import { Fab, useTheme, Tooltip } from "@mui/material";
import { Mic as MicIcon, Stop as StopIcon } from "@mui/icons-material";

const RecordButton = ({ isRecording, onClick, disabled }) => {
  const theme = useTheme();

  return (
    <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"} arrow>
      <span>
        <Fab
          color={isRecording ? "error" : "primary"}
          aria-label={isRecording ? "stop recording" : "start recording"}
          onClick={onClick}
          disabled={disabled}
          sx={{
            width: 72,
            height: 72,
            boxShadow: theme.shadows[6],
            "&:hover": {
              boxShadow: theme.shadows[10],
            },
            "&.Mui-disabled": {
              backgroundColor: isRecording
                ? theme.palette.error.light
                : theme.palette.primary.light,
              opacity: 0.7,
              cursor: "not-allowed",
              pointerEvents: "auto",
            },
          }}
        >
          {isRecording ? (
            <StopIcon sx={{ fontSize: 36 }} />
          ) : (
            <MicIcon sx={{ fontSize: 36 }} />
          )}
        </Fab>
      </span>
    </Tooltip>
  );
};

export default RecordButton;
