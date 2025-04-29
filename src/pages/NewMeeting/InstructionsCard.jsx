import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, Box, useTheme } from '@mui/material';
import { TipsAndUpdates as TipsIcon, LooksOne, LooksTwo, Looks3, Looks4, Info as InfoIcon } from '@mui/icons-material';

const InstructionsCard = ({ elevation, borderRadius, boxShadow, sx }) => {
    const theme = useTheme();
    return (
        <Card elevation={elevation} sx={{ p: { xs: 1, sm: 1 }, borderRadius: borderRadius, boxShadow: boxShadow, height: "100%", display: "flex", flexDirection: "column", ...sx }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <TipsIcon sx={{ mr: 1.5, color: theme.palette.info.main, fontSize: 24 }} />
                    <Typography variant="h6" component="h3" fontWeight={600}>Recording Instructions</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Follow these steps for better meeting summaries:</Typography>
                <List dense>
                    <ListItem>
                        <ListItemIcon sx={{ minWidth: 32 }}><LooksOne fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText primary="Start by stating the names of all participants." />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon sx={{ minWidth: 32 }}><LooksTwo fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText primary='Clearly state the agenda using phrases like "Today\s agenda is..."' />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon sx={{ minWidth: 32 }}><Looks3 fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText primary='Mention keywords like "Action Plan", "Goals", or "Next Steps".' />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon sx={{ minWidth: 32 }}><Looks4 fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText primary='Use phrases like "To summarize..." when concluding.' />
                    </ListItem>
                </List>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", alignItems: "flex-start", mt: 2 }}>
                    <InfoIcon sx={{ mr: 1.5, color: theme.palette.info.main, mt: 0.5, fontSize: 20 }} />
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>General Tip</Typography>
                        <Typography variant="body2" color="text.secondary">Minimize background noise and ensure speakers talk clearly near the microphone.</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default InstructionsCard;