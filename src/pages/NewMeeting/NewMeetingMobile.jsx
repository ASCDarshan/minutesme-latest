import React, { useState, useRef, useEffect, useCallback } from "react";
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
} from "@mui/material";
import { motion } from "framer-motion";
import LiveTranscriptCard from "./LiveTranscriptCard";
import ProcessingView from "./ProcessingView";
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
} from "@mui/icons-material";

const NewMeetingMobile = (props) => {
  const {
    activeStep,
    cardElevation,
    cardBorderRadius,
    cardBoxShadow,
    theme,
    contextIsRecording,
    mediaRecorderStatus,
    toggleRecording,
    recordingTime,
    audioBlob,
    handleProcessRecording,
    recordingError,
    isMicrophoneAvailable,
    speechRecognitionSupported,
    listening,
    currentLanguage,
    handleLanguageChange,
    handleCopy,
    handleShare,
    transcript,
    displayedTranscript,
    keywordsToHighlight,
    highlightColor,
    liveTranscriptEndRef,
    finalTranscription,
    isTranscribing,
    finalTranscriptionError,
    contextError,
    transcribeMeetingAudio,
    handleGenerateAndSave,
    meetingTitle,
    setMeetingTitle,
    isProcessingMinutes,
    processingError,
    handleRecordAgain,
    isUploading,
    handleFileUpload,
    isLoading,
    canProcess,
  } = props;

  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [tipsDrawerOpen, setTipsDrawerOpen] = useState(false);
  const [isReadyToProcess, setIsReadyToProcess] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (audioBlob && !contextIsRecording && !isUploading) {
      setIsReadyToProcess(true);
    } else {
      setIsReadyToProcess(false);
    }
  }, [audioBlob, contextIsRecording, isUploading]);

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
      } else {
      }
    },
    [handleFileUpload]
  );

  const getStatusText = () => {
    if (isLoading && !isUploading && !contextIsRecording) return "Loading...";
    if (isUploading) return "Processing upload...";
    if (mediaRecorderStatus === "acquiring_media")
      return "Requesting microphone...";
    if (!speechRecognitionSupported) return "Speech recognition not supported";
    if (!isMicrophoneAvailable && !audioBlob) return "Microphone unavailable";
    if (isReadyToProcess) return "Audio ready. Tap Process to continue.";
    return "Tap record or upload file";
  };
  const statusText = getStatusText();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "hi-IN", name: "Hindi" },
    { code: "gu-IN", name: "Gujarati" },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        pb: 10,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/webm,audio/ogg,audio/wav,audio/mpeg,audio/mp4,audio/aac,audio/flac,.mp3,.m4a,.wav"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />

      {activeStep === 0 && (
        <motion.div
          key="step0-mobile-top-record"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Paper
            elevation={2}
            sx={{
              width: "100%",
              mb: 2,
              borderRadius: 2,
              overflow: "hidden",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: contextIsRecording
                  ? alpha(theme.palette.error.main, 0.1)
                  : isReadyToProcess
                  ? alpha(theme.palette.success.main, 0.1)
                  : isUploading
                  ? alpha(theme.palette.info.main, 0.1)
                  : alpha(theme.palette.primary.main, 0.1),
                borderBottom: "1px solid",
                borderColor: contextIsRecording
                  ? alpha(theme.palette.error.main, 0.2)
                  : isReadyToProcess
                  ? alpha(theme.palette.success.main, 0.2)
                  : isUploading
                  ? alpha(theme.palette.info.main, 0.2)
                  : alpha(theme.palette.primary.main, 0.2),
              }}
            >
              {contextIsRecording ? (
                <Chip
                  icon={<RecordIcon fontSize="small" />}
                  label={`Recording: ${formatTime(recordingTime)}`}
                  color="error"
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: 4,
                    "& .MuiChip-icon": {
                      color: theme.palette.error.main,
                      animation: "pulse 1.5s infinite",
                    },
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1 },
                      "50%": { opacity: 0.6 },
                    },
                  }}
                />
              ) : isReadyToProcess ? (
                <Chip
                  icon={<CheckMarkIcon fontSize="small" />}
                  label={`Recorded: ${formatTime(recordingTime)}`}
                  color="success"
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 4 }}
                />
              ) : isUploading ? (
                <Chip
                  icon={<CircularProgress size={16} color="info" />}
                  label={`Uploading...`}
                  color="info"
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 4 }}
                />
              ) : (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Ready to Record/Upload
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                p: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", gap: 5 }}>
                <Tooltip title="Select language">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setLanguageDialogOpen(true)}
                    disabled={listening || contextIsRecording || isUploading}
                    sx={{
                      borderRadius: 4,
                      minWidth: 40,
                      p: "4px 14px",
                    }}
                    aria-label="Select language"
                  >
                    <LanguageIcon fontSize="small" />
                  </Button>
                </Tooltip>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Tooltip title="Upload audio file (MP3 format only)">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleUploadClick}
                      disabled={contextIsRecording || isLoading || isUploading}
                      sx={{
                        borderRadius: 4,
                        minWidth: 40,
                        p: "4px 8px",
                      }}
                      aria-label="Upload audio file"
                    >
                      <FileUploadIcon fontSize="small" />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: "nowrap", p: "4px 8px" }}
                      >
                        Upload Recording
                      </Typography>
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
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
                      borderRadius: 2,
                    }}
                  >
                    <TipsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
          <Box sx={{ textAlign: "center", my: 2, px: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {statusText}
            </Typography>
          </Box>
          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12}>
              <LiveTranscriptCard
                elevation={cardElevation}
                borderRadius={cardBorderRadius}
                boxShadow={cardBoxShadow}
                listening={listening}
                currentLanguage={currentLanguage}
                handleCopy={handleCopy}
                handleShare={handleShare}
                transcript={transcript}
                speechRecognitionSupported={speechRecognitionSupported}
                isMicrophoneAvailable={isMicrophoneAvailable}
                displayedTranscript={displayedTranscript}
                keywordsToHighlight={keywordsToHighlight}
                highlightColor={highlightColor}
                contextIsRecording={contextIsRecording}
                liveTranscriptEndRef={liveTranscriptEndRef}
                sx={{ height: "auto", minHeight: 200 }}
              />
            </Grid>
          </Grid>
          {recordingError && !contextIsRecording && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {typeof recordingError === "string"
                ? recordingError
                : "An unknown recording error occurred."}
            </Alert>
          )}
          <Dialog
            open={languageDialogOpen}
            onClose={() => setLanguageDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: 3,
                width: "90%",
                maxWidth: 360,
              },
            }}
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <LanguageIcon
                  sx={{ mr: 1.5, color: theme.palette.primary.main }}
                />
                <Typography variant="h6" fontWeight={600}>
                  Select Language{" "}
                </Typography>
              </Box>
              <IconButton
                edge="end"
                onClick={() => setLanguageDialogOpen(false)}
                aria-label="close"
              >
                <CloseIcon />{" "}
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 2 }}>
              <List sx={{ pt: 0 }}>
                {languages.map((language) => (
                  <ListItem
                    button
                    onClick={() => {
                      handleLanguageChange({
                        target: { value: language.code },
                      });
                      setLanguageDialogOpen(false);
                    }}
                    key={language.code}
                    disabled={listening || contextIsRecording || isUploading}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor:
                        currentLanguage === language.code
                          ? alpha(theme.palette.primary.main, 0.08)
                          : "transparent",
                      border: `1px solid ${
                        currentLanguage === language.code
                          ? theme.palette.primary.main
                          : "transparent"
                      }`,
                    }}
                  >
                    <ListItemIcon>
                      <LanguageIcon
                        color={
                          currentLanguage === language.code
                            ? "primary"
                            : "inherit"
                        }
                      />{" "}
                    </ListItemIcon>
                    <ListItemText primary={language.name} />
                    {currentLanguage === language.code && (
                      <CheckMarkIcon color="primary" />
                    )}
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button
                onClick={() => setLanguageDialogOpen(false)}
                variant="outlined"
                fullWidth
                sx={{ borderRadius: 28 }}
              >
                Cancel{" "}
              </Button>
            </DialogActions>
          </Dialog>
          <Drawer
            anchor="bottom"
            open={tipsDrawerOpen}
            onClose={() => setTipsDrawerOpen(false)}
            PaperProps={{
              sx: {
                maxHeight: "80vh",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
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
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TipsIcon color="warning" sx={{ mr: 1.5 }} />
                <Typography variant="h6" fontWeight={600}>
                  Meeting Tips
                </Typography>
              </Box>
              <IconButton onClick={() => setTipsDrawerOpen(false)} edge="end">
                <CloseIcon />{" "}
              </IconButton>
            </Box>
            <Box sx={{ p: 2, overflowY: "auto" }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                How to Get Better Results{" "}
              </Typography>
              <List>
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
                  <ListItem key={tip.number} sx={{ mb: 2, px: 0 }}>
                    <ListItemIcon>
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
                        }}
                      >
                        {tip.number}{" "}
                      </Box>{" "}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600}>
                          {tip.title}
                        </Typography>
                      }
                      secondary={tip.description}
                    />
                  </ListItem>
                ))}
              </List>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <InfoIcon fontSize="small" color="warning" sx={{ mr: 1 }} />{" "}
                  <Typography variant="subtitle2" fontWeight={600}>
                    Pro Tip
                  </Typography>{" "}
                </Box>
                <Typography variant="body2">
                  Position your device closer to the speaker and minimize
                  background noise for the best recording quality.{" "}
                </Typography>
              </Box>
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Recognized Keywords{" "}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {keywordsToHighlight.slice(0, 10).map((keyword) => (
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
            </Box>
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setTipsDrawerOpen(false)}
                sx={{
                  borderRadius: 8,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Got it{" "}
              </Button>
            </Box>
          </Drawer>
          <Fab
            color={contextIsRecording ? "error" : "primary"}
            aria-label={
              contextIsRecording
                ? "Stop recording"
                : isReadyToProcess
                ? "Process Audio"
                : "Start recording"
            }
            onClick={
              isReadyToProcess ? handleProcessRecording : toggleRecording
            }
            disabled={
              isReadyToProcess
                ? !canProcess || isLoading || isUploading
                : isLoading ||
                  isUploading ||
                  mediaRecorderStatus === "acquiring_media" ||
                  (!isMicrophoneAvailable && !audioBlob) ||
                  !speechRecognitionSupported
            }
            sx={{
              position: "fixed",
              bottom: 32,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: theme.shadows[6],
              width: isReadyToProcess ? "auto" : 64,
              height: isReadyToProcess ? 48 : 64,
              px: isReadyToProcess ? 3 : 0,
              borderRadius: isReadyToProcess ? 28 : "50%",
              transition: "all 0.3s ease",
              ...(contextIsRecording && {
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: -4,
                  right: -4,
                  bottom: -4,
                  left: -4,
                  border: `2px solid ${theme.palette.error.main}`,
                  borderRadius: "50%",
                  animation: "pulsate 1.5s ease-out infinite",
                },
                "@keyframes pulsate": {
                  "0%": { opacity: 1, transform: "scale(1)" },
                  "50%": { opacity: 0.5, transform: "scale(1.1)" },
                  "100%": { opacity: 1, transform: "scale(1)" },
                },
              }),
            }}
          >
            {isReadyToProcess ? (
              isLoading || isUploading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <>
                  <PlayIcon sx={{ mr: 1 }} /> Process
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
          key="step1-mobile"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <ProcessingView
            finalTranscription={finalTranscription}
            isTranscribing={isTranscribing}
            finalTranscriptionError={finalTranscriptionError}
            contextError={contextError}
            transcribeMeetingAudio={transcribeMeetingAudio}
            audioBlob={audioBlob}
            meetingTitle={meetingTitle}
            setMeetingTitle={setMeetingTitle}
            handleGenerateAndSave={handleGenerateAndSave}
            isProcessingMinutes={isProcessingMinutes}
            processingError={processingError}
            handleRecordAgain={handleRecordAgain}
            cardElevation={cardElevation}
            cardBorderRadius={cardBorderRadius}
            isLoading={isLoading}
          />
        </motion.div>
      )}
    </Box>
  );
};

export default NewMeetingMobile;
