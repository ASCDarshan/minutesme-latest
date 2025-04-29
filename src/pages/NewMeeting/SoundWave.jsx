import React from "react";
import { Box, keyframes } from "@mui/material";

const waveAnimation = keyframes`
  0%, 100% { transform: scaleY(0.1); }
  50% { transform: scaleY(1); }
`;

const SoundWave = ({ isRecording }) => {
  const barCount = 15;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {[...Array(barCount)].map((_, index) => (
        <Box
          key={index}
          sx={{
            width: "4px",
            height: "80%",
            backgroundColor: isRecording ? "primary.main" : "grey.400",
            mx: "2px",
            borderRadius: "2px",
            transformOrigin: "bottom",
            transform: "scaleY(0.1)",
            transition: "background-color 0.3s ease, transform 0.3s ease",
            animation: isRecording
              ? `${waveAnimation} ${
                  0.8 + Math.random() * 0.7
                }s ease-in-out infinite alternate`
              : "none",
            animationDelay: isRecording ? `${index * 0.05}s` : "0s",
          }}
        />
      ))}
    </Box>
  );
};

export default SoundWave;
