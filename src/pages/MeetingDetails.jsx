import { useEffect, useState, useCallback } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMeeting } from "../context/MeetingContext";
import TimelinePoint from "../components/MeetingDetails/TimelinePoint";
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Divider,
  Tab,
  Tabs,
  ListItemIcon,
  ListItemText,
  Alert,
  useTheme,
  useMediaQuery,
  Snackbar,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack,
  MoreVert,
  Share as ShareIcon,
  Delete as DeleteIcon,
  ContentCopy,
  CalendarToday,
  AccessTime,
  People,
  Comment,
  Lightbulb,
  AssignmentTurnedIn,
  Schedule,
  MicNone,
  NoteAlt,
  Bookmark,
  BookmarkBorder,
  CheckCircle,
  Public,
  Email,
} from "@mui/icons-material";
import moment from "moment";
import AudioPlayer from "../components/MeetingDetails/AudioPlayer";
import AnimatedSection from "../components/MeetingDetails/AnimatedSection";
import MeetingDetailsSkeleton from "../components/UI/MeetingDetailsSkeleton";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`meeting-tabpanel-${index}`}
      aria-labelledby={`meeting-tab-${index}`}
      {...other}
      sx={{ mt: 3 }}
    >
      <AnimatePresence mode="wait">
        {value === index && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    loadMeeting: contextLoadMeeting,
    currentMeeting,
    loading,
    error,
    removeMeeting,
  } = useMeeting();
  const [activeTab, setActiveTab] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadMeeting = useCallback(contextLoadMeeting, [contextLoadMeeting]);

  useEffect(() => {
    if (id) {
      loadMeeting(id);
    } else {
      console.log("MeetingDetails Effect: No meeting ID provided in URL.");
    }
  }, [id, loadMeeting]);

  const handleDeleteMeeting = async () => {
    setDeleteDialogOpen(false);
    const deleted = await removeMeeting(id);
    if (deleted) {
      navigate("/");
      setSnackbarMessage("Meeting deleted successfully");
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage("Failed to delete meeting");
      setSnackbarOpen(true);
    }
  };

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenShareMenu = (event) => {
    event.stopPropagation();
    setShareMenuAnchor(event.currentTarget);
  };

  const handleCloseShareMenu = () => setShareMenuAnchor(null);
  const handleOpenActionsMenu = (event) => {
    event.stopPropagation();
    setActionsMenuAnchor(event.currentTarget);
  };
  const handleCloseActionsMenu = () => setActionsMenuAnchor(null);

  const generatePlainTextSummary = () => {
    const minutesData = currentMeeting?.minutesData || {};
    let summary = "";
    summary += `Meeting Title: ${currentMeeting?.title || "Untitled"}\n`;
    summary += `Date: ${formattedDate} ${formattedTime}\n`;

    if (minutesData?.participants && minutesData.participants.length > 0) {
      summary += `Participants: ${
        Array.isArray(minutesData.participants)
          ? minutesData.participants.join(", ")
          : minutesData.participants
      }\n`;
    }

    if (minutesData?.agenda && minutesData.agenda.length > 0) {
      summary += "\nAgenda:\n";
      (Array.isArray(minutesData.agenda)
        ? minutesData.agenda
        : [minutesData.agenda]
      ).forEach((item) => {
        summary += `- ${item}\n`;
      });
    }

    if (
      minutesData?.keyPoints &&
      Object.keys(minutesData.keyPoints).length > 0
    ) {
      summary += "\nKey Discussion Points:\n";
      Object.entries(minutesData.keyPoints).forEach(([key, value]) => {
        summary += `- ${value}\n`;
      });
    }

    if (minutesData?.decisions && minutesData.decisions.length > 0) {
      summary += "\nDecisions Made:\n";
      (Array.isArray(minutesData.decisions)
        ? minutesData.decisions
        : [minutesData.decisions]
      ).forEach((decision) => {
        summary += `- ${decision}\n`;
      });
    }

    if (actionItems.length > 0) {
      summary += "\nAction Items:\n";
      actionItems.forEach((item) => {
        summary += `- ${item.content}`;
        if (item.assignee) summary += ` (Assigned: ${item.assignee})`;
        if (item.dueDate) summary += ` (Due: ${item.dueDate})`;
        summary += ` - Status: ${item.complete ? "Completed" : "Pending"}\n`;
      });
    }

    if (minutesData?.nextSteps) {
      summary += "\nNext Steps:\n";
      summary += `${minutesData.nextSteps}\n`;
    }

    if (minutesData?.transcription) {
      summary += "\nTranscript:\n";
      summary += `${minutesData.transcription}\n`;
    }

    return summary;
  };

  const handleShareEmail = () => {
    handleCloseShareMenu();
    const subject = `Meeting Minutes: ${
      currentMeeting?.title || "Untitled Meeting"
    }`;
    const body = generatePlainTextSummary();
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, "_blank");
  };

  const handleCopyLink = () => {
    handleCloseShareMenu();
    const plainTextSummary = generatePlainTextSummary();
    navigator.clipboard
      .writeText(plainTextSummary)
      .then(() => {
        setSnackbarMessage("Meeting summary copied to clipboard!");
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage("Failed to copy to clipboard");
        setSnackbarOpen(true);
      });
  };

  const handlePublishToWeb = () => {
    handleCloseShareMenu();
    setSnackbarMessage("Publish to web functionality coming soon!");
    setSnackbarOpen(true);
  };

  const shareOptions = [
    {
      icon: <Email fontSize="small" />,
      label: "Email",
      onClick: handleShareEmail,
    },
    {
      icon: <ContentCopy fontSize="small" />,
      label: "Copy as Text",
      onClick: handleCopyLink,
    },
    {
      icon: <Public fontSize="small" />,
      label: "Publish to Web",
      onClick: handlePublishToWeb,
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: alpha(theme.palette.background.default, 0.97),
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, flexGrow: 1 }}>
          <MeetingDetailsSkeleton activeTab={activeTab} />
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading meeting: {error}
        </Alert>
        <Button
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBack />}
        >
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  if (!currentMeeting) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Meeting not found
        </Alert>
        <Button
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBack />}
        >
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  const minutesData = currentMeeting.minutesData || {};
  const hasMinutesError = !!minutesData?.error;

  const formattedDate = currentMeeting.createdAt?.toDate()
    ? moment(currentMeeting.createdAt.toDate()).format("MMMM D, YYYY")
    : "Date unavailable";
  const formattedTime = currentMeeting.createdAt?.toDate()
    ? moment(currentMeeting.createdAt.toDate()).format("h:mm A")
    : "";

  let parsedActionItems = [];
  try {
    if (minutesData?.actionItems) {
      parsedActionItems = (
        Array.isArray(minutesData.actionItems)
          ? minutesData.actionItems
          : [minutesData.actionItems]
      ).map((item) => {
        if (typeof item !== "string")
          return {
            content: "Invalid action item format",
            assignee: null,
            dueDate: null,
            complete: false,
          };

        return {
          content: item
            .replace(/-\s*\[.*?\]\s*/g, "")
            .replace(/\[Due:.*?\]/g, "")
            .trim(),
          assignee: item.match(/\[(.*?)\]/)?.[1] || null,
          dueDate: item.match(/\[Due:\s*(.*?)\]/)?.[1] || null,
          complete: item.includes("[x]") || item.includes("[X]"),
        };
      });
    }
  } catch (e) {
    console.error("Error parsing action items:", e);
    parsedActionItems = [
      {
        content: "Error loading action items",
        assignee: null,
        dueDate: null,
        complete: false,
      },
    ];
  }
  const actionItems = parsedActionItems;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        background: theme.palette.background.default,
        pb: 8,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "50%",
          background: `radial-gradient(circle at 15% 15%, ${alpha(
            theme.palette.primary.main,
            0.07
          )} 0%, transparent 70%)`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: 3 }}>
        <Box sx={{ mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              component={RouterLink}
              to="/dashboard"
              startIcon={<ArrowBack />}
              sx={{ mb: 2 }}
            >
              Back to Dashboard
            </Button>
          </motion.div>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography
                    variant="h4"
                    component="h1"
                    fontWeight={700}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mr: 1,
                    }}
                  >
                    {currentMeeting.title || "Meeting Details"}
                  </Typography>
                </motion.div>
                <IconButton
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  sx={{
                    color: isBookmarked ? "warning.main" : "text.disabled",
                    "&:hover": {
                      color: isBookmarked ? "warning.dark" : "text.primary",
                    },
                  }}
                >
                  {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
              </Box>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  <Chip
                    icon={<CalendarToday fontSize="small" />}
                    label={formattedDate}
                    size="small"
                    sx={{ bgcolor: "background.paper" }}
                  />
                  {formattedTime && (
                    <Chip
                      icon={<AccessTime fontSize="small" />}
                      label={formattedTime}
                      size="small"
                      sx={{ bgcolor: "background.paper" }}
                    />
                  )}
                  {minutesData?.participants && (
                    <Chip
                      icon={<People fontSize="small" />}
                      label={
                        Array.isArray(minutesData.participants)
                          ? minutesData.participants.length > 3
                            ? `${minutesData.participants
                                .slice(0, 3)
                                .join(", ")} +${
                                minutesData.participants.length - 3
                              }`
                            : minutesData.participants.join(", ")
                          : minutesData.participants
                      }
                      size="small"
                      sx={{ bgcolor: "background.paper" }}
                    />
                  )}
                </Box>
              </motion.div>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignSelf: { xs: "flex-end", sm: "auto" },
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={handleOpenShareMenu}
                  sx={{ borderRadius: 2 }}
                >
                  Share
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <IconButton
                  onClick={handleOpenActionsMenu}
                  sx={{
                    bgcolor: "background.paper",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    border: "1px solid",
                    borderColor: theme.palette.divider,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <MoreVert />
                </IconButton>
              </motion.div>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mt: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleChangeTab}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile
              sx={{
                "& .MuiTab-root": {
                  py: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  minWidth: 0,
                },
                "& .Mui-selected": {
                  color: `${theme.palette.primary.main} !important`,
                },
              }}
            >
              <Tab
                label="Minutes"
                icon={<NoteAlt />}
                iconPosition="start"
                disabled={hasMinutesError}
              />
              <Tab label="Transcript" icon={<Comment />} iconPosition="start" />
              <Tab
                label="Action Items"
                icon={<AssignmentTurnedIn />}
                iconPosition="start"
                disabled={hasMinutesError}
              />
              <Tab label="Recording" icon={<MicNone />} iconPosition="start" />
            </Tabs>
          </Box>
          {hasMinutesError && activeTab !== 3 && activeTab !== 1 && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              Could not load structured minutes details ({minutesData.error}).
              Transcript and recording may still be available.
            </Alert>
          )}
          <TabPanel value={activeTab} index={0}>
            {!hasMinutesError && (
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <AnimatedSection
                    title="Meeting Overview"
                    icon={<People />}
                    color={theme.palette.primary.main}
                    delay={0}
                  >
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: "1px solid",
                        borderColor: alpha(theme.palette.primary.main, 0.1),
                        mb: 4,
                      }}
                    >
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Date & Time
                          </Typography>
                          <Typography variant="body1">
                            {formattedDate}, {formattedTime}
                          </Typography>
                        </Grid>
                        {minutesData?.participants && (
                          <Grid item xs={12} md={4}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Participants
                            </Typography>
                            <Typography variant="body1">
                              {Array.isArray(minutesData.participants)
                                ? minutesData.participants.join(", ")
                                : minutesData.participants}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    {minutesData.agenda && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Agenda
                        </Typography>
                        <Box component="div">
                          {(Array.isArray(minutesData.agenda)
                            ? minutesData.agenda
                            : [minutesData.agenda]
                          ).map((item, index) => (
                            <Typography
                              key={index}
                              variant="body1"
                              component="p"
                              sx={{
                                mb: 1,
                                display: "flex",
                                alignItems: "center",
                                "&::before": {
                                  content: '""',
                                  display: "inline-block",
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  bgcolor: theme.palette.primary.main,
                                  mr: 2,
                                },
                              }}
                            >
                              {item}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </AnimatedSection>
                  {minutesData.keyPoints &&
                    Object.keys(minutesData.keyPoints).length > 0 && (
                      <AnimatedSection
                        title="Key Discussion Points"
                        icon={<Comment />}
                        color={theme.palette.info.main}
                        delay={1}
                      >
                        {Object.entries(minutesData.keyPoints).map(
                          ([key, value], index) => (
                            <Box key={index} sx={{ mb: 1.5 }}>
                              <Typography variant="body1" component="p">
                                {String(value)}
                              </Typography>
                            </Box>
                          )
                        )}
                      </AnimatedSection>
                    )}

                  {minutesData.decisions && (
                    <AnimatedSection
                      title="Decisions Made"
                      icon={<Lightbulb />}
                      color={theme.palette.warning.main}
                      delay={2}
                    >
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.warning.main, 0.05),
                          border: "1px solid",
                          borderColor: alpha(theme.palette.warning.main, 0.1),
                          mb: 3,
                        }}
                      >
                        {(Array.isArray(minutesData.decisions)
                          ? minutesData.decisions
                          : [minutesData.decisions]
                        ).map((line, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              mb: 2,
                              "&:last-child": { mb: 0 },
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: theme.palette.success.main,
                                mr: 2,
                                mt: 0.3,
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body1">{line}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </AnimatedSection>
                  )}

                  {actionItems.length > 0 && (
                    <AnimatedSection
                      title="Action Items"
                      icon={<AssignmentTurnedIn />}
                      color={theme.palette.success.main}
                      delay={3}
                    >
                      <Box
                        sx={{
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: theme.palette.divider,
                          overflow: "hidden",
                          mb: 3,
                        }}
                      >
                        {actionItems.map((item, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 2,
                              bgcolor: "background.paper",
                              borderBottom:
                                index < actionItems.length - 1
                                  ? "1px solid"
                                  : "none",
                              borderColor: theme.palette.divider,
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: item.complete
                                  ? theme.palette.success.main
                                  : theme.palette.primary.main,
                              }}
                            >
                              {item.assignee?.[0]?.toUpperCase() || "?"}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  textDecoration: item.complete
                                    ? "line-through"
                                    : "none",
                                  color: item.complete
                                    ? "text.secondary"
                                    : "text.primary",
                                }}
                              >
                                {item.content}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mt: 0.5,
                                }}
                              >
                                {item.assignee && (
                                  <>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Assigned:{" "}
                                      <span style={{ fontWeight: 600 }}>
                                        {item.assignee}
                                      </span>
                                    </Typography>
                                    <Divider
                                      orientation="vertical"
                                      flexItem
                                      sx={{ mx: 1, my: 0.5 }}
                                    />
                                  </>
                                )}
                                {item.dueDate && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Due:{" "}
                                    <span style={{ fontWeight: 600 }}>
                                      {item.dueDate}
                                    </span>
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            <Chip
                              label={item.complete ? "Completed" : "Pending"}
                              size="small"
                              color={item.complete ? "success" : "default"}
                              sx={{ fontWeight: 500, height: 24 }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </AnimatedSection>
                  )}

                  {minutesData.nextSteps && (
                    <AnimatedSection
                      title="Next Steps"
                      icon={<Schedule />}
                      color={theme.palette.secondary.main}
                      delay={4}
                    >
                      <Typography variant="body1" component="div">
                        {minutesData.nextSteps.split("\n").map(
                          (line, index) =>
                            line.trim() && (
                              <Typography
                                key={index}
                                variant="body1"
                                component="p"
                                sx={{ mb: 1.5 }}
                              >
                                {line}
                              </Typography>
                            )
                        )}
                      </Typography>
                    </AnimatedSection>
                  )}
                </CardContent>
              </Card>
            )}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                  }}
                >
                  <Typography variant="h5" fontWeight={600}>
                    Full Transcript
                  </Typography>
                </Box>
                {minutesData?.transcription ? (
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: theme.palette.divider,
                      bgcolor: alpha(theme.palette.background.paper, 0.6),
                      maxHeight: "60vh",
                      overflow: "auto",
                    }}
                  >
                    <Typography
                      variant="body1"
                      component="div"
                      sx={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}
                    >
                      {minutesData.transcription}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      Transcript not available.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            {!hasMinutesError && (
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" fontWeight={600}>
                      Action Items Timeline
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 2 }}>
                    {actionItems.length > 0 ? (
                      actionItems.map((item, index) => (
                        <TimelinePoint
                          key={index}
                          time={`Task ${index + 1}`}
                          content={`${item.content}${
                            item.assignee ? ` (Assignee: ${item.assignee})` : ""
                          }${item.dueDate ? ` (Due: ${item.dueDate})` : ""}`}
                          type="action"
                          delay={index + 1}
                        />
                      ))
                    ) : (
                      <Typography color="text.secondary">
                        No action items identified.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 4 }}>
                  Meeting Recording
                </Typography>
                {currentMeeting.audioUrl ? (
                  <AudioPlayer audioUrl={currentMeeting.audioUrl} />
                ) : (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      Audio recording not available.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TabPanel>
        </Box>
      </Container>
      <Menu
        anchorEl={shareMenuAnchor}
        open={Boolean(shareMenuAnchor)}
        onClose={handleCloseShareMenu}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1.5, borderRadius: 2, minWidth: 180 },
        }}
      >
        {shareOptions?.map((option) => (
          <MenuItem
            key={option?.label}
            onClick={() => {
              option?.onClick();
              handleCloseShareMenu();
            }}
          >
            <ListItemIcon>{option?.icon}</ListItemIcon>
            <ListItemText primary={option?.label} />
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={actionsMenuAnchor}
        open={Boolean(actionsMenuAnchor)}
        onClose={handleCloseActionsMenu}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1.5, borderRadius: 2, minWidth: 180 },
        }}
      >
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleCloseActionsMenu();
          }}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete Meeting" />
        </MenuItem>
      </Menu>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-meeting-dialog-title"
        aria-describedby="delete-meeting-dialog-description"
      >
        <DialogTitle id="delete-meeting-dialog-title">
          Delete Meeting
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-meeting-dialog-description">
            Are you sure you want to delete this meeting? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteMeeting}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Box>
  );
};

export default MeetingDetails;
