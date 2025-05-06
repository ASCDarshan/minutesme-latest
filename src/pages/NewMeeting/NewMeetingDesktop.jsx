/* eslint-disable no-unused-vars */
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
import { useMeeting } from "../../context/MeetingContext";
import { AnimatePresence, motion } from "framer-motion";

import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  useTheme,
  alpha,
  Alert,
  IconButton,
  Snackbar,
  useMediaQuery,
  Tooltip,
  Chip,
  Drawer,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Zoom,
  SvgIcon,
} from "@mui/material";

import {
  ArrowBack,
  Mic as MicIcon,
  Stop as StopIcon,
  Notes as NotesIcon,
  Language as LanguageIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Lightbulb as LightbulbIcon,
  FiberManualRecord as RecordIcon,
  Timer as TimerIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Done as DoneIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  FileUpload as FileUploadIcon,
} from "@mui/icons-material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const WaveLogoIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M3,12 C5,10 7,14 9,12 C11,10 13,14 15,12 C17,10 19,14 21,12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M3,17 C5,15 7,19 9,17 C11,15 13,19 15,17 C17,15 19,19 21,17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeOpacity="0.5"
    />
    <path
      d="M3,7 C5,5 7,9 9,7 C11,5 13,9 15,7 C17,5 19,9 21,7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeOpacity="0.7"
    />
  </SvgIcon>
);

const HighlightKeywords = React.memo(({ text, keywords, highlightColor }) => {
  if (!keywords?.length || !text) return text;

  const escapedKeywords = keywords.map((kw) =>
    kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const regex = new RegExp(`\\b(${escapedKeywords.join("|")})\\b`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <Box
            component="span"
            key={index}
            sx={{
              backgroundColor: highlightColor,
              borderRadius: "3px",
              px: 0.5,
              mx: 0.5,
              display: "inline-block",
              position: "relative",
              whiteSpace: "nowrap",
              fontWeight: 500,
            }}
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </>
  );
});

const KeywordChip = ({ keyword, active, onClick }) => {
  const theme = useTheme();

  return (
    <Chip
      label={keyword}
      variant={active ? "filled" : "outlined"}
      color="primary"
      size="small"
      onClick={onClick}
      sx={{
        borderRadius: 6,
        px: 0.5,
        fontWeight: 500,
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          borderColor: theme.palette.primary.main,
        },
        transition: "all 0.2s ease",
        cursor: "pointer",
        height: 26,
      }}
    />
  );
};

const InstructionsDrawer = ({ open, onClose, keywordExamples, theme }) => {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxHeight: "80vh",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LightbulbIcon color="warning" />
            <Typography variant="h6" fontWeight={600}>
              Meeting Tips
            </Typography>
          </Box>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ p: 3, overflowY: "auto" }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            How to Get Better Results
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              mt: 2,
            }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
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
                  mt: 0.5,
                }}
              >
                1
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Start with introductions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Begin by stating all participants' names clearly so they're
                  included in the minutes.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
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
                  mt: 0.5,
                }}
              >
                2
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  State the agenda clearly
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Say "Today's agenda includes..." or "Our meeting agenda is..."
                  to help with organization.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
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
                  mt: 0.5,
                }}
              >
                3
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Use key phrases for action items
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mention "Action Item", "Task", "Next Steps", or "Deadline"
                  when assigning responsibilities.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
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
                  mt: 0.5,
                }}
              >
                4
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Summarize at the end
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  End with "To summarize..." or "In conclusion..." to highlight
                  key points.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.08),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            mb: 3,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Important Keywords
          </Typography>
          <Typography variant="body2" mb={2}>
            These keywords help organize the summary better:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {keywordExamples.map((keyword) => (
              <Chip
                key={keyword}
                label={keyword}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 6 }}
              />
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.warning.main, 0.08),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <TimerIcon fontSize="small" color="warning" />
            <Typography variant="subtitle2" fontWeight={600}>
              Pro Tip
            </Typography>
          </Box>
          <Typography variant="body2">
            Position your device closer to the speaker and minimize background
            noise for the best recording quality.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: 8,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Got it
        </Button>
      </Box>
    </Drawer>
  );
};

