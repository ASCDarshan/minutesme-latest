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
  Drawer,
  List,
  ListItem,
  ListItemText,
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
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

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

  const mobileDrawerContent = (
    <Box
      sx={{
        width: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Logo size="medium" />
      </Box>
      {currentUser ? (
        <>
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: alpha(theme.palette.primary.light, 0.1),
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src={currentUser.photoURL}
                alt={currentUser.displayName || "User"}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}
              >
                {currentUser.displayName ? (
                  currentUser.displayName[0].toUpperCase()
                ) : (
                  <Person />
                )}
              </Avatar>
              <Box sx={{ ml: 1.5, overflow: "hidden" }}>
                <Typography variant="subtitle2" noWrap fontWeight={600}>
                  {currentUser.displayName || "User"}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {currentUser.email}
                </Typography>
              </Box>
            </Box>
          </Box>
          <List component="nav" sx={{ flexGrow: 1, p: 2 }}>
            {navItems.map((item) => (
              <ListItem
                key={item.path}
                button
                component={RouterLink}
                to={item.path}
                selected={isActive(item.path)}
                onClick={() => setMobileDrawerOpen(false)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  "&.Mui-selected": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    },
                    "& .MuiListItemIcon-root": {
                      color: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            <Divider sx={{ my: 2 }} />
            <ListItem
              button
              component={RouterLink}
              to="/profile"
              selected={isActive("/profile")}
              onClick={() => setMobileDrawerOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 1,
                "&.Mui-selected": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="My Profile" />
            </ListItem>
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                color: theme.palette.error.main,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItem>
          </List>
        </>
      ) : (
        <Box
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            component={RouterLink}
            to="/login"
            color="primary"
            size="large"
            fullWidth
            onClick={() => setMobileDrawerOpen(false)}
            sx={{ borderRadius: 3 }}
          >
            Sign In
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/register"
            color="primary"
            size="large"
            fullWidth
            onClick={() => setMobileDrawerOpen(false)}
            sx={{ borderRadius: 3 }}
          >
            Create Account
          </Button>
        </Box>
      )}
    </Box>
  );

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
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Button
                        variant="outlined"
                        component={RouterLink}
                        to="/login"
                        sx={{
                          borderRadius: 3,
                          mr: 1,
                        }}
                      >
                        Sign In
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
                        to="/register"
                        sx={{
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        }}
                      >
                        Sign Up
                      </Button>
                    </motion.div>
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
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            width: 280,
          },
        }}
      >
        {mobileDrawerContent}
      </Drawer>
      <Toolbar />
    </>
  );
};

export default Header;
