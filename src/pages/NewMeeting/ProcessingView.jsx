import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import { Notes, Mic as MicIcon } from "@mui/icons-material";
import ProcessingUI from "./ProcessingUI";

const ProcessingView = ({
  finalTranscription,
  isTranscribing,
  finalTranscriptionError,
  contextError,
  transcribeMeetingAudio,
  audioBlob,
  meetingTitle,
  setMeetingTitle,
  handleGenerateAndSave,
  isProcessingMinutes,
  processingError,
  handleRecordAgain,
  cardElevation,
  cardBorderRadius,
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ width: "100%", maxWidth: 700 }}>
      <Card
        sx={{
          borderRadius: cardBorderRadius,
          mb: 4,
          boxShadow: "0 10px 40px rgba(0,0,0,0.07)",
          elevation: cardElevation,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Notes sx={{ mr: 1, color: "primary.main" }} /> Final
              Transcription Result
            </Typography>
          </Box>
          {isTranscribing && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 1 }} color="text.secondary">
                Transcribing audio... Please wait.
              </Typography>
            </Box>
          )}
          {finalTranscriptionError && !isTranscribing && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {contextError}
              <Button
                size="small"
                onClick={transcribeMeetingAudio}
                sx={{ ml: 2 }}
              >
                Retry
              </Button>
            </Alert>
          )}
          {finalTranscription && !isTranscribing && (
            <Box
              sx={{
                maxHeight: 300,
                overflowY: "auto",
                p: 2,
                background: alpha(theme.palette.grey[500], 0.05),
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  wordBreak: "break-word",
                }}
              >
                {finalTranscription}
              </Typography>
            </Box>
          )}
          {!finalTranscription &&
            !isTranscribing &&
            audioBlob &&
            !finalTranscriptionError && (
              <Typography
                sx={{ textAlign: "center", py: 4 }}
                color="text.secondary"
              >
                Processing audio for final transcription...
              </Typography>
            )}
          {!audioBlob && !isTranscribing && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No audio recording found for final processing. Please record
              again.
            </Alert>
          )}
        </CardContent>
      </Card>

      {finalTranscription && !isTranscribing && !finalTranscriptionError && (
        <ProcessingUI
          meetingTitle={meetingTitle}
          setMeetingTitle={setMeetingTitle}
          onProcess={handleGenerateAndSave}
          isLoading={isProcessingMinutes}
          currentError={processingError}
        />
      )}

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Button
          onClick={handleRecordAgain}
          color="inherit"
          variant="outlined"
          startIcon={<MicIcon />}
          disabled={isTranscribing || isProcessingMinutes}
          sx={{ borderRadius: 20 }}
        >
          Record Again
        </Button>
      </Box>
    </Box>
  );
};
export default ProcessingView;
