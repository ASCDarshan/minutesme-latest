import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { useReactMediaRecorder } from "react-media-recorder";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase/config";
import { useAuth } from "./AuthContext";
import { transcribeAudio, generateMinutes } from "../services/openai";

// --- Constants ---
const LOCALSTORAGE_CHUNK_PREFIX = "recordingChunk_";
const RECORDING_TIMESLICE_MS = 300000; // 5 minutes
const MAX_UPLOAD_SIZE_MB = 100; // Example: Limit upload size to 100MB
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = [
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "audio/mpeg", // mp3
  "audio/mp4", // m4a
  "audio/aac",
  "audio/flac",
];

// --- Helper Functions ---
// Function to clear stored recording chunks from localStorage
const clearStoredChunks = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(LOCALSTORAGE_CHUNK_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    // console.log("Cleared stored recording chunks.");
  } catch (error) {
    console.error("Error clearing stored chunks:", error);
  }
};

// Function to save a chunk to localStorage (using Base64 encoding)
const saveChunkToLocalStorage = (index, blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        localStorage.setItem(
          `${LOCALSTORAGE_CHUNK_PREFIX}${index}`,
          reader.result // Base64 string
        );
        // console.log(`Saved chunk ${index} to localStorage.`);
        resolve();
      } catch (error) {
        console.error(`Error saving chunk ${index} to localStorage:`, error);
        // Handle potential quota exceeded error
        if (
          error.name === "QuotaExceededError" ||
          error.code === 22 /* DOMException code for QuotaExceededError */
        ) {
          reject(
            new Error(
              "LocalStorage quota exceeded. Recording may be incomplete."
            )
          );
        } else {
          reject(error);
        }
      }
    };
    reader.onerror = (error) => {
      console.error(`Error reading chunk ${index} for localStorage:`, error);
      reject(error);
    };
    reader.readAsDataURL(blob); // Read as Base64
  });
};

// Function to retrieve and combine chunks from localStorage
const combineChunksFromLocalStorage = async () => {
  const chunks = [];
  let i = 0;
  let combinedBlob = null;
  let firstChunkType = null;

  try {
    // Retrieve chunks sequentially
    while (true) {
      const base64String = localStorage.getItem(
        `${LOCALSTORAGE_CHUNK_PREFIX}${i}`
      );
      if (!base64String) {
        break; // No more chunks
      }

      // Convert Base64 back to Blob
      const fetchRes = await fetch(base64String);
      const chunkBlob = await fetchRes.blob();

      if (i === 0) {
        firstChunkType = chunkBlob.type; // Store the type of the first chunk
      }
      chunks.push(chunkBlob);
      i++;
    }

    if (chunks.length > 0) {
      // Combine using the type of the first chunk (or a default)
      combinedBlob = new Blob(chunks, {
        type: firstChunkType || "audio/webm",
      });
      // console.log(
      //   `Combined ${chunks.length} chunks into a single blob of type ${combinedBlob.type} and size ${combinedBlob.size} bytes.`
      // );
    } else {
      // console.log("No chunks found in localStorage to combine.");
    }
  } catch (error) {
    console.error("Error retrieving or combining chunks:", error);
    // Don't clear chunks here, maybe they can be recovered later?
    // Or clear them to prevent issues next time? Let's clear them.
    clearStoredChunks();
    throw new Error("Failed to reconstruct recording from saved parts."); // Re-throw error
  }

  // Clean up localStorage after successful retrieval and combination
  clearStoredChunks();
  return combinedBlob;
};

// --- Context ---
const MeetingContext = createContext();

export const useMeeting = () => {
  return useContext(MeetingContext);
};

