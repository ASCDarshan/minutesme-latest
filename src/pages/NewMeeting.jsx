import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Link as RouterLink } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useMeeting } from "../context/MeetingContext";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Container,
  Typography,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  alpha,
  Snackbar,
  useMediaQuery,
} from "@mui/material";
import { ArrowBack, Mic as MicIcon, Notes } from "@mui/icons-material";

import NewMeetingMobile from "./NewMeeting/NewMeetingMobile";
import NewMeetingDesktop from "./NewMeeting/NewMeetingDesktop";

const NewMeeting = () => {
  const {
    isRecording: contextIsRecording,
    mediaRecorderStatus,
    startMeeting,
    endMeeting,
    transcribeMeetingAudio,
    generateAndSaveMeeting,
    transcription: finalTranscription,
    isTranscribing,
    isGeneratingMinutes,
    loading,
    error: contextError,
    audioBlob,
  } = useMeeting();

  const [recordingTime, setRecordingTime] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [meetingTitle, setMeetingTitle] = useState("");
  const theme = useTheme();
  const timerRef = useRef(null);
  const waveFrequencyRef = useRef(1.5);
  const waveAmplitudeRef = useRef(20);
  const hasTransitionedToStep1 = useRef(false);
  const liveTranscriptEndRef = useRef(null); // Keep refs here
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [recordingStopped, setRecordingStopped] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en-US");

  // --- Hooks ---
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Media Query Hook

  const {
    transcript,
    interimTranscript,
    finalTranscript: liveFinalTranscript, // Rename to avoid clash
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  // --- Memos ---
  const keywordsToHighlight = useMemo(
    () => [
      "agenda",
      "next steps",
      "action plan",
      "action item",
      "goals",
      "summary",
      "summarize",
      "participants",
      "decision",
      "minutes",
      "deadline",
      "follow up",
      "issue",
      "problem",
      "solution",
      "proposal",
      "vote",
      "assign",
      "task",
      "milestone",
      "blocker",
    ],
    []
  );
  const highlightColor = useMemo(
    () => alpha(theme.palette.secondary.main, 0.3),
    [theme]
  );
  const displayedTranscript = useMemo(
    () =>
      liveFinalTranscript + (interimTranscript ? " " + interimTranscript : ""),
    [liveFinalTranscript, interimTranscript]
  );
  const speechRecognitionSupported = useMemo(
    () => browserSupportsSpeechRecognition,
    [browserSupportsSpeechRecognition]
  );

  // --- Effects (Keep all effects here) ---
  useEffect(() => {
    if (contextIsRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [contextIsRecording]);

  useEffect(() => {
    if (
      contextIsRecording &&
      !listening &&
      browserSupportsSpeechRecognition &&
      isMicrophoneAvailable
    ) {
      // Added mic check
      resetTranscript();
      SpeechRecognition.startListening({
        continuous: true,
        language: currentLanguage,
      });
    } else if (!contextIsRecording && listening) {
      SpeechRecognition.stopListening();
    }
    // Cleanup handled by stopListening call above
  }, [
    contextIsRecording,
    listening,
    browserSupportsSpeechRecognition,
    currentLanguage,
    resetTranscript,
    isMicrophoneAvailable,
  ]); // Added mic available

  // Auto-transition to Step 1 logic - Needs adjustment
  useEffect(() => {
    if (
      mediaRecorderStatus === "stopped" &&
      activeStep === 0 && // Only transition from step 0
      !hasTransitionedToStep1.current && // Prevent multiple transitions
      audioBlob // Ensure blob is actually available
      // REMOVED: && false
    ) {
      // console.log("Attempting auto-transition to Step 1");
      // setActiveStep(1); // Auto-transition
      // hasTransitionedToStep1.current = true;
      // if (listening) {
      //    SpeechRecognition.stopListening(); // Ensure listening stops
      // }
      // ---> DECISION: Keep manual "Process Recording" button for clarity <---
      // The auto-transition can be confusing if transcription takes time.
      // The user explicitly clicking "Process" feels more controlled.
    }
  }, [mediaRecorderStatus, activeStep, audioBlob, listening]); // Removed hasTransitionedToStep1 ref dependency for simplicity if re-enabled

  // Transcription Trigger Effect
  useEffect(() => {
    const transcriptionErrorExists = contextError?.startsWith(
      "Transcription failed"
    ); // Optional chaining

    if (
      activeStep === 1 &&
      audioBlob &&
      !finalTranscription &&
      !isTranscribing &&
      !transcriptionErrorExists
    ) {
      // console.log("Triggering transcription...");
      transcribeMeetingAudio();
    }
  }, [
    activeStep,
    audioBlob,
    finalTranscription,
    isTranscribing,
    contextError,
    transcribeMeetingAudio,
  ]);

  // Scroll Live Transcript Effect
  useEffect(() => {
    if (activeStep === 0 && liveTranscriptEndRef.current) {
      liveTranscriptEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [displayedTranscript, activeStep]);

  // --- Handlers (Keep all handlers here) ---
  const toggleRecording = useCallback(() => {
    if (!contextIsRecording && mediaRecorderStatus !== "acquiring_media") {
      setRecordingTime(0);
      hasTransitionedToStep1.current = false; // Reset transition flag
      setActiveStep(0); // Ensure we are on step 0
      setRecordingStopped(false);
      resetTranscript(); // Reset live transcript
      // Reset final transcript and blob? -> Depends on context logic
      startMeeting();
    } else if (contextIsRecording) {
      endMeeting();
      setRecordingStopped(true); // Explicitly set that recording was stopped by user action
    }
  }, [
    contextIsRecording,
    mediaRecorderStatus,
    startMeeting,
    endMeeting,
    resetTranscript,
  ]); // Added resetTranscript

  const handleLanguageChange = useCallback(
    (event) => {
      // Added useCallback
      const newLang = event.target.value;
      setCurrentLanguage(newLang);
      if (listening) {
        SpeechRecognition.stopListening().then(() => {
          resetTranscript(); // Reset transcript for new language
          SpeechRecognition.startListening({
            continuous: true,
            language: newLang,
          });
        });
      }
    },
    [listening, resetTranscript]
  ); // Added resetTranscript

  const handleCopy = useCallback(async () => {
    // Use liveFinalTranscript which holds the non-interim parts from speech-rec hook
    const textToCopy = liveFinalTranscript || transcript; // Fallback to transcript if liveFinal is empty
    if (!textToCopy) {
      setSnackbarMessage("Nothing to copy!");
      setSnackbarOpen(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      setSnackbarMessage("Transcript copied to clipboard!");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      setSnackbarMessage("Failed to copy transcript.");
      setSnackbarOpen(true);
    }
  }, [liveFinalTranscript, transcript]); // Depend on liveFinalTranscript and transcript

  const handleShare = useCallback(async () => {
    const textToShare = liveFinalTranscript || transcript; // Fallback
    if (!textToShare) {
      setSnackbarMessage("Nothing to share!");
      setSnackbarOpen(true);
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meeting Transcript",
          text: textToShare,
        });
        setSnackbarMessage("Transcript shared successfully!");
        setSnackbarOpen(true);
      } catch (err) {
        console.error("Error sharing:", err);
        if (err.name !== "AbortError") {
          setSnackbarMessage("Failed to share transcript.");
          setSnackbarOpen(true);
        }
      }
    } else {
      console.warn("Web Share API not supported.");
      setSnackbarMessage(
        "Web Share not supported by your browser. Try copying instead."
      );
      setSnackbarOpen(true);
    }
  }, [liveFinalTranscript, transcript]); // Depend on liveFinalTranscript and transcript

  const handleGenerateAndSave = useCallback(async () => {
    // Added useCallback
    if (!meetingTitle.trim()) {
      console.warn("NewMeeting/handleGenerateAndSave: Meeting title is empty.");
      setSnackbarMessage("Please enter a meeting title."); // User feedback
      setSnackbarOpen(true);
      return;
    }
    if (!finalTranscription) {
      // Check if final transcription exists
      console.warn(
        "NewMeeting/handleGenerateAndSave: Final transcription not available."
      );
      setSnackbarMessage(
        "Final transcription is not available to generate minutes."
      );
      setSnackbarOpen(true);
      return;
    }
    await generateAndSaveMeeting(meetingTitle);
    // Consider adding success/error handling based on promise result here
  }, [meetingTitle, finalTranscription, generateAndSaveMeeting]); // Added finalTranscription

  const handleProcessRecording = useCallback(() => {
    // Added useCallback
    if (audioBlob) {
      setActiveStep(1);
      hasTransitionedToStep1.current = true; // Mark that we've manually moved to step 1
      if (listening) {
        SpeechRecognition.stopListening(); // Ensure listening stops
      }
    } else {
      setSnackbarMessage("No recording available to process.");
      setSnackbarOpen(true);
    }
  }, [audioBlob, listening]); // Added listening

  const handleRecordAgain = useCallback(() => {
    // Added useCallback
    setActiveStep(0);
    setRecordingTime(0);
    resetTranscript();
    setRecordingStopped(false);
    hasTransitionedToStep1.current = false;
    setMeetingTitle(""); // Reset title
    // Consider adding context reset call here if needed: resetMeetingContextState();
  }, [resetTranscript]); // Added resetTranscript

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // --- Derived State ---
  const isProcessingMinutes = isGeneratingMinutes || loading; // Combined loading state
  const processingError = useMemo(
    () =>
      contextError &&
      !contextError.startsWith("Transcription failed") &&
      !contextError.startsWith("Recording Error")
        ? contextError
        : null,
    [contextError]
  );
  const recordingError = useMemo(
    () =>
      contextError &&
      (mediaRecorderStatus === "error" ||
        contextError.startsWith("Recording Error")),
    [contextError, mediaRecorderStatus]
  );
  const finalTranscriptionError = useMemo(
    () => contextError?.startsWith("Transcription failed"),
    [contextError]
  ); // Optional chaining

  // --- Styling Constants ---
  const cardElevation = 8;
  const cardBorderRadius = 4;
  const cardBoxShadow = "0 15px 50px rgba(0,0,0,0.08)";

  // --- Props object for children ---
  // Consolidate all props needed by child components
  const viewProps = {
    activeStep,
    theme,
    contextIsRecording,
    mediaRecorderStatus,
    toggleRecording,
    startMeeting,
    endMeeting, // Pass down if needed by children (maybe not)
    transcribeMeetingAudio,
    generateAndSaveMeeting, // Pass down
    finalTranscription,
    isTranscribing,
    isGeneratingMinutes,
    loading, // Pass down generic loading
    contextError,
    audioBlob,
    recordingTime,
    meetingTitle,
    setMeetingTitle, // Pass down state and setter
    timerRef, // Pass refs if children need direct access (usually pass value instead)
    waveFrequencyRef,
    waveAmplitudeRef, // Pass refs
    hasTransitionedToStep1, // Pass ref if needed (maybe not)
    liveTranscriptEndRef, // Pass ref
    snackbarOpen,
    setSnackbarOpen, // Pass state and setter (or just handler)
    snackbarMessage,
    setSnackbarMessage, // Pass state and setter (or just handler)
    recordingStopped,
    setRecordingStopped, // Pass state and setter
    currentLanguage,
    setCurrentLanguage, // Pass state and setter
    transcript: liveFinalTranscript || transcript, // Pass combined live transcript
    interimTranscript, // Pass down
    finalTranscript: finalTranscription, // Pass down (already have it)
    listening,
    resetTranscript, // Pass down
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    keywordsToHighlight,
    highlightColor,
    displayedTranscript,
    handleLanguageChange,
    handleCopy,
    handleShare,
    handleGenerateAndSave,
    handleProcessRecording,
    handleRecordAgain,
    handleSnackbarClose, // Pass down snackbar close handler
    isProcessingMinutes,
    processingError,
    recordingError,
    finalTranscriptionError,
    cardElevation,
    cardBorderRadius,
    cardBoxShadow, // Pass styling constants
    speechRecognitionSupported, // Pass memoized value
  };

  // --- Render Logic ---
  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        background: theme.palette.background.default, // Use theme background
        pb: 8,
      }}
    >
      {/* Background Gradient */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%", // Adjusted height
          background: `radial-gradient(circle at 20% 30%, ${alpha(
            theme.palette.primary.main,
            0.07
          )} 0%, transparent 70%)`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: 3 }}>
        {/* Back Button */}
        <Box sx={{ mb: 4 }}>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBack />}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>

        {/* Header */}
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" component="h1" fontWeight={700}>
              {activeStep === 0 ? "Record Your Meeting" : "Process & Review"}
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {activeStep === 0
                ? "Select language, follow instructions, and start recording"
                : "Review transcription and generate minutes"}
            </Typography>
          </motion.div>
        </Box>

        {/* Stepper */}
        <Box sx={{ mb: 5 }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{ maxWidth: 700, mx: "auto" }}
          >
            <Step key="Record">
              <StepLabel
                StepIconComponent={MicIcon}
                StepIconProps={{
                  sx: {
                    fontSize: 28,
                    "&.Mui-active": { color: theme.palette.primary.main },
                    "&.Mui-completed": { color: theme.palette.primary.main },
                  },
                }}
              >
                Record
              </StepLabel>
            </Step>
            <Step key="Process">
              <StepLabel
                StepIconComponent={Notes}
                StepIconProps={{
                  sx: {
                    fontSize: 28,
                    "&.Mui-active": { color: theme.palette.primary.main },
                    "&.Mui-completed": { color: theme.palette.primary.main },
                  },
                }}
              >
                Process & Review
              </StepLabel>
            </Step>
          </Stepper>
        </Box>

        {/* Conditional Rendering based on Screen Size */}
        <Box sx={{ display: "flex", justifyContent: "center", minHeight: 400 }}>
          {isMobile ? (
            <NewMeetingMobile {...viewProps} />
          ) : (
            <NewMeetingDesktop {...viewProps} />
          )}
        </Box>
      </Container>

      {/* Snackbar (Remains Global) */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default NewMeeting;
