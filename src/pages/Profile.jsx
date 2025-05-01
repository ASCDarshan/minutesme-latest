import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMeeting } from "../context/MeetingContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Button,
  Container,
  Typography,
  Avatar,
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  LinearProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Badge,
  Chip,
  alpha,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  Person,
  ArrowBack,
  Logout as LogoutIcon,
  CloudDownload,
  DeleteForever,
  Edit,
  VerifiedUser,
  CheckCircle,
  Close,
  MicNone,
  MoreVert,
  Event,
  AccessTime,
  CalendarToday,
  Description,
} from "@mui/icons-material";
import StatCard from "../components/Profile/StatCard";
import moment from "moment/moment";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { meetings, fetchUserMeetings, isLoading } = useMeeting();

  const navigate = useNavigate();
  const theme = useTheme();
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchUserMeetings();
      } catch (error) {
        console.error("Error fetching user meetings:", error);
      }
    };

    fetchData();
  }, [fetchUserMeetings]);

  const calculateMeetingStats = () => {
    if (!meetings) {
      return {
        totalMeetings: 0,
        totalMinutes: 0,
        averageDuration: 0,
        storageUsed: 0,
        recentMeetings: [],
      };
    }

    const totalMeetings = meetings.length;

    let totalMinutes = 0;
    meetings.forEach((meeting) => {
      if (meeting.duration) {
        totalMinutes += meeting.duration;
      } else if (meeting.transcription) {
        const wordCount = meeting.transcription.length / 5;
        const estimatedMinutes = Math.round(wordCount / 150);
        totalMinutes += estimatedMinutes;
      }
    });

    const averageDuration =
      totalMeetings > 0 ? Math.round(totalMinutes / totalMeetings) : 0;

    // Calculate storage used (rough estimate)
    // Assuming 1KB per 500 characters of text, plus metadata
    let storageUsed = 0;
    meetings.forEach((meeting) => {
      if (meeting.transcription) {
        storageUsed += meeting.transcription.length / 500 + 5; // 5KB base per meeting
      } else {
        storageUsed += 5; // Default 5KB if no transcription
      }

      // Add storage for audio if available
      if (meeting.audioUrl) {
        storageUsed += 500; // Rough estimate of 500KB per audio recording
      }
    });

    // Convert to MB
    storageUsed = Math.round(storageUsed / 1024);

    const recentMeetings = [...meetings]
      .sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      })
      .slice(0, 5);

    return {
      totalMeetings,
      totalMinutes,
      averageDuration,
      storageUsed,
      recentMeetings,
    };
  };

  const stats = calculateMeetingStats();

  const storageLimit = 1000;
  const storagePercentage = (stats.storageUsed / storageLimit) * 100;

  const handleLogout = async () => {
    setLogoutDialogOpen(false);
    await logout();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountDialogOpen(false);
    alert("Account deletion will be implemented in a future update");
  };

  const handleEnterEditMode = () => {
    setEditedName(currentUser?.displayName || "");
    setProfileEditMode(true);
  };

  const handleSaveProfile = () => {
    setProfileEditMode(false);
    alert("Profile update will be implemented in a future update");
  };

  const handleCancelEdit = () => {
    setProfileEditMode(false);
  };

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Please sign in to view your profile
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/"
            sx={{ mt: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        pb: 6,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "250px",
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.dark,
            0.7
          )} 0%, ${alpha(theme.palette.primary.main, 0.5)} 50%, ${alpha(
            theme.palette.secondary.light,
            0.3
          )} 100%)`,
          zIndex: 0,
          borderRadius: "0 0 30px 30px",
          boxShadow: `0 10px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, pt: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            component={RouterLink}
            to="/dashboard"
            startIcon={<ArrowBack />}
            sx={{
              mb: 3,
              color: "white",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: alpha("#fff", 0.1),
              },
            }}
          >
            Back to Dashboard
          </Button>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  mb: 3,
                  background: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  boxShadow: `0 10px 30px ${alpha(
                    theme.palette.common.black,
                    0.07
                  )}`,
                }}
              >
                <Box
                  sx={{
                    textAlign: "center",
                    position: "relative",
                    pt: 4,
                    pb: 3,
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2,
                    }}
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        profileEditMode ? null : (
                          <IconButton
                            size="small"
                            onClick={handleEnterEditMode}
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              color: "#fff",
                              width: 32,
                              height: 32,
                              "&:hover": {
                                bgcolor: theme.palette.primary.dark,
                              },
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        )
                      }
                    >
                      <Avatar
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || "User"}
                        sx={{
                          width: 110,
                          height: 110,
                          border: `4px solid ${theme.palette.background.paper}`,
                          boxShadow: `0 0 0 4px ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                        }}
                      >
                        {currentUser.displayName ? (
                          currentUser.displayName[0].toUpperCase()
                        ) : (
                          <Person />
                        )}
                      </Avatar>
                    </Badge>
                  </motion.div>
                  <Box sx={{ mt: 2 }}>
                    <AnimatePresence mode="wait">
                      {profileEditMode ? (
                        <motion.div
                          key="edit-mode"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TextField
                            fullWidth
                            label="Display Name"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ maxWidth: "80%", mb: 2 }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 2,
                            }}
                          >
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={handleCancelEdit}
                              startIcon={<Close />}
                              sx={{ borderRadius: 2 }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={handleSaveProfile}
                              startIcon={<CheckCircle />}
                              sx={{ borderRadius: 2 }}
                            >
                              Save
                            </Button>
                          </Box>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="display-mode"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Typography variant="h5" fontWeight={600}>
                            {currentUser.displayName || "User"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {currentUser.email}
                          </Typography>
                          <Chip
                            icon={<VerifiedUser fontSize="small" />}
                            label="Verified Account"
                            color="primary"
                            size="small"
                            sx={{ mt: 2, borderRadius: 1.5 }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                </Box>
                <Divider />
                <CardContent sx={{ px: 2, py: 0 }}>
                  <List disablePadding>
                    <ListItem
                      button
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                        },
                      }}
                      onClick={() => {
                        alert(
                          "This feature will be implemented in a future update"
                        );
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 42 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.08
                            ),
                            color: theme.palette.primary.main,
                          }}
                        >
                          <CloudDownload fontSize="small" />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary="Download My Data"
                        secondary="Get a copy of all your data"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem
                      button
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                        },
                      }}
                      onClick={() => setLogoutDialogOpen(true)}
                    >
                      <ListItemIcon sx={{ minWidth: 42 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: alpha(
                              theme.palette.info.main,
                              0.08
                            ),
                            color: theme.palette.info.main,
                          }}
                        >
                          <LogoutIcon fontSize="small" />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary="Sign Out"
                        secondary="Log out of your account"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem
                      button
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.error.main,
                            0.05
                          ),
                        },
                      }}
                      onClick={() => setDeleteAccountDialogOpen(true)}
                    >
                      <ListItemIcon sx={{ minWidth: 42 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: alpha(
                              theme.palette.error.main,
                              0.08
                            ),
                            color: theme.palette.error.main,
                          }}
                        >
                          <DeleteForever fontSize="small" />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary="Delete Account"
                        secondary="Permanently remove your account and data"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          color: "error.main",
                        }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={8}>
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "200px",
                }}
              >
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading your data...</Typography>
              </Box>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      mb: 3,
                      background: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      boxShadow: `0 10px 30px ${alpha(
                        theme.palette.common.black,
                        0.07
                      )}`,
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                        Account Overview
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <StatCard
                            icon={<MicNone />}
                            title="Recording Time"
                            value={`${stats.totalMinutes} min`}
                            color={theme.palette.primary.main}
                            delay={1}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <StatCard
                            icon={<Event />}
                            title="Total Meetings"
                            value={stats.totalMeetings}
                            color={theme.palette.secondary.main}
                            delay={2}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <StatCard
                            icon={<AccessTime />}
                            title="Avg. Duration"
                            value={`${stats.averageDuration} min`}
                            color={theme.palette.info.main}
                            delay={3}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      mb: 3,
                      background: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      boxShadow: `0 10px 30px ${alpha(
                        theme.palette.common.black,
                        0.07
                      )}`,
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 3,
                        }}
                      >
                        <Typography variant="h6" fontWeight={600}>
                          Storage Usage
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            py: 0.5,
                            px: 1.5,
                            borderRadius: 5,
                            backgroundColor:
                              storagePercentage >= 80
                                ? alpha(theme.palette.warning.main, 0.1)
                                : alpha(theme.palette.success.main, 0.1),
                            color:
                              storagePercentage >= 80
                                ? theme.palette.warning.main
                                : theme.palette.success.main,
                            fontWeight: 600,
                          }}
                        >
                          {storagePercentage.toFixed(0)}% Used
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {stats.storageUsed} MB Used
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {storageLimit} MB Total
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={storagePercentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.08
                            ),
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              background:
                                storagePercentage >= 80
                                  ? `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`
                                  : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            },
                          }}
                        />
                      </Box>
                      {storagePercentage >= 80 ? (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: alpha(
                              theme.palette.warning.main,
                              0.05
                            ),
                            border: `1px solid ${alpha(
                              theme.palette.warning.main,
                              0.2
                            )}`,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            <strong
                              style={{ color: theme.palette.warning.main }}
                            >
                              Running low on storage.
                            </strong>{" "}
                            Consider upgrading your account for more space.
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            color="warning"
                            sx={{ ml: "auto", borderRadius: 2 }}
                          >
                            Upgrade
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Your storage includes recordings, transcriptions, and
                          meeting minutes.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      background: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      boxShadow: `0 10px 30px ${alpha(
                        theme.palette.common.black,
                        0.07
                      )}`,
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                        Recent Meetings
                      </Typography>

                      {stats.recentMeetings &&
                        stats.recentMeetings.length > 0 ? (
                        <List sx={{ px: 0 }}>
                          {stats.recentMeetings.map((meeting, index) => (
                            <React.Fragment key={meeting.id || index}>
                              <ListItem
                                sx={{
                                  px: 2,
                                  py: 1.5,
                                  borderRadius: 2,
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.05
                                    ),
                                  },
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  navigate(`/meeting/${meeting.id}`)
                                }
                              >
                                <ListItemIcon>
                                  <Avatar
                                    sx={{
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.1
                                      ),
                                      color: theme.palette.primary.main,
                                    }}
                                  >
                                    <Description />
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                    >
                                      {meeting.title || "Untitled Meeting"}
                                    </Typography>
                                  }
                                  secondary={
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mt: 0.5,
                                      }}
                                    >
                                      <CalendarToday
                                        fontSize="small"
                                        sx={{
                                          fontSize: 14,
                                          mr: 0.5,
                                          color: "text.secondary",
                                        }}
                                      />
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        Created:{" "}
                                        {meeting.createdAt &&
                                          typeof meeting.createdAt.seconds ===
                                          "number"
                                          ? moment(
                                            meeting.createdAt.seconds * 1000
                                          ).format("MMM D, YYYY, hh:mm A")
                                          : "No date"}
                                      </Typography>
                                      {meeting.duration && (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            ml: 2,
                                          }}
                                        >
                                          <AccessTime
                                            fontSize="small"
                                            sx={{
                                              fontSize: 14,
                                              mr: 0.5,
                                              color: "text.secondary",
                                            }}
                                          />
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            {meeting.duration} min
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  }
                                />
                                <IconButton edge="end">
                                  <MoreVert fontSize="small" />
                                </IconButton>
                              </ListItem>
                              {index < stats.recentMeetings.length - 1 && (
                                <Divider variant="inset" component="li" />
                              )}
                            </React.Fragment>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            You haven't recorded any meetings yet.
                          </Typography>
                          <Button
                            variant="contained"
                            component={RouterLink}
                            to="/new-meeting"
                            sx={{ mt: 2, borderRadius: 2 }}
                          >
                            Record a Meeting
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </Grid>
        </Grid>
      </Container>
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            maxWidth: "400px",
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Sign Out</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to sign out of your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            color="primary"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteAccountDialogOpen}
        onClose={() => setDeleteAccountDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            maxWidth: "400px",
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be
            undone and all your data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setDeleteAccountDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
