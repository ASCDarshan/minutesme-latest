// components/NewMeeting/Timer.jsx
import React from 'react';
import { Typography } from '@mui/material';

// Helper function to format seconds into MM:SS
const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
};

const Timer = ({ seconds, sx }) => {
    return (
        <Typography
            variant="h4" // Make it prominent
            component="div" // Use div instead of p for semantic correctness if needed
            sx={{
                fontFamily: 'monospace', // Good for fixed-width numbers
                color: 'text.primary',
                fontWeight: 500,
                ...sx, // Allow overriding styles
            }}
        >
            {formatTime(seconds)}
        </Typography>
    );
};

export default Timer;