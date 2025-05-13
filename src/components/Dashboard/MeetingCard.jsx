import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Card,
  CardContent,
  Chip,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  TaskAlt,
  MoreVert as MoreVertIcon,
  EditNote,
} from "@mui/icons-material";
import moment from "moment";

const MeetingCard = ({ meeting, onDelete }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleDeleteClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleConfirmDelete = () => {
    onDelete(meeting.id);
    setDeleteDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const formattedDate = meeting.createdAt?.toDate()
    ? moment(meeting.createdAt.toDate()).format("ddd, MMM D")
    : "--";
  const formattedTime = meeting.createdAt?.toDate()
    ? moment(meeting.createdAt.toDate()).format("h:mm A")
    : "--";
  const relativeTime = meeting.createdAt?.toDate()
    ? moment(meeting.createdAt.toDate()).fromNow()
    : "";

  const getStatusChip = () => {
    switch (meeting.status) {
      case "completed":
        return (
          <Chip
            label="Processed"
            size="small"
            color="success"
            variant="outlined"
            icon={<TaskAlt fontSize="small" />}
          />
        );
      case "completed_partial":
        return (
          <Chip
            label="Partial"
            size="small"
            color="warning"
            variant="outlined"
            icon={<EditNote fontSize="small" />}
          />
        );
      case "failed":
        return (
          <Chip label="Failed" size="small" color="error" variant="outlined" />
        );
      default:
        return <Chip label={meeting.status || "Draft"} size="small" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      style={{ height: "100%" }}
    >
      <Card
        component={RouterLink}
        to={`/meeting/${meeting.id}`}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          textDecoration: "none",
          borderRadius: 3,
          overflow: "hidden",
          background: theme.palette.background.paper,
          position: "relative",
          transition: "all 0.3s ease",
          border: "1px solid",
          borderColor: theme.palette.divider,
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
          "&:hover": {
            borderColor: theme.palette.primary.light,
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              {meeting.title?.[0]?.toUpperCase() || "M"}
            </Avatar>
          }
          action={
            <IconButton aria-label="settings" onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          }
          title={
            <Tooltip title={meeting.title || "Untitled Meeting"}>
              <Typography
                variant="h6"
                fontWeight={600}
                noWrap
                color="text.primary"
                sx={{ fontSize: "1rem" }}
              >
                {meeting.title || "Untitled Meeting"}
              </Typography>
            </Tooltip>
          }
          subheader={
            <Typography variant="caption" color="text.secondary">
              {formattedDate} • {relativeTime}
            </Typography>
          }
          sx={{ pb: 0 }}
        />
        <CardContent sx={{ pt: 1, flexGrow: 1, pb: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              height: 40,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {meeting?.minutesData?.transcription
              ? "Transcript available..."
              : `Created ${relativeTime}`}
          </Typography>
        </CardContent>
        <Divider />
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: alpha(theme.palette.secondary.main, 0.2),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title={`Created by ${meeting.creatorName || "Unknown"}`}>
              <Avatar
                src={meeting.creatorPhotoURL}
                sx={{ width: 28, height: 28, fontSize: "0.8rem" }}
              >
                {meeting.creatorName?.[0] || "?"}
              </Avatar>
            </Tooltip>
            <Typography variant="caption" color="text.black">
              {formattedTime}
            </Typography>
          </Box>
          {getStatusChip()}
        </Box>
        <Menu
          id={`meeting-menu-${meeting.id}`}
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: 2,
              minWidth: 180,
              overflow: "hidden",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <MenuItem
            onClick={handleDeleteClick}
            sx={{ color: theme.palette.error.main }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </Menu>
      </Card>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-meeting-dialog-title"
        aria-describedby="delete-meeting-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            maxWidth: "400px",
            width: "100%",
          },
        }}
      >
        <DialogTitle id="delete-meeting-dialog-title" sx={{ pb: 1 }}>
          Delete Meeting
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-meeting-dialog-description">
            Are you sure you want to This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleCancelDelete}
            sx={{ borderRadius: 2 }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default MeetingCard;
