// components/NewMeeting/ProcessingUI.jsx
import React from 'react';
import {
    Box,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Paper, // Use Paper for slight visual separation
    Typography,
    useTheme
} from '@mui/material';
import { Save as SaveIcon, ErrorOutline as ErrorIcon } from '@mui/icons-material';

const ProcessingUI = ({
    meetingTitle,
    setMeetingTitle,
    onProcess, // Function to call when 'Generate' button is clicked
    isLoading, // Boolean to indicate if processing is happening
    currentError // String containing error message, or null/undefined
}) => {
    const theme = useTheme();

    const handleTitleChange = (event) => {
        setMeetingTitle(event.target.value);
    };

    const canProcess = meetingTitle.trim().length > 0 && !isLoading;

    return (
        <Paper
            elevation={3} // Give it some elevation
            sx={{
                p: { xs: 2, sm: 3 }, // Padding inside the paper
                borderRadius: 2, // Match border radius if needed
                // border: `1px solid ${theme.palette.divider}`, // Optional border
                mt: 2 // Margin top
            }}
        >
            <Typography variant="h6" gutterBottom fontWeight={600}>
                Generate Meeting Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter a title for your meeting and click generate to create the minutes and summary.
            </Typography>

            <Box component="form" noValidate autoComplete="off">
                <TextField
                    fullWidth
                    required
                    id="meeting-title"
                    label="Meeting Title"
                    variant="outlined"
                    value={meetingTitle}
                    onChange={handleTitleChange}
                    disabled={isLoading} // Disable input while loading
                    sx={{ mb: 2 }} // Margin bottom before button
                />

                <Button
                    fullWidth
                    variant="contained"
                    color="secondary" // Use a distinct color for generation
                    size="large"
                    onClick={onProcess}
                    disabled={!canProcess} // Disable if no title or already loading
                    startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                    sx={{
                        py: 1.5, // Make button slightly taller
                        fontWeight: 600,
                        transition: 'background-color 0.3s ease', // Smooth transition
                        '&.Mui-disabled': {
                           // Optional: specific styling for disabled state if needed
                           // backgroundColor: theme.palette.action.disabledBackground,
                        }
                    }}
                >
                    {isLoading ? 'Generating...' : 'Generate & Save Minutes'}
                </Button>
            </Box>

            {/* Error Display Area */}
            {currentError && (
                <Alert
                    severity="error"
                    icon={<ErrorIcon fontSize="inherit" />}
                    sx={{ mt: 3 }} // Margin top for spacing
                >
                    <Typography variant="body2">
                        <strong>Generation Failed:</strong> {currentError}
                    </Typography>
                </Alert>
            )}
        </Paper>
    );
};

export default ProcessingUI;