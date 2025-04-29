import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
// Ensure the path to MeetingContext is correct based on your project structure
import { useMeeting } from "../../context/MeetingContext";
import { AnimatePresence, motion } from "framer-motion";

// Material UI components
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
  Fab,
  Tooltip,
  Slide,
  Chip,
  Badge,
  Drawer,
  Dialog,
  DialogContent,
  DialogActions,
  Popover,
  TextField,
  Zoom,
  SvgIcon
} from "@mui/material";

// Material UI icons
import {
  ArrowBack,
  Mic as MicIcon,
  Notes as NotesIcon,
  Language as LanguageIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  PlayArrow as PlayIcon,
  Lightbulb as LightbulbIcon,
  FiberManualRecord as RecordIcon,
  Timer as TimerIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
  Done as DoneIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  FileUpload as FileUploadIcon, // Import Upload Icon
} from "@mui/icons-material";

// Import components (Ensure paths are correct)
import SoundWave from "../NewMeeting/SoundWave"; // Assuming path is correct

// --- Helper Components (Keep these as they are) ---

// Create a custom wave logo icon
const WaveLogoIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M3,12 C5,10 7,14 9,12 C11,10 13,14 15,12 C17,10 19,14 21,12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M3,17 C5,15 7,19 9,17 C11,15 13,19 15,17 C17,15 19,19 21,17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeOpacity="0.5"
    />
    <path d="M3,7 C5,5 7,9 9,7 C11,5 13,9 15,7 C17,5 19,9 21,7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeOpacity="0.7"
    />
  </SvgIcon>
);

// Highlight keywords component
const HighlightKeywords = React.memo(({ text, keywords, highlightColor }) => {
  if (!keywords?.length || !text) return text;

  const escapedKeywords = keywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
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
              fontWeight: 500
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

// Animated Record Button
const RecordButton = ({ isRecording, onClick, disabled, size = "large" }) => {
  const theme = useTheme();

  const sizeMap = {
    small: { size: 48, iconSize: 24 },
    medium: { size: 64, iconSize: 32 },
    large: { size: 80, iconSize: 40 }
  };

  const { size: buttonSize, iconSize } = sizeMap[size];

  return (
    <Zoom in={true}>
      <Fab
        color={isRecording ? "error" : "primary"}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        onClick={onClick}
        disabled={disabled}
        sx={{
          width: buttonSize,
          height: buttonSize,
          boxShadow: theme.shadows[8],
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': {
            transform: 'scale(1.08)',
            boxShadow: theme.shadows[12]
          },
          '&:active': {
            transform: 'scale(0.96)'
          },
          position: 'relative',
          '&::before': isRecording ? {
            content: '""',
            position: 'absolute',
            top: -8,
            left: -8,
            right: -8,
            bottom: -8,
            borderRadius: '50%',
            border: `2px solid ${theme.palette.error.main}`,
            animation: 'pulse 2s infinite'
          } : {}
        }}
      >
        {isRecording ? (
          <RecordIcon sx={{ fontSize: iconSize, animation: 'blink 1.5s infinite' }} />
        ) : (
          <MicIcon sx={{ fontSize: iconSize }} />
        )}

        <style jsx>{`
            @keyframes pulse {
              0% { transform: scale(0.95); opacity: 0.7; }
              70% { transform: scale(1.05); opacity: 0.3; }
              100% { transform: scale(0.95); opacity: 0.7; }
            }
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.6; }
            }
          `}</style>
      </Fab>
    </Zoom>
  );
};

// KeywordChip component
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
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          borderColor: theme.palette.primary.main
        },
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        height: 26
      }}
    />
  );
};

