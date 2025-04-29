// components/NewMeeting/SoundWave.jsx
import React from 'react';
import { Box, keyframes } from '@mui/material';

// Define keyframes for the wave animation
const waveAnimation = keyframes`
  0%, 100% { transform: scaleY(0.1); }
  50% { transform: scaleY(1); }
`;

const SoundWave = ({ isRecording }) => {
    const barCount = 15; // Number of bars in the wave

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%',
                overflow: 'hidden',
            }}
        >
            {[...Array(barCount)].map((_, index) => (
                <Box
                    key={index}
                    sx={{
                        width: '4px', // Width of each bar
                        height: '80%', // Max height relative to container
                        backgroundColor: isRecording ? 'primary.main' : 'grey.400', // Color changes based on recording
                        mx: '2px', // Spacing between bars
                        borderRadius: '2px',
                        transformOrigin: 'bottom',
                        transform: 'scaleY(0.1)', // Start scaled down
                        transition: 'background-color 0.3s ease, transform 0.3s ease', // Smooth transition for start/stop
                        animation: isRecording
                            ? `${waveAnimation} ${0.8 + Math.random() * 0.7}s ease-in-out infinite alternate` // Apply animation if recording
                            : 'none', // No animation if not recording
                        animationDelay: isRecording ? `${index * 0.05}s` : '0s', // Stagger animation start times
                    }}
                />
            ))}
        </Box>
    );
};

export default SoundWave;