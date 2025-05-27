import {
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
      setTranscription("");
      setMinutes(null);
      setCurrentMeeting(null);
      chunkCounterRef.current = 0;
      clearStoredChunks();
    },
    onStop: async (blobUrl, blob) => {
      setLoading(true);
      setError(null);
      try {
        if (blob && blob.size > 0) {
          await saveChunkToLocalStorage(chunkCounterRef.current, blob);
        }
        const combined = await combineChunksFromLocalStorage();
        if (combined && combined.size > 0) {
          saveAudioBlob(combined);
          console.log("Recording stopped, combined blob saved:", combined);
        } else if (blob && blob.size > 0 && chunkCounterRef.current === 0) {
          saveAudioBlob(blob);
          console.log(
            "Recording stopped, single blob saved (short recording):",
            blob
          );
        } else {
          console.warn("No audio data to save after stopping recording.");
        }
      } catch (err) {
        console.error("Error processing recording on stop:", err);
        setError(
          `Error processing recording: ${err.message}. Please try again.`
        );
        setAudioBlob(null);
      } finally {
        setLoading(false);
        clearBlobUrl();
      }
    },
    onDataAvailable: async (blob) => {
      if (blob.size > 0) {
        try {
          console.log(
            `Data available, chunk ${chunkCounterRef.current}, size: ${blob.size}`
          );
          await saveChunkToLocalStorage(chunkCounterRef.current, blob);
          chunkCounterRef.current += 1;
        } catch (err) {
          console.error("Stopping recording due to localStorage error:", err);
          stopMediaRecorder();
          setError(
            `Recording stopped: Could not save audio chunk. ${err.message}`
          );
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
    if (isRecording || status === "acquiring_media") return;
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
    if (!isRecording) return;
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
        setError(
          `Invalid file type (${
            file.type
          }). Permitted: ${ALLOWED_AUDIO_TYPES.join(", ")}`
        );
        return false;
      }
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        setError(
          `File too large (${(file.size / 1024 / 1024).toFixed(
            1
          )}MB). Max: ${MAX_UPLOAD_SIZE_MB}MB.`
        );
        return false;
      }
      setIsUploading(true);
      setError(null);
      setAudioBlob(null);
      setTranscription("");
      setMinutes(null);
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
      setError("No audio to transcribe.");
      return false;
    }
    if (transcription && !error?.includes("Transcription failed")) return true;

    setLoading(true);
    setIsTranscribing(true);
    setError(null);
    try {
      const transcriptText = await transcribeAudio(audioBlob);
      if (transcriptText === null || transcriptText === undefined)
        throw new Error("Transcription service returned invalid result.");
      setTranscription(transcriptText);
      return true;
    } catch (err) {
      setError(`Transcription failed: ${err.message}`);
      setTranscription("");
      return false;
    } finally {
      setIsTranscribing(false);
      setLoading(false);
    }
  }, [audioBlob, transcription, error]);

  const generateAndSaveMeeting = useCallback(
    async (title = "Untitled Meeting") => {
      if (!audioBlob || !currentUser) {
        setError("No recording/upload or user not logged in.");
        return null;
      }
      if (!transcription && !isTranscribing) {
        setError("Transcription needed. Processing audio first...");
        const transcriptionSuccess = await transcribeMeetingAudio();
        if (!transcriptionSuccess) return null;
        await new Promise((resolve) => setTimeout(resolve, 100));
      } else if (isTranscribing) {
        setError("Wait for transcription to complete.");
        return null;
      } else if (!transcription) {
        setError("Transcription is missing.");
        return null;
      }

      setLoading(true);
      setIsGeneratingMinutes(true);
      setError(null);
      let meetingId = null;

      try {
        const generatedMinutesData = await generateMinutes(
          transcription,
          title
        );
        setMinutes(generatedMinutesData);

        const meetingStatus =
          generatedMinutesData && !generatedMinutesData.error
            ? "completed"
            : "completed_partial";

        const meetingDocData = {
          title,
          status: meetingStatus,
          userId: currentUser.uid,
          creatorName: currentUser.displayName || "Unknown",
          creatorEmail: currentUser.email,
          hasTranscription: !!transcription,
          hasMinutes: !generatedMinutesData?.error,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          audioUrl: null,
          minutesUrl: null,
          error: generatedMinutesData?.error
            ? `Minutes Gen: ${generatedMinutesData.error}`
            : null,
        };
        const docRef = await addDoc(collection(db, "meetings"), meetingDocData);
        meetingId = docRef.id;

        const audioPath = `recordings/${currentUser.uid}/${meetingId}/audio.${
          audioBlob.type.split("/")[1] || "webm"
        }`;
        const audioStorageRef = ref(storage, audioPath);
        await uploadBytes(audioStorageRef, audioBlob);
        const audioUrl = await getDownloadURL(audioStorageRef);

        const fullMinutesToStore = {
          ...generatedMinutesData,
          transcription: transcription,
          audioUrl: audioUrl,
        };
        const minutesPath = `minutes/${currentUser.uid}/${meetingId}/minutes.json`;
        const minutesStorageRef = ref(storage, minutesPath);
        const jsonBlob = new Blob(
          [JSON.stringify(fullMinutesToStore, null, 2)],
          { type: "application/json" }
        );
        await uploadBytes(minutesStorageRef, jsonBlob);
        const minutesUrl = await getDownloadURL(minutesStorageRef);

        await updateDoc(doc(db, "meetings", meetingId), {
          audioUrl,
          minutesUrl,
          updatedAt: serverTimestamp(),
          status: meetingStatus,
        });

        navigate(`/meeting/${meetingId}`);
        return meetingId;
      } catch (err) {
        console.error(
          "CONTEXT/generateAndSaveMeeting: Firebase/OpenAI Error:",
          err
        );
        setError(`Error saving results: ${err.message}`);
        if (meetingId) {
          await updateDoc(doc(db, "meetings", meetingId), {
            status: "failed",
            error: `Save failed: ${err.message}`,
            updatedAt: serverTimestamp(),
          });
        }
        return null;
      } finally {
        setIsGeneratingMinutes(false);
        setLoading(false);
      }
    },
    [
      currentUser,
      audioBlob,
      transcription,
      isTranscribing,
      transcribeMeetingAudio,
      navigate,
    ]
  );

  const saveUpdatedMinutes = useCallback(
    async (meetingId, updatedFullMinutesData, updatedTitle) => {
      if (!currentUser || !meetingId) {
        setError("Authentication error or missing meeting ID.");
        return false;
      }
      if (!updatedFullMinutesData && !updatedTitle) {
        setError("No changes to save.");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const meetingDocRef = doc(db, "meetings", meetingId);
        const currentMeetingSnap = await getDoc(meetingDocRef);

        if (!currentMeetingSnap.exists()) {
          throw new Error("Meeting not found in database for update.");
        }
        const existingMeetingDbData = currentMeetingSnap.data();

        const minutesPath = `minutes/${currentUser.uid}/${meetingId}/minutes.json`;
        const minutesStorageRef = ref(storage, minutesPath);

        const finalMinutesObjectForStorage = {
          audioUrl:
            existingMeetingDbData.minutesData?.audioUrl ||
            updatedFullMinutesData?.audioUrl ||
            currentMeeting?.minutesData?.audioUrl ||
            null,
          ...updatedFullMinutesData,
        };

        const jsonBlob = new Blob(
          [JSON.stringify(finalMinutesObjectForStorage, null, 2)],
          {
            type: "application/json",
          }
        );
        await uploadBytes(minutesStorageRef, jsonBlob);
        const newMinutesUrl = await getDownloadURL(minutesStorageRef);

        const firestoreUpdates = {
          minutesUrl: newMinutesUrl,
          updatedAt: serverTimestamp(),
        };

        if (updatedTitle && updatedTitle !== existingMeetingDbData.title) {
          firestoreUpdates.title = updatedTitle;
        }

        if (
          existingMeetingDbData.minutesData?.error &&
          !finalMinutesObjectForStorage.error
        ) {
          firestoreUpdates.status = "completed";
          firestoreUpdates.error = null;
        } else if (finalMinutesObjectForStorage.error) {
          firestoreUpdates.status = "completed_partial";
          firestoreUpdates.error = `Minutes data issue: ${finalMinutesObjectForStorage.error}`;
        }

        await updateDoc(meetingDocRef, firestoreUpdates);

        if (currentMeeting && currentMeeting.id === meetingId) {
          setCurrentMeeting((prev) => ({
            ...prev,
            title: updatedTitle || prev.title,
            minutesData: finalMinutesObjectForStorage,
            minutesUrl: newMinutesUrl,
            status: firestoreUpdates.status || prev.status,
            error:
              firestoreUpdates.error !== undefined
                ? firestoreUpdates.error
                : prev.error,
            updatedAt: { seconds: Math.floor(Date.now() / 1000) },
          }));
        }

        setLoading(false);
        return true;
      } catch (err) {
        console.error(
          "CONTEXT/saveUpdatedMinutes: Error saving updated minutes:",
          err
        );
        setError(`Error saving changes: ${err.message}. Please try again.`);
        setLoading(false);
        return false;
      }
    },
    [currentUser, db, storage, currentMeeting, setCurrentMeeting]
  );

  const loadUserMeetings = useCallback(async () => {
    if (!currentUser) {
      setMeetings([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "meetings"),
        where("userId", "==", currentUser.uid)
      );
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
        if (!meetingSnap.exists()) throw new Error("Meeting not found.");

        const meetingData = { id: meetingSnap.id, ...meetingSnap.data() };
        if (meetingData.userId !== currentUser.uid)
          throw new Error("Access denied.");

        if (meetingData.minutesUrl) {
          try {
            const response = await fetch(meetingData.minutesUrl);
            if (!response.ok)
              throw new Error(
                `Workspace minutes JSON failed (Status: ${response.status})`
              );
            const minutesJson = await response.json();
            meetingData.minutesData = minutesJson;
          } catch (fetchError) {
            console.error(
              "CONTEXT/loadMeeting: Error fetching minutes data:",
              fetchError
            );
            setError(
              (prevError) =>
                prevError ||
                `Failed to load minutes details: ${fetchError.message}`
            );
            meetingData.minutesData = {
              error: `Could not load minutes: ${fetchError.message}`,
            };
          }
        } else {
          meetingData.minutesData = null;
        }
        setCurrentMeeting(meetingData);
        return meetingData;
      } catch (err) {
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
      try {
        const meetingRef = doc(db, "meetings", meetingId);
        const meetingSnap = await getDoc(meetingRef);
        if (!meetingSnap.exists())
          throw new Error("Meeting not found for deletion.");
        if (meetingSnap.data().userId !== currentUser.uid)
          throw new Error("Permission denied.");

        const audioFileName = meetingSnap
          .data()
          .audioUrl?.split("/")
          .pop()
          ?.split("?")[0];
        if (audioFileName) {
          const audioPath = `recordings/${
            currentUser.uid
          }/${meetingId}/${decodeURIComponent(audioFileName)}`;
          try {
            await deleteObject(ref(storage, audioPath));
          } catch (e) {
            if (e.code !== "storage/object-not-found")
              console.error(`Failed to delete audio ${audioPath}:`, e);
          }
        }
        if (meetingSnap.data().minutesUrl) {
          const minutesPath = `minutes/${currentUser.uid}/${meetingId}/minutes.json`;
          try {
            await deleteObject(ref(storage, minutesPath));
          } catch (e) {
            if (e.code !== "storage/object-not-found")
              console.error(`Failed to delete minutes ${minutesPath}:`, e);
          }
        }

        await deleteDoc(meetingRef);
        setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
        if (currentMeeting?.id === meetingId) setCurrentMeeting(null);
        return true;
      } catch (err) {
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
    saveUpdatedMinutes,
  };

  return (
    <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>
  );
}

export const MeetingProvider = MeetingProviderComponent;
export default MeetingContext;
