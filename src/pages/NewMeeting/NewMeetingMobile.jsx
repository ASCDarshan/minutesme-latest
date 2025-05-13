import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpeechRecognition from "react-speech-recognition";
import { useMeeting } from "../../context/MeetingContext"; // Using original context path
import { useSpeechRecognition } from "react-speech-recognition";

// UI Components
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  Switch,
  Drawer,
  Alert,
  CircularProgress,
  Snackbar,
  useMediaQuery,
} from "@mui/material";

// Icons
import {
  MicNone as MicIcon,
  Stop as StopIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Translate as TranslateIcon,
  Check as CheckIcon,
  FileUpload as UploadIcon,
  LightbulbOutline as TipsIcon,
  MoreVert as MoreIcon,
  PlayArrow as ProcessIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  WifiTethering as LiveIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RecordAgainIcon,
  KeyboardVoice as VoiceIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const MeetingRecorder = () => {
  // Context from original component
  const {
    mediaRecorderStatus,
    isRecording: contextIsRecording,
    startMeeting,
    endMeeting,
    isUploading,
    handleFileUpload,
    audioBlob,
    transcription: finalTranscription,
    isTranscribing,
    isGeneratingMinutes,
    loading,
    error: contextError,
    transcribeMeetingAudio,
    generateAndSaveMeeting,
    clearMeetingError,
    resetMeetingContextState,
  } = useMeeting();

  // Local state
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("en-US");
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);
  const [tipsSheetOpen, setTipsSheetOpen] = useState(false);
  const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showWaveform, setShowWaveform] = useState(true);

  // Refs
  const timerRef = useRef(null);
  const hasProcessedRef = useRef(false);
  const liveTranscriptEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const waveformRef = useRef(null);
  const meetingTitleRef = useRef(null);

  // Speech recognition (from original component)
  const {
    interimTranscript,
    finalTranscript: liveFinalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  // Check if we're on a small screen (true mobile experience)
  const isMobile = useMediaQuery("(max-width:600px)");

  // Keywords to highlight in transcript
  const keywordsToHighlight = useMemo(
    () => [
      "agenda",
      "next steps",
      "action item",
      "decision",
      "deadline",
      "follow up",
      "task",
      "summary",
    ],
    []
  );

  // Derived state
  const displayedTranscript = useMemo(
    () =>
      liveFinalTranscript + (interimTranscript ? " " + interimTranscript : ""),
    [liveFinalTranscript, interimTranscript]
  );

  const isLoading = useMemo(
    () =>
      loading ||
      isUploading ||
      (contextIsRecording && mediaRecorderStatus === "acquiring_media"),
    [loading, isUploading, contextIsRecording, mediaRecorderStatus]
  );

  const canProcess = useMemo(() => {
    return (
      !!audioBlob &&
      !contextIsRecording &&
      !isUploading &&
      !loading &&
      !isTranscribing &&
      !isGeneratingMinutes
    );
  }, [
    audioBlob,
    contextIsRecording,
    isUploading,
    loading,
    isTranscribing,
    isGeneratingMinutes,
  ]);

  const isProcessingAny = useMemo(
    () => isTranscribing || isGeneratingMinutes || loading || isUploading,
    [isTranscribing, isGeneratingMinutes, loading, isUploading]
  );

  const showMinutesContent = useMemo(
    () => activeTab === 1 && !!finalTranscription && !isTranscribing,
    [activeTab, finalTranscription, isTranscribing]
  );

  // Recording timer effect
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

  // Error handling effect
  useEffect(() => {
    if (contextError) {
      const errorMessage =
        typeof contextError === "string"
          ? contextError
          : contextError.message || "An unexpected error occurred.";
      setSnackbarMessage(`Error: ${errorMessage}`);
      setSnackbarOpen(true);
      if (typeof clearMeetingError === "function") clearMeetingError();
    }
  }, [contextError, clearMeetingError]);

  // Transcript scrolling effect
  useEffect(() => {
    if (activeTab === 0 && listening && liveTranscriptEndRef.current) {
      liveTranscriptEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [displayedTranscript, activeTab, listening]);

  // Speech recognition effect
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
      browserSupportsSpeechRecognition &&
      isMicrophoneAvailable &&
      !listening
    ) {
      resetTranscript();
      startListening();
    } else if (
      (!contextIsRecording ||
        !isMicrophoneAvailable ||
        !browserSupportsSpeechRecognition ||
        mediaRecorderStatus !== "recording") &&
      listening
    ) {
      SpeechRecognition.stopListening();
    }
  }, [
    contextIsRecording,
    mediaRecorderStatus,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    listening,
    currentLanguage,
    resetTranscript,
  ]);

  // Auto-transcribe effect
  useEffect(() => {
    const shouldTranscribe =
      activeTab === 1 &&
      audioBlob &&
      !finalTranscription &&
      !isTranscribing &&
      !contextError?.includes("Transcription failed");

    if (shouldTranscribe && hasProcessedRef.current) {
      transcribeMeetingAudio();
    }
  }, [
    activeTab,
    audioBlob,
    finalTranscription,
    isTranscribing,
    contextError,
    transcribeMeetingAudio,
  ]);

  // Waveform animation effect
  useEffect(() => {
    if (contextIsRecording && waveformRef.current && showWaveform) {
      animateWaveform();
    }
  }, [contextIsRecording, showWaveform]);

  // Reset for new recording
  const handleReset = useCallback(() => {
    if (typeof resetMeetingContextState === "function") {
      resetMeetingContextState();
    }
    resetTranscript();
    setRecordingTime(0);
    setActiveTab(0);
    setMeetingTitle("");
    hasProcessedRef.current = false;
  }, [resetTranscript, resetMeetingContextState]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (
      !contextIsRecording &&
      mediaRecorderStatus !== "acquiring_media" &&
      !isUploading
    ) {
      handleReset();
      startMeeting();
    } else if (contextIsRecording) {
      endMeeting();
    }
  }, [
    contextIsRecording,
    mediaRecorderStatus,
    isUploading,
    startMeeting,
    endMeeting,
    handleReset,
  ]);

  // Handle language change
  const handleLanguageChange = useCallback(
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
      setLanguageSheetOpen(false);
    },
    [listening, resetTranscript]
  );

  // Handle file upload
  const handleUploadClick = useCallback(
    () => fileInputRef.current?.click(),
    []
  );

  const handleFileSelected = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      event.target.value = null;
      handleReset();

      const success = await handleFileUpload(file);
      if (success) {
        setSnackbarMessage("File ready. Swipe up to process.");
      } else if (!contextError) {
        setSnackbarMessage("File upload failed.");
      }
      setSnackbarOpen(true);
    },
    [handleFileUpload, handleReset, contextError]
  );

  // Copy to clipboard
  const handleCopy = useCallback(async (textToCopy) => {
    if (!textToCopy) {
      setSnackbarMessage("Nothing to copy!");
      setSnackbarOpen(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setSnackbarMessage("Copied!");

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    } catch (err) {
      console.error("Copy failed:", err);
      setSnackbarMessage("Copy failed.");
    }
    setSnackbarOpen(true);
  }, []);

  // Share transcript
  const handleShare = useCallback(
    async (textToShare, title = "Meeting Transcript") => {
      if (!textToShare) {
        setSnackbarMessage("Nothing to share!");
        setSnackbarOpen(true);
        return;
      }

      if (navigator.share) {
        try {
          await navigator.share({ title, text: textToShare });

          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(20);
          }
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

  // Process recording
  const handleProcessRecording = useCallback(() => {
    if (canProcess) {
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([30, 30, 30]);
      }

      setActiveTab(1);
      hasProcessedRef.current = true;

      if (listening) {
        SpeechRecognition.stopListening();
      }
    } else {
      let msg = "Cannot process audio yet.";
      if (!audioBlob) msg = "No audio available to process.";
      else if (isProcessingAny) msg = "Processing is already in progress.";

      setSnackbarMessage(msg);
      setSnackbarOpen(true);
    }
  }, [canProcess, audioBlob, isProcessingAny, listening]);

  // Generate and save minutes
  const handleGenerateAndSave = useCallback(async () => {
    if (!meetingTitle.trim()) {
      setSnackbarMessage("Please enter a meeting title.");
      setSnackbarOpen(true);
      setIsEditingTitle(true);
      return;
    }

    if (!finalTranscription && !isTranscribing) {
      setSnackbarMessage("Transcription not complete.");
      setSnackbarOpen(true);
      return;
    }

    if (isProcessingAny) {
      setSnackbarMessage("Please wait for current tasks to finish.");
      setSnackbarOpen(true);
      return;
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    const success = await generateAndSaveMeeting(meetingTitle);
    setSnackbarMessage(
      success
        ? "Minutes generated and saved!"
        : contextError || "Failed to generate minutes."
    );
    setSnackbarOpen(true);
  }, [
    meetingTitle,
    finalTranscription,
    isTranscribing,
    isProcessingAny,
    generateAndSaveMeeting,
    contextError,
  ]);

  // Waveform animation
  const animateWaveform = () => {
    if (!waveformRef.current) return;

    const canvas = waveformRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    let animationId;
    const bars = 40;
    const barWidth = width / bars - 1;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < bars; i++) {
        // Dynamic height based on randomness for visual effect
        const barHeight = Math.random() * (height * 0.8) + height * 0.2;

        ctx.fillStyle = "#6200ea";
        ctx.fillRect(
          i * (barWidth + 1),
          (height - barHeight) / 2,
          barWidth,
          barHeight
        );
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  };

  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // Language options
  const languages = useMemo(
    () => [
      { code: "en-US", name: "English (US)" },
      { code: "en-GB", name: "English (UK)" },
      { code: "es-ES", name: "Spanish" },
      { code: "fr-FR", name: "French" },
      { code: "de-DE", name: "German" },
      { code: "hi-IN", name: "Hindi" },
      { code: "ja-JP", name: "Japanese" },
      { code: "ko-KR", name: "Korean" },
    ],
    []
  );

  // Get status text
  const getStatusText = () => {
    if (
      isLoading &&
      !isUploading &&
      !contextIsRecording &&
      !canProcess &&
      !listening
    )
      return "Loading...";
    if (isUploading) return "Processing upload...";
    if (mediaRecorderStatus === "acquiring_media")
      return "Connecting to microphone...";
    if (contextIsRecording && mediaRecorderStatus === "failed")
      return "Mic connection failed. Check permissions.";
    if (!browserSupportsSpeechRecognition && !audioBlob && !contextIsRecording)
      return "Live transcript not supported by browser.";
    if (!isMicrophoneAvailable && !audioBlob && !contextIsRecording)
      return "Microphone unavailable or access denied.";
    if (canProcess)
      return `Audio ready (${formatTime(
        recordingTime || 0
      )}). Swipe up to process.`;
    if (contextIsRecording && listening)
      return "Recording with live transcript";
    if (contextIsRecording && !listening && mediaRecorderStatus === "recording")
      return "Recording... (No live transcript)";
    if (contextIsRecording) return "Recording in progress...";
    return "Tap to start recording";
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  // Categorize errors for better UX
  const recordingError = useMemo(
    () =>
      contextError?.startsWith("Recording Error:")
        ? contextError.replace("Recording Error: ", "")
        : null,
    [contextError]
  );

  const transcriptionError = useMemo(
    () =>
      contextError?.startsWith("Transcription failed") ? contextError : null,
    [contextError]
  );

  const processingError = useMemo(
    () =>
      contextError && !recordingError && !transcriptionError
        ? contextError
        : null,
    [contextError, recordingError, transcriptionError]
  );

  // Highlight keywords in transcript
  const highlightKeywords = (text) => {
    if (!text) return "";

    let result = text;
    keywordsToHighlight.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      result = result.replace(
        regex,
        `<mark style="background-color: rgba(98, 0, 234, 0.1); color: inherit; padding: 0 2px; border-radius: 3px;">$&</mark>`
      );
    });

    return result;
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "hidden",
        bgcolor: "#fafafa",
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />

      {/* Main content based on active tab */}
      <AnimatePresence mode="wait">
        {activeTab === 0 ? (
          /* Recording View */
          <motion.div
            key="record-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* App header */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
                bgcolor: "#fff",
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Meeting Recorder
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => setLanguageSheetOpen(true)}
                  sx={{ bgcolor: "rgba(0,0,0,0.04)" }}
                >
                  <TranslateIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => setTipsSheetOpen(true)}
                  sx={{ bgcolor: "rgba(0,0,0,0.04)" }}
                >
                  <TipsIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => setOptionsSheetOpen(true)}
                  sx={{ bgcolor: "rgba(0,0,0,0.04)" }}
                >
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Status indicator & timer */}
            <Box
              sx={{
                p: 2,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#fff",
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              {contextIsRecording ? (
                <>
                  <Chip
                    icon={
                      <LiveIcon
                        fontSize="small"
                        sx={{ animation: "pulse 2s infinite" }}
                      />
                    }
                    label={formatTime(recordingTime)}
                    color="error"
                    sx={{
                      height: "36px",
                      fontWeight: 600,
                      fontSize: "1rem",
                      px: 1,
                      mb: 1,
                      "& .MuiChip-icon": {
                        color: "error.main",
                      },
                      "@keyframes pulse": {
                        "0%": { opacity: 1 },
                        "50%": { opacity: 0.5 },
                        "100%": { opacity: 1 },
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {listening ? "Live transcription active" : "Recording..."}
                  </Typography>
                </>
              ) : canProcess ? (
                <>
                  <Chip
                    icon={<CheckIcon fontSize="small" />}
                    label={`Recording: ${formatTime(recordingTime || 0)}`}
                    color="success"
                    sx={{
                      height: "36px",
                      fontWeight: 600,
                      mb: 1,
                      px: 1,
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Swipe up to process
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {getStatusText()}
                </Typography>
              )}
            </Box>

            {/* Waveform visualization (only shown when recording) */}
            {showWaveform && contextIsRecording && (
              <Box
                sx={{
                  p: 2,
                  height: 100,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <canvas
                  ref={waveformRef}
                  width={280}
                  height={80}
                  style={{ width: "100%", maxWidth: "280px", height: "80px" }}
                />
              </Box>
            )}

            {/* Live transcript area */}
            <Box
              sx={{
                flex: 1,
                mx: 2,
                mt: 2,
                mb: 16,
                p: 2,
                bgcolor: "#fff",
                borderRadius: 2,
                overflowY: "auto",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {displayedTranscript ? (
                <Typography
                  variant="body1"
                  dangerouslySetInnerHTML={{
                    __html: highlightKeywords(displayedTranscript),
                  }}
                />
              ) : contextIsRecording ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ my: 4 }}
                >
                  Speak to see live transcription here...
                </Typography>
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <VoiceIcon
                    sx={{ fontSize: 48, color: "rgba(0,0,0,0.2)", mb: 2 }}
                  />
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                  >
                    Tap the record button to start capturing your meeting
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ mt: 1 }}
                  >
                    Or upload an existing recording
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={handleUploadClick}
                    sx={{ mt: 3, borderRadius: 20 }}
                    disabled={contextIsRecording || isLoading || isUploading}
                  >
                    Upload Audio
                  </Button>
                </Box>
              )}
              <div ref={liveTranscriptEndRef} />
            </Box>

            {/* Error alert */}
            {recordingError && !contextIsRecording && (
              <Alert
                severity="error"
                sx={{
                  position: "absolute",
                  bottom: 100,
                  left: 16,
                  right: 16,
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {recordingError}
              </Alert>
            )}

            {/* Recording floating action button */}
            <Box
              sx={{
                position: "fixed",
                bottom: 24,
                width: "100%",
                display: "flex",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <IconButton
                  onClick={toggleRecording}
                  disabled={
                    isLoading ||
                    isUploading ||
                    mediaRecorderStatus === "acquiring_media" ||
                    (!isMicrophoneAvailable &&
                      !audioBlob &&
                      !contextIsRecording) ||
                    (!browserSupportsSpeechRecognition &&
                      !audioBlob &&
                      !contextIsRecording)
                  }
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: contextIsRecording ? "error.main" : "primary.main",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    "&:hover": {
                      bgcolor: contextIsRecording
                        ? "error.dark"
                        : "primary.dark",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "rgba(0,0,0,0.12)",
                      color: "rgba(0,0,0,0.26)",
                    },
                  }}
                >
                  {contextIsRecording ? (
                    <StopIcon sx={{ fontSize: 32 }} />
                  ) : (
                    <MicIcon sx={{ fontSize: 32 }} />
                  )}
                </IconButton>
              </motion.div>
            </Box>

            {/* Process button (swipe up indicator when ready) */}
            {canProcess && (
              <Box
                sx={{
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  py: 2,
                  bgcolor: "primary.main",
                  color: "#fff",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  textAlign: "center",
                  cursor: "pointer",
                  boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
                  transform: "translateY(70%)",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover, &:active": {
                    transform: "translateY(0%)",
                  },
                }}
                onClick={handleProcessRecording}
              >
                <ArrowDownIcon
                  sx={{
                    transform: "rotate(180deg)",
                    animation: "bounce 1.5s infinite",
                    "@keyframes bounce": {
                      "0%, 20%, 50%, 80%, 100%": {
                        transform: "translateY(0) rotate(180deg)",
                      },
                      "40%": { transform: "translateY(-6px) rotate(180deg)" },
                      "60%": { transform: "translateY(-3px) rotate(180deg)" },
                    },
                  }}
                />
                <Typography variant="body1" fontWeight={600}>
                  Process Recording
                </Typography>
              </Box>
            )}
          </motion.div>
        ) : (
          /* Processing View */
          <motion.div
            key="process-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header with back button */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
                bgcolor: "#fff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  size="small"
                  edge="start"
                  onClick={() => {
                    if (isTranscribing || isGeneratingMinutes) {
                      setSnackbarMessage(
                        "Please wait for processing to complete"
                      );
                      setSnackbarOpen(true);
                      return;
                    }
                    setActiveTab(0);
                  }}
                  sx={{ mr: 1 }}
                >
                  <BackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight={600}>
                  Process Recording
                </Typography>
              </Box>

              <IconButton
                size="small"
                onClick={() => {
                  handleReset();
                  setActiveTab(0);
                }}
                sx={{ bgcolor: "rgba(0,0,0,0.04)" }}
                disabled={isProcessingAny}
              >
                <RecordAgainIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Meeting title input */}
            <Box
              sx={{
                px: 3,
                py: 2,
                bgcolor: "#fff",
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              {isEditingTitle ? (
                <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                  <TextField
                    variant="standard"
                    fullWidth
                    label="Meeting Title"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    autoFocus
                    inputRef={meetingTitleRef}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    color="primary"
                    onClick={() => {
                      if (meetingTitle.trim()) {
                        setIsEditingTitle(false);
                      } else {
                        setSnackbarMessage("Please enter a title");
                        setSnackbarOpen(true);
                      }
                    }}
                  >
                    <SaveIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={500}
                    sx={{
                      color: meetingTitle ? "text.primary" : "text.secondary",
                      flex: 1,
                      wordBreak: "break-word",
                    }}
                  >
                    {meetingTitle || "Untitled Meeting"}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setIsEditingTitle(true)}
                    sx={{ bgcolor: "rgba(0,0,0,0.04)" }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* Transcription status/content */}
            <Box
              sx={{
                m: 2,
                p: 0,
                bgcolor: "#fff",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Transcription
                </Typography>

                {finalTranscription && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(finalTranscription)}
                      sx={{ bgcolor: "rgba(0,0,0,0.04)" }}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() =>
                        handleShare(
                          finalTranscription,
                          meetingTitle || "Meeting Transcript"
                        )
                      }
                      sx={{ bgcolor: "rgba(0,0,0,0.04)" }}
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
                {isTranscribing ? (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      Transcribing audio...
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      align="center"
                      sx={{ mt: 1, px: 4 }}
                    >
                      This may take a minute or two depending on the length of
                      your recording
                    </Typography>
                  </Box>
                ) : transcriptionError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {transcriptionError}
                  </Alert>
                ) : finalTranscription ? (
                  <Typography
                    variant="body1"
                    component="div"
                    dangerouslySetInnerHTML={{
                      __html: highlightKeywords(finalTranscription),
                    }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ my: 4 }}
                  >
                    Your transcription will appear here
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Generate button */}
            <Box sx={{ p: 2, pb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={!finalTranscription || isGeneratingMinutes}
                onClick={handleGenerateAndSave}
                sx={{
                  py: 1.5,
                  borderRadius: 28,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
                disableElevation
              >
                {isGeneratingMinutes ? (
                  <>
                    <CircularProgress
                      size={24}
                      color="inherit"
                      sx={{ mr: 1 }}
                    />
                    Generating...
                  </>
                ) : (
                  "Generate Meeting Minutes"
                )}
              </Button>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom sheets */}

      {/* Language selection sheet */}
      <Drawer
        anchor="bottom"
        open={languageSheetOpen}
        onClose={() => setLanguageSheetOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: "80vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2,
            pt: 1,
          },
        }}
      >
        <Box
          sx={{
            width: "40px",
            height: "4px",
            bgcolor: "rgba(0,0,0,0.1)",
            borderRadius: "4px",
            mx: "auto",
            mb: 2,
          }}
        />

        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, px: 1 }}>
          Select Language
        </Typography>

        <Box sx={{ maxHeight: "60vh", overflowY: "auto", pb: 2 }}>
          {languages.map((lang) => (
            <Box
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderRadius: 2,
                mb: 1,
                bgcolor:
                  currentLanguage === lang.code
                    ? "rgba(98, 0, 234, 0.08)"
                    : "transparent",
                border: "1px solid",
                borderColor:
                  currentLanguage === lang.code
                    ? "primary.main"
                    : "rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TranslateIcon
                  sx={{
                    mr: 2,
                    color:
                      currentLanguage === lang.code
                        ? "primary.main"
                        : "action.active",
                  }}
                />
                <Typography variant="body1">{lang.name}</Typography>
              </Box>

              {currentLanguage === lang.code && <CheckIcon color="primary" />}
            </Box>
          ))}
        </Box>
      </Drawer>

      {/* Tips sheet */}
      <Drawer
        anchor="bottom"
        open={tipsSheetOpen}
        onClose={() => setTipsSheetOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: "85vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2,
            pt: 1,
          },
        }}
      >
        <Box
          sx={{
            width: "40px",
            height: "4px",
            bgcolor: "rgba(0,0,0,0.1)",
            borderRadius: "4px",
            mx: "auto",
            mb: 2,
          }}
        />

        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, px: 1 }}>
          Tips for Better Results
        </Typography>

        <Box sx={{ maxHeight: "65vh", overflowY: "auto", pb: 2 }}>
          {[
            {
              title: "Speak clearly",
              description:
                "Ensure participants speak at a moderate pace and enunciate clearly.",
            },
            {
              title: "State the agenda",
              description:
                "Begin by clearly stating the meeting's agenda and objectives.",
            },
            {
              title: "Identify speakers",
              description:
                "Ask participants to state their name before speaking.",
            },
            {
              title: "Use keywords",
              description:
                "Use phrases like 'action item', 'next steps', or 'decision' to highlight important points.",
            },
            {
              title: "Summarize at the end",
              description:
                "End with a clear summary of decisions and action items.",
            },
            {
              title: "Minimize background noise",
              description:
                "Find a quiet location and place your device near the speakers.",
            },
          ].map((tip, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {index + 1}. {tip.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tip.description}
              </Typography>
            </Box>
          ))}

          <Box
            sx={{
              p: 3,
              mb: 2,
              bgcolor: "primary.light",
              color: "primary.main",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              gutterBottom
              align="center"
            >
              Highlighted Keywords
            </Typography>
            <Typography variant="body2" align="center" sx={{ mb: 2 }}>
              These words are automatically highlighted in transcripts:
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                justifyContent: "center",
              }}
            >
              {keywordsToHighlight.map((keyword) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  size="small"
                  variant="outlined"
                  sx={{
                    bgcolor: "white",
                    borderColor: "primary.main",
                    color: "primary.main",
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={() => setTipsSheetOpen(false)}
          sx={{
            borderRadius: 28,
            py: 1.5,
            my: 2,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
          }}
          disableElevation
        >
          Got it
        </Button>
      </Drawer>

      {/* Options sheet */}
      <Drawer
        anchor="bottom"
        open={optionsSheetOpen}
        onClose={() => setOptionsSheetOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2,
            pt: 1,
          },
        }}
      >
        <Box
          sx={{
            width: "40px",
            height: "4px",
            bgcolor: "rgba(0,0,0,0.1)",
            borderRadius: "4px",
            mx: "auto",
            mb: 2,
          }}
        />

        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, px: 1 }}>
          Options
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => {
              handleUploadClick();
              setOptionsSheetOpen(false);
            }}
            sx={{
              py: 1.5,
              mb: 2,
              borderRadius: 2,
              justifyContent: "flex-start",
              textTransform: "none",
            }}
            disabled={contextIsRecording || isLoading || isUploading}
          >
            Upload audio recording
          </Button>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 2,
            }}
          >
            <Typography variant="body1">
              Show waveform while recording
            </Typography>
            <Switch
              checked={showWaveform}
              onChange={(e) => setShowWaveform(e.target.checked)}
              color="primary"
            />
          </Box>
        </Box>

        <Button
          fullWidth
          variant="text"
          color="inherit"
          onClick={() => setOptionsSheetOpen(false)}
          startIcon={<CloseIcon />}
          sx={{
            borderRadius: 28,
            py: 1,
            mb: 2,
            textTransform: "none",
            color: "text.secondary",
          }}
        >
          Close
        </Button>
      </Drawer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            px: 2,
            mb: 2,
          },
        }}
      />
    </Box>
  );
};

export default MeetingRecorder;