const RecorderTimer = ({ seconds, isRecording, isUploading }) => {
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          bgcolor: isRecording
            ? "error.main"
            : isUploading
              ? "info.main"
              : "text.disabled",
          animation: isRecording ? "blink 1.5s infinite" : "none",
        }}
      />
      <Typography
        variant="h5"
        fontWeight={600}
        sx={{ fontFamily: "monospace" }}
      >
        {isUploading || seconds === 0 ? "00:00" : formatTime(seconds)}
      </Typography>

      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Box>
  );
};

const LanguageSelector = ({
  open,
  onClose,
  currentLanguage,
  onSelectLanguage,
  disabled,
}) => {
  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "hi-IN", name: "Hindi" },
    { code: "gu-IN", name: "Gujarati" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "ja-JP", name: "Japanese" },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: 320,
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" fontWeight={600}>
          Select Language
        </Typography>
      </Box>

      <DialogContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: 1,
          }}
        >
          {languages.map((lang) => (
            <Chip
              key={lang.code}
              label={lang.name}
              onClick={() => {
                if (!disabled) {
                  onSelectLanguage({ target: { value: lang.code } });
                  onClose();
                }
              }}
              color={currentLanguage === lang.code ? "primary" : "default"}
              variant={currentLanguage === lang.code ? "filled" : "outlined"}
              disabled={disabled}
              sx={{
                borderRadius: 2,
                py: 2,
                justifyContent: "center",
                fontWeight: currentLanguage === lang.code ? 600 : 400,
              }}
              icon={
                currentLanguage === lang.code ? (
                  <CheckIcon fontSize="small" />
                ) : null
              }
            />
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} fullWidth sx={{ borderRadius: 8 }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MeetingRecorder = () => {
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
    loading: contextLoading,
    error: contextError,
    transcribeMeetingAudio,
    generateAndSaveMeeting,
  } = useMeeting();

  const [recordingTime, setRecordingTime] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [recordingStoppedManually, setRecordingStoppedManually] =
    useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en-US");
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [expandedTranscript, setExpandedTranscript] = useState(false);

  const theme = useTheme();
  const timerRef = useRef(null);
  const hasProcessedRef = useRef(false);
  const liveTranscriptEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
  const keywordExamples = useMemo(
    () => [
      "agenda",
      "action item",
      "next steps",
      "decision",
      "deadline",
      "summary",
    ],
    []
  );
  const highlightColor = useMemo(
    () => alpha(theme.palette.secondary.main, 0.2),
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
      isUploading ||
      (contextIsRecording && mediaRecorderStatus === "acquiring_media"),
    [contextLoading, isUploading, contextIsRecording, mediaRecorderStatus]
  );
  const canProcess = useMemo(() => {
    const hasData = !!audioBlob;
    const isIdle =
      !contextIsRecording &&
      !isTranscribing &&
      !isGeneratingMinutes &&
      !isLoading &&
      !isUploading;
    return hasData && isIdle;
  }, [
    audioBlob,
    contextIsRecording,
    isTranscribing,
    isGeneratingMinutes,
    isLoading,
    isUploading,
  ]);

  const isProcessingAny = useMemo(
    () => isTranscribing || isGeneratingMinutes || isLoading,
    [isTranscribing, isGeneratingMinutes, isLoading]
  );
  const showMinuteContent = useMemo(
    () => activeStep === 1 && !!finalTranscription && !isTranscribing,
    [activeStep, finalTranscription, isTranscribing]
  );

  useEffect(() => {
    if (contextIsRecording && mediaRecorderStatus === "recording") {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [contextIsRecording, mediaRecorderStatus]);

  useEffect(() => {
    if (
      contextIsRecording &&
      mediaRecorderStatus === "recording" &&
      speechRecognitionSupported &&
      isMicrophoneAvailable &&
      !listening
    ) {
      resetTranscript();
      SpeechRecognition.startListening({
        continuous: true,
        language: currentLanguage,
      });
    } else if (
      (!contextIsRecording ||
        !isMicrophoneAvailable ||
        !speechRecognitionSupported) &&
      listening
    ) {
      SpeechRecognition.stopListening();
    }
  }, [
    contextIsRecording,
    mediaRecorderStatus,
    listening,
    speechRecognitionSupported,
    currentLanguage,
    resetTranscript,
    isMicrophoneAvailable,
  ]);

  useEffect(() => {
    const shouldTranscribe =
      activeStep === 1 &&
      audioBlob &&
      !finalTranscription &&
      !isTranscribing &&
      !contextError?.includes("Transcription failed");
    if (shouldTranscribe && hasProcessedRef.current) {
      transcribeMeetingAudio();
    }
  }, [
    activeStep,
    audioBlob,
    finalTranscription,
    isTranscribing,
    contextError,
    transcribeMeetingAudio,
  ]); // Added hasProcessedRef dependency? No, keep it as is.

  // Auto-scroll Live Transcript Effect
  useEffect(() => {
    if (activeStep === 0 && liveTranscriptEndRef.current) {
      liveTranscriptEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [displayedTranscript, activeStep]);

  useEffect(() => {
    if (contextError) {
      setSnackbarMessage(`Error: ${contextError}`); // Prefix with Error for clarity
      setSnackbarOpen(true);
    }
  }, [contextError]);

  useEffect(() => {

    if (audioBlob && !contextIsRecording && !isUploading) {
      console.log("audioBlob && !contextIsRecording && !isUploading");
    }
  }, [audioBlob, contextIsRecording, isUploading]);


  const toggleRecording = useCallback(() => {
    if (
      !contextIsRecording &&
      mediaRecorderStatus !== "acquiring_media" &&
      !isUploading
    ) {
      setRecordingTime(0);
      hasProcessedRef.current = false;
      setActiveStep(0);
      setRecordingStoppedManually(false);
      resetTranscript();
      setMeetingTitle("");
      startMeeting();
    } else if (contextIsRecording) {
      endMeeting();
      setRecordingStoppedManually(true);
    }
  }, [
    contextIsRecording,
    mediaRecorderStatus,
    isUploading,
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

  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileSelected = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      event.target.value = null;

      const success = await handleFileUpload(file);

      if (success) {
        setActiveStep(0);
        setRecordingTime(0);
        setRecordingStoppedManually(true);
        hasProcessedRef.current = false;
        resetTranscript();
        setSnackbarMessage("File ready. Click 'Process Audio' below.");
        setSnackbarOpen(true);
      } else {
        console.log("File upload failed.");
      }
    },
    [handleFileUpload, resetTranscript]
  );

  const handleCopy = useCallback(async (textToCopy) => {
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
  }, []);

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
          setSnackbarMessage("Transcript shared successfully!");
          setSnackbarOpen(true);
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error("Error sharing:", err);
            setSnackbarMessage("Failed to share transcript.");
            setSnackbarOpen(true);
          }
        }
      } else {
        setSnackbarMessage("Web Share not supported. Try copying instead.");
        setSnackbarOpen(true);
      }
    },
    []
  );

  const handleProcessRecording = useCallback(() => {
    if (canProcess) {
      setActiveStep(1);
      hasProcessedRef.current = true;
      if (listening) {
        SpeechRecognition.stopListening();
      }
    } else {
      if (!audioBlob) setSnackbarMessage("No recording or file available.");
      else if (isLoading) setSnackbarMessage("Processing...");
      else setSnackbarMessage("Cannot process yet. Check audio data.");
      setSnackbarOpen(true);
    }
  }, [canProcess, audioBlob, isLoading, listening]);

  const handleGenerateAndSave = useCallback(async () => {
    if (!meetingTitle.trim()) {
      setSnackbarMessage("Please enter a meeting title first");
      setSnackbarOpen(true);
      return;
    }
    if (!finalTranscription && !isTranscribing) {
      setSnackbarMessage("Transcription must be complete first.");
      setSnackbarOpen(true);
      return;
    }
    if (isProcessingAny) {
      setSnackbarMessage("Please wait for current processing to finish.");
      setSnackbarOpen(true);
      return;
    }
    await generateAndSaveMeeting(meetingTitle);
  }, [
    meetingTitle,
    finalTranscription,
    isTranscribing,
    isProcessingAny,
    generateAndSaveMeeting,
  ]);

  const handleRecordAgain = useCallback(() => {
    setActiveStep(0);
    setRecordingTime(0);
    resetTranscript();
    hasProcessedRef.current = false;
    setMeetingTitle("");
  }, [resetTranscript]);

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  }, []);

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
    () => contextError && contextError.startsWith("Recording Error"),
    [contextError]
  );
  const finalTranscriptionError = useMemo(
    () => contextError && contextError.startsWith("Transcription failed"),
    [contextError]
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(to bottom, ${alpha(
          theme.palette.background.default,
          0.5
        )} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
        backgroundAttachment: "fixed",
        backdropFilter: "blur(10px)",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          zIndex: -1,
          opacity: 0.5,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "50vw",
            height: "50vw",
            borderRadius: "50%",
            filter: "blur(80px)",
            background: `radial-gradient(circle, ${alpha(
              theme.palette.primary.main,
              0.2
            )} 0%, transparent 70%)`,
            top: "-10vw",
            right: "-10vw",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: "40vw",
            height: "40vw",
            borderRadius: "50%",
            filter: "blur(100px)",
            background: `radial-gradient(circle, ${alpha(
              theme.palette.secondary.main,
              0.15
            )} 0%, transparent 70%)`,
            bottom: "-10vw",
            left: "-10vw",
          }}
        />
      </Box>

      <Box
        sx={{
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.1),
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: alpha(theme.palette.background.paper, 0.7),
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WaveLogoIcon
                  color="primary"
                  sx={{ fontSize: isMobile ? 22 : 28 }}
                />
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  fontWeight={600}
                  color="primary"
                >
                  VoiceScribe
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Meeting tips">
                <IconButton
                  onClick={() => setInstructionsOpen(true)}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                >
                  <LightbulbIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Select language">
                <IconButton
                  onClick={() => setLanguageDialogOpen(true)}
                  disabled={listening || contextIsRecording || isUploading}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                >
                  <LanguageIcon />
                </IconButton>
              </Tooltip>
              {!isMobile && contextIsRecording && (
                <Chip
                  icon={<RecordIcon fontSize="small" />}
                  label="Recording"
                  color="error"
                  size="small"
                  sx={{
                    borderRadius: 8,
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1 },
                      "50%": { opacity: 0.7 },
                    },
                  }}
                />
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/webm,audio/ogg,audio/wav,audio/mpeg,audio/mp4,audio/aac,audio/flac,.mp3,.m4a,.wav"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />

      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          pt: 3,
          pb: 12,
          position: "relative",
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="wait">
          {activeStep === 0 ? (
            <motion.div
              key="recording-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  mb: 4,
                }}
              >
                <Box
                  sx={{
                    mb: 1,
                  }}
                >
                  <Button
                    onClick={
                      contextIsRecording
                        ? toggleRecording
                        : recordingStoppedManually && audioBlob
                          ? handleProcessRecording
                          : toggleRecording
                    }
                    sx={{
                      borderRadius: 20,
                      bgcolor: contextIsRecording
                        ? alpha(theme.palette.error.main, 0.1)
                        : recordingStoppedManually && audioBlob
                          ? alpha(theme.palette.success.main, 0.1)
                          : isUploading
                            ? alpha(theme.palette.info.main, 0.1)
                            : alpha(theme.palette.primary.main, 0.1),
                      color: contextIsRecording
                        ? "error.main"
                        : recordingStoppedManually && audioBlob
                          ? "success.main"
                          : isUploading
                            ? "info.dark"
                            : "primary.main",
                      px: 3,
                      py: 0.5,
                      border: "1px solid",
                      borderColor: contextIsRecording
                        ? alpha(theme.palette.error.main, 0.2)
                        : recordingStoppedManually && audioBlob
                          ? alpha(theme.palette.success.main, 0.2)
                          : isUploading
                            ? alpha(theme.palette.info.main, 0.2)
                            : alpha(theme.palette.primary.main, 0.2),
                      textTransform: "none",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      "&:hover": {
                        bgcolor: contextIsRecording
                          ? alpha(theme.palette.error.main, 0.2)
                          : recordingStoppedManually && audioBlob
                            ? alpha(theme.palette.success.main, 0.2)
                            : isUploading
                              ? alpha(theme.palette.info.main, 0.2)
                              : alpha(theme.palette.primary.main, 0.2),
                      },
                      pointerEvents: isUploading ? "none" : "auto",
                    }}
                    disabled={isUploading || isLoading}
                  >
                    {isUploading || isLoading ? (
                      <CircularProgress
                        size={16}
                        color="inherit"
                        sx={{ mr: 1 }}
                      />
                    ) : contextIsRecording ? (
                      <StopIcon fontSize="small" sx={{ mr: 1 }} />
                    ) : recordingStoppedManually && audioBlob ? (
                      <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
                    ) : (
                      <MicIcon fontSize="small" sx={{ mr: 1 }} />
                    )}
                    {contextIsRecording
                      ? "Stop Recording"
                      : isUploading
                        ? "Processing Upload..."
                        : recordingStoppedManually && audioBlob
                          ? "Process Audio"
                          : recordingStoppedManually && !audioBlob
                            ? "Stopped (No Audio)"
                            : "Start Recording"}
                  </Button>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Tooltip title="Upload audio file (MP3 format only)">
                    <span>
                      <Button
                        component="label"
                        sx={{
                          borderRadius: 20,
                          bgcolor: isUploading
                            ? alpha(theme.palette.info.main, 0.1)
                            : alpha(theme.palette.primary.main, 0.1),
                          color: isUploading ? "info.dark" : "primary.main",
                          px: 3,
                          py: 0.5,
                          border: "1px solid",
                          borderColor: isUploading
                            ? alpha(theme.palette.info.main, 0.2)
                            : alpha(theme.palette.primary.main, 0.2),
                          textTransform: "none",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          "&:hover": {
                            bgcolor: isUploading
                              ? alpha(theme.palette.info.main, 0.2)
                              : alpha(theme.palette.primary.main, 0.2),
                          },
                          pointerEvents: isUploading ? "none" : "auto",
                        }}
                        disabled={isUploading || isLoading}
                        title="Upload audio file (MP3 format only)"
                      >
                        {isUploading || isLoading ? (
                          <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                        ) : (
                          <FileUploadIcon fontSize="small" sx={{ mr: 1 }} />
                        )}
                        {isUploading ? "Processing Upload..." : "Upload Recording"}
                        <input
                          type="file"
                          accept="audio/mpeg"
                          hidden
                          onChange={handleUploadClick}
                        />
                      </Button>
                    </span>
                  </Tooltip>
                </Box>

                {(contextIsRecording ||
                  recordingStoppedManually ||
                  isUploading) && (
                    <RecorderTimer
                      seconds={recordingTime}
                      isRecording={contextIsRecording}
                      isUploading={isUploading}
                    />
                  )}
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" },
                  gap: 3,
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                      px: 0.5,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {" "}
                      {listening ? "Live Transcript" : "Transcript"}{" "}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {liveFinalTranscript && !listening && (
                        <>
                          <Tooltip title="Copy to clipboard">
                            <IconButton
                              onClick={() => handleCopy(liveFinalTranscript)}
                              size="small"
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {navigator.share && (
                            <Tooltip title="Share transcript">
                              <IconButton
                                onClick={() => handleShare(liveFinalTranscript)}
                                size="small"
                              >
                                <ShareIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </>
                      )}
                      <Tooltip
                        title={expandedTranscript ? "Collapse" : "Expand"}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            setExpandedTranscript(!expandedTranscript)
                          }
                        >
                          {expandedTranscript ? (
                            <ExpandLessIcon fontSize="small" />
                          ) : (
                            <ExpandMoreIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      bgcolor: "background.paper",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: alpha(theme.palette.divider, 0.1),
                      p: 3,
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      maxHeight: expandedTranscript ? "none" : 400,
                      overflow: "hidden",
                      boxShadow: theme.shadows[1],
                      transition: "max-height 0.3s ease",
                      minHeight: 200,
                    }}
                  >
                    {!speechRecognitionSupported ? (
                      <Alert
                        severity="warning"
                        variant="filled"
                        sx={{ borderRadius: 2 }}
                      >
                        Speech recognition not supported by your browser.
                      </Alert>
                    ) : !isMicrophoneAvailable &&
                      !audioBlob &&
                      !contextIsRecording ? (
                      <Alert
                        severity="error"
                        variant="filled"
                        sx={{ borderRadius: 2 }}
                      >
                        Microphone access denied. Check permissions.
                      </Alert>
                    ) : listening ? (
                      <Box
                        sx={{
                          flex: 1,
                          overflowY: "auto",
                          px: 1,
                          py: 2,
                          position: "relative",
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontSize: "1rem",
                          lineHeight: 1.7,
                          letterSpacing: 0.2,
                        }}
                      >
                        <HighlightKeywords
                          text={displayedTranscript}
                          keywords={keywordsToHighlight}
                          highlightColor={highlightColor}
                        />
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            width: "2px",
                            height: "1.2em",
                            bgcolor: "primary.main",
                            verticalAlign: "middle",
                            ml: 0.5,
                            animation: "blink 1s step-end infinite",
                            "@keyframes blink": {
                              "from, to": { opacity: 1 },
                              "50%": { opacity: 0 },
                            },
                          }}
                        />
                        <div ref={liveTranscriptEndRef} />
                      </Box>
                    ) : liveFinalTranscript ? (
                      <Box
                        sx={{
                          flex: 1,
                          overflowY: "auto",
                          px: 1,
                          py: 2,
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontSize: "1rem",
                          lineHeight: 1.7,
                          letterSpacing: 0.2,
                        }}
                      >
                        <HighlightKeywords
                          text={liveFinalTranscript}
                          keywords={keywordsToHighlight}
                          highlightColor={highlightColor}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          px: 3,
                        }}
                      >
                        <NotesIcon
                          sx={{
                            fontSize: 48,
                            color: alpha(theme.palette.text.primary, 0.2),
                            mb: 2,
                          }}
                        />
                        <Typography
                          variant="h6"
                          gutterBottom
                          color="text.secondary"
                        >
                          {" "}
                          No transcript yet{" "}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ maxWidth: 400 }}
                        >
                          {recordingStoppedManually
                            ? "Audio ready. Click 'Process Audio' below."
                            : isUploading
                              ? "Processing upload..."
                              : "Press Record or Upload File to begin."}
                        </Typography>
                      </Box>
                    )}
                    {!expandedTranscript &&
                      (listening || liveFinalTranscript) && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 60,
                            background:
                              "linear-gradient(to top, rgba(255,255,255,0.9), transparent)",
                            pointerEvents: "none",
                          }}
                        />
                      )}


                  </Box>


                  {(contextIsRecording || listening) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {" "}
                        Suggested Keywords:{" "}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {keywordExamples.map((keyword) => (
                          <KeywordChip
                            key={keyword}
                            keyword={keyword}
                            active={false}
                            onClick={() => {
                              setSnackbarMessage(`Try saying "${keyword}"`);
                              setSnackbarOpen(true);
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "background.paper",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: alpha(theme.palette.divider, 0.1),
                      p: 3,
                      boxShadow: theme.shadows[1],
                      mt: 5
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <LightbulbIcon color="warning" sx={{ mr: 1.5 }} />
                      <Typography variant="h6" fontWeight={600}>
                        {" "}
                        Meeting Tips{" "}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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
                            mt: 0.5,
                          }}
                        >
                          1
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Start with introductions
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            State participants' names clearly.
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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
                            mt: 0.5,
                          }}
                        >
                          2
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            State the agenda clearly
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Say "Today's agenda includes..."
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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
                            mt: 0.5,
                          }}
                        >
                          3
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Use key phrases for actions
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Mention "Action Item" or "Next Steps"
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
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
                            mt: 0.5,
                          }}
                        >
                          4
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Summarize at the end
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            End with "To summarize..."
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.warning.main, 0.08),
                        border: `1px solid ${alpha(
                          theme.palette.warning.main,
                          0.2
                        )}`,
                      }}
                    >
                      <Typography variant="body2">
                        <strong>Pro Tip:</strong> Minimize background noise for
                        best quality.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              {recordingError && (
                <Alert
                  severity="error"
                  sx={{ mt: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}
                >
                  {" "}
                  {typeof recordingError === "string"
                    ? recordingError
                    : "An unknown recording error occurred."}{" "}
                </Alert>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="processing-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              <Box
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.1),
                  mb: 3,
                  overflow: "hidden",
                  boxShadow: theme.shadows[2],
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: "1px solid",
                    borderColor: alpha(theme.palette.divider, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <NotesIcon
                      sx={{ mr: 1.5, color: theme.palette.primary.main }}
                    />
                    <Typography variant="h6" fontWeight={600}>
                      {" "}
                      Transcription Results{" "}
                    </Typography>
                  </Box>
                  {finalTranscription && !isTranscribing && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Copy to clipboard">
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(finalTranscription)}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {navigator.share && (
                        <Tooltip title="Share">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleShare(
                                finalTranscription,
                                meetingTitle || "Meeting Transcription"
                              )
                            }
                          >
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Box>
                <Box sx={{ p: 3 }}>
                  {isTranscribing ? (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <CircularProgress
                        size={60}
                        thickness={4}
                        sx={{ color: theme.palette.primary.main, mb: 3 }}
                      />
                      <Typography variant="h6" gutterBottom>
                        {" "}
                        Transcribing your audio...{" "}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ maxWidth: 500, mx: "auto" }}
                      >
                        {" "}
                        This may take a moment depending on the length.{" "}
                      </Typography>
                      <Box
                        sx={{
                          mt: 4,
                          mx: "auto",
                          maxWidth: 500,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            bottom: 0,
                            width: "30%",
                            borderRadius: 2,
                            bgcolor: theme.palette.primary.main,
                            animation: "loading 2s infinite",
                            "@keyframes loading": {
                              "0%": { left: "-30%" },
                              "100%": { left: "100%" },
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  ) : finalTranscriptionError ? (
                    <Alert
                      severity="error"
                      sx={{
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                      }}
                      action={
                        <Button
                          color="error"
                          size="small"
                          onClick={transcribeMeetingAudio}
                          variant="outlined"
                          sx={{ borderRadius: 28 }}
                        >
                          {" "}
                          Retry{" "}
                        </Button>
                      }
                    >
                      {" "}
                      {contextError}{" "}
                    </Alert>
                  ) : finalTranscription ? (
                    <Box
                      sx={{
                        maxHeight: 400,
                        overflowY: "auto",
                        p: 2,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        borderRadius: 2,
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontSize: "1rem",
                        lineHeight: 1.7,
                        letterSpacing: 0.2,
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.1
                        )}`,
                      }}
                    >
                      <HighlightKeywords
                        text={finalTranscription}
                        keywords={keywordsToHighlight}
                        highlightColor={highlightColor}
                      />
                    </Box>
                  ) : !audioBlob ? (
                    <Alert
                      severity="warning"
                      sx={{ borderRadius: 2 }}
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={handleRecordAgain}
                          variant="outlined"
                          sx={{ borderRadius: 28 }}
                        >
                          {" "}
                          Record/Upload{" "}
                        </Button>
                      }
                    >
                      {" "}
                      No audio found. Please record or upload first.{" "}
                    </Alert>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <CircularProgress size={40} />
                      <Typography sx={{ mt: 2 }} color="text.secondary">
                        {" "}
                        Preparing to process...{" "}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {showMinuteContent && (
                <Box
                  sx={{
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.divider, 0.1),
                    boxShadow: theme.shadows[2],
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: "1px solid",
                      borderColor: alpha(theme.palette.divider, 0.1),
                      display: "flex",
                      alignItems: "center",
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }}
                  >
                    <SaveIcon
                      sx={{ mr: 1.5, color: theme.palette.primary.main }}
                    />
                    <Typography variant="h6" fontWeight={600}>
                      {" "}
                      Generate Meeting Minutes{" "}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" },
                        gap: 3,
                        alignItems: "end",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          gutterBottom
                        >
                          {" "}
                          Meeting Title{" "}
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter a descriptive title"
                          value={meetingTitle}
                          onChange={(e) => setMeetingTitle(e.target.value)}
                          InputProps={{
                            sx: {
                              borderRadius: 2,
                              bgcolor: alpha(
                                theme.palette.background.default,
                                0.5
                              ),
                              boxShadow: "none",
                              "&:hover": {
                                bgcolor: alpha(
                                  theme.palette.background.default,
                                  0.7
                                ),
                              },
                            },
                          }}
                        />

                      </Box>
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Button
                          onClick={handleRecordAgain}
                          color="inherit"
                          variant="outlined"
                          startIcon={<RestoreIcon />}
                          disabled={isProcessingAny}
                          sx={{
                            borderRadius: 20,
                            flex: 1,
                            py: 0.5,
                            px: 1.5,
                            fontSize: "0.875rem",
                            textTransform: "none",
                            fontWeight: 500,
                            minWidth: 0,
                          }}
                        >
                          Record Again
                        </Button>
                        <Button
                          onClick={handleGenerateAndSave}
                          color="primary"
                          variant="contained"
                          startIcon={
                            isProcessingAny ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <DoneIcon />
                            )
                          }
                          sx={{
                            borderRadius: 20,
                            flex: 1.2,
                            py: 0.75,
                            px: 2,
                            fontSize: "0.875rem",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: theme.shadows[2],
                            minWidth: 0,
                          }}
                        >
                          {isProcessingAny ? "Processing..." : "Generate Minutes"}
                        </Button>
                      </Box>

                    </Box>
                    {processingError && (
                      <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                        {" "}
                        {processingError}{" "}
                      </Alert>
                    )}
                  </Box>
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      <InstructionsDrawer
        open={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
        keywordExamples={keywordExamples}
        theme={theme}
      />

      <LanguageSelector
        open={languageDialogOpen}
        onClose={() => setLanguageDialogOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleLanguageChange}
        disabled={listening || contextIsRecording || isUploading}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            borderRadius: 2,
            minWidth: "auto",
            px: 2,
          },
        }}
      />
    </Box>
  );
};

export default MeetingRecorder;
