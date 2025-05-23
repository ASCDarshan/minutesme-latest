import { Typography } from "@mui/material";

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");
  return `${paddedMinutes}:${paddedSeconds}`;
};

const Timer = ({ seconds, sx }) => {
  return (
    <Typography
      variant="h4"
      component="div" 
      sx={{
        fontFamily: "monospace",
        color: "text.primary",
        fontWeight: 500,
        ...sx,
      }}
    >
      {formatTime(seconds)}
    </Typography>
  );
};

export default Timer;
