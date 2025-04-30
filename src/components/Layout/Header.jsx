import React, { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  Divider,
  Container,
  Tooltip,
  alpha,
  useTheme,
  useScrollTrigger,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Settings,
  Logout,
  AccountCircle,
  Dashboard,
  MicNone,
  Person,
  Mic,
  VolumeUp,
  NoteAlt,
  Storage,
} from "@mui/icons-material";
import Logo from "../UI/Logo";

const ElevatedAppBar = ({ children }) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 10,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    sx: {
      ...children.props.sx,
      backdropFilter: trigger ? "blur(10px)" : "none",
      backgroundColor: trigger
        ? (theme) => alpha(theme.palette.background.paper, 0.85)
        : (theme) => alpha(theme.palette.background.paper, 0.98),
      borderBottom: (theme) =>
        trigger ? "none" : `1px solid ${theme.palette.divider}`,
      transition: (theme) =>
        theme.transitions.create(
          [
            "background-color",
            "backdrop-filter",
            "box-shadow",
            "border-bottom",
          ],
          {
            duration: theme.transitions.duration.standard,
          }
        ),
    },
  });
};

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Dashboard /> },
    { path: "/new-meeting", label: "New Recording", icon: <MicNone /> },
  ];

  return (
    <>
      <ElevatedAppBar>
        <AppBar position="fixed" color="inherit" elevation={0}>
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ py: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", md: "flex-start" },
                  flexGrow: { xs: 1, md: 0 },
                  mr: { md: 3 },
                }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <RouterLink
                    to="/"
                    style={{ textDecoration: "none", display: "flex" }}
                  >
                    <Logo size={isMobile ? "small" : "medium"} />
                  </RouterLink>
                </motion.div>
              </Box>

              {!isMobile && currentUser && (
                <Box sx={{ display: "flex", flexGrow: 1, ml: 3 }}>
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Button
                        component={RouterLink}
                        to={item.path}
                        color={isActive(item.path) ? "primary" : "inherit"}
                        sx={{
                          mx: 1,
                          fontWeight: isActive(item.path) ? 600 : 500,
                          position: "relative",
                          "&::after": isActive(item.path)
                            ? {
                              content: '""',
                              position: "absolute",
                              bottom: 6,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 16,
                              height: 3,
                              borderRadius: 4,
                              backgroundColor: theme.palette.primary.main,
                            }
                            : {},
                        }}
                      >
                        {item.label}
                      </Button>
                    </motion.div>
                  ))}
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  ml: "auto",
                }}
              >
                {currentUser ? (
                  <>
                    {!isSmall && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="contained"
                          component={RouterLink}
                          to="/new-meeting"
                          startIcon={<MicNone />}
                          sx={{
                            borderRadius: 3,
                            boxShadow: theme.shadows[3],
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            "&:hover": {
                              boxShadow: theme.shadows[6],
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          Record
                        </Button>
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <Tooltip title="Account">
                        <IconButton
                          onClick={handleUserMenuOpen}
                          size="small"
                          sx={{
                            ml: 1,
                            border: `2px solid ${alpha(
                              theme.palette.primary.main,
                              0.2
                            )}`,
                            "&:hover": {
                              borderColor: theme.palette.primary.main,
                            },
                          }}
                        >
                          <Avatar
                            src={currentUser.photoURL}
                            alt={currentUser.displayName}
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: theme.palette.primary.main,
                            }}
                          >
                            {currentUser.displayName ? (
                              currentUser.displayName[0].toUpperCase()
                            ) : (
                              <AccountCircle />
                            )}
                          </Avatar>
                        </IconButton>
                      </Tooltip>
                    </motion.div>
                    {isMobile && (
                      <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="end"
                        onClick={handleDrawerToggle}
                        sx={{ ml: 1 }}
                      >
                        <MenuIcon />
                      </IconButton>
                    )}
                  </>
                ) : (
                  <>
                    {!isSmall && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <Button
                            variant="outlined"
                            component={RouterLink}
                            sx={{
                              borderRadius: 3,
                            }}
                            startIcon={<Mic fontSize="small" />}
                            size="small"
                          >
                            Voice Recording
                          </Button>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          <Button
                            variant="contained"
                            component={RouterLink}
                            sx={{
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            }}
                            startIcon={<VolumeUp fontSize="small" />}
                            size="small"
                          >
                            Audio Transcription
                          </Button>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <Button
                            variant="outlined"
                            component={RouterLink}
                            sx={{
                              borderRadius: 3,
                            }}
                            startIcon={<NoteAlt fontSize="small" />}
                            size="small"
                          >
                            AI Minutes
                          </Button>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          <Button
                            variant="contained"
                            component={RouterLink}
                            sx={{
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            }}
                            startIcon={<Storage fontSize="small" />}
                            size="small"
                          >
                            Cloud Storage
                          </Button>
                        </motion.div>
                      </>
                    )}

                    {isMobile && (
                      <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="end"
                        onClick={handleDrawerToggle}
                        sx={{ ml: 1 }}
                      ></IconButton>
                    )}
                  </>
                )}
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </ElevatedAppBar>

      <Menu
        id="user-menu"
        anchorEl={userMenuAnchorEl}
        open={Boolean(userMenuAnchorEl)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          elevation: 8,
          sx: {
            minWidth: 220,
            borderRadius: 2,
            mt: 1.5,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {currentUser?.displayName || "User"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentUser?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          component={RouterLink}
          to="/profile"
          onClick={handleUserMenuClose}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          My Profile
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Sign Out</Typography>
        </MenuItem>
      </Menu>

      <Toolbar />
    </>
  );
};

export default Header;
