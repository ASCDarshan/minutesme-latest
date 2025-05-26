import React, { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  Stack,
  Divider,
  useTheme,
  Button,
  useMediaQuery,
} from "@mui/material";
import { KeyboardArrowUp } from "@mui/icons-material";
import Logo from "../UI/Logo";

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const footerSections = useMemo(
    () => [
      {
        title: "Company",
        links: [
          { label: "About Us", to: "/about-us" },
          { label: "Our Team", to: "/our-team" },
          { label: "Blog", to: "/blog" },
          { label: "Contact Us", to: "/contact-us" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Terms and Conditions", to: "/terms-and-conditions" },
          { label: "Privacy Policy", to: "/privacy-policy" },
          { label: "Cookie Policy", to: "/cookies" },
          { label: "Copyright", to: "/copyright" },
        ],
      },
    ],
    []
  );

  return (
    <Box
      component="footer"
      role="contentinfo"
      sx={{
        bgcolor: theme.palette.background.paper,
        color: "text.secondary",
        mt: "auto",
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          pt: { xs: 4, md: 6 },
          pb: { xs: 3, md: 4 },
          px: { xs: 3, sm: 4 },
        }}
      >
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          justifyContent="space-between"
        >
          <Grid item xs={12} md={4} sx={{ mb: { xs: 2, md: 0 } }}>
            <Stack spacing={2} alignItems={{ xs: "center", md: "flex-start" }}>
              <Logo size={isMobile ? "medium" : "large"} />
              <Typography
                variant="body2"
                sx={{
                  maxWidth: 320,
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                MakeMyMinutes: Effortless meeting summaries powered by AI. Focus
                on the conversation, let us handle the notes.
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid
              container
              spacing={{ xs: 3, sm: 4 }}
              justifyContent={{ xs: "center", md: "flex-end" }}
            >
              {footerSections.map((section) => (
                <Grid
                  item
                  xs={6}
                  sm={4}
                  md={3}
                  key={section.title}
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography
                      component="h3"
                      variant="overline"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                    >
                      {section.title}
                    </Typography>
                    <Stack direction="column" spacing={1}>
                      {section.links.map((link) => (
                        <Link
                          key={link.label}
                          component={link.external ? "a" : RouterLink}
                          to={link.external ? undefined : link.to}
                          href={link.external ? link.to : undefined}
                          target={link.external ? "_blank" : undefined}
                          rel={
                            link.external ? "noopener noreferrer" : undefined
                          }
                          variant="body2"
                          color="inherit"
                          underline="hover"
                          sx={{
                            "&:hover": {
                              color: "primary.main",
                            },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </Stack>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 4, md: 6 } }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column-reverse", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2">
            © {currentYear} MakeMyMinutes. All rights reserved.
          </Typography>

          <Button
            size="small"
            onClick={scrollToTop}
            startIcon={<KeyboardArrowUp />}
            aria-label="Scroll to top"
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
