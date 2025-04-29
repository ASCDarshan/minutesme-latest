import React, { useState, useRef, useCallback } from 'react'; // Added useRef, useCallback
import {
  Box,
  Grid,
  Typography,
  useTheme,
  alpha,
  Button,
  Alert,
  AppBar,
  Toolbar,
  Fab,
  IconButton,
  Badge,
  Chip,
  Paper,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Tooltip // Added Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
// Assuming these components are correctly imported from their paths
import InstructionsCard from './InstructionsCard';
import LiveTranscriptCard from './LiveTranscriptCard';
import ProcessingView from './ProcessingView';
// Remove duplicate imports if RecordButton and Timer are not used directly here
// import RecordButton from './RecordButton';
// import Timer from './Timer';
import {
  PlayArrow as PlayIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  Language as LanguageIcon,
  FiberManualRecord as RecordIcon,
  CheckCircle as CheckIcon, // Using CheckMarkIcon below for consistency
  InfoOutlined as InfoIcon,
  TipsAndUpdates as TipsIcon,
  Close as CloseIcon,
  Check as CheckMarkIcon, // Renamed import for clarity
  FileUpload as FileUploadIcon // Added Upload Icon
} from '@mui/icons-material';

const NewMeetingMobile = (props) => {
  const {
    // Props passed from NewMeeting.js
    activeStep,
    cardElevation,
    cardBorderRadius,
    cardBoxShadow,
    theme,
    contextIsRecording,
    mediaRecorderStatus,
    toggleRecording,
    recordingTime,
    // recordingStopped, // Replaced by recordingStoppedManually logic
    audioBlob,
    handleProcessRecording,
    recordingError,
    isMicrophoneAvailable,
    speechRecognitionSupported,
    listening,
    currentLanguage,
    handleLanguageChange,
    handleCopy, // Used within LiveTranscriptCard
    handleShare, // Used within LiveTranscriptCard
    transcript, // Used within LiveTranscriptCard
    displayedTranscript, // Used within LiveTranscriptCard
    keywordsToHighlight, // Used within LiveTranscriptCard
    highlightColor, // Used within LiveTranscriptCard
    liveTranscriptEndRef, // Used within LiveTranscriptCard
    finalTranscription, // Used within ProcessingView
    isTranscribing, // Used within ProcessingView
    finalTranscriptionError, // Used within ProcessingView
    contextError, // Used within ProcessingView & potentially here
    transcribeMeetingAudio, // Used within ProcessingView
    handleGenerateAndSave, // Used within ProcessingView
    meetingTitle, // Used within ProcessingView
    setMeetingTitle, // Used within ProcessingView
    isProcessingMinutes, // Used within ProcessingView
    processingError, // Used within ProcessingView
    handleRecordAgain, // Used within ProcessingView
    // --- New props for upload ---
    isUploading,
    handleFileUpload, // Function from context
    // --- Calculated props ---
    isLoading, // Combined loading state
    canProcess, // Calculated state for enabling process button
    // --- Removed props if only used in child components ---
    // timerRef, waveFrequencyRef, waveAmplitudeRef (if not used directly)
    // --- Explicitly add recordingStoppedManually if needed, or rely on canProcess/audioBlob ---
    // recordingStoppedManually, // Let's use audioBlob and !contextIsRecording to determine state
  } = props;

  // Local state for dialogs/drawers
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [tipsDrawerOpen, setTipsDrawerOpen] = useState(false);
  // Local state to track if recording/upload was stopped/completed
  // This helps manage the transition between Record FAB and Process Button
  const [isReadyToProcess, setIsReadyToProcess] = useState(false);

  // Ref for hidden file input
  const fileInputRef = useRef(null);

  // --- Effects ---
  // Update isReadyToProcess based on audioBlob and recording state
  React.useEffect(() => {
    // Set ready if we have a blob AND we are not currently recording or uploading
    if (audioBlob && !contextIsRecording && !isUploading) {
      setIsReadyToProcess(true);
    } else {
      setIsReadyToProcess(false);
    }
  }, [audioBlob, contextIsRecording, isUploading]);


  // --- Handlers ---

  // Trigger hidden file input click
  const handleUploadClick = useCallback(() => {
    // console.log("Mobile: handleUploadClick triggered"); // DEBUG
     if (fileInputRef.current) {
         fileInputRef.current.click();
     }
  }, []);

  // Handle file selection from input
  const handleFileSelected = useCallback(async (event) => {
      const file = event.target.files?.[0];
      // console.log("Mobile: handleFileSelected: File chosen:", file?.name); // DEBUG
      if (!file) return;
      event.target.value = null; // Reset input

      // console.log("Mobile: Calling handleFileUpload from context..."); // DEBUG
      const success = await handleFileUpload(file); // Call context handler
      // console.log("Mobile: Context handleFileUpload returned:", success); // DEBUG

      if (success) {
          // The useEffect watching audioBlob will set isReadyToProcess
          // Snackbar message is handled by parent or context error effect
          // console.log("Mobile: File upload success reported by context."); // DEBUG
      } else {
          // Error state is handled by the context and shown via parent's Snackbar
          // console.error("Mobile: File upload failed or was rejected by context handler."); // DEBUG
      }
  }, [handleFileUpload]); // Dependency on context handler


  // --- Helper Functions ---

  // Helper function to determine status text
  const getStatusText = () => {
    if (isLoading && !isUploading && !contextIsRecording) return "Loading..."; // General loading
    if (isUploading) return "Processing upload...";
    if (mediaRecorderStatus === "acquiring_media") return "Requesting microphone...";
    if (!speechRecognitionSupported) return "Speech recognition not supported";
    if (!isMicrophoneAvailable && !audioBlob) return "Microphone unavailable"; // Show only if no blob exists
    if (isReadyToProcess) return "Audio ready. Tap Process to continue.";
    return "Tap record or upload file";
  };
  const statusText = getStatusText();

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Available languages
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'gu-IN', name: 'Gujarati' }
    // Add more languages as needed
  ];

  // Language display name
  const getLanguageDisplayName = (code) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  return (
    <Box sx={{ width: '100%', position: 'relative', pb: 10 /* Add padding for FAB */ }}>

      {/* Hidden File Input */}
       <input
           ref={fileInputRef}
           type="file"
           accept="audio/webm,audio/ogg,audio/wav,audio/mpeg,audio/mp4,audio/aac,audio/flac,.mp3,.m4a,.wav"
           onChange={handleFileSelected}
           style={{ display: 'none' }}
       />

      {/* ======================= STEP 0 VIEW ======================= */}
      {activeStep === 0 && (
        <motion.div
          key="step0-mobile-top-record"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Top Recording Controls - Fixed at top */}
          <Paper
            elevation={2}
            sx={{
              width: '100%',
              mb: 2,
              borderRadius: 2,
              overflow: 'hidden',
              position: 'sticky', // Make it sticky
              top: 0, // Stick to top (adjust based on header height if needed)
              zIndex: 10 // Ensure it's above content
            }}
          >
            {/* Recording Status Banner */}
            <Box
              sx={{
                width: '100%',
                p: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: contextIsRecording ? alpha(theme.palette.error.main, 0.1)
                         : isReadyToProcess ? alpha(theme.palette.success.main, 0.1)
                         : isUploading ? alpha(theme.palette.info.main, 0.1)
                         : alpha(theme.palette.primary.main, 0.1),
                borderBottom: '1px solid',
                borderColor: contextIsRecording ? alpha(theme.palette.error.main, 0.2)
                             : isReadyToProcess ? alpha(theme.palette.success.main, 0.2)
                             : isUploading ? alpha(theme.palette.info.main, 0.2)
                             : alpha(theme.palette.primary.main, 0.2)
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
                    '& .MuiChip-icon': {
                      color: theme.palette.error.main,
                      animation: 'pulse 1.5s infinite',
                    },
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.6 }
                    }
                  }}
                />
              ) : isReadyToProcess ? (
                <Chip
                  icon={<CheckMarkIcon fontSize="small" />}
                  label={`Recorded: ${formatTime(recordingTime)}`} // Show final time
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
              ): (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Ready to Record/Upload
                </Typography>
              )}
            </Box>

            {/* Control Bar */}
            <Box
              sx={{
                p: 1.5, // Reduced padding slightly
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {/* Left Buttons: Language & Upload */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                 <Tooltip title="Select language">
                   <Button
                     variant="outlined"
                     size="small"
                     onClick={() => setLanguageDialogOpen(true)}
                     disabled={listening || contextIsRecording || isUploading}
                     sx={{
                       borderRadius: 4,
                       minWidth: 40, // Ensure icon buttons have space
                       p: '4px 8px'
                     }}
                     aria-label="Select language"
                   >
                     <LanguageIcon fontSize="small" />
                   </Button>
                 </Tooltip>
                 <Tooltip title="Upload audio file">
                   <Button
                     variant="outlined"
                     size="small"
                     onClick={handleUploadClick}
                     disabled={contextIsRecording || isLoading || isUploading}
                     sx={{
                       borderRadius: 4,
                       minWidth: 40,
                       p: '4px 8px'
                     }}
                     aria-label="Upload audio file"
                   >
                     <FileUploadIcon fontSize="small" />
                   </Button>
                 </Tooltip>
              </Box>

              {/* Center: Record/Process Button Area */}
              {/* This is now handled by the FAB at the bottom */}

              {/* Right Buttons: Tips */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                 <Tooltip title="Meeting tips">
                   <IconButton
                     color="primary"
                     onClick={() => setTipsDrawerOpen(true)}
                     size="small"
                     sx={{
                       border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                       borderRadius: 2
                     }}
                   >
                     <TipsIcon fontSize="small" />
                   </IconButton>
                 </Tooltip>
              </Box>
            </Box>
          </Paper>

          {/* Status Text */}
          <Box sx={{ textAlign: 'center', my: 2, px: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {statusText}
            </Typography>
          </Box>

          {/* Grid container for the cards */}
          <Grid container spacing={2} alignItems="stretch">
            {/* Live Transcript Card - Full width on mobile */}
            <Grid item xs={12} >
              <LiveTranscriptCard
                 elevation={cardElevation}
                 borderRadius={cardBorderRadius}
                 boxShadow={cardBoxShadow}
                 listening={listening}
                 currentLanguage={currentLanguage}
                 // handleLanguageChange={handleLanguageChange} // Language changed via dialog
                 handleCopy={handleCopy}
                 handleShare={handleShare}
                 transcript={transcript} // Pass live transcript parts
                 speechRecognitionSupported={speechRecognitionSupported}
                 isMicrophoneAvailable={isMicrophoneAvailable}
                 displayedTranscript={displayedTranscript}
                 keywordsToHighlight={keywordsToHighlight}
                 highlightColor={highlightColor}
                 contextIsRecording={contextIsRecording}
                 liveTranscriptEndRef={liveTranscriptEndRef}
                 sx={{ height: 'auto', minHeight: 200 }} // Adjust height
              />
            </Grid>

            {/* Instructions Card - Full width on mobile */}
            {/* Optionally hide instructions card initially on mobile or show below */}
            {/*
            <Grid item xs={12}>
              <InstructionsCard
                elevation={cardElevation}
                borderRadius={cardBorderRadius}
                boxShadow={cardBoxShadow}
                sx={{ height: 'auto' }} // Adjust height
              />
            </Grid>
            */}
          </Grid>

          {/* Display Recording Error if present */}
          {recordingError && !contextIsRecording && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {typeof recordingError === 'string' ? recordingError : "An unknown recording error occurred."}
            </Alert>
          )}

          {/* Language Selection Dialog */}
          <Dialog
            open={languageDialogOpen}
            onClose={() => setLanguageDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: 3,
                width: '90%',
                maxWidth: 360
              }
            }}
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LanguageIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                <Typography variant="h6" fontWeight={600}> Select Language </Typography>
              </Box>
              <IconButton edge="end" onClick={() => setLanguageDialogOpen(false)} aria-label="close"> <CloseIcon /> </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 2 }}>
              <List sx={{ pt: 0 }}>
                {languages.map((language) => (
                  <ListItem
                    button
                    onClick={() => {
                      handleLanguageChange({ target: { value: language.code } });
                      setLanguageDialogOpen(false);
                    }}
                    key={language.code}
                    disabled={listening || contextIsRecording || isUploading} // Disable if recording/uploading
                    sx={{ borderRadius: 2, mb: 1, bgcolor: currentLanguage === language.code ? alpha(theme.palette.primary.main, 0.08) : 'transparent', border: `1px solid ${currentLanguage === language.code ? theme.palette.primary.main : 'transparent'}` }}
                  >
                    <ListItemIcon> <LanguageIcon color={currentLanguage === language.code ? "primary" : "inherit"} /> </ListItemIcon>
                    <ListItemText primary={language.name} />
                    {currentLanguage === language.code && <CheckMarkIcon color="primary" />}
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button onClick={() => setLanguageDialogOpen(false)} variant="outlined" fullWidth sx={{ borderRadius: 28 }}> Cancel </Button>
            </DialogActions>
          </Dialog>

          {/* Tips Drawer */}
          <Drawer
            anchor="bottom"
            open={tipsDrawerOpen}
            onClose={() => setTipsDrawerOpen(false)}
            PaperProps={{ sx: { maxHeight: '80vh', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' } }}
          >
             {/* Tips Drawer Content (Keep as is) */}
             <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                 <TipsIcon color="warning" sx={{ mr: 1.5 }} />
                 <Typography variant="h6" fontWeight={600}>Meeting Tips</Typography>
               </Box>
               <IconButton onClick={() => setTipsDrawerOpen(false)} edge="end"> <CloseIcon /> </IconButton>
             </Box>
             <Box sx={{ p: 2, overflowY: 'auto' }}>
               <Typography variant="subtitle1" fontWeight={600} gutterBottom> How to Get Better Results </Typography>
               <List>
                 {[ { number: 1, title: "Start with introductions", description: "Begin by stating all participants' names clearly." }, { number: 2, title: "State the agenda clearly", description: "Use phrases like \"Today's agenda includes...\"" }, { number: 3, title: "Highlight action items", description: "Mention keywords like \"Action Item\", \"Next Steps\", etc." }, { number: 4, title: "Summarize at the end", description: "End with \"To summarize our discussion today...\"" } ].map((tip) => (
                   <ListItem key={tip.number} sx={{ mb: 2, px: 0 }}>
                     <ListItemIcon> <Box sx={{ width: 28, height: 28, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}> {tip.number} </Box> </ListItemIcon>
                     <ListItemText primary={<Typography variant="subtitle2" fontWeight={600}>{tip.title}</Typography>} secondary={tip.description} />
                   </ListItem>
                 ))}
               </List>
               <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.warning.main, 0.08), borderRadius: 2, border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> <InfoIcon fontSize="small" color="warning" sx={{ mr: 1 }} /> <Typography variant="subtitle2" fontWeight={600}>Pro Tip</Typography> </Box>
                 <Typography variant="body2"> Position your device closer to the speaker and minimize background noise for the best recording quality. </Typography>
               </Box>
               <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.08), borderRadius: 2, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                 <Typography variant="subtitle2" fontWeight={600} gutterBottom> Recognized Keywords </Typography>
                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                   {keywordsToHighlight.slice(0, 10).map(keyword => ( <Chip key={keyword} label={keyword} size="small" color="primary" variant="outlined" sx={{ borderRadius: 6 }} /> ))}
                 </Box>
               </Box>
             </Box>
             <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
               <Button fullWidth variant="contained" onClick={() => setTipsDrawerOpen(false)} sx={{ borderRadius: 8, py: 1, textTransform: 'none', fontWeight: 600 }}> Got it </Button>
             </Box>
          </Drawer>

          {/* Fixed Action Button at Bottom */}
           <Fab
             color={contextIsRecording ? "error" : "primary"}
             aria-label={contextIsRecording ? "Stop recording" : isReadyToProcess ? "Process Audio" : "Start recording"}
             onClick={isReadyToProcess ? handleProcessRecording : toggleRecording}
             disabled={
               isReadyToProcess
                 ? !canProcess || isLoading || isUploading // Disable Process if not ready or loading
                 : isLoading || isUploading || mediaRecorderStatus === 'acquiring_media' || (!isMicrophoneAvailable && !audioBlob) || !speechRecognitionSupported // Disable Record if loading, uploading, acquiring, no mic (and no blob), or not supported
             }
             sx={{
               position: 'fixed',
               bottom: 32, // Adjust position as needed
               left: '50%',
               transform: 'translateX(-50%)',
               boxShadow: theme.shadows[6],
               width: isReadyToProcess ? 'auto' : 64, // Make Process button wider
               height: isReadyToProcess ? 48 : 64,
               px: isReadyToProcess ? 3 : 0, // Padding for Process button text
               borderRadius: isReadyToProcess ? 28 : '50%', // Pill shape for Process button
               transition: 'all 0.3s ease',
               ...(contextIsRecording && { // Pulse animation only when recording
                 '&::after': {
                   content: '""',
                   position: 'absolute',
                   top: -4, right: -4, bottom: -4, left: -4,
                   border: `2px solid ${theme.palette.error.main}`,
                   borderRadius: '50%',
                   animation: 'pulsate 1.5s ease-out infinite',
                 },
                 '@keyframes pulsate': {
                   '0%': { opacity: 1, transform: 'scale(1)' },
                   '50%': { opacity: 0.5, transform: 'scale(1.1)' },
                   '100%': { opacity: 1, transform: 'scale(1)' },
                 },
               }),
             }}
           >
             {isReadyToProcess
               ? (isLoading || isUploading ? <CircularProgress size={24} color="inherit" /> : <><PlayIcon sx={{ mr: 1 }} /> Process</>)
               : (contextIsRecording ? <StopIcon /> : <MicIcon />)
             }
           </Fab>

        </motion.div>
      )}

      {/* ======================= STEP 1 VIEW ======================= */}
      {activeStep === 1 && (
        <motion.div
          key="step1-mobile"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
        >
           {/* Use ProcessingView component */}
           <ProcessingView
                finalTranscription={finalTranscription}
                isTranscribing={isTranscribing}
                finalTranscriptionError={finalTranscriptionError}
                contextError={contextError} // Pass general context error
                transcribeMeetingAudio={transcribeMeetingAudio}
                audioBlob={audioBlob}
                meetingTitle={meetingTitle}
                setMeetingTitle={setMeetingTitle}
                handleGenerateAndSave={handleGenerateAndSave}
                isProcessingMinutes={isProcessingMinutes} // Pass specific flag
                processingError={processingError} // Pass specific error
                handleRecordAgain={handleRecordAgain}
                cardElevation={cardElevation}
                cardBorderRadius={cardBorderRadius}
                isLoading={isLoading} // Pass general loading flag
           />
        </motion.div>
      )}
    </Box>
  );
};

export default NewMeetingMobile;