// --- Provider Component ---
function MeetingProviderComponent({ children }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [minutes, setMinutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingMinutes, setIsGeneratingMinutes] = useState(false);
  const [error, setError] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // Track upload state

  const chunkCounterRef = useRef(0); // Ref to keep track of chunk index for localStorage

  const {
    status,
    startRecording: startMediaRecorder,
    stopRecording: stopMediaRecorder,
    pauseRecording, // Added for potential future use
    resumeRecording, // Added for potential future use
    mediaBlobUrl, // Keep if needed for preview, but we use audioBlob state
    previewStream,
    clearBlobUrl, // Clears the mediaBlobUrl if needed
  } = useReactMediaRecorder({
    audio: true,
    video: false,
    blobPropertyBag: { type: "audio/webm" }, // Explicitly set blob type
    // Ask for specific codecs if needed, e.g., { type: 'audio/webm;codecs=opus' }
    timeslice: RECORDING_TIMESLICE_MS, // Trigger onDataAvailable every 5 minutes
    onStart: () => {
      setError(null);
      setAudioBlob(null); // Clear any previous blob (e.g., from upload)
      chunkCounterRef.current = 0; // Reset chunk counter
      clearStoredChunks(); // Clear any leftover chunks from previous recordings
      // console.log("Recording started, timeslice:", RECORDING_TIMESLICE_MS);
    },
    onStop: async (blobUrl, blob) => {
      // 'blob' here is the *last* chunk when timeslice is used.
      // We need to combine chunks from localStorage.
      // console.log("Recording stopped. Attempting to combine chunks...");
      setLoading(true); // Indicate processing
      setError(null);
      try {
        // If onDataAvailable wasn't triggered (short recording), save the final blob directly
        if (chunkCounterRef.current === 0 && blob && blob.size > 0) {
           console.log("Short recording, saving final blob directly.");
           await saveChunkToLocalStorage(0, blob); // Save the only chunk
           chunkCounterRef.current = 1; // Indicate one chunk was saved
        } else if (blob && blob.size > 0) {
            // Save the final chunk if it exists (might be smaller than timeslice)
            // console.log(`Saving final chunk ${chunkCounterRef.current}...`);
            await saveChunkToLocalStorage(chunkCounterRef.current, blob);
            chunkCounterRef.current += 1;
        }


        const combined = await combineChunksFromLocalStorage(); // This also clears localStorage
        if (combined) {
          saveAudioBlob(combined); // Set the combined blob to state
          // console.log("Successfully combined chunks from localStorage.");
        } else {
          console.warn("No combined blob could be created from storage.");
          // setError("Could not reconstruct recording. Please try again."); // Set error?
        }
      } catch (err) {
        console.error("Error combining chunks on stop:", err);
        setError(
          `Error processing recording: ${err.message}. Please try again.`
        );
        setAudioBlob(null); // Ensure blob is null on error
        clearStoredChunks(); // Clean up localStorage on error
      } finally {
        setLoading(false); // Stop loading indicator
        clearBlobUrl(); // Clean up the temporary URL from the hook
      }
    },
    onDataAvailable: async (blob) => {
      // This fires every 'timeslice' milliseconds with a chunk of audio
      // console.log(
      //   `onDataAvailable: Received chunk ${chunkCounterRef.current} of size ${blob.size}`
      // );
      if (blob.size > 0) {
        try {
          await saveChunkToLocalStorage(chunkCounterRef.current, blob);
          chunkCounterRef.current += 1;
        } catch (err) {
          // Stop recording if localStorage fails (e.g., quota)
          console.error("Stopping recording due to localStorage error:", err);
          stopMediaRecorder(); // Stop the recording
          setError(
            `Recording stopped: Could not save audio chunk. ${err.message}`
          );
          clearStoredChunks(); // Clean up potentially corrupted storage
        }
      }
    },
    onError: (err) => {
      console.error("CONTEXT/onError: react-media-recorder Error:", err);
      let message = err.message || err.name || "Unknown recording error";
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = "Microphone not found. Please ensure it's connected and enabled.";
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = "Microphone access denied. Please grant permission in your browser settings.";
      } else if (err.name === 'SecurityError') {
         message = "Microphone access denied due to security settings. Ensure the page is served over HTTPS.";
      }
      setError(`Recording Error: ${message}`);
      clearStoredChunks(); // Clean up storage on error
    },
  });

  const isRecording = status === "recording";
  const mediaRecorderStatus = status; // Expose the detailed status

  // Function to explicitly set the audio blob (used by recording and upload)
  const saveAudioBlob = useCallback((blob) => {
    // console.log(`Setting audioBlob: size=${blob?.size}, type=${blob?.type}`);
    setAudioBlob(blob);
  }, []);

  // --- Meeting Lifecycle Functions ---

  const startMeeting = useCallback(() => {
    if (isRecording || status === "acquiring_media") {
      console.warn("startMeeting called while already recording or acquiring.");
      return;
    }
    // console.log("Attempting to start meeting...");
    setError(null);
    setAudioBlob(null); // Clear previous blob (important if switching from upload)
    setTranscription("");
    setMinutes(null);
    setIsTranscribing(false);
    setIsGeneratingMinutes(false);
    setIsUploading(false); // Ensure upload state is reset
    clearBlobUrl(); // Clear any lingering mediaBlobUrl
    chunkCounterRef.current = 0; // Reset chunk counter
    clearStoredChunks(); // Clear storage before starting

    // Delay slightly to ensure state resets propagate? Maybe not needed.
    startMediaRecorder();
  }, [isRecording, status, startMediaRecorder, clearBlobUrl]);

  const endMeeting = useCallback(() => {
    if (!isRecording) {
      // console.warn("endMeeting called when not recording.");
      return;
    }
    // console.log("Attempting to stop meeting...");
    stopMediaRecorder();
  }, [isRecording, stopMediaRecorder]);

  // --- Upload Handling ---
  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) {
        setError("No file selected.");
        return false;
      }
      if (isRecording) {
        setError("Cannot upload while recording is in progress.");
        return false;
      }

      // Basic validation
      if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
        console.warn(`Upload rejected: Invalid file type - ${file.type}`);
        setError(
          `Invalid file type (${file.type}). Please upload a valid audio file (${ALLOWED_AUDIO_TYPES.map(t => t.split('/')[1]).join(', ')}).`
        );
        return false;
      }
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        console.warn(`Upload rejected: File too large - ${file.size} bytes`);
        setError(
          `File is too large (${(file.size / 1024 / 1024).toFixed(
            1
          )} MB). Maximum size is ${MAX_UPLOAD_SIZE_MB} MB.`
        );
        return false;
      }

      // console.log(`Handling file upload: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
      setIsUploading(true); // Set uploading flag
      setError(null);
      setAudioBlob(null); // Clear any existing blob
      setTranscription("");
      setMinutes(null);
      setIsTranscribing(false);
      setIsGeneratingMinutes(false);
      clearBlobUrl();
      clearStoredChunks(); // Ensure no recording chunks interfere

      // Simulate some processing if needed, or just set the blob
      // Using a timeout to allow UI to update with loading state
      await new Promise(resolve => setTimeout(resolve, 100)); // Short delay

      saveAudioBlob(file); // Set the uploaded file as the audioBlob
      setIsUploading(false); // Clear uploading flag
      // console.log("File upload processed, audioBlob set.");
      return true; // Indicate success
    },
    [isRecording, saveAudioBlob, clearBlobUrl] // Dependencies
  );

  // --- Transcription and Generation ---

  const transcribeMeetingAudio = useCallback(async () => {
    if (!audioBlob) {
      console.error("CONTEXT/transcribeMeetingAudio: No audioBlob found.");
      setError("No recording or uploaded file available to transcribe.");
      return false;
    }
    // Allow re-transcription if needed? For now, return if already transcribed.
    if (transcription && !error?.startsWith("Transcription failed")) {
       console.log("Transcription already exists. Skipping.");
       return true;
    }

    // console.log("Starting transcription process...");
    setLoading(true);
    setIsTranscribing(true);
    setError(null); // Clear previous errors

    try {
      const transcript = await transcribeAudio(audioBlob);
      // Check explicitly for null/undefined, allow empty string "" as valid
      if (transcript === null || transcript === undefined) {
        throw new Error("Transcription service returned an invalid result.");
      }

      // console.log("Transcription successful.");
      setTranscription(transcript);
      setIsTranscribing(false);
      // Keep loading true if generation follows immediately? No, let generate handle its own loading.
      setLoading(false);
      return true;
    } catch (err) {
      console.error(
        "CONTEXT/transcribeMeetingAudio: Failed to transcribe audio:",
        err
      );
      setError(`Transcription failed: ${err.message}`);
      setTranscription(""); // Clear any partial transcription on error
      setIsTranscribing(false);
      setLoading(false);
      return false;
    }
  }, [audioBlob, transcription, error]); // Dependencies

  const generateAndSaveMeeting = useCallback(
    async (title = "Untitled Meeting") => {
      if (!audioBlob || !currentUser) {
        console.error(
          "CONTEXT/generateAndSaveMeeting: Missing audioBlob or currentUser."
        );
        setError("No recording/upload available or user not logged in.");
        return null;
      }
      // Ensure transcription is done *before* generating minutes
      if (!transcription && !isTranscribing) {
        console.warn(
          "CONTEXT/generateAndSaveMeeting: Transcription not ready. Attempting transcription first."
        );
        setError("Transcription needed. Processing audio first...");
        const transcriptionSuccess = await transcribeMeetingAudio();
        if (!transcriptionSuccess) {
          // Error state is already set by transcribeMeetingAudio
          console.error(
            "CONTEXT/generateAndSaveMeeting: Transcription failed, cannot proceed."
          );
          // Don't clear the transcription error message
          return null;
        }
        // If successful, the transcription state will update, allow proceeding
        // Add a small delay to ensure state update propagates if needed?
        await new Promise(resolve => setTimeout(resolve, 100));
      } else if (isTranscribing) {
         console.warn("CONTEXT/generateAndSaveMeeting: Transcription still in progress.");
         setError("Please wait for transcription to complete before generating minutes.");
         return null;
      } else if (!transcription) {
         // Should not happen if logic above is correct, but as a safeguard
         console.error("CONTEXT/generateAndSaveMeeting: Transcription missing after check.");
         setError("Transcription is missing. Cannot generate minutes.");
         return null;
      }


      // console.log(`Starting generation and save process for: ${title}`);
      setLoading(true);
      setIsGeneratingMinutes(true);
      setError(null); // Clear previous errors before generation/saving

      // Timeout for the entire process (generation + upload)
      const processingTimeout = setTimeout(() => {
        // Check specific flags, not just generic 'loading'
        if (isGeneratingMinutes || loading) {
          console.warn(
            "CONTEXT/generateAndSaveMeeting: Processing timed out after 3 minutes."
          );
          // Only set error if one isn't already set
          setError((prevError) => prevError || "Processing took too long and timed out. Please try again.");
          setLoading(false);
          setIsGeneratingMinutes(false); // Ensure flag is reset
        }
      }, 180000); // 3 minutes

      let audioUrl = null;
      let generatedMinutesData = null; // Start fresh for generation
      let meetingId = null;
      let minutesUrl = null; // Define minutesUrl

      try {
        // Step 1: Generate Minutes using the final transcription
        try {
          // console.log("CONTEXT/generateAndSaveMeeting: Step 1 - Generating minutes...");
          generatedMinutesData = await generateMinutes(transcription, title);

          if (generatedMinutesData && generatedMinutesData.error) {
            console.error(
              "CONTEXT/generateAndSaveMeeting: Minutes generation resulted in an error state:",
              generatedMinutesData.error
            );
            // Set error, but continue to save what we have (audio + transcript)
            setError(
              `Minutes Generation Failed: ${generatedMinutesData.error}. Saving recording and transcription.`
            );
          } else if (!generatedMinutesData) {
            // Treat empty result as an error for saving purposes
            throw new Error(
              "Minutes generation result was empty or undefined."
            );
          }
          setMinutes(generatedMinutesData); // Store result (including potential error)
          // console.log("CONTEXT/generateAndSaveMeeting: Step 1 - Minutes generation attempt completed.");
        } catch (minutesError) {
          console.error(
            "CONTEXT/generateAndSaveMeeting: Failed during minutes generation call:",
            minutesError
          );
          // Set error, but continue to save audio + transcript
          setError(
            `Minutes generation failed: ${minutesError.message}. Saving recording and transcription.`
          );
          // Ensure minutes state reflects the failure
          setMinutes({ error: `Generation failed: ${minutesError.message}` });
        }
        setIsGeneratingMinutes(false); // Generation attempt finished

        // Step 2: Create Firestore Document (initial)
        // console.log("CONTEXT/generateAndSaveMeeting: Step 2 - Creating Firestore document...");
        const meetingStatus =
          generatedMinutesData && !generatedMinutesData.error
            ? "completed" // Has valid minutes
            : "completed_partial"; // Has transcript, maybe audio, but failed/no minutes
        const hasValidMinutes =
          generatedMinutesData && !generatedMinutesData.error;

        const meetingData = {
          title,
          status: meetingStatus,
          creatorName: currentUser.displayName || "Unknown User",
          creatorEmail: currentUser.email,
          userId: currentUser.uid,
          hasTranscription: !!transcription, // Based on actual transcription state
          hasMinutes: hasValidMinutes,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          audioUrl: null, // Will be updated later
          minutesUrl: null, // Will be updated later
          error: error, // Store any error encountered so far (e.g., from generation)
        };
        const meetingsRef = collection(db, "meetings");
        const docRef = await addDoc(meetingsRef, meetingData);
        meetingId = docRef.id;
        // console.log(`CONTEXT/generateAndSaveMeeting: Step 2 - Firestore document created: ${meetingId}`);

        // Step 3: Upload Audio to Storage
        // console.log("CONTEXT/generateAndSaveMeeting: Step 3 - Uploading audio...");
        const audioPath = `recordings/${currentUser.uid}/${meetingId}/audio.${audioBlob.type.split('/')[1] || 'webm'}`; // Use actual blob type extension
        const audioRef = ref(storage, audioPath);
        await uploadBytes(audioRef, audioBlob);
        audioUrl = await getDownloadURL(audioRef);
        // console.log("CONTEXT/generateAndSaveMeeting: Step 3 - Audio uploaded:", audioUrl);

        // Step 4: Prepare and Upload Minutes JSON to Storage
        // console.log("CONTEXT/generateAndSaveMeeting: Step 4 - Preparing and uploading minutes JSON...");
        const minutesToStore = {
          // Ensure generatedMinutesData exists, otherwise provide error structure
          ...(generatedMinutesData && typeof generatedMinutesData === 'object'
              ? generatedMinutesData
              : { error: "Minutes data unavailable or generation failed." }),
          transcription: transcription || "Transcription not available.", // Include transcription
          audioUrl: audioUrl, // Include audio URL in the JSON
        };
        const minutesPath = `minutes/${currentUser.uid}/${meetingId}/minutes.json`;
        const minutesRef = ref(storage, minutesPath);
        const jsonBlob = new Blob([JSON.stringify(minutesToStore, null, 2)], {
          type: "application/json",
        });
        await uploadBytes(minutesRef, jsonBlob);
        minutesUrl = await getDownloadURL(minutesRef); // Assign to defined variable
        // console.log("CONTEXT/generateAndSaveMeeting: Step 4 - Minutes JSON uploaded:", minutesUrl);

        // Step 5: Update Firestore Document with URLs
        // console.log("CONTEXT/generateAndSaveMeeting: Step 5 - Updating Firestore document with URLs...");
        const meetingDocRef = doc(db, "meetings", meetingId); // Use correct ref
        await updateDoc(meetingDocRef, {
          audioUrl,
          minutesUrl,
          updatedAt: serverTimestamp(),
          status: meetingStatus, // Re-affirm status in case it needs update
          error: error, // Update with latest error state (might be null if generation succeeded)
        });
        // console.log("CONTEXT/generateAndSaveMeeting: Step 5 - Firestore document updated.");

        // --- Success ---
        clearTimeout(processingTimeout); // Clear timeout on success
        setLoading(false);
        // console.log(`CONTEXT/generateAndSaveMeeting: Process completed successfully for meeting ${meetingId}. Navigating...`);
        navigate(`/meeting/${meetingId}`); // Navigate on success
        return meetingId; // Return the ID

      } catch (err) {
        // --- Catch all for Storage/Firestore errors ---
        console.error(
          "CONTEXT/generateAndSaveMeeting: Error during Firebase storage/update:",
          err
        );
        setError((prevError) => prevError || `Error saving results: ${err.message}`); // Keep existing error if generation failed earlier
        // Attempt to update Firestore status to 'failed' if doc was created
        if (meetingId) {
          try {
            const meetingRef = doc(db, "meetings", meetingId);
            await updateDoc(meetingRef, {
              status: "failed",
              // Include audio/minutes URLs if they were obtained before failure
              ...(audioUrl && { audioUrl }),
              ...(minutesUrl && { minutesUrl }),
              error: `Save failed: ${err.message}. ${error || ''}`, // Combine errors
              updatedAt: serverTimestamp(),
            });
          } catch (updateError) {
            console.error(
              "CONTEXT: Failed to update meeting status to failed:",
              updateError
            );
            // Log additional error but don't overwrite primary save error
          }
        }
        clearTimeout(processingTimeout); // Clear timeout on error
        setIsGeneratingMinutes(false); // Ensure flags are reset
        setLoading(false);
        return null; // Indicate failure
      }
    },
    [
      currentUser, audioBlob, transcription, isTranscribing, // Input dependencies
      transcribeMeetingAudio, // Function dependency
      error, // State dependency to avoid overwriting generation errors
      navigate, // Navigation dependency
    ]
  );


  // --- Data Loading and Deletion ---

  const loadUserMeetings = useCallback(async () => {
    if (!currentUser) {
      setMeetings([]);
      // console.log("loadUserMeetings: No current user, clearing meetings.");
      return;
    }
    // console.log("loadUserMeetings: Loading meetings for user:", currentUser.uid);
    setLoading(true);
    setError(null);
    try {
      const meetingsRef = collection(db, "meetings");
      const q = query(
        meetingsRef,
        where("userId", "==", currentUser.uid)
        // orderBy("createdAt", "desc") // Add ordering directly in query
      );
      const querySnapshot = await getDocs(q);
      let userMeetings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort client-side as Firestore might require composite index for multiple filters/orders
      userMeetings.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
      // console.log(`loadUserMeetings: Found ${userMeetings.length} meetings.`);
      setMeetings(userMeetings);

    } catch (err) {
      console.error("CONTEXT/loadUserMeetings: Error:", err);
      setError(`Error loading meetings: ${err.message}`);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const loadMeeting = useCallback(
    async (meetingId) => {
      if (!currentUser || !meetingId) {
        // console.log("loadMeeting: Missing user or meetingId.");
        setCurrentMeeting(null);
        return null;
      }
      // console.log(`loadMeeting: Loading meeting ${meetingId} for user ${currentUser.uid}`);
      setLoading(true);
      setError(null);
      setCurrentMeeting(null); // Clear previous meeting details
      try {
        const meetingRef = doc(db, "meetings", meetingId);
        const meetingSnap = await getDoc(meetingRef);

        if (!meetingSnap.exists()) {
          throw new Error("Meeting not found.");
        }
        const meetingData = { id: meetingSnap.id, ...meetingSnap.data() };

        // Authorization check
        if (meetingData.userId !== currentUser.uid) {
          throw new Error("Access denied.");
        }

        // Fetch minutes data from URL if it exists
        if (meetingData.minutesUrl) {
          // console.log(`loadMeeting: Fetching minutes from ${meetingData.minutesUrl}`);
          try {
            const response = await fetch(meetingData.minutesUrl);
            if (!response.ok) {
              throw new Error(
                `Failed to fetch minutes JSON (Status: ${response.status})`
              );
            }
            // Ensure response is treated as JSON
            const minutesJson = await response.json();
            meetingData.minutesData = minutesJson;
            // console.log("loadMeeting: Successfully fetched and parsed minutes data.");
          } catch (fetchError) {
            console.error(
              "CONTEXT/loadMeeting: Error fetching or parsing minutes data:",
              fetchError
            );
            // Set error state but also include error info in meeting data
            setError(
              (prev) => prev || `Failed to load minutes details: ${fetchError.message}`
            );
            meetingData.minutesData = {
              error: `Could not load minutes details: ${fetchError.message}`,
            };
          }
        } else {
          // console.log("loadMeeting: No minutesUrl found for this meeting.");
          meetingData.minutesData = null; // Or perhaps { info: "Minutes not generated or available." }
        }

        setCurrentMeeting(meetingData);
        // console.log("loadMeeting: Meeting loaded successfully.", meetingData);
        return meetingData;

      } catch (err) {
        console.error("CONTEXT/loadMeeting: Error loading meeting:", err);
        setError(`Error loading meeting: ${err.message}`);
        setCurrentMeeting(null); // Ensure currentMeeting is null on error
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  const removeMeeting = useCallback(
    async (meetingId) => {
      if (!currentUser || !meetingId) return false;
      // console.log(`removeMeeting: Attempting to delete meeting ${meetingId}`);
      setLoading(true);
      setError(null);
      let meetingData = null; // To get file paths

      try {
        // 1. Get meeting doc to check ownership and get file paths
        const meetingRef = doc(db, "meetings", meetingId);
        const meetingSnap = await getDoc(meetingRef);

        if (!meetingSnap.exists()) {
          throw new Error("Meeting not found.");
        }
        meetingData = meetingSnap.data();
        if (meetingData.userId !== currentUser.uid) {
          throw new Error("Permission denied to delete this meeting.");
        }

        // 2. Delete files from Storage (use URLs if available, otherwise construct path)
        // Deleting using constructed paths is more reliable if URLs become invalid
        const audioPath = `recordings/${currentUser.uid}/${meetingId}/`; // Folder path
        const minutesPath = `minutes/${currentUser.uid}/${meetingId}/`; // Folder path

        // Function to delete storage object, ignoring not-found errors
        const safeDeleteObject = async (filePath) => {
          try {
            // console.log(`Attempting to delete storage object: ${filePath}`);
            await deleteObject(ref(storage, filePath));
            // console.log(`Deleted: ${filePath}`);
          } catch (e) {
            if (e.code === "storage/object-not-found") {
              // console.warn(`Storage object not found (okay): ${filePath}`);
            } else {
              // Log other errors but don't necessarily stop the process
              console.error(`Failed to delete storage object ${filePath}:`, e);
              // Optionally re-throw or collect errors if deletion failure is critical
              // throw e; // Uncomment if file deletion failure should stop the whole process
            }
          }
        };

        // Attempt to delete common file names within the folders
        await safeDeleteObject(`${audioPath}audio.webm`);
        await safeDeleteObject(`${audioPath}audio.ogg`);
        await safeDeleteObject(`${audioPath}audio.mp3`);
        await safeDeleteObject(`${audioPath}audio.m4a`);
        // Add other potential audio extensions if needed
        await safeDeleteObject(`${minutesPath}minutes.json`);

        // 3. Delete Firestore document
        // console.log(`Deleting Firestore document: ${meetingId}`);
        await deleteDoc(meetingRef);

        // 4. Update local state
        setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
        if (currentMeeting?.id === meetingId) {
          setCurrentMeeting(null);
        }
        // console.log(`removeMeeting: Successfully deleted meeting ${meetingId}`);
        return true;

      } catch (err) {
        console.error("CONTEXT/removeMeeting: Error deleting meeting:", err);
        setError(`Error deleting meeting: ${err.message}`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, currentMeeting]
  );

  // --- Context Value ---
  const value = {
    // Recording Status & Control
    mediaRecorderStatus, // e.g., 'idle', 'recording', 'paused', 'stopped', 'acquiring_media'
    isRecording, // boolean shortcut for status === 'recording'
    previewStream, // For potential visualizers
    startMeeting,
    endMeeting,
    // Upload Status & Control
    isUploading, // boolean
    handleFileUpload, // function(file): boolean
    // Data & State
    audioBlob, // The current Blob (from recording or upload)
    transcription, // string
    minutes, // object (generated minutes data or error)
    meetings, // array of user's meetings
    currentMeeting, // object (details of the currently viewed meeting)
    // Loading & Error States
    loading, // General loading indicator (covers transcription, generation, saving, loading lists/details)
    isTranscribing, // Specific flag for transcription phase
    isGeneratingMinutes, // Specific flag for minutes generation phase
    error, // string | null (holds the latest error message)
    // Core Actions
    saveAudioBlob, // Primarily internal, but exposed if needed: function(blob)
    transcribeMeetingAudio, // function(): Promise<boolean>
    generateAndSaveMeeting, // function(title: string): Promise<string | null>
    // Data Management Actions
    loadUserMeetings, // function(): Promise<void>
    loadMeeting, // function(meetingId: string): Promise<object | null>
    removeMeeting, // function(meetingId: string): Promise<boolean>
  };

  return (
    <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>
  );
}

export const MeetingProvider = MeetingProviderComponent;
export default MeetingContext; // Export context itself if needed elsewhere
