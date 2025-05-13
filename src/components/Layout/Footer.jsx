import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  Stack,
  IconButton,
  Divider,
  useTheme,
  Button,
} from "@mui/material";
import {
  GitHub,
  Twitter,
  LinkedIn,
  MailOutline,
  Phone,
  LocationOn,
  KeyboardArrowUp,
} from "@mui/icons-material";
import Logo from "../UI/Logo";

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const footerSections = [
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms of Service", to: "/terms" },
        { label: "Cookie Policy", to: "/cookie" },
      ],
    },
  ];

  // const socialLinks = [
  //   { label: "GitHub", icon: <GitHub />, href: "https://github.com" },
  //   { label: "Twitter", icon: <Twitter />, href: "https://twitter.com" },
  //   { label: "LinkedIn", icon: <LinkedIn />, href: "https://linkedin.com" },
  // ];

  // const contactInfo = [
  //   {
  //     icon: <MailOutline fontSize="small" />,
  //     text: "info@makemyminutes.com",
  //     href: "mailto:info@makemyminutes.com",
  //   },
  //   {
  //     icon: <Phone fontSize="small" />,
  //     text: "+1 (555) 123-4567",
  //     href: "tel:+15551234567",
  //   },
  //   { icon: <LocationOn fontSize="small" />, text: "San Francisco, CA" },
  // ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor:
          theme.palette.mode === "dark"
            ? theme.palette.grey[900]
            : theme.palette.grey[100],
        color: "text.secondary",
        mt: "auto",
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 8, pb: 4 }}>
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          justifyContent="space-between"
        >
          <Grid item xs={12} md={4}>
            <Stack spacing={2} alignItems={{ xs: "center", md: "flex-start" }}>
              <Logo size="large" />
              <Typography
                variant="body2"
                sx={{ maxWidth: 320, textAlign: { xs: "center", md: "left" } }}
              >
                MakeMyMinutes: Effortless meeting summaries powered by AI. Focus
                on the conversation, let us handle the notes.
              </Typography>
              {/* <Stack direction="row" spacing={1.5}>
                {socialLinks.map((social) => (
                  <IconButton
                    key={social.label}
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    size="medium"
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        color: "primary.main",
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack> */}
            </Stack>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={{ xs: 3, sm: 4 }}>
              {footerSections.map((section) => (
                <Grid item xs={6} sm={3} key={section.title}>
                  <Stack
                    spacing={1.5}
                    alignItems={{ xs: "center", sm: "flex-start" }}
                  >
                    <Typography
                      variant="overline"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                    >
                      {section.title}
                    </Typography>
                    {section.links.map((link) => (
                      <Link
                        key={link.label}
                        component={link.external ? "a" : RouterLink}
                        to={link.external ? undefined : link.to}
                        href={link.external ? link.to : undefined}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        variant="body2"
                        color="inherit"
                        underline="hover"
                        sx={{
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        <Divider sx={{ my: 6 }} />
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column-reverse", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            © {currentYear} MakeMyMinutes. All rights reserved.
          </Typography>
          {/* <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1, sm: 2.5 }}
            alignItems="center"
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", sm: "block" } }}
              />
            }
          >
            {contactInfo.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                color="inherit"
                underline={item.href ? "hover" : "none"}
                target={
                  item.href && item.href.startsWith("http")
                    ? "_blank"
                    : undefined
                }
                rel={
                  item.href && item.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  textDecorationColor: "rgba(0, 0, 0, 0.2)",
                  cursor: item.href ? "pointer" : "default",
                  "&:hover": {
                    color: item.href ? "primary.main" : "inherit",
                  },
                }}
              >
                {item.icon}
                <Typography variant="body2">{item.text}</Typography>
              </Link>
            ))}
          </Stack> */}
          <Button
            size="small"
            onClick={scrollToTop}
            startIcon={<KeyboardArrowUp />}
            sx={{
              color: "text.secondary",
              textTransform: "none",
              "&:hover": {
                color: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            Back to top
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
