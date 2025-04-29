import React from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Typography,
} from "@mui/material";
import {
  Save as SaveIcon,
  ErrorOutline as ErrorIcon,
} from "@mui/icons-material";

const ProcessingUI = ({
  meetingTitle,
  setMeetingTitle,
  onProcess,
  isLoading,
  currentError,
}) => {
  const handleTitleChange = (event) => {
    setMeetingTitle(event.target.value);
  };

  const canProcess = meetingTitle.trim().length > 0 && !isLoading;

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        mt: 2,
      }}
    >
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Generate Meeting Summary
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter a title for your meeting and click generate to create the minutes
        and summary.
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
          disabled={isLoading}
          sx={{ mb: 2 }}
        />
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          size="large"
          onClick={onProcess}
          disabled={!canProcess}
          startIcon={
            isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={{
            py: 1.5,
            fontWeight: 600,
            transition: "background-color 0.3s ease",
            "&.Mui-disabled": {},
          }}
        >
          {isLoading ? "Generating..." : "Generate & Save Minutes"}
        </Button>
      </Box>
      {currentError && (
        <Alert
          severity="error"
          icon={<ErrorIcon fontSize="inherit" />}
          sx={{ mt: 3 }}
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
