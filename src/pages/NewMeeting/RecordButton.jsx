// components/NewMeeting/RecordButton.jsx
import React from 'react';
import { Fab, useTheme, Tooltip } from '@mui/material';
import { Mic as MicIcon, Stop as StopIcon } from '@mui/icons-material';

const RecordButton = ({ isRecording, onClick, disabled }) => {
    const theme = useTheme();

    return (
        <Tooltip title={isRecording ? 'Stop Recording' : 'Start Recording'} arrow>
            {/* Span needed for tooltip when button is disabled */}
            <span>
                <Fab
                    color={isRecording ? 'error' : 'primary'}
                    aria-label={isRecording ? 'stop recording' : 'start recording'}
                    onClick={onClick}
                    disabled={disabled}
                    sx={{
                        width: 72, // Larger size for prominence
                        height: 72,
                        boxShadow: theme.shadows[6],
                        '&:hover': {
                            boxShadow: theme.shadows[10],
                        },
                        // Style disabled state explicitly if needed
                        '&.Mui-disabled': {
                            backgroundColor: isRecording ? theme.palette.error.light : theme.palette.primary.light,
                            opacity: 0.7,
                            cursor: 'not-allowed',
                            pointerEvents: 'auto' // Ensure tooltip still works on disabled
                        }
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