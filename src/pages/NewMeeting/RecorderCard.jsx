import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  useTheme,
  alpha,
} from "@mui/material";
import { PlayArrow as PlayIcon } from "@mui/icons-material";
import RecordButton from "./RecordButton";
import SoundWave from "./SoundWave";
import Timer from "./Timer";

const RecorderCard = ({
  elevation,
  borderRadius,
  boxShadow,
  sx,
  contextIsRecording,
  toggleRecording,
  mediaRecorderStatus,
  isMicrophoneAvailable,
  speechRecognitionSupported,
  recordingTime,
  recordingStopped,
  audioBlob,
  handleProcessRecording,
  recordingError,
  waveFrequency,
  waveAmplitude,
}) => {
  const theme = useTheme();
  return (
    <Card
      elevation={elevation}
      sx={{
        p: { xs: 1, sm: 1 },
        borderRadius: borderRadius,
        boxShadow: boxShadow,
        position: "relative",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...sx,
      }}
    >
      <CardContent
        sx={{
          position: "relative",
          zIndex: 1,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          gutterBottom
          sx={{ textAlign: "center", mb: 2 }}
        >
          Recorder
        </Typography>
        <Box
          sx={{
            mb: 2,
            height: 120,
            bgcolor: alpha(theme.palette.background.paper, 0.5),
          }}
        >
          <SoundWave
            isRecording={contextIsRecording}
            frequency={waveFrequency}
            amplitude={waveAmplitude}
          />
        </Box>
        <Timer seconds={recordingTime} sx={{ mb: 2, textAlign: "center" }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            mt: "auto",
            gap: 2,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ mb: 1 }}>
              <RecordButton
                isRecording={contextIsRecording}
                onClick={toggleRecording}
                disabled={
                  mediaRecorderStatus === "acquiring_media" ||
                  !isMicrophoneAvailable ||
                  !speechRecognitionSupported
                }
              />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500, minHeight: "1.5em" }}
            >
              {mediaRecorderStatus === "acquiring_media"
                ? "Requesting microphone..."
                : !speechRecognitionSupported
                ? "Speech recognition not supported"
                : !isMicrophoneAvailable
                ? "Microphone unavailable"
                : contextIsRecording
                ? "Tap to stop recording"
                : "Tap to start recording"}
            </Typography>
          </Box>
          {recordingStopped && audioBlob && !contextIsRecording && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PlayIcon />}
              onClick={handleProcessRecording}
              sx={{
                borderRadius: 28,
                px: 3,
                py: 1,
                fontWeight: 600,
                boxShadow: `0 4px 14px ${alpha(
                  theme.palette.secondary.main,
                  0.4
                )}`,
              }}
            >
              Process Recording
            </Button>
          )}
        </Box>
        {recordingError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {typeof recordingError === "string"
              ? recordingError
              : "An unknown recording error occurred."}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default RecorderCard;
