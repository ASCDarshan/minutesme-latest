import React, {
  createContext,
  useContext,
  useState,
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

const LOCALSTORAGE_CHUNK_PREFIX = "recordingChunk_";
const RECORDING_TIMESLICE_MS = 300000;
const MAX_UPLOAD_SIZE_MB = 100;
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = [
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "audio/mpeg",
  "audio/mp4",
  "audio/aac",
  "audio/flac",
];

const clearStoredChunks = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(LOCALSTORAGE_CHUNK_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing stored chunks:", error);
  }
};

const saveChunkToLocalStorage = (index, blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        localStorage.setItem(
          `${LOCALSTORAGE_CHUNK_PREFIX}${index}`,
          reader.result
        );
        resolve();
      } catch (error) {
        console.error(`Error saving chunk ${index} to localStorage:`, error);
        if (error.name === "QuotaExceededError" || error.code === 22) {
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
    reader.readAsDataURL(blob);
  });
};

const combineChunksFromLocalStorage = async () => {
  const chunks = [];
  let i = 0;
  let combinedBlob = null;
  let firstChunkType = null;

  try {
    while (true) {
      const base64String = localStorage.getItem(
        `${LOCALSTORAGE_CHUNK_PREFIX}${i}`
      );
      if (!base64String) {
        break;
      }

      const fetchRes = await fetch(base64String);
      const chunkBlob = await fetchRes.blob();

      if (i === 0) {
        firstChunkType = chunkBlob.type;
      }
      chunks.push(chunkBlob);
      i++;
    }

    if (chunks.length > 0) {
      combinedBlob = new Blob(chunks, {
        type: firstChunkType || "audio/webm",
      });
    } else {
      console.log("error");
    }
  } catch (error) {
    console.error("Error retrieving or combining chunks:", error);
    clearStoredChunks();
    throw new Error("Failed to reconstruct recording from saved parts.");
  }

  clearStoredChunks();
  return combinedBlob;
};

const MeetingContext = createContext();

