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
  TextField,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  MoreVert,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
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

const SectionHeader = ({ title, onEdit, isEditing }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{ mb: 1 }}
  >
    <Typography variant="h6" fontWeight={600} color="text.secondary">
      {title}
    </Typography>
    {!isEditing && (
      <Tooltip title={`Edit ${title}`}>
        <IconButton onClick={onEdit} size="small" color="primary">
          <EditIcon sx={{ fontSize: "1.1rem" }} />
        </IconButton>
      </Tooltip>
    )}
  </Stack>
);

const EditInterface = ({
  value,
  onChange,
  onSave,
  onCancel,
  label,
  helperText,
  rows = 4,
}) => (
  <Box>
    <TextField
      fullWidth
      label={label}
      multiline
      rows={rows}
      value={value}
      onChange={onChange}
      variant="outlined"
      size="small"
      sx={{ mb: 1 }}
      autoFocus
      helperText={helperText}
    />
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      <Button onClick={onCancel} size="small" startIcon={<CancelIcon />}>
        Cancel
      </Button>
      <Button
        onClick={onSave}
        variant="contained"
        size="small"
        startIcon={<SaveIcon />}
      >
        Save
      </Button>
    </Stack>
  </Box>
);

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    loadMeeting: contextLoadMeeting,
    currentMeeting,
    loading,
    error,
    removeMeeting,
    saveUpdatedMinutes,
  } = useMeeting();

  const [activeTab, setActiveTab] = useState(0);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  const [isEditingParticipants, setIsEditingParticipants] = useState(false);
  const [editedParticipantsText, setEditedParticipantsText] = useState("");

  const [isEditingAgenda, setIsEditingAgenda] = useState(false);
  const [editedAgendaText, setEditedAgendaText] = useState("");

  const [isEditingKeyPoints, setIsEditingKeyPoints] = useState(false);
  const [editedKeyPointsText, setEditedKeyPointsText] = useState("");

  const [isEditingDecisions, setIsEditingDecisions] = useState(false);
  const [editedDecisionsText, setEditedDecisionsText] = useState("");

  const [isEditingActionItems, setIsEditingActionItems] = useState(false);
  const [editedActionItemsText, setEditedActionItemsText] = useState("");

  const [isEditingNextSteps, setIsEditingNextSteps] = useState(false);
  const [editedNextStepsText, setEditedNextStepsText] = useState("");

  const [isEditingTranscription, setIsEditingTranscription] = useState(false);
  const [editedTranscriptionText, setEditedTranscriptionText] = useState("");

  const loadMeeting = useCallback(
    async (meetingId) => {
      setIsPageLoading(true);
      await contextLoadMeeting(meetingId);
      setIsPageLoading(false);
    },
    [contextLoadMeeting]
  );

  useEffect(() => {
    if (id) {
      loadMeeting(id);
    }
  }, [id, loadMeeting]);

  const minutesData = currentMeeting?.minutesData || {};
  const hasMinutesError =
    !!minutesData?.error && Object.keys(minutesData).length === 1;

  const handleDeleteMeeting = async () => {
    setDeleteDialogOpen(false);
    const deleted = await removeMeeting(id);
    if (deleted) {
      navigate("/");
      setSnackbarMessage("Meeting deleted successfully");
      setSnackbarSeverity("success");
    } else {
      setSnackbarMessage(error || "Failed to delete meeting");
      setSnackbarSeverity("error");
    }
    setSnackbarOpen(true);
  };

  const handleChangeTab = (event, newValue) => setActiveTab(newValue);

  const handleOpenShareMenu = (event) =>
    setShareMenuAnchor(event.currentTarget);
  const handleCloseShareMenu = () => setShareMenuAnchor(null);
  const handleOpenActionsMenu = (event) =>
    setActionsMenuAnchor(event.currentTarget);
  const handleCloseActionsMenu = () => setActionsMenuAnchor(null);

  const formattedDate = currentMeeting?.createdAt?.toDate()
    ? moment(currentMeeting.createdAt.toDate()).format("MMMM D, YYYY")
    : "N/A";
  const formattedTime = currentMeeting?.createdAt?.toDate()
    ? moment(currentMeeting.createdAt.toDate()).format("h:mm A")
    : "N/A";

  const handleEdit = (field) => {
    const data = currentMeeting?.minutesData;
    switch (field) {
      case "title":
        setEditedTitle(currentMeeting?.title || "");
        setIsEditingTitle(true);
        break;
      case "participants":
        setEditedParticipantsText((data?.participants || []).join("\n"));
        setIsEditingParticipants(true);
        break;
      case "agenda":
        setEditedAgendaText((data?.agenda || []).join("\n"));
        setIsEditingAgenda(true);
        break;
      case "keyPoints":
        const keyPointsArray = Array.isArray(data?.keyPoints)
          ? data.keyPoints
          : typeof data?.keyPoints === "object" && data?.keyPoints !== null
          ? Object.values(data.keyPoints)
          : [];
        setEditedKeyPointsText(keyPointsArray.join("\n"));
        setIsEditingKeyPoints(true);
        break;
      case "decisions":
        setEditedDecisionsText((data?.decisions || []).join("\n"));
        setIsEditingDecisions(true);
        break;
      case "actionItems":
        const actionItemsContent = (
          Array.isArray(data?.actionItems) ? data.actionItems : []
        )
          .map((item) => {
            return typeof item === "object" && item !== null && item.content
              ? item.content
              : String(item);
          })
          .join("\n");
        setEditedActionItemsText(actionItemsContent);
        setIsEditingActionItems(true);
        break;
      case "nextSteps":
        setEditedNextStepsText(data?.nextSteps || "");
        setIsEditingNextSteps(true);
        break;
      case "transcription":
        setEditedTranscriptionText(data?.transcription || "");
        setIsEditingTranscription(true);
        break;
      default:
        break;
    }
  };

  const handleCancel = (field) => {
    switch (field) {
      case "title":
        setIsEditingTitle(false);
        break;
      case "participants":
        setIsEditingParticipants(false);
        break;
      case "agenda":
        setIsEditingAgenda(false);
        break;
      case "keyPoints":
        setIsEditingKeyPoints(false);
        break;
      case "decisions":
        setIsEditingDecisions(false);
        break;
      case "actionItems":
        setIsEditingActionItems(false);
        break;
      case "nextSteps":
        setIsEditingNextSteps(false);
        break;
      case "transcription":
        setIsEditingTranscription(false);
        break;
      default:
        break;
    }
  };

  const handleSave = async (field) => {
    if (!currentMeeting || !saveUpdatedMinutes) {
      setSnackbarMessage("Cannot save: Data or save function unavailable.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    let minutesPayload = { ...currentMeeting.minutesData };
    let titlePayload = currentMeeting.title;
    let success = false;

    try {
      const toArray = (text) =>
        text
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

      switch (field) {
        case "title":
          titlePayload = editedTitle;
          break;
        case "participants":
          minutesPayload.participants = toArray(editedParticipantsText);
          break;
        case "agenda":
          minutesPayload.agenda = toArray(editedAgendaText);
          break;
        case "keyPoints":
          minutesPayload.keyPoints = toArray(editedKeyPointsText);
          break;
        case "decisions":
          minutesPayload.decisions = toArray(editedDecisionsText);
          break;
        case "actionItems":
          minutesPayload.actionItems = toArray(editedActionItemsText).map(
            (content) => ({
              content: content,
              assignee: null,
              dueDate: null,
              complete: false,
            })
          );
          break;
        case "nextSteps":
          minutesPayload.nextSteps = editedNextStepsText;
          break;
        case "transcription":
          minutesPayload.transcription = editedTranscriptionText;
          break;
        default:
          return;
      }

      success = await saveUpdatedMinutes(
        currentMeeting.id,
        minutesPayload,
        titlePayload
      );

      if (success) {
        setSnackbarMessage(
          `${
            field.charAt(0).toUpperCase() +
            field.slice(1).replace(/([A-Z])/g, " $1")
          } updated successfully!`
        );
        setSnackbarSeverity("success");
        await loadMeeting(id);
      } else {
        throw new Error(
          error || `Failed to update ${field}. Please try again.`
        );
      }
    } catch (e) {
      setSnackbarMessage(e.message);
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
      handleCancel(field);
    }
  };

  let parsedActionItems = [];
  if (minutesData?.actionItems) {
    if (Array.isArray(minutesData.actionItems)) {
      parsedActionItems = minutesData.actionItems
        .map((item, index) => {
          if (typeof item === "string") {
            const dueDateMatch = item.match(/\[Due:\s*(.*?)\]/);
            let assigneeMatch = item.match(/\[(.*?)\]/);

            // If the assignee match is the same as the due date match,
            // it means there's no assignee.
            if (
              assigneeMatch &&
              dueDateMatch &&
              assigneeMatch[0] === dueDateMatch[0]
            ) {
              assigneeMatch = null;
            }

            return {
              id: `item-${index}`,
              content: item
                .replace(/-\s*/, "")
                .replace(/\[Due:.*?\]/g, "")
                .replace(/\[.*?\]/, "") // Use non-global replace to only remove the first bracket match (the assignee)
                .trim(),
              assignee: assigneeMatch ? assigneeMatch[1] : null,
              dueDate: dueDateMatch ? dueDateMatch[1] : null,
              complete: item.includes("[x]") || item.includes("[X]"),
            };
          } else if (
            typeof item === "object" &&
            item !== null &&
            item.content
          ) {
            return { id: `item-${index}`, ...item };
          }
          return null; // Return null for invalid formats
        })
        .filter(Boolean); // Filter out any null entries
    } else if (typeof minutesData.actionItems === "string") {
      parsedActionItems = minutesData.actionItems
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line, index) => ({
          id: `item-${index}`,
          content: line.trim(),
          assignee: null,
          dueDate: null,
          complete: false,
        }));
    }
  }
  const actionItems = parsedActionItems;

  const generatePlainTextSummary = () => {
    let summary = `Meeting Title: ${
      currentMeeting?.title || "Untitled Meeting"
    }\n`;
    summary += `Date: ${formattedDate} at ${formattedTime}\n`;

    const currentParticipants = currentMeeting?.minutesData?.participants || [];
    if (currentParticipants.length > 0) {
      summary += `Participants: ${currentParticipants.join(", ")}\n`;
    }
    if (minutesData?.agenda?.length) {
      summary +=
        "\nAgenda:\n" +
        minutesData.agenda.map((item) => `- ${item}`).join("\n") +
        "\n";
    }
    if (
      minutesData?.keyPoints &&
      (Array.isArray(minutesData.keyPoints)
        ? minutesData.keyPoints.length > 0
        : Object.keys(minutesData.keyPoints).length > 0)
    ) {
      summary += "\nKey Discussion Points:\n";
      const keyPointsArray = Array.isArray(minutesData.keyPoints)
        ? minutesData.keyPoints
        : Object.values(minutesData.keyPoints);
      summary += keyPointsArray.map((item) => `- ${item}`).join("\n") + "\n";
    }
    if (minutesData?.decisions?.length) {
      summary +=
        "\nDecisions Made:\n" +
        minutesData.decisions.map((item) => `- ${item}`).join("\n") +
        "\n";
    }
    if (actionItems?.length) {
      summary +=
        "\nAction Items:\n" +
        actionItems
          .map(
            (item) =>
              `- ${item.content}${
                item.assignee ? ` (Assigned: ${item.assignee})` : ""
              }${item.dueDate ? ` (Due: ${item.dueDate})` : ""} - Status: ${
                item.complete ? "Completed" : "Pending"
              }`
          )
          .join("\n") +
        "\n";
    }
    if (minutesData?.nextSteps) {
      summary += "\nNext Steps:\n" + minutesData.nextSteps + "\n";
    }
    if (minutesData?.transcription) {
      summary +=
        "\n--- Transcript (Snippet) ---\n" +
        minutesData.transcription.substring(0, 300) +
        "...\n";
    }
    return summary;
  };

  const handleShareEmail = () => {
    handleCloseShareMenu();
    const subject = `Meeting Minutes: ${
      currentMeeting?.title || "Untitled Meeting"
    }`;
    const body = generatePlainTextSummary();
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`,
      "_blank"
    );
  };

  const handleCopySummary = () => {
    handleCloseShareMenu();
    navigator.clipboard
      .writeText(generatePlainTextSummary())
      .then(() => {
        setSnackbarMessage("Summary copied!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage("Failed to copy summary.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const shareOptions = [
    {
      icon: <Email fontSize="small" />,
      label: "Share via Email",
      onClick: handleShareEmail,
    },
    {
      icon: <ContentCopy fontSize="small" />,
      label: "Copy Summary",
      onClick: handleCopySummary,
    },
    {
      icon: <Public fontSize="small" />,
      label: "Publish to Web (Soon)",
      onClick: () => {
        handleCloseShareMenu();
        setSnackbarMessage("Publish to web coming soon!");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
      },
    },
  ];

  if (isPageLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <MeetingDetailsSkeleton activeTab={activeTab} />
      </Container>
    );
  }

  if (error && !currentMeeting) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
        <Button
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBack />}
        >
          Dashboard
        </Button>
      </Container>
    );
  }

  if (!currentMeeting) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Meeting not found or still loading...
        </Alert>
        <Button
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBack />}
        >
          Dashboard
        </Button>
      </Container>
    );
  }

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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Box sx={{ flexGrow: 1, width: "100%" }}>
              {isEditingTitle ? (
                <Box sx={{ maxWidth: { xs: "100%", sm: "70%" }, mb: 2 }}>
                  <EditInterface
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onSave={() => handleSave("title")}
                    onCancel={() => handleCancel("title")}
                    label="Meeting Title"
                    helperText="Enter the new title for the meeting."
                    rows={1}
                  />
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography
                    variant="h4"
                    component="h1"
                    fontWeight={700}
                    sx={{
                      mr: 1,
                      background: `linear-gradient(135deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {currentMeeting.title || "Meeting Details"}
                  </Typography>
                  <Tooltip title="Edit Title">
                    <IconButton
                      onClick={() => handleEdit("title")}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                <Chip
                  icon={<CalendarToday fontSize="small" />}
                  label={formattedDate}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<AccessTime fontSize="small" />}
                  label={formattedTime}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Box>
            <Stack
              direction="row"
              spacing={1}
              alignSelf={{ xs: "flex-end", sm: "center" }}
              sx={{ mt: { xs: 2, sm: 0 } }}
            >
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleOpenShareMenu}
                sx={{ borderRadius: 20, px: 2 }}
              >
                Share
              </Button>
              <IconButton
                onClick={handleOpenActionsMenu}
                sx={{
                  bgcolor: "background.paper",
                  boxShadow: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <MoreVert />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleChangeTab}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
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
                disabled={hasMinutesError && activeTab !== 1 && activeTab !== 3}
              />
              <Tab label="Transcript" icon={<Comment />} iconPosition="start" />
              <Tab
                label="Action Items"
                icon={<AssignmentTurnedIn />}
                iconPosition="start"
                disabled={hasMinutesError && activeTab !== 1 && activeTab !== 3}
              />
              <Tab label="Recording" icon={<MicNone />} iconPosition="start" />
            </Tabs>
          </Box>

          {hasMinutesError && activeTab !== 1 && activeTab !== 3 && (
            <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
              Could not load structured minutes details ({minutesData.error}).
              Transcript and recording may still be available.
            </Alert>
          )}

          <TabPanel value={activeTab} index={0}>
            {!hasMinutesError && (
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 8px 24px ${alpha(
                    theme.palette.common.black,
                    0.05
                  )}`,
                  mt: 1,
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
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
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
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
                        <Grid item xs={12} md={isEditingParticipants ? 12 : 6}>
                          <SectionHeader
                            title="Participants"
                            onEdit={() => handleEdit("participants")}
                            isEditing={isEditingParticipants}
                          />
                          {isEditingParticipants ? (
                            <EditInterface
                              value={editedParticipantsText}
                              onChange={(e) =>
                                setEditedParticipantsText(e.target.value)
                              }
                              onSave={() => handleSave("participants")}
                              onCancel={() => handleCancel("participants")}
                              label="Participants"
                              helperText="Enter each participant on a new line."
                            />
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {minutesData.participants?.length > 0 ? (
                                minutesData.participants.map((p, i) => (
                                  <Chip key={i} label={p} size="small" />
                                ))
                              ) : (
                                <Typography color="text.secondary">
                                  Not specified.
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  </AnimatedSection>

                  {minutesData.agenda && minutesData.agenda.length > 0 && (
                    <Divider sx={{ my: 4 }} />
                  )}
                  <AnimatedSection
                    title="Agenda"
                    icon={<NoteAlt />}
                    color={theme.palette.info.main}
                    delay={0.1}
                  >
                    {isEditingAgenda ? (
                      <EditInterface
                        value={editedAgendaText}
                        onChange={(e) => setEditedAgendaText(e.target.value)}
                        onSave={() => handleSave("agenda")}
                        onCancel={() => handleCancel("agenda")}
                        label="Agenda"
                        helperText="List each agenda item on a new line."
                      />
                    ) : (
                      <Box
                        component="ul"
                        sx={{ pl: 2, m: 0, listStyleType: "disc" }}
                      >
                        {minutesData.agenda?.length > 0 ? (
                          minutesData.agenda.map((item, index) => (
                            <Typography
                              component="li"
                              key={index}
                              variant="body1"
                              sx={{ mb: 0.5 }}
                            >
                              {item}
                            </Typography>
                          ))
                        ) : (
                          <Typography color="text.secondary">
                            No agenda provided.
                          </Typography>
                        )}
                      </Box>
                    )}
                  </AnimatedSection>

                  {minutesData.keyPoints &&
                    minutesData.keyPoints.length > 0 && (
                      <Divider sx={{ my: 4 }} />
                    )}

                  {minutesData.keyPoints &&
                    (Array.isArray(minutesData.keyPoints)
                      ? minutesData.keyPoints.length > 0
                      : Object.keys(minutesData.keyPoints).length > 0) && (
                      <AnimatedSection
                        title="Key Discussion Points"
                        icon={<Comment />}
                        color={theme.palette.info.main}
                        delay={0.2}
                      >
                        {isEditingKeyPoints ? (
                          <EditInterface
                            value={editedKeyPointsText}
                            onChange={(e) =>
                              setEditedKeyPointsText(e.target.value)
                            }
                            onSave={() => handleSave("keyPoints")}
                            onCancel={() => handleCancel("keyPoints")}
                            label="Key Points"
                            helperText="List each key point on a new line."
                          />
                        ) : (
                          <Box
                            component="ul"
                            sx={{ pl: 2, m: 0, listStyleType: "disc" }}
                          >
                            {minutesData.keyPoints?.length > 0 ? (
                              minutesData.keyPoints.map((item, index) => (
                                <Typography
                                  component="li"
                                  key={index}
                                  variant="body1"
                                  sx={{ mb: 0.5 }}
                                >
                                  {String(item)}
                                </Typography>
                              ))
                            ) : (
                              <Typography color="text.secondary">
                                No key points recorded.
                              </Typography>
                            )}
                          </Box>
                        )}
                      </AnimatedSection>
                    )}

                  {minutesData.decisions &&
                    minutesData.decisions.length > 0 && (
                      <Divider sx={{ my: 4 }} />
                    )}

                  {minutesData.decisions &&
                    minutesData.decisions.length > 0 && (
                      <AnimatedSection
                        title="Decisions Made"
                        icon={<Lightbulb />}
                        color={theme.palette.warning.main}
                        delay={0.3}
                      >
                        <SectionHeader
                          title="Decisions Made"
                          onEdit={() => handleEdit("decisions")}
                          isEditing={isEditingDecisions}
                        />
                        {isEditingDecisions ? (
                          <EditInterface
                            value={editedDecisionsText}
                            onChange={(e) =>
                              setEditedDecisionsText(e.target.value)
                            }
                            onSave={() => handleSave("decisions")}
                            onCancel={() => handleCancel("decisions")}
                            label="Decisions"
                            helperText="List each decision on a new line."
                          />
                        ) : (
                          <Box>
                            {minutesData.decisions?.length > 0 ? (
                              minutesData.decisions.map((line, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 1,
                                    "&:last-child": { mb: 0 },
                                  }}
                                >
                                  <CheckCircle
                                    sx={{
                                      color: theme.palette.success.main,
                                      mr: 1.5,
                                      fontSize: "1.2rem",
                                    }}
                                  />
                                  <Typography variant="body1">
                                    {line}
                                  </Typography>
                                </Box>
                              ))
                            ) : (
                              <Typography color="text.secondary">
                                No decisions recorded.
                              </Typography>
                            )}
                          </Box>
                        )}
                      </AnimatedSection>
                    )}

                  {actionItems && actionItems.length > 0 && (
                    <Divider sx={{ my: 4 }} />
                  )}

                  <AnimatedSection
                    title="Action Items"
                    icon={<AssignmentTurnedIn />}
                    color={theme.palette.success.main}
                    delay={0.4}
                  >
                    <SectionHeader
                      title="Action Items"
                      onEdit={() => handleEdit("actionItems")}
                      isEditing={isEditingActionItems}
                    />
                    {isEditingActionItems ? (
                      <EditInterface
                        value={editedActionItemsText}
                        onChange={(e) =>
                          setEditedActionItemsText(e.target.value)
                        }
                        onSave={() => handleSave("actionItems")}
                        onCancel={() => handleCancel("actionItems")}
                        label="Action Items"
                        helperText="Enter each action item on a new line."
                        rows={10}
                      />
                    ) : actionItems.length > 0 ? (
                      <Box
                        sx={{
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          overflow: "hidden",
                        }}
                      >
                        {actionItems.map((item, index) => (
                          <Box
                            key={item.id || index}
                            sx={{
                              p: 2,
                              bgcolor: "background.paper",
                              borderBottom:
                                index < actionItems.length - 1
                                  ? `1px solid ${theme.palette.divider}`
                                  : "none",
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
                                  ? theme.palette.success.light
                                  : theme.palette.primary.light,
                                color: item.complete
                                  ? theme.palette.success.contrastText
                                  : theme.palette.primary.contrastText,
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
                              {(item.assignee || item.dueDate) && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  component="div"
                                  sx={{ mt: 0.5 }}
                                >
                                  {item.assignee &&
                                    `Assigned: ${item.assignee}`}
                                  {item.assignee && item.dueDate && " | "}
                                  {item.dueDate && `Due: ${item.dueDate}`}
                                </Typography>
                              )}
                            </Box>
                            <Chip
                              label={item.complete ? "Completed" : "Pending"}
                              size="small"
                              color={item.complete ? "success" : "default"}
                              sx={{
                                fontWeight: 500,
                                height: 24,
                                borderRadius: "8px",
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">
                        No action items identified.
                      </Typography>
                    )}
                  </AnimatedSection>

                  {minutesData.nextSteps && <Divider sx={{ my: 4 }} />}
                  <AnimatedSection
                    title="Next Steps"
                    icon={<Schedule />}
                    color={theme.palette.secondary.main}
                    delay={0.5}
                  >
                    <SectionHeader
                      title="Next Steps"
                      onEdit={() => handleEdit("nextSteps")}
                      isEditing={isEditingNextSteps}
                    />
                    {isEditingNextSteps ? (
                      <EditInterface
                        value={editedNextStepsText}
                        onChange={(e) => setEditedNextStepsText(e.target.value)}
                        onSave={() => handleSave("nextSteps")}
                        onCancel={() => handleCancel("nextSteps")}
                        label="Next Steps"
                        helperText="Describe the next steps."
                      />
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {minutesData.nextSteps || "No next steps specified."}
                      </Typography>
                    )}
                  </AnimatedSection>
                </CardContent>
              </Card>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: `0 8px 24px ${alpha(
                  theme.palette.common.black,
                  0.05
                )}`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <SectionHeader
                  title="Full Transcript"
                  onEdit={() => handleEdit("transcription")}
                  isEditing={isEditingTranscription}
                />
                {isEditingTranscription ? (
                  <EditInterface
                    value={editedTranscriptionText}
                    onChange={(e) => setEditedTranscriptionText(e.target.value)}
                    onSave={() => handleSave("transcription")}
                    onCancel={() => handleCancel("transcription")}
                    label="Transcript"
                    helperText="Edit the meeting transcript."
                    rows={15}
                  />
                ) : minutesData?.transcription ? (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: alpha(theme.palette.background.paper, 0.7),
                      maxHeight: "60vh",
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.7,
                    }}
                  >
                    {minutesData.transcription}
                  </Box>
                ) : (
                  <Typography
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 3 }}
                  >
                    Transcript not available.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {!hasMinutesError && (
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 8px 24px ${alpha(
                    theme.palette.common.black,
                    0.05
                  )}`,
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <SectionHeader
                    title="Action Items Timeline"
                    onEdit={() => {
                      setSnackbarMessage(
                        "Editing action items from this view is not supported. Please use the Minutes tab for editing action items."
                      );
                      setSnackbarSeverity("info");
                      setSnackbarOpen(true);
                    }}
                    isEditing={false}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    This view provides a timeline overview of action items. For
                    editing, please refer to the "Minutes" tab.
                  </Typography>
                  {actionItems.length > 0 ? (
                    actionItems.map((item, index) => (
                      <TimelinePoint
                        key={item.id || index}
                        time={
                          item.dueDate
                            ? `Due: ${item.dueDate}`
                            : `Task ${index + 1}`
                        }
                        content={`${item.content}${
                          item.assignee ? ` (Assignee: ${item.assignee})` : ""
                        }`}
                        type={item.complete ? "completed" : "action"}
                        delay={index}
                      />
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      No action items identified.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: `0 8px 24px ${alpha(
                  theme.palette.common.black,
                  0.05
                )}`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  Meeting Recording
                </Typography>
                {currentMeeting.audioUrl ? (
                  <AudioPlayer audioUrl={currentMeeting.audioUrl} />
                ) : (
                  <Typography
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 3 }}
                  >
                    Audio recording not available.
                  </Typography>
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
          sx: { mt: 1.5, borderRadius: 2, minWidth: 200 },
        }}
      >
        {shareOptions.map((option) => (
          <MenuItem key={option.label} onClick={option.onClick}>
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText primary={option.label} />
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
      >
        <DialogTitle>Delete Meeting</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure? This action cannot be undone.
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
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeetingDetails;