// Instructions Drawer
const InstructionsDrawer = ({ open, onClose, keywordExamples, theme }) => {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxHeight: '80vh',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper' }}>
        <Box sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightbulbIcon color="warning" />
            <Typography variant="h6" fontWeight={600}>Meeting Tips</Typography>
          </Box>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ p: 3, overflowY: 'auto' }}>
        {/* ... (Instructions content remains the same) ... */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            How to Get Better Results
          </Typography>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            mt: 2
          }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  mt: 0.5
                }}
              >
                1
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Start with introductions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Begin by stating all participants' names clearly so they're included in the minutes.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  mt: 0.5
                }}
              >
                2
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  State the agenda clearly
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Say "Today's agenda includes..." or "Our meeting agenda is..." to help with organization.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  mt: 0.5
                }}
              >
                3
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Use key phrases for action items
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mention "Action Item", "Task", "Next Steps", or "Deadline" when assigning responsibilities.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  mt: 0.5
                }}
              >
                4
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Summarize at the end
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  End with "To summarize..." or "In conclusion..." to highlight key points.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.info.main, 0.08),
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          mb: 3
        }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Important Keywords
          </Typography>
          <Typography variant="body2" mb={2}>
            These keywords help organize the summary better:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {keywordExamples.map(keyword => (
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

        <Box sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.warning.main, 0.08),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TimerIcon fontSize="small" color="warning" />
            <Typography variant="subtitle2" fontWeight={600}>
              Pro Tip
            </Typography>
          </Box>
          <Typography variant="body2">
            Position your device closer to the speaker and minimize background noise for the best recording quality.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: 8,
            py: 1,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Got it
        </Button>
      </Box>
    </Drawer>
  );
};

// Timer component
const RecorderTimer = ({ seconds, isRecording, isUploading }) => { // Added isUploading prop
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <Box sx={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        bgcolor: isRecording ? 'error.main' : isUploading ? 'info.main' : 'text.disabled', // Color for uploading
        animation: isRecording ? 'blink 1.5s infinite' : 'none'
      }} />
      <Typography variant="h5" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
        {/* Show 00:00 when uploading or if time is 0 */}
        {isUploading || seconds === 0 ? '00:00' : formatTime(seconds)}
      </Typography>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
};

