import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useMeeting } from "../../context/MeetingContext"; // ASSUMING PATH
import { motion } from "framer-motion";
import {
  Box,
  Grid,
  Typography,
  Button,
  Alert,
  Fab,
  IconButton,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Tooltip,
  alpha,
  CircularProgress,
  Snackbar,
  useTheme,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  Language as LanguageIcon,
  FiberManualRecord as RecordIcon,
  InfoOutlined as InfoIcon,
  TipsAndUpdates as TipsIcon,
  Close as CloseIcon,
  Check as CheckMarkIcon,
  FileUpload as FileUploadIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  // Save as SaveIcon, // ProcessingView might have its own icons
  // Restore as RestoreIcon,
  // Done as DoneIcon,
} from "@mui/icons-material";

import LiveTranscriptCard from "./LiveTranscriptCard"; // ASSUMING PATH
import ProcessingView from "./ProcessingView"; // ASSUMING PATH

const NewMeetingMobile = () => {
  const theme = useTheme();

  const {
    mediaRecorderStatus,
    isRecording: contextIsRecording,
    startMeeting,
    endMeeting,
    isUploading: contextIsUploading,
    handleFileUpload: contextHandleFileUpload,
    audioBlob,
    transcription: finalTranscriptionFromContext,
    isTranscribing: contextIsTranscribing,
    isGeneratingMinutes,
    loading: contextLoading,
    error: contextError,
    transcribeMeetingAudio: contextTranscribeMeetingAudio,
    generateAndSaveMeeting: contextGenerateAndSaveMeeting,
    clearMeetingError,
    resetMeetingContextState,
  } = useMeeting();

  const [recordingTime, setRecordingTime] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("en-US");

  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [tipsDrawerOpen, setTipsDrawerOpen] = useState(false);

  const timerRef = useRef(null);
  const hasProcessedRef = useRef(false);
  const liveTranscriptEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
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
    () => alpha(theme.palette.secondary.main, 0.25),
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

  const isLoading = useMemo(
    () =>
      contextLoading ||
      contextIsUploading ||
      (contextIsRecording && mediaRecorderStatus === "acquiring_media"),
    [
      contextLoading,
      contextIsUploading,
      contextIsRecording,
      mediaRecorderStatus,
    ]
  );

  const isReadyToProcess = useMemo(() => {
    return (
      !!audioBlob &&
      !contextIsRecording &&
      !contextIsUploading &&
      !isLoading &&
      !contextIsTranscribing &&
      !isGeneratingMinutes
    );
  }, [
    audioBlob,
    contextIsRecording,
    contextIsUploading,
    isLoading,
    contextIsTranscribing,
    isGeneratingMinutes,
  ]);

  const canProcess = useMemo(() => {
    const hasData = !!audioBlob;
    const isIdle =
      !contextIsRecording &&
      !contextIsTranscribing &&
      !isGeneratingMinutes &&
      !isLoading &&
      !contextIsUploading;
    return hasData && isIdle;
  }, [
    audioBlob,
    contextIsRecording,
    contextIsTranscribing,
    isGeneratingMinutes,
    isLoading,
    contextIsUploading,
  ]);

  const isProcessingAny = useMemo(
    () =>
      contextIsTranscribing ||
      isGeneratingMinutes ||
      isLoading ||
      contextIsUploading,
    [contextIsTranscribing, isGeneratingMinutes, isLoading, contextIsUploading]
  );

  const showMinuteContent = useMemo(
    () =>
      activeStep === 1 &&
      !!finalTranscriptionFromContext &&
      !contextIsTranscribing,
    [activeStep, finalTranscriptionFromContext, contextIsTranscribing]
  );

  useEffect(() => {
    if (contextIsRecording && mediaRecorderStatus === "recording") {
      timerRef.current = setInterval(
        () => setRecordingTime((prev) => prev + 1),
        1000
      );
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [contextIsRecording, mediaRecorderStatus]);

  useEffect(() => {
    if (contextError) {
      const errorMessage =
        contextError === "string"
          ? contextError
          : contextError.message || "An unexpected error occurred.";
      setSnackbarMessage(`Error: ${errorMessage}`);
      setSnackbarOpen(true);
      if (typeof clearMeetingError === "function") clearMeetingError();
    }
  }, [contextError, clearMeetingError]);

  useEffect(() => {
    if (activeStep === 0 && listening && liveTranscriptEndRef.current) {
      liveTranscriptEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [displayedTranscript, activeStep, listening]);

  useEffect(() => {
    const startListening = async () => {
      try {
        await SpeechRecognition.startListening({
          continuous: true,
          language: currentLanguage,
        });
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setSnackbarMessage("Could not start microphone for live transcript.");
        setSnackbarOpen(true);
      }
    };

    if (
      contextIsRecording &&
      mediaRecorderStatus === "recording" &&
      speechRecognitionSupported &&
      isMicrophoneAvailable &&
      !listening
    ) {
      resetTranscript();
      startListening();
    } else if (
      (!contextIsRecording ||
        !isMicrophoneAvailable ||
        !speechRecognitionSupported ||
        mediaRecorderStatus !== "recording") &&
      listening
    ) {
      SpeechRecognition.stopListening();
    }
  }, [
    contextIsRecording,
    mediaRecorderStatus,
    speechRecognitionSupported,
    isMicrophoneAvailable,
    listening,
    currentLanguage,
    resetTranscript,
  ]);

  useEffect(() => {
    const shouldTranscribe =
      activeStep === 1 &&
      audioBlob &&
      !finalTranscriptionFromContext &&
      !contextIsTranscribing &&
      !contextError?.includes("Transcription failed");
    if (shouldTranscribe && hasProcessedRef.current) {
      contextTranscribeMeetingAudio();
    }
  }, [
    activeStep,
    audioBlob,
    finalTranscriptionFromContext,
    contextIsTranscribing,
    contextError,
    contextTranscribeMeetingAudio,
  ]);

  const handleFullResetForNewRecording = useCallback(() => {
    if (typeof resetMeetingContextState === "function") {
      resetMeetingContextState();
    }
    resetTranscript();
    setRecordingTime(0);
    setActiveStep(0);
    setMeetingTitle("");
    hasProcessedRef.current = false;
  }, [resetTranscript, resetMeetingContextState]);

  const toggleRecording = useCallback(() => {
    if (
      !contextIsRecording &&
      mediaRecorderStatus !== "acquiring_media" &&
      !contextIsUploading
    ) {
      handleFullResetForNewRecording();
      startMeeting();
    } else if (contextIsRecording) {
      endMeeting();
    }
  }, [
    contextIsRecording,
    mediaRecorderStatus,
    contextIsUploading,
    startMeeting,
    endMeeting,
    handleFullResetForNewRecording,
  ]);

  const handleLanguageChangeInternal = useCallback(
    async (langCode) => {
      setCurrentLanguage(langCode);
      if (listening) {
        await SpeechRecognition.stopListening();
        resetTranscript();
        try {
          await SpeechRecognition.startListening({
            continuous: true,
            language: langCode,
          });
        } catch (error) {
          console.error(
            "Error restarting speech recognition with new language:",
            error
          );
          setSnackbarMessage("Error applying new language to live transcript.");
          setSnackbarOpen(true);
        }
      }
      setLanguageDialogOpen(false);
    },
    [listening, resetTranscript]
  );

  const handleUploadClickInternal = useCallback(
    () => fileInputRef.current?.click(),
    []
  );

  const handleFileSelectedInternal = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      event.target.value = null;
      handleFullResetForNewRecording();

      const success = await contextHandleFileUpload(file);
      if (success) {
        setSnackbarMessage("File ready. Tap 'Process' to continue.");
      } else if (!contextError) {
        setSnackbarMessage("File upload failed.");
      }
      setSnackbarOpen(true);
    },
    [contextHandleFileUpload, handleFullResetForNewRecording, contextError]
  );

  const handleCopyToClipboard = useCallback(async (textToCopy) => {
    if (!textToCopy) {
      setSnackbarMessage("Nothing to copy!");
      setSnackbarOpen(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      setSnackbarMessage("Copied!");
    } catch (err) {
      console.error("Copy failed:", err);
      setSnackbarMessage("Copy failed.");
    }
    setSnackbarOpen(true);
  }, []);

  const handleShareTranscript = useCallback(
    async (textToShare, title = "Meeting Transcript") => {
      if (!textToShare) {
        setSnackbarMessage("Nothing to share!");
        setSnackbarOpen(true);
        return;
      }
      if (navigator.share) {
        try {
          await navigator.share({ title, text: textToShare });
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error("Share failed:", err);
            setSnackbarMessage("Share failed.");
            setSnackbarOpen(true);
          }
        }
      } else {
        setSnackbarMessage("Share not supported. Copy instead.");
        setSnackbarOpen(true);
      }
    },
    []
  );

  const handleProcessRecordingInternal = useCallback(() => {
    if (canProcess) {
      setActiveStep(1);
      hasProcessedRef.current = true;
      if (listening) SpeechRecognition.stopListening();
    } else {
      let msg = "Cannot process audio yet.";
      if (!audioBlob) msg = "No audio available to process.";
      else if (isProcessingAny) msg = "Processing is already in progress.";
      setSnackbarMessage(msg);
      setSnackbarOpen(true);
    }
  }, [canProcess, audioBlob, isProcessingAny, listening]);

  const handleGenerateAndSaveInternal = useCallback(async () => {
    if (!meetingTitle.trim()) {
      setSnackbarMessage("Please enter a meeting title.");
      setSnackbarOpen(true);
      return;
    }
    if (!finalTranscriptionFromContext && !contextIsTranscribing) {
      setSnackbarMessage("Transcription not complete.");
      setSnackbarOpen(true);
      return;
    }
    if (isProcessingAny) {
      setSnackbarMessage("Please wait for current tasks to finish.");
      setSnackbarOpen(true);
      return;
    }

    const success = await contextGenerateAndSaveMeeting(meetingTitle);
    setSnackbarMessage(
      success
        ? "Minutes generated and saved!"
        : contextError || "Failed to generate minutes."
    );
    setSnackbarOpen(true);
    if (success) {
    }
  }, [
    meetingTitle,
    finalTranscriptionFromContext,
    contextIsTranscribing,
    isProcessingAny,
    contextGenerateAndSaveMeeting,
    contextError,
  ]);

  const handleRecordAgainInternal = useCallback(() => {
    handleFullResetForNewRecording();
  }, [handleFullResetForNewRecording]);

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  }, []);

  const categorizedRecordingError = useMemo(
    () =>
      contextError?.startsWith("Recording Error:")
        ? contextError.replace("Recording Error: ", "")
        : null,
    [contextError]
  );
  const categorizedFinalTranscriptionError = useMemo(
    () =>
      contextError?.startsWith("Transcription failed") ? contextError : null,
    [contextError]
  );
  const categorizedProcessingError = useMemo(
    () =>
      contextError &&
      !categorizedRecordingError &&
      !categorizedFinalTranscriptionError
        ? contextError
        : null,
    [
      contextError,
      categorizedRecordingError,
      categorizedFinalTranscriptionError,
    ]
  );

  const formatTime = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;

  const languages = useMemo(
    () => [
      { code: "en-US", name: "English (US)" },
      { code: "en-GB", name: "English (UK)" },
      { code: "hi-IN", name: "Hindi" },
      { code: "gu-IN", name: "Gujarati" },
      { code: "es-ES", name: "Spanish" },
      { code: "fr-FR", name: "French" },
      { code: "de-DE", name: "German" },
      { code: "ja-JP", name: "Japanese" },
    ],
    []
  );

  const getStatusText = () => {
    if (
      isLoading &&
      !contextIsUploading &&
      !contextIsRecording &&
      !isReadyToProcess &&
      !listening
    )
      return "Loading...";
    if (contextIsUploading) return "Processing upload...";
    if (mediaRecorderStatus === "acquiring_media")
      return "Connecting to microphone...";
    if (contextIsRecording && mediaRecorderStatus === "failed")
      return "Mic connection failed. Check permissions.";
    if (!speechRecognitionSupported && !audioBlob && !contextIsRecording)
      return "Live transcript not supported by browser.";
    if (!isMicrophoneAvailable && !audioBlob && !contextIsRecording)
      return "Microphone unavailable or access denied.";
    if (isReadyToProcess)
      return `Audio ready (${formatTime(recordingTime || 0)}). Tap Process.`;
    if (contextIsRecording && listening)
      return "Listening for live transcript...";
    if (contextIsRecording && !listening && mediaRecorderStatus === "recording")
      return "Recording... (Live transcript pending or mic issues)";
    if (contextIsRecording) return "Recording in progress...";
    return "Tap record or upload file";
  };
  const statusText = getStatusText();

  const cardElevation = 1;
  const cardBorderRadius = "12px";
  const cardBoxShadow = theme.shadows[1];

  const pulsateKeyframesSx = {
    "@keyframes pulsateFab": {},
    "@keyframes pulsateChip": {},
  };

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        pb: 12,
        ...pulsateKeyframesSx,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelectedInternal}
        style={{ display: "none" }}
      />

      {activeStep === 0 && (
        <motion.div
          key="step0-mobile-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            elevation={2}
            sx={{
              width: "100%",
              mb: 2,
              borderRadius: "12px",
              overflow: "hidden",
              position: "sticky",
              top: 0,
              zIndex: 1100,
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 40,
                bgcolor: contextIsRecording
                  ? alpha(theme.palette.error.light, 0.15)
                  : isReadyToProcess
                  ? alpha(theme.palette.success.light, 0.15)
                  : contextIsUploading
                  ? alpha(theme.palette.info.light, 0.15)
                  : alpha(theme.palette.primary.light, 0.15),
                borderBottom: "1px solid",
                borderColor: contextIsRecording
                  ? alpha(theme.palette.error.main, 0.3)
                  : isReadyToProcess
                  ? alpha(theme.palette.success.main, 0.3)
                  : contextIsUploading
                  ? alpha(theme.palette.info.main, 0.3)
                  : alpha(theme.palette.primary.main, 0.3),
              }}
            >
              {contextIsRecording ? (
                <Chip
                  icon={<RecordIcon fontSize="small" />}
                  label={`Recording: ${formatTime(recordingTime)}`}
                  color="error"
                  size="small"
                  sx={{
                    borderRadius: "16px",
                    fontWeight: 500,
                    animation: "$pulsateChip 1.5s infinite ease-out",
                  }}
                />
              ) : isReadyToProcess ? (
                <Chip
                  icon={<CheckMarkIcon fontSize="small" />}
                  label={`Ready: ${formatTime(recordingTime || 0)}`}
                  color="success"
                  size="small"
                  sx={{ borderRadius: "16px", fontWeight: 500 }}
                />
              ) : contextIsUploading ? (
                <Chip
                  icon={<CircularProgress size={16} color="inherit" />}
                  label="Uploading..."
                  color="info"
                  size="small"
                  sx={{ borderRadius: "16px", fontWeight: 500 }}
                />
              ) : (
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "text.secondary" }}
                >
                  Ready to Record / Upload
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                p: 1.5,
                pt: 1,
                pb: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
                <Tooltip title="Select language">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setLanguageDialogOpen(true)}
                    disabled={
                      listening ||
                      contextIsRecording ||
                      contextIsUploading ||
                      isLoading
                    }
                    sx={{
                      borderRadius: "16px",
                      minWidth: { xs: 38, sm: 40 },
                      p: { xs: "4px 8px", sm: "4px 12px" },
                    }}
                  >
                    <LanguageIcon fontSize="small" />
                  </Button>
                </Tooltip>
                <Tooltip title="Upload audio file">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleUploadClickInternal}
                    disabled={
                      contextIsRecording || isLoading || contextIsUploading
                    }
                    sx={{
                      borderRadius: "16px",
                      minWidth: { xs: 38, sm: 40 },
                      p: "4px 8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FileUploadIcon
                      fontSize="small"
                      sx={{ mr: { xs: 0, sm: 0.5 } }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        display: { xs: "none", sm: "block" },
                        lineHeight: 1.2,
                      }}
                    >
                      Upload Recording
                    </Typography>
                  </Button>
                </Tooltip>
              </Box>
              <Tooltip title="Meeting tips">
                <IconButton
                  color="primary"
                  onClick={() => setTipsDrawerOpen(true)}
                  size="small"
                  sx={{
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                    borderRadius: "16px",
                  }}
                >
                  <TipsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          <Box sx={{ textAlign: "center", my: 1.5, px: 2, minHeight: "2.8em" }}>
            <Typography variant="caption" color="text.secondary" component="p">
              {statusText}
            </Typography>
          </Box>

          <Grid
            container
            spacing={0}
            alignItems="stretch"
            sx={{ px: { xs: 0.5, sm: 1 } }}
          >
            <Grid item xs={12}>
              <LiveTranscriptCard
                elevation={cardElevation}
                sx={{
                  height: "auto",
                  minHeight: { xs: 180, sm: 200 },
                  borderRadius: cardBorderRadius,
                  boxShadow: cardBoxShadow,
                }}
                listening={listening}
                currentLanguage={currentLanguage}
                handleCopy={handleCopyToClipboard}
                handleShare={handleShareTranscript}
                transcript={liveFinalTranscript}
                speechRecognitionSupported={speechRecognitionSupported}
                isMicrophoneAvailable={isMicrophoneAvailable}
                displayedTranscript={displayedTranscript}
                keywordsToHighlight={keywordsToHighlight}
                highlightColor={highlightColor}
                contextIsRecording={contextIsRecording}
                liveTranscriptEndRef={liveTranscriptEndRef}
              />
            </Grid>
          </Grid>

          {categorizedRecordingError && !contextIsRecording && (
            <Alert
              severity="error"
              sx={{ mt: 2, mx: { xs: 0.5, sm: 1 }, borderRadius: "12px" }}
            >
              {categorizedRecordingError}
            </Alert>
          )}

          <Dialog
            open={languageDialogOpen}
            onClose={() => setLanguageDialogOpen(false)}
            PaperProps={{
              sx: { borderRadius: "16px", width: "90%", maxWidth: 380 },
            }}
          >
            <DialogTitle
              sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LanguageIcon sx={{ mr: 1.5, color: "primary.main" }} />
                  <Typography variant="h6" fontWeight={600}>
                    Select Language
                  </Typography>
                </Box>
                <IconButton
                  edge="end"
                  onClick={() => setLanguageDialogOpen(false)}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 2 }}>
              <List sx={{ pt: 0 }}>
                {languages.map((lang) => (
                  <ListItem
                    button
                    onClick={() => handleLanguageChangeInternal(lang.code)}
                    key={lang.code}
                    disabled={
                      listening ||
                      contextIsRecording ||
                      contextIsUploading ||
                      isLoading
                    }
                    sx={{
                      borderRadius: "12px",
                      mb: 1,
                      border: `1px solid ${
                        currentLanguage === lang.code
                          ? theme.palette.primary.main
                          : alpha(theme.palette.divider, 0.3)
                      }`,
                      bgcolor:
                        currentLanguage === lang.code
                          ? alpha(theme.palette.primary.main, 0.08)
                          : "transparent",
                      "&:hover": {
                        bgcolor:
                          currentLanguage !== lang.code
                            ? alpha(theme.palette.action.hover, 0.04)
                            : undefined,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <LanguageIcon
                        fontSize="small"
                        color={
                          currentLanguage === lang.code ? "primary" : "inherit"
                        }
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={lang.name}
                      primaryTypographyProps={{
                        fontWeight: currentLanguage === lang.code ? 500 : 400,
                      }}
                    />
                    {currentLanguage === lang.code && (
                      <CheckMarkIcon color="primary" fontSize="small" />
                    )}
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1 }}>
              <Button
                onClick={() => setLanguageDialogOpen(false)}
                variant="outlined"
                fullWidth
                sx={{ borderRadius: "20px" }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>

          <Drawer
            anchor="bottom"
            open={tipsDrawerOpen}
            onClose={() => setTipsDrawerOpen(false)}
            PaperProps={{
              sx: {
                maxHeight: "85vh",
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px",
                overflow: "hidden",
              },
            }}
          >
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `1px solid ${theme.palette.divider}`,
                position: "sticky",
                top: 0,
                bgcolor: "background.paper",
                zIndex: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TipsIcon color="warning" sx={{ mr: 1.5 }} />
                <Typography variant="h6" fontWeight={600}>
                  Meeting Tips
                </Typography>
              </Box>
              <IconButton onClick={() => setTipsDrawerOpen(false)} edge="end">
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ p: 2, overflowY: "auto", pb: 10 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                How to Get Better Results
              </Typography>
              <List dense>
                {[
                  {
                    number: 1,
                    title: "Start with introductions",
                    description:
                      "Begin by stating all participants' names clearly.",
                  },
                  {
                    number: 2,
                    title: "State the agenda clearly",
                    description:
                      'Use phrases like "Today\'s agenda includes..."',
                  },
                  {
                    number: 3,
                    title: "Highlight action items",
                    description:
                      'Mention keywords like "Action Item", "Next Steps", etc.',
                  },
                  {
                    number: 4,
                    title: "Summarize at the end",
                    description:
                      'End with "To summarize our discussion today..."',
                  },
                ].map((tip) => (
                  <ListItem
                    key={tip.number}
                    sx={{ mb: 1.5, px: 0, alignItems: "flex-start" }}
                  >
                    {" "}
                    <ListItemIcon sx={{ minWidth: 38, mt: 0.5 }}>
                      {" "}
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: "primary.main",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          flexShrink: 0,
                        }}
                      >
                        {" "}
                        {tip.number}{" "}
                      </Box>{" "}
                    </ListItemIcon>{" "}
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600}>
                          {tip.title}
                        </Typography>
                      }
                      secondary={tip.description}
                    />{" "}
                  </ListItem>
                ))}
              </List>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  borderRadius: "12px",
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <InfoIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Pro Tip
                  </Typography>
                </Box>
                <Typography variant="body2">
                  Position your device closer to the speaker and minimize
                  background noise for the best recording quality.
                </Typography>
              </Box>
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  borderRadius: "12px",
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Recognized Keywords (Examples)
                </Typography>
                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mt: 1 }}
                >
                  {(keywordsToHighlight || []).slice(0, 12).map((keyword) => (
                    <Chip
                      key={keyword}
                      label={keyword}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: "16px" }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                position: "sticky",
                bottom: 0,
                bgcolor: "background.paper",
                zIndex: 1,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                onClick={() => setTipsDrawerOpen(false)}
                sx={{
                  borderRadius: "20px",
                  py: 1.25,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Got it
              </Button>
            </Box>
          </Drawer>

          <Fab
            color={
              contextIsRecording
                ? "error"
                : isReadyToProcess
                ? "success"
                : "primary"
            }
            aria-label={
              contextIsRecording
                ? "Stop recording"
                : isReadyToProcess
                ? "Process Audio"
                : "Start recording"
            }
            onClick={
              isReadyToProcess
                ? handleProcessRecordingInternal
                : toggleRecording
            }
            disabled={
              isReadyToProcess
                ? !canProcess || isLoading || contextIsUploading
                : isLoading ||
                  contextIsUploading ||
                  mediaRecorderStatus === "acquiring_media" ||
                  (!isMicrophoneAvailable &&
                    !audioBlob &&
                    !contextIsRecording) ||
                  (!speechRecognitionSupported &&
                    !audioBlob &&
                    !contextIsRecording)
            }
            sx={{
              position: "fixed",
              bottom: { xs: 24, sm: 32 },
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: theme.shadows[8],
              width: isReadyToProcess ? "auto" : { xs: 60, sm: 64 },
              height: isReadyToProcess ? 48 : { xs: 60, sm: 64 },
              px: isReadyToProcess ? 3 : undefined,
              borderRadius: isReadyToProcess ? "28px" : "50%",
              transition: "all 0.25s ease-in-out",
              ...(contextIsRecording && {
                animation: "$pulsateFab 1.5s infinite ease-out",
              }),
            }}
          >
            {isReadyToProcess ? (
              (isLoading && !contextIsUploading) || contextIsUploading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <>
                  {" "}
                  <PlayIcon sx={{ mr: 0.8 }} /> Process{" "}
                </>
              )
            ) : contextIsRecording ? (
              <StopIcon />
            ) : (
              <MicIcon />
            )}
          </Fab>
        </motion.div>
      )}

      {activeStep === 1 && (
        <motion.div
          key="step1-mobile-view"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            paddingTop: "8px",
          }}
        >
          <ProcessingView
            finalTranscription={finalTranscriptionFromContext}
            isTranscribing={contextIsTranscribing}
            finalTranscriptionError={categorizedFinalTranscriptionError}
            contextError={categorizedProcessingError}
            transcribeMeetingAudio={contextTranscribeMeetingAudio}
            audioBlob={audioBlob}
            meetingTitle={meetingTitle}
            setMeetingTitle={setMeetingTitle}
            handleGenerateAndSave={handleGenerateAndSaveInternal}
            isProcessingMinutes={isGeneratingMinutes}
            processingError={categorizedProcessingError}
            handleRecordAgain={handleRecordAgainInternal}
            cardElevation={cardElevation}
            cardBorderRadius={cardBorderRadius}
            cardBoxShadow={cardBoxShadow}
            isLoading={isLoading}
            theme={theme}
            highlightColor={highlightColor}
            keywordsToHighlight={keywordsToHighlight}
            currentLanguage={currentLanguage}
            recordingTime={recordingTime}
            handleCopy={handleCopyToClipboard}
            handleShare={handleShareTranscript}
            showMinuteContent={showMinuteContent}
          />
        </motion.div>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            borderRadius: "8px",
            minWidth: "auto",
            textAlign: "center",
            px: 2.5,
            py: 1.25,
            mb: { xs: 11, sm: 2 },
          },
        }}
      />
    </Box>
  );
};

export default NewMeetingMobile;
