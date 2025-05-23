import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Snackbar,
  useMediaQuery,
  alpha,
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
  const liveTranscriptEndRef = useRef(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [recordingStopped, setRecordingStopped] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en-US");

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    transcript,
    interimTranscript,
    finalTranscript: liveFinalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

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
      resetTranscript();
      SpeechRecognition.startListening({
        continuous: true,
        language: currentLanguage,
      });
    } else if (!contextIsRecording && listening) {
      SpeechRecognition.stopListening();
    }
  }, [
    contextIsRecording,
    listening,
    browserSupportsSpeechRecognition,
    currentLanguage,
    resetTranscript,
    isMicrophoneAvailable,
  ]);

  useEffect(() => {
    if (
      mediaRecorderStatus === "stopped" &&
      activeStep === 0 &&
      !hasTransitionedToStep1.current &&
      audioBlob
    ) {
    }
  }, [mediaRecorderStatus, activeStep, audioBlob, listening]);

  useEffect(() => {
    const transcriptionErrorExists = contextError?.startsWith(
      "Transcription failed"
    );

    if (
      activeStep === 1 &&
      audioBlob &&
      !finalTranscription &&
      !isTranscribing &&
      !transcriptionErrorExists
    ) {
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

  useEffect(() => {
    if (activeStep === 0 && liveTranscriptEndRef.current) {
      liveTranscriptEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [displayedTranscript, activeStep]);

  const toggleRecording = useCallback(() => {
    if (!contextIsRecording && mediaRecorderStatus !== "acquiring_media") {
      setRecordingTime(0);
      hasTransitionedToStep1.current = false;
      setActiveStep(0);
      setRecordingStopped(false);
      resetTranscript();
      startMeeting();
    } else if (contextIsRecording) {
      endMeeting();
      setRecordingStopped(true);
    }
  }, [
    contextIsRecording,
    mediaRecorderStatus,
    startMeeting,
    endMeeting,
    resetTranscript,
  ]);

  const handleLanguageChange = useCallback(
    (event) => {
      const newLang = event.target.value;
      setCurrentLanguage(newLang);
      if (listening) {
        SpeechRecognition.stopListening().then(() => {
          resetTranscript();
          SpeechRecognition.startListening({
            continuous: true,
            language: newLang,
          });
        });
      }
    },
    [listening, resetTranscript]
  );

  const handleCopy = useCallback(async () => {
    const textToCopy = liveFinalTranscript || transcript;
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
  }, [liveFinalTranscript, transcript]);

  const handleShare = useCallback(async () => {
    const textToShare = liveFinalTranscript || transcript;
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
  }, [liveFinalTranscript, transcript]);

  const handleGenerateAndSave = useCallback(async () => {
    if (!meetingTitle.trim()) {
      console.warn("NewMeeting/handleGenerateAndSave: Meeting title is empty.");
      setSnackbarMessage("Please enter a meeting title.");
      setSnackbarOpen(true);
      return;
    }
    if (!finalTranscription) {
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
  }, [meetingTitle, finalTranscription, generateAndSaveMeeting]);

  const handleProcessRecording = useCallback(() => {
    if (audioBlob) {
      setActiveStep(1);
      hasTransitionedToStep1.current = true;
      if (listening) {
        SpeechRecognition.stopListening();
      }
    } else {
      setSnackbarMessage("No recording available to process.");
      setSnackbarOpen(true);
    }
  }, [audioBlob, listening]);

  const handleRecordAgain = useCallback(() => {
    setActiveStep(0);
    setRecordingTime(0);
    resetTranscript();
    setRecordingStopped(false);
    hasTransitionedToStep1.current = false;
    setMeetingTitle("");
  }, [resetTranscript]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const isProcessingMinutes = isGeneratingMinutes || loading;
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
  );

  const cardElevation = 8;
  const cardBorderRadius = 4;
  const cardBoxShadow = "0 15px 50px rgba(0,0,0,0.08)";

  const viewProps = {
    activeStep,
    theme,
    contextIsRecording,
    mediaRecorderStatus,
    toggleRecording,
    startMeeting,
    endMeeting,
    transcribeMeetingAudio,
    generateAndSaveMeeting,
    finalTranscription,
    isTranscribing,
    isGeneratingMinutes,
    loading,
    contextError,
    audioBlob,
    recordingTime,
    meetingTitle,
    setMeetingTitle,
    timerRef,
    waveFrequencyRef,
    waveAmplitudeRef,
    hasTransitionedToStep1,
    liveTranscriptEndRef,
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    recordingStopped,
    setRecordingStopped,
    currentLanguage,
    setCurrentLanguage,
    transcript: liveFinalTranscript || transcript,
    interimTranscript,
    finalTranscript: finalTranscription,
    listening,
    resetTranscript,
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
    handleSnackbarClose,
    isProcessingMinutes,
    processingError,
    recordingError,
    finalTranscriptionError,
    cardElevation,
    cardBorderRadius,
    cardBoxShadow,
    speechRecognitionSupported,
  };

  return (
    <Box>
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            component={RouterLink}
            to="/dashboard"
            startIcon={<ArrowBack />}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
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
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {isMobile ? (
            <NewMeetingMobile {...viewProps} />
          ) : (
            <NewMeetingDesktop {...viewProps} />
          )}
        </Box>
      </Container>
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