export const useMeeting = () => {
  return useContext(MeetingContext);
};

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
  const [isUploading, setIsUploading] = useState(false);

  const chunkCounterRef = useRef(0);

  const {
    status,
    startRecording: startMediaRecorder,
    stopRecording: stopMediaRecorder,
    previewStream,
    clearBlobUrl,
  } = useReactMediaRecorder({
    audio: true,
    video: false,
    blobPropertyBag: { type: "audio/webm" },
    timeslice: RECORDING_TIMESLICE_MS,
    onStart: () => {
      setError(null);
      setAudioBlob(null);
      chunkCounterRef.current = 0;
      clearStoredChunks();
    },
    onStop: async (blobUrl, blob) => {
      setLoading(true);
      setError(null);
      try {
        if (chunkCounterRef.current === 0 && blob && blob.size > 0) {
          console.log("Short recording, saving final blob directly.");
          await saveChunkToLocalStorage(0, blob);
          chunkCounterRef.current = 1;
        } else if (blob && blob.size > 0) {
          await saveChunkToLocalStorage(chunkCounterRef.current, blob);
          chunkCounterRef.current += 1;
        }

        const combined = await combineChunksFromLocalStorage();
        if (combined) {
          saveAudioBlob(combined);
        } else {
          console.warn("No combined blob could be created from storage.");
        }
      } catch (err) {
        console.error("Error combining chunks on stop:", err);
        setError(
          `Error processing recording: ${err.message}. Please try again.`
        );
        setAudioBlob(null);
        clearStoredChunks();
      } finally {
        setLoading(false);
        clearBlobUrl();
      }
    },
    onDataAvailable: async (blob) => {
      if (blob.size > 0) {
        try {
          await saveChunkToLocalStorage(chunkCounterRef.current, blob);
          chunkCounterRef.current += 1;
        } catch (err) {
          console.error("Stopping recording due to localStorage error:", err);
          stopMediaRecorder();
          setError(
            `Recording stopped: Could not save audio chunk. ${err.message}`
          );
          clearStoredChunks();
        }
      }
    },
    onError: (err) => {
      console.error("CONTEXT/onError: react-media-recorder Error:", err);
      let message = err.message || err.name || "Unknown recording error";
      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        message =
          "Microphone not found. Please ensure it's connected and enabled.";
      } else if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        message =
          "Microphone access denied. Please grant permission in your browser settings.";
      } else if (err.name === "SecurityError") {
        message =
          "Microphone access denied due to security settings. Ensure the page is served over HTTPS.";
      }
      setError(`Recording Error: ${message}`);
      clearStoredChunks();
    },
  });

  const isRecording = status === "recording";
  const mediaRecorderStatus = status;

  const saveAudioBlob = useCallback((blob) => {
    setAudioBlob(blob);
  }, []);

  const startMeeting = useCallback(() => {
    if (isRecording || status === "acquiring_media") {
      console.warn("startMeeting called while already recording or acquiring.");
      return;
    }
    setError(null);
    setAudioBlob(null);
    setTranscription("");
    setMinutes(null);
    setIsTranscribing(false);
    setIsGeneratingMinutes(false);
    setIsUploading(false);
    clearBlobUrl();
    chunkCounterRef.current = 0;
    clearStoredChunks();

    startMediaRecorder();
  }, [isRecording, status, startMediaRecorder, clearBlobUrl]);

  const endMeeting = useCallback(() => {
    if (!isRecording) {
      return;
    }
    stopMediaRecorder();
  }, [isRecording, stopMediaRecorder]);

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

      if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
        console.warn(`Upload rejected: Invalid file type - ${file.type}`);
        setError(
          `Invalid file type (${
            file.type
          }). Please upload a valid audio file (${ALLOWED_AUDIO_TYPES.map(
            (t) => t.split("/")[1]
          ).join(", ")}).`
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

      setIsUploading(true);
      setError(null);
      setAudioBlob(null);
      setTranscription("");
      setMinutes(null);
      setIsTranscribing(false);
      setIsGeneratingMinutes(false);
      clearBlobUrl();
      clearStoredChunks();

      await new Promise((resolve) => setTimeout(resolve, 100));

      saveAudioBlob(file);
      setIsUploading(false);
      return true;
    },
    [isRecording, saveAudioBlob, clearBlobUrl]
  );

  const transcribeMeetingAudio = useCallback(async () => {
    if (!audioBlob) {
      console.error("CONTEXT/transcribeMeetingAudio: No audioBlob found.");
      setError("No recording or uploaded file available to transcribe.");
      return false;
    }
    if (transcription && !error?.startsWith("Transcription failed")) {
      console.log("Transcription already exists. Skipping.");
      return true;
    }

    setLoading(true);
    setIsTranscribing(true);
    setError(null);

    try {
      const transcript = await transcribeAudio(audioBlob);
      if (transcript === null || transcript === undefined) {
        throw new Error("Transcription service returned an invalid result.");
      }

      setTranscription(transcript);
      setIsTranscribing(false);
      setLoading(false);
      return true;
    } catch (err) {
      console.error(
        "CONTEXT/transcribeMeetingAudio: Failed to transcribe audio:",
        err
      );
      setError(`Transcription failed: ${err.message}`);
      setTranscription("");
      setIsTranscribing(false);
      setLoading(false);
      return false;
    }
  }, [audioBlob, transcription, error]);

  const generateAndSaveMeeting = useCallback(
    async (title = "Untitled Meeting") => {
      if (!audioBlob || !currentUser) {
        console.error(
          "CONTEXT/generateAndSaveMeeting: Missing audioBlob or currentUser."
        );
        setError("No recording/upload available or user not logged in.");
        return null;
      }
      if (!transcription && !isTranscribing) {
        console.warn(
          "CONTEXT/generateAndSaveMeeting: Transcription not ready. Attempting transcription first."
        );
        setError("Transcription needed. Processing audio first...");
        const transcriptionSuccess = await transcribeMeetingAudio();
        if (!transcriptionSuccess) {
          console.error(
            "CONTEXT/generateAndSaveMeeting: Transcription failed, cannot proceed."
          );
          return null;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      } else if (isTranscribing) {
        console.warn(
          "CONTEXT/generateAndSaveMeeting: Transcription still in progress."
        );
        setError(
          "Please wait for transcription to complete before generating minutes."
        );
        return null;
      } else if (!transcription) {
        console.error(
          "CONTEXT/generateAndSaveMeeting: Transcription missing after check."
        );
        setError("Transcription is missing. Cannot generate minutes.");
        return null;
      }

      setLoading(true);
      setIsGeneratingMinutes(true);
      setError(null);

      const processingTimeout = setTimeout(() => {
        if (isGeneratingMinutes || loading) {
          console.warn(
            "CONTEXT/generateAndSaveMeeting: Processing timed out after 3 minutes."
          );
          setError(
            (prevError) =>
              prevError ||
              "Processing took too long and timed out. Please try again."
          );
          setLoading(false);
          setIsGeneratingMinutes(false);
        }
      }, 180000);

      let audioUrl = null;
      let generatedMinutesData = null;
      let meetingId = null;
      let minutesUrl = null;

      try {
        try {
          generatedMinutesData = await generateMinutes(transcription, title);

          if (generatedMinutesData && generatedMinutesData.error) {
            console.error(
              "CONTEXT/generateAndSaveMeeting: Minutes generation resulted in an error state:",
              generatedMinutesData.error
            );
            setError(
              `Minutes Generation Failed: ${generatedMinutesData.error}. Saving recording and transcription.`
            );
          } else if (!generatedMinutesData) {
            throw new Error(
              "Minutes generation result was empty or undefined."
            );
          }
          setMinutes(generatedMinutesData);
        } catch (minutesError) {
          console.error(
            "CONTEXT/generateAndSaveMeeting: Failed during minutes generation call:",
            minutesError
          );
          setError(
            `Minutes generation failed: ${minutesError.message}. Saving recording and transcription.`
          );
          setMinutes({ error: `Generation failed: ${minutesError.message}` });
        }
        setIsGeneratingMinutes(false);

        const meetingStatus =
          generatedMinutesData && !generatedMinutesData.error
            ? "completed"
            : "completed_partial";
        const hasValidMinutes =
          generatedMinutesData && !generatedMinutesData.error;

        const meetingData = {
          title,
          status: meetingStatus,
          creatorName: currentUser.displayName || "Unknown User",
          creatorEmail: currentUser.email,
          userId: currentUser.uid,
          hasTranscription: !!transcription,
          hasMinutes: hasValidMinutes,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          audioUrl: null,
          minutesUrl: null,
          error: error,
        };
        const meetingsRef = collection(db, "meetings");
        const docRef = await addDoc(meetingsRef, meetingData);
        meetingId = docRef.id;

        const audioPath = `recordings/${currentUser.uid}/${meetingId}/audio.${
          audioBlob.type.split("/")[1] || "webm"
        }`;
        const audioRef = ref(storage, audioPath);
        await uploadBytes(audioRef, audioBlob);
        audioUrl = await getDownloadURL(audioRef);

        const minutesToStore = {
          ...(generatedMinutesData && typeof generatedMinutesData === "object"
            ? generatedMinutesData
            : { error: "Minutes data unavailable or generation failed." }),
          transcription: transcription || "Transcription not available.",
          audioUrl: audioUrl,
        };
        const minutesPath = `minutes/${currentUser.uid}/${meetingId}/minutes.json`;
        const minutesRef = ref(storage, minutesPath);
        const jsonBlob = new Blob([JSON.stringify(minutesToStore, null, 2)], {
          type: "application/json",
        });
        await uploadBytes(minutesRef, jsonBlob);
        minutesUrl = await getDownloadURL(minutesRef);

        const meetingDocRef = doc(db, "meetings", meetingId);
        await updateDoc(meetingDocRef, {
          audioUrl,
          minutesUrl,
          updatedAt: serverTimestamp(),
          status: meetingStatus,
          error: error,
        });

        clearTimeout(processingTimeout);
        setLoading(false);
        navigate(`/meeting/${meetingId}`);
        return meetingId;
      } catch (err) {
        console.error(
          "CONTEXT/generateAndSaveMeeting: Error during Firebase storage/update:",
          err
        );
        setError(
          (prevError) => prevError || `Error saving results: ${err.message}`
        );
        if (meetingId) {
          try {
            const meetingRef = doc(db, "meetings", meetingId);
            await updateDoc(meetingRef, {
              status: "failed",
              ...(audioUrl && { audioUrl }),
              ...(minutesUrl && { minutesUrl }),
              error: `Save failed: ${err.message}. ${error || ""}`,
              updatedAt: serverTimestamp(),
            });
          } catch (updateError) {
            console.error(
              "CONTEXT: Failed to update meeting status to failed:",
              updateError
            );
          }
        }
        clearTimeout(processingTimeout);
        setIsGeneratingMinutes(false);
        setLoading(false);
        return null;
      }
    },
    [
      currentUser,
      audioBlob,
      transcription,
      isTranscribing,
      transcribeMeetingAudio,
      error,
      navigate,
    ]
  );

  const loadUserMeetings = useCallback(async () => {
    if (!currentUser) {
      setMeetings([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const meetingsRef = collection(db, "meetings");
      const q = query(meetingsRef, where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      let userMeetings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      userMeetings.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
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
        setCurrentMeeting(null);
        return null;
      }
      setLoading(true);
      setError(null);
      setCurrentMeeting(null);
      try {
        const meetingRef = doc(db, "meetings", meetingId);
        const meetingSnap = await getDoc(meetingRef);

        if (!meetingSnap.exists()) {
          throw new Error("Meeting not found.");
        }
        const meetingData = { id: meetingSnap.id, ...meetingSnap.data() };

        if (meetingData.userId !== currentUser.uid) {
          throw new Error("Access denied.");
        }

        if (meetingData.minutesUrl) {
          try {
            const response = await fetch(meetingData.minutesUrl);
            if (!response.ok) {
              throw new Error(
                `Failed to fetch minutes JSON (Status: ${response.status})`
              );
            }
            const minutesJson = await response.json();
            meetingData.minutesData = minutesJson;
          } catch (fetchError) {
            console.error(
              "CONTEXT/loadMeeting: Error fetching or parsing minutes data:",
              fetchError
            );
            setError(
              (prev) =>
                prev || `Failed to load minutes details: ${fetchError.message}`
            );
            meetingData.minutesData = {
              error: `Could not load minutes details: ${fetchError.message}`,
            };
          }
        } else {
          meetingData.minutesData = null;
        }

        setCurrentMeeting(meetingData);
        return meetingData;
      } catch (err) {
        console.error("CONTEXT/loadMeeting: Error loading meeting:", err);
        setError(`Error loading meeting: ${err.message}`);
        setCurrentMeeting(null);
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
      setLoading(true);
      setError(null);
      let meetingData = null;

      try {
        const meetingRef = doc(db, "meetings", meetingId);
        const meetingSnap = await getDoc(meetingRef);

        if (!meetingSnap.exists()) {
          throw new Error("Meeting not found.");
        }
        meetingData = meetingSnap.data();
        if (meetingData.userId !== currentUser.uid) {
          throw new Error("Permission denied to delete this meeting.");
        }

        const audioPath = `recordings/${currentUser.uid}/${meetingId}/`;
        const minutesPath = `minutes/${currentUser.uid}/${meetingId}/`;

        const safeDeleteObject = async (filePath) => {
          try {
            await deleteObject(ref(storage, filePath));
          } catch (e) {
            if (e.code === "storage/object-not-found") {
            } else {
              console.error(`Failed to delete storage object ${filePath}:`, e);
            }
          }
        };

        await safeDeleteObject(`${audioPath}audio.webm`);
        await safeDeleteObject(`${audioPath}audio.ogg`);
        await safeDeleteObject(`${audioPath}audio.mp3`);
        await safeDeleteObject(`${audioPath}audio.m4a`);
        await safeDeleteObject(`${minutesPath}minutes.json`);

        await deleteDoc(meetingRef);

        setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
        if (currentMeeting?.id === meetingId) {
          setCurrentMeeting(null);
        }
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

  const value = {
    mediaRecorderStatus,
    isRecording,
    previewStream,
    startMeeting,
    endMeeting,
    isUploading,
    handleFileUpload,
    audioBlob,
    transcription,
    minutes,
    meetings,
    currentMeeting,
    loading,
    isTranscribing,
    isGeneratingMinutes,
    error,
    saveAudioBlob,
    transcribeMeetingAudio,
    generateAndSaveMeeting,
    loadUserMeetings,
    loadMeeting,
    removeMeeting,
  };

  return (
    <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>
  );
}

export const MeetingProvider = MeetingProviderComponent;
export default MeetingContext;