// Language selector dialog
const LanguageSelector = ({ open, onClose, currentLanguage, onSelectLanguage, disabled }) => {
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'gu-IN', name: 'Gujarati' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'ja-JP', name: 'Japanese' }
    // Add more languages as supported by your transcription service
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: 320
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600}>
          Select Language
        </Typography>
      </Box>

      <DialogContent sx={{ p: 2 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 1
        }}>
          {languages.map(lang => (
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
                justifyContent: 'center',
                fontWeight: currentLanguage === lang.code ? 600 : 400
              }}
              icon={currentLanguage === lang.code ? <CheckIcon fontSize="small" /> : null}
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

// --- Main Meeting Recorder Component ---
const MeetingRecorder = () => {
  // --- Context Hooks ---
  const {
    // Recording state & control
    mediaRecorderStatus,
    isRecording: contextIsRecording,
    startMeeting,
    endMeeting,
    // Upload state & control
    isUploading, // Added
    handleFileUpload, // Added
    // Data & Processing state
    audioBlob,
    transcription: finalTranscription,
    minutes, // Added from context (though not used directly in this view yet)
    isTranscribing,
    isGeneratingMinutes,
    loading: contextLoading, // Renamed from context
    error: contextError,
    // Actions
    transcribeMeetingAudio,
    generateAndSaveMeeting,
    // Other context values if needed
  } = useMeeting();

  // --- State ---
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeStep, setActiveStep] = useState(0); // 0: Record/Upload, 1: Process
  const [meetingTitle, setMeetingTitle] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [recordingStoppedManually, setRecordingStoppedManually] = useState(false); // Track if user stopped or uploaded
  const [currentLanguage, setCurrentLanguage] = useState("en-US");
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [expandedTranscript, setExpandedTranscript] = useState(false);

  // --- Refs ---
  const theme = useTheme();
  const timerRef = useRef(null);
  const hasProcessedRef = useRef(false); // Track if processing step was initiated
  const liveTranscriptEndRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for the hidden file input

  // --- Media Queries ---
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // --- Speech Recognition ---
  const {
    transcript, // Live transcript accumulating
    interimTranscript, // Current hypothesis
    finalTranscript: liveFinalTranscript, // Finalized part of live transcript
    listening, // Is speech recognition active?
    resetTranscript, // Function to reset live transcript
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  // --- Memos ---
  const keywordsToHighlight = useMemo(
    () => [ /* Keywords remain the same */
      "agenda", "next steps", "action plan", "action item", "goals", "summary",
      "summarize", "participants", "decision", "minutes", "deadline", "follow up",
      "issue", "problem", "solution", "proposal", "vote", "assign", "task",
      "milestone", "blocker",
    ],
    []
  );
  const keywordExamples = useMemo(() => ["agenda", "action item", "next steps", "decision", "deadline", "summary"], []);
  const highlightColor = useMemo(() => alpha(theme.palette.secondary.main, 0.2), [theme]);
  const displayedTranscript = useMemo(() => liveFinalTranscript + (interimTranscript ? " " + interimTranscript : ""), [liveFinalTranscript, interimTranscript]);
  const speechRecognitionSupported = useMemo(() => browserSupportsSpeechRecognition, [browserSupportsSpeechRecognition]);
  const isLoading = useMemo(() => contextLoading || isUploading || (contextIsRecording && mediaRecorderStatus === 'acquiring_media'), [contextLoading, isUploading, contextIsRecording, mediaRecorderStatus]);
  // *** Updated canProcess memo ***
  const canProcess = useMemo(() => {
    const hasData = !!audioBlob;
    const isIdle = !contextIsRecording && !isTranscribing && !isGeneratingMinutes && !isLoading && !isUploading;
    // console.log(`canProcess check: hasData=${hasData}, isIdle=${isIdle}, audioBlob size=${audioBlob?.size}`); // DEBUG LOG
    return hasData && isIdle;
  }, [audioBlob, contextIsRecording, isTranscribing, isGeneratingMinutes, isLoading, isUploading]);

  const isProcessingAny = useMemo(() => isTranscribing || isGeneratingMinutes || isLoading, [isTranscribing, isGeneratingMinutes, isLoading]);
  const showMinuteContent = useMemo(() => activeStep === 1 && !!finalTranscription && !isTranscribing, [activeStep, finalTranscription, isTranscribing]);

  // --- Effects ---

  // Recording Timer Effect
  useEffect(() => {
    if (contextIsRecording && mediaRecorderStatus === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      // Keep recordingTime unless explicitly reset
    }
    return () => clearInterval(timerRef.current);
  }, [contextIsRecording, mediaRecorderStatus]);

  // Live Speech Recognition Effect
  useEffect(() => {
    if (contextIsRecording && mediaRecorderStatus === 'recording' && speechRecognitionSupported && isMicrophoneAvailable && !listening) {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: currentLanguage });
    } else if ((!contextIsRecording || !isMicrophoneAvailable || !speechRecognitionSupported) && listening) {
      SpeechRecognition.stopListening();
    }
    // Cleanup handled by stopListening call
  }, [contextIsRecording, mediaRecorderStatus, listening, speechRecognitionSupported, currentLanguage, resetTranscript, isMicrophoneAvailable]);

  // Auto-transcribe when moving to Step 1
  useEffect(() => {
    const shouldTranscribe = activeStep === 1 && audioBlob && !finalTranscription && !isTranscribing && !contextError?.includes("Transcription failed");
    if (shouldTranscribe && hasProcessedRef.current) {
      // console.log("Effect: Triggering transcription..."); // DEBUG LOG
      transcribeMeetingAudio();
    }
  }, [activeStep, audioBlob, finalTranscription, isTranscribing, contextError, transcribeMeetingAudio]); // Added hasProcessedRef dependency? No, keep it as is.

  // Auto-scroll Live Transcript Effect
  useEffect(() => {
    if (activeStep === 0 && liveTranscriptEndRef.current) {
      liveTranscriptEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [displayedTranscript, activeStep]);

  // Effect to show context errors in Snackbar
  useEffect(() => {
    if (contextError) {
      // console.error("Context Error Received:", contextError); // DEBUG LOG
      setSnackbarMessage(`Error: ${contextError}`); // Prefix with Error for clarity
      setSnackbarOpen(true);
    }
  }, [contextError]);

  // *** Add Effect to monitor audioBlob changes ***
  useEffect(() => {
    // console.log("audioBlob state changed:", audioBlob ? `Size: ${audioBlob.size}` : 'null'); // DEBUG LOG
    // If an audioBlob appears AND we previously stopped/uploaded, ensure the 'stopped' state is set.
    // This helps if the context sets the blob slightly after the handler finishes.
    if (audioBlob && !contextIsRecording && !isUploading) {
      // Check if it was *already* stopped. Avoid setting it if recording just started and blob is null initially.
      // The `recordingStoppedManually` flag handles the main transition, this is a fallback.
      // console.log("Detected audioBlob presence while idle, ensuring stopped state.");
      // setRecordingStoppedManually(true); // Re-ensure this state if needed, but might cause loops if not careful. Let's rely on the handler logic first.
    }
  }, [audioBlob, contextIsRecording, isUploading]);


  // --- Handlers ---

  // Toggle recording start/stop
  const toggleRecording = useCallback(() => {
    // console.log("toggleRecording called. Current state:", { contextIsRecording, mediaRecorderStatus, isUploading }); // DEBUG LOG
    if (!contextIsRecording && mediaRecorderStatus !== "acquiring_media" && !isUploading) {
      setRecordingTime(0);
      hasProcessedRef.current = false;
      setActiveStep(0);
      setRecordingStoppedManually(false);
      resetTranscript();
      setMeetingTitle("");
      // console.log("Starting meeting via context..."); // DEBUG LOG
      startMeeting();
    } else if (contextIsRecording) {
      // console.log("Ending meeting via context..."); // DEBUG LOG
      endMeeting();
      setRecordingStoppedManually(true); // Set immediately on user action
    }
  }, [contextIsRecording, mediaRecorderStatus, isUploading, startMeeting, endMeeting, resetTranscript]);

  // Handle language change from selector
  const handleLanguageChange = useCallback((event) => {
    const newLang = event.target.value;
    // console.log("handleLanguageChange:", newLang); // DEBUG LOG
    setCurrentLanguage(newLang);
    if (listening) {
      SpeechRecognition.stopListening().then(() => {
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true, language: newLang });
      });
    }
  }, [listening, resetTranscript]);

  // Trigger hidden file input click
  const handleUploadClick = useCallback(() => {
    // console.log("handleUploadClick triggered"); // DEBUG LOG
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Handle file selection from input
  const handleFileSelected = useCallback(async (event) => {
    const file = event.target.files?.[0];
    // console.log("handleFileSelected: File chosen:", file?.name); // DEBUG LOG
    if (!file) return;
    event.target.value = null; // Reset input

    // console.log("Calling handleFileUpload from context..."); // DEBUG LOG
    const success = await handleFileUpload(file); // Call context handler
    // console.log("Context handleFileUpload returned:", success); // DEBUG LOG

    if (success) {
      setActiveStep(0);
      setRecordingTime(0);
      setRecordingStoppedManually(true); // Explicitly set state for UI update
      hasProcessedRef.current = false;
      resetTranscript();
      setSnackbarMessage("File ready. Click 'Process Audio' below."); // Updated message
      setSnackbarOpen(true);
      // console.log("State updated after successful upload:", { activeStep: 0, recordingStoppedManually: true }); // DEBUG LOG
    } else {
      // Error state is handled by the context and shown via useEffect
      // console.error("File upload failed or was rejected by context handler."); // DEBUG LOG
      // Snackbar with error message is shown by the contextError effect
      // Optionally set a specific snackbar message here if context doesn't provide one
      // setSnackbarMessage("File upload failed. Please check console for details.");
      // setSnackbarOpen(true);
    }
  }, [handleFileUpload, resetTranscript]); // Dependencies

  // Handle copy transcript
  const handleCopy = useCallback(async (textToCopy) => {
    // console.log("handleCopy called"); // DEBUG LOG
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
  }, []); // Dependencies managed where called

  // Handle share transcript
  const handleShare = useCallback(async (textToShare, title = "Meeting Transcript") => {
    // console.log("handleShare called"); // DEBUG LOG
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
  }, []); // Dependencies managed where called

  // Handle "Process Recording" button click
  const handleProcessRecording = useCallback(() => {
    // console.log("handleProcessRecording clicked. canProcess:", canProcess); // DEBUG LOG
    if (canProcess) {
      setActiveStep(1);
      hasProcessedRef.current = true; // Mark processing initiated
      if (listening) {
        SpeechRecognition.stopListening();
      }
      // console.log("Moved to step 1. Transcription should trigger via effect."); // DEBUG LOG
      // Transcription triggered by useEffect watching activeStep=1
    } else {
      // console.warn("Process button clicked but conditions not met."); // DEBUG LOG
      if (!audioBlob) setSnackbarMessage("No recording or file available.");
      else if (isLoading) setSnackbarMessage("Processing...");
      else setSnackbarMessage("Cannot process yet. Check audio data.");
      setSnackbarOpen(true);
    }
  }, [canProcess, audioBlob, isLoading, listening]); // Dependencies

  // Handle "Generate Minutes" button click
  const handleGenerateAndSave = useCallback(async () => {
    // console.log("handleGenerateAndSave clicked."); // DEBUG LOG
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
    // console.log("Calling generateAndSaveMeeting from context..."); // DEBUG LOG
    await generateAndSaveMeeting(meetingTitle);
    // Navigation handled by context on success
  }, [meetingTitle, finalTranscription, isTranscribing, isProcessingAny, generateAndSaveMeeting]);

  // Handle "Record Again" button click (from Step 1)
  const handleRecordAgain = useCallback(() => {
    // console.log("handleRecordAgain called."); // DEBUG LOG
    setActiveStep(0);
    setRecordingTime(0);
    resetTranscript();
    setRecordingStoppedManually(false); // Reset the key state
    hasProcessedRef.current = false;
    setMeetingTitle("");
    // Context state reset happens on next startMeeting/handleFileUpload
  }, [resetTranscript]);

  // Handle Snackbar close
  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  }, []);

  // --- Derived State for Errors ---
  const processingError = useMemo(() => contextError && !contextError.startsWith("Transcription failed") && !contextError.startsWith("Recording Error") ? contextError : null, [contextError]);
  const recordingError = useMemo(() => contextError && contextError.startsWith("Recording Error"), [contextError]);
  const finalTranscriptionError = useMemo(() => contextError && contextError.startsWith("Transcription failed"), [contextError]);

  // --- Render Logic ---
  return (
    <Box
      sx={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        background: `linear-gradient(to bottom, ${alpha(theme.palette.background.default, 0.5)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
        backgroundAttachment: "fixed", backdropFilter: "blur(10px)", position: "relative"
      }}
    >
      {/* Background Elements */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", zIndex: -1, opacity: 0.5 }}>
        <Box sx={{ position: "absolute", width: "50vw", height: "50vw", borderRadius: "50%", filter: "blur(80px)", background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`, top: "-10vw", right: "-10vw" }} />
        <Box sx={{ position: "absolute", width: "40vw", height: "40vw", borderRadius: "50%", filter: "blur(100px)", background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 70%)`, bottom: "-10vw", left: "-10vw" }} />
      </Box>

      {/* Header */}
      <Box sx={{ backdropFilter: "blur(10px)", borderBottom: "1px solid", borderColor: alpha(theme.palette.divider, 0.1), position: "sticky", top: 0, zIndex: 10, background: alpha(theme.palette.background.paper, 0.7) }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
            {/* Left Header */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button component={RouterLink} to="/" size={isMobile ? "small" : "medium"} startIcon={<ArrowBack />} sx={{ mr: { xs: 1, sm: 2 }, color: "text.primary", borderRadius: 8 }}>
                Back
              </Button>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WaveLogoIcon color="primary" sx={{ fontSize: isMobile ? 22 : 28 }} />
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={600} color="primary">
                  VoiceScribe
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Upload audio file">
                <IconButton
                  onClick={handleUploadClick}
                  disabled={contextIsRecording || isLoading || isUploading}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                >
                  <FileUploadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Meeting tips"><IconButton onClick={() => setInstructionsOpen(true)} color="primary" size={isMobile ? "small" : "medium"}><LightbulbIcon /></IconButton></Tooltip>
              <Tooltip title="Select language"><IconButton onClick={() => setLanguageDialogOpen(true)} disabled={listening || contextIsRecording || isUploading} color="primary" size={isMobile ? "small" : "medium"}><LanguageIcon /></IconButton></Tooltip>
              {!isMobile && contextIsRecording && (<Chip icon={<RecordIcon fontSize="small" />} label="Recording" color="error" size="small" sx={{ borderRadius: 8, animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } } }} />)}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        // Specify allowed audio MIME types for better filtering
        accept="audio/webm,audio/ogg,audio/wav,audio/mpeg,audio/mp4,audio/aac,audio/flac,.mp3,.m4a,.wav"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 3, pb: 12, position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {activeStep === 0 ? (
            // --- RECORDING / UPLOAD VIEW (STEP 0) ---
            <motion.div key="recording-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Status & Timer */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Box sx={{ mb: 1, borderRadius: 20, bgcolor: contextIsRecording ? alpha(theme.palette.error.main, 0.1) : recordingStoppedManually ? alpha(theme.palette.success.main, 0.1) : isUploading ? alpha(theme.palette.info.main, 0.1) : alpha(theme.palette.primary.main, 0.1), color: contextIsRecording ? 'error.main' : recordingStoppedManually ? 'success.main' : isUploading ? 'info.dark' : 'primary.main', px: 3, py: 0.5, border: '1px solid', borderColor: contextIsRecording ? alpha(theme.palette.error.main, 0.2) : recordingStoppedManually ? alpha(theme.palette.success.main, 0.2) : isUploading ? alpha(theme.palette.info.main, 0.2) : alpha(theme.palette.primary.main, 0.2), }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {/* Updated Status Text */}
                    {contextIsRecording ? "Recording in progress"
                      : isUploading ? "Processing Upload..."
                        : recordingStoppedManually && audioBlob ? "Audio Ready"
                          : recordingStoppedManually && !audioBlob ? "Stopped (No Audio)" // Edge case
                            : "Ready to record or upload"}
                  </Typography>
                </Box>
                {/* Show timer when recording OR when stopped/uploaded (to show final/zero time) */}
                {(contextIsRecording || recordingStoppedManually || isUploading) && (
                  <RecorderTimer seconds={recordingTime} isRecording={contextIsRecording} isUploading={isUploading} />
                )}
              </Box>

              {/* Main Grid Layout */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, gap: 3, flex: 1 }}>
                {/* Left Panel - Transcript */}
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 0.5 }}>
                    <Typography variant="h6" fontWeight={600}> {listening ? "Live Transcript" : "Transcript"} </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* Show copy/share only for finalized live transcript */}
                      {liveFinalTranscript && !listening && (
                        <>
                          <Tooltip title="Copy to clipboard"><IconButton onClick={() => handleCopy(liveFinalTranscript)} size="small"><CopyIcon fontSize="small" /></IconButton></Tooltip>
                          {navigator.share && (<Tooltip title="Share transcript"><IconButton onClick={() => handleShare(liveFinalTranscript)} size="small"><ShareIcon fontSize="small" /></IconButton></Tooltip>)}
                        </>
                      )}
                      <Tooltip title={expandedTranscript ? "Collapse" : "Expand"}><IconButton size="small" onClick={() => setExpandedTranscript(!expandedTranscript)}>{expandedTranscript ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}</IconButton></Tooltip>
                    </Box>
                  </Box>
                  {/* Transcript Box */}
                  <Box sx={{ flex: 1, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), p: 3, position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: expandedTranscript ? 'none' : 400, overflow: 'hidden', boxShadow: theme.shadows[1], transition: 'max-height 0.3s ease', minHeight: 200 }}>
                    {!speechRecognitionSupported ? (<Alert severity="warning" variant="filled" sx={{ borderRadius: 2 }}>Speech recognition not supported by your browser.</Alert>)
                      : !isMicrophoneAvailable && !audioBlob && !contextIsRecording ? (<Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>Microphone access denied. Check permissions.</Alert>) // Refined condition
                        : listening ? (
                          <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 2, position: 'relative', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '1rem', lineHeight: 1.7, letterSpacing: 0.2 }}>
                            <HighlightKeywords text={displayedTranscript} keywords={keywordsToHighlight} highlightColor={highlightColor} />
                            <Box component="span" sx={{ display: 'inline-block', width: '2px', height: '1.2em', bgcolor: 'primary.main', verticalAlign: 'middle', ml: 0.5, animation: 'blink 1s step-end infinite', '@keyframes blink': { 'from, to': { opacity: 1 }, '50%': { opacity: 0 } } }} />
                            <div ref={liveTranscriptEndRef} />
                          </Box>
                        ) : liveFinalTranscript ? ( // Show finalized live transcript if available
                          <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 2, fontFamily: "'Inter', system-ui, sans-serif", fontSize: '1rem', lineHeight: 1.7, letterSpacing: 0.2 }}>
                            <HighlightKeywords text={liveFinalTranscript} keywords={keywordsToHighlight} highlightColor={highlightColor} />
                          </Box>
                        ) : ( // Placeholder text
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 3 }}>
                            <NotesIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.primary, 0.2), mb: 2 }} />
                            <Typography variant="h6" gutterBottom color="text.secondary"> No transcript yet </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                              {/* Updated Placeholder Text */}
                              {recordingStoppedManually ? "Audio ready. Click 'Process Audio' below."
                                : isUploading ? "Processing upload..."
                                  : "Press Record or Upload File to begin."}
                            </Typography>
                          </Box>
                        )}
                    {/* Fade out effect */}
                    {!expandedTranscript && (listening || liveFinalTranscript) && (<Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)', pointerEvents: 'none' }} />)}
                  </Box>
                  {/* Suggested Keywords */}
                  {(contextIsRecording || listening) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}> Suggested Keywords: </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {keywordExamples.map(keyword => (<KeywordChip key={keyword} keyword={keyword} active={false} onClick={() => { setSnackbarMessage(`Try saying "${keyword}"`); setSnackbarOpen(true); }} />))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Right Panel - Instructions & Sound Wave */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 3 }}>
                  {/* Instructions Panel */}
                  <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), p: 3, boxShadow: theme.shadows[1] }}>
                    {/* ... (Instructions content remains the same) ... */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LightbulbIcon color="warning" sx={{ mr: 1.5 }} />
                      <Typography variant="h6" fontWeight={600}> Meeting Tips </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      {/* Tip 1 */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box sx={{ width: 28, height: 28, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0, mt: 0.5 }}>1</Box>
                        <Box><Typography variant="subtitle2" fontWeight={600}>Start with introductions</Typography><Typography variant="body2" color="text.secondary">State participants' names clearly.</Typography></Box>
                      </Box>
                      {/* Tip 2 */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box sx={{ width: 28, height: 28, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0, mt: 0.5 }}>2</Box>
                        <Box><Typography variant="subtitle2" fontWeight={600}>State the agenda clearly</Typography><Typography variant="body2" color="text.secondary">Say "Today's agenda includes..."</Typography></Box>
                      </Box>
                      {/* Tip 3 */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box sx={{ width: 28, height: 28, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0, mt: 0.5 }}>3</Box>
                        <Box><Typography variant="subtitle2" fontWeight={600}>Use key phrases for actions</Typography><Typography variant="body2" color="text.secondary">Mention "Action Item" or "Next Steps"</Typography></Box>
                      </Box>
                      {/* Tip 4 */}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ width: 28, height: 28, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0, mt: 0.5 }}>4</Box>
                        <Box><Typography variant="subtitle2" fontWeight={600}>Summarize at the end</Typography><Typography variant="body2" color="text.secondary">End with "To summarize..."</Typography></Box>
                      </Box>
                    </Box>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.08), border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
                      <Typography variant="body2"><strong>Pro Tip:</strong> Minimize background noise for best quality.</Typography>
                    </Box>
                  </Box>
                  {/* Sound Wave Animation */}
                  <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), p: 3, boxShadow: theme.shadows[1], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, overflow: 'hidden' }}>
                    <SoundWave isRecording={contextIsRecording} frequency={1.5} amplitude={20} />
                  </Box>
                </Box>
              </Box>
              {/* Recording Error Alert */}
              {recordingError && (<Alert severity="error" sx={{ mt: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}> {typeof recordingError === "string" ? recordingError : "An unknown recording error occurred."} </Alert>)}
            </motion.div>

          ) : (
            // --- PROCESSING VIEW (STEP 1) ---
            <motion.div key="processing-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Transcription Results Card */}
              <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), mb: 3, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotesIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight={600}> Transcription Results </Typography>
                  </Box>
                  {/* Show copy/share for final transcription */}
                  {finalTranscription && !isTranscribing && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Copy to clipboard"><IconButton size="small" onClick={() => handleCopy(finalTranscription)}><CopyIcon fontSize="small" /></IconButton></Tooltip>
                      {navigator.share && (<Tooltip title="Share"><IconButton size="small" onClick={() => handleShare(finalTranscription, meetingTitle || "Meeting Transcription")}><ShareIcon fontSize="small" /></IconButton></Tooltip>)}
                    </Box>
                  )}
                </Box>
                {/* Transcription Content Area */}
                <Box sx={{ p: 3 }}>
                  {isTranscribing ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main, mb: 3 }} />
                      <Typography variant="h6" gutterBottom> Transcribing your audio... </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}> This may take a moment depending on the length. </Typography>
                      {/* Loading bar animation */}
                      <Box sx={{ mt: 4, mx: 'auto', maxWidth: 500, height: 4, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '30%', borderRadius: 2, bgcolor: theme.palette.primary.main, animation: 'loading 2s infinite', '@keyframes loading': { '0%': { left: '-30%' }, '100%': { left: '100%' } } }} />
                      </Box>
                    </Box>
                  ) : finalTranscriptionError ? (
                    <Alert severity="error" sx={{ borderRadius: 2, display: 'flex', alignItems: 'center' }} action={<Button color="error" size="small" onClick={transcribeMeetingAudio} variant="outlined" sx={{ borderRadius: 28 }}> Retry </Button>}> {contextError} </Alert>
                  ) : finalTranscription ? (
                    <Box sx={{ maxHeight: 400, overflowY: 'auto', p: 2, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 2, fontFamily: "'Inter', system-ui, sans-serif", fontSize: '1rem', lineHeight: 1.7, letterSpacing: 0.2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                      <HighlightKeywords text={finalTranscription} keywords={keywordsToHighlight} highlightColor={highlightColor} />
                    </Box>
                  ) : !audioBlob ? ( // Check if audioBlob is missing (shouldn't happen if process was clicked)
                    <Alert severity="warning" sx={{ borderRadius: 2 }} action={<Button color="inherit" size="small" onClick={handleRecordAgain} variant="outlined" sx={{ borderRadius: 28 }}> Record/Upload </Button>}> No audio found. Please record or upload first. </Alert>
                  ) : ( // Initial state before transcription starts
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress size={40} />
                      <Typography sx={{ mt: 2 }} color="text.secondary"> Preparing to process... </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Generate Minutes Section (conditional) */}
              {showMinuteContent && (
                <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), boxShadow: theme.shadows[2], overflow: 'hidden' }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), display: 'flex', alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <SaveIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight={600}> Generate Meeting Minutes </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, gap: 3, alignItems: 'end' }}>
                      {/* Meeting Title Input */}
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom> Meeting Title </Typography>
                        <TextField fullWidth variant="outlined" placeholder="Enter a descriptive title" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} InputProps={{ sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5), boxShadow: 'none', '&:hover': { bgcolor: alpha(theme.palette.background.default, 0.7) } } }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}> A clear title helps find this meeting later. </Typography>
                      </Box>
                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button onClick={handleRecordAgain} color="inherit" variant="outlined" startIcon={<RestoreIcon />} disabled={isProcessingAny} sx={{ borderRadius: 28, flex: 1, py: 1.5, textTransform: 'none', fontWeight: 500 }}> Record Again </Button>
                        <Button onClick={handleGenerateAndSave} color="primary" variant="contained" startIcon={isProcessingAny ? <CircularProgress size={20} color="inherit" /> : <DoneIcon />} disabled={isProcessingAny || !meetingTitle.trim()} sx={{ borderRadius: 28, flex: 2, py: 1.5, boxShadow: theme.shadows[4], textTransform: 'none', fontWeight: 600 }}> {isProcessingAny ? "Processing..." : "Generate Minutes"} </Button>
                      </Box>
                    </Box>
                    {/* Processing Error */}
                    {processingError && (<Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}> {processingError} </Alert>)}
                  </Box>
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Fixed Bottom Bar/Button */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 3, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        {activeStep === 0 ? (
          // Show Record button if not stopped/uploaded, otherwise show Process button
          !recordingStoppedManually ? (
            <RecordButton
              isRecording={contextIsRecording}
              onClick={toggleRecording}
              // *** Updated disabled logic for Record Button ***
              disabled={isLoading || isUploading || mediaRecorderStatus === 'acquiring_media' || (!isMicrophoneAvailable && !audioBlob) || !speechRecognitionSupported}
              size={isMobile ? "medium" : "large"}
            />
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayIcon />}
              onClick={handleProcessRecording}
              // *** Updated disabled logic for Process Button ***
              disabled={!canProcess || isLoading || isUploading} // Check canProcess, isLoading, isUploading
              sx={{ borderRadius: 28, px: 4, py: 1.5, fontWeight: 600, boxShadow: theme.shadows[8], textTransform: 'none', fontSize: '1rem' }}
            >
              {/* Show appropriate text/spinner */}
              {isLoading || isUploading ? <CircularProgress size={24} color="inherit" /> : "Process Audio"}
            </Button>
          )
        ) : (
          // No primary button needed in step 1 (actions are in the card)
          <Box sx={{ height: isMobile ? 64 : 80 }} /> // Placeholder to maintain height
        )}
      </Box>

      {/* Instructions Drawer (Mobile) */}
      <InstructionsDrawer open={instructionsOpen} onClose={() => setInstructionsOpen(false)} keywordExamples={keywordExamples} theme={theme} />

      {/* Language Selector Dialog */}
      <LanguageSelector open={languageDialogOpen} onClose={() => setLanguageDialogOpen(false)} currentLanguage={currentLanguage} onSelectLanguage={handleLanguageChange} disabled={listening || contextIsRecording || isUploading} />

      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} message={snackbarMessage} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} sx={{ '& .MuiSnackbarContent-root': { borderRadius: 2, minWidth: 'auto', px: 2 } }} />

    </Box>
  );
};

export default MeetingRecorder;
