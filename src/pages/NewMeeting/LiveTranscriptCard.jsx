import React from 'react';
import { Card, CardContent, Typography, Box, FormControl, InputLabel, Select, MenuItem, Tooltip, IconButton, Alert, useTheme, alpha } from '@mui/material';
import { HighlightAlt as HighlightIcon, Language as LanguageIcon, Share as ShareIcon, MicOff as MicOffIcon } from '@mui/icons-material';
import HighlightKeywords from './HighlightKeywords'; // Assuming path is correct
import { CopyAll as CopyIcon } from '@mui/icons-material';


const LiveTranscriptCard = ({
    elevation, borderRadius, boxShadow, sx,
    listening, currentLanguage, handleLanguageChange,
    handleCopy, handleShare, transcript,
    speechRecognitionSupported, isMicrophoneAvailable,
    displayedTranscript, keywordsToHighlight, highlightColor,
    contextIsRecording, liveTranscriptEndRef
}) => {
    const theme = useTheme();
    return (
        <Card elevation={elevation} sx={{ p: { xs: 1, sm: 1 }, borderRadius: borderRadius, boxShadow: boxShadow, height: "100%", display: "flex", flexDirection: "column", ...sx }}>
            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <HighlightIcon sx={{ mr: 1.5, color: "secondary.main", fontSize: 24 }} />
                        <Typography variant="h6" component="h3" fontWeight={600}>Live Transcript</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }} disabled={listening}>
                            <InputLabel id="language-select-label">Language</InputLabel>
                            <Select
                                labelId="language-select-label"
                                id="language-select"
                                value={currentLanguage}
                                label="Language"
                                onChange={handleLanguageChange}
                                startAdornment={<LanguageIcon sx={{ mr: 0.5, color: "action.active" }} />}
                                disabled={listening}
                            >
                                <MenuItem value="en-US">English (US)</MenuItem>
                                <MenuItem value="en-GB">English (UK)</MenuItem>
                                <MenuItem value="hi-IN">Hindi (India)</MenuItem>
                                <MenuItem value="gu-IN">Gujarati (India)</MenuItem>
                            </Select>
                        </FormControl>
                        <Tooltip title="Copy Transcript">
                            <span><IconButton onClick={handleCopy} disabled={!transcript || listening} size="small"><CopyIcon /></IconButton></span>
                        </Tooltip>
                        <Tooltip title="Share Transcript">
                            <span><IconButton onClick={handleShare} disabled={!transcript || listening || !navigator.share} size="small"><ShareIcon /></IconButton></span>
                        </Tooltip>
                    </Box>
                </Box>
                <Box sx={{ flexGrow: 1, minHeight: 150, maxHeight: 300, overflowY: "auto", p: 2, background: alpha(theme.palette.grey[500], 0.05), borderRadius: 2, border: `1px solid ${theme.palette.divider}`, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "0.875rem" }}>
                    {!speechRecognitionSupported ? (<Alert severity="warning" icon={<MicOffIcon />}>Speech recognition not supported by your browser.</Alert>)
                        : !isMicrophoneAvailable ? (<Alert severity="error" icon={<MicOffIcon />}>Microphone access denied or not found.</Alert>)
                        : listening ? (
                            <>
                                <HighlightKeywords text={displayedTranscript} keywords={keywordsToHighlight} highlightColor={highlightColor} />
                                <Box component="span" sx={{ animation: "blinker 1s linear infinite", ml: "2px", borderLeft: `2px solid ${theme.palette.text.primary}` }}> </Box>
                                <style>{` @keyframes blinker { 50% { opacity: 0; } } `}</style>
                            </>
                        ) : transcript ? (<HighlightKeywords text={transcript} keywords={keywordsToHighlight} highlightColor={highlightColor} />)
                        : contextIsRecording ? (<Typography color="text.secondary" sx={{ fontStyle: "italic" }}>Listening... Speak clearly.</Typography>)
                        : (<Typography color="text.secondary" sx={{ fontStyle: "italic" }}>Click record to start live transcription.</Typography>)
                    }
                    <div ref={liveTranscriptEndRef} />
                </Box>
            </CardContent>
        </Card>
    );
};

export default LiveTranscriptCard;