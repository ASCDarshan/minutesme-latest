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

  const footerSections = [
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms of Service", to: "/terms" },
        { label: "Cookie Policy", to: "/cookie" },
        { label: "Copyright", to: "/copyright" },
      ],
    },
  ];

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
      <Container
        maxWidth="lg"
        sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 3, md: 4 } }}
      >
        <Grid
          container
          spacing={{ xs: 3, md: 6 }}
          justifyContent="space-between"
        >
          <Grid item xs={12} md={4} sx={{ mb: { xs: 2, md: 0 } }}>
            <Stack spacing={2} alignItems="center">
              <Logo size={isMobile ? "medium" : "large"} />
              <Typography
                variant="body2"
                sx={{
                  maxWidth: 320,
                  textAlign: "center",
                  px: { xs: 2, md: 0 },
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
              spacing={{ xs: 2, sm: 4 }}
              justifyContent={{ xs: "center", md: "flex-start" }}
            >
              {footerSections.map((section) => (
                <Grid
                  item
                  xs={12}
                  sm={3}
                  key={section.title}
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "center", md: "flex-start" },
                  }}
                >
                  <Stack spacing={1.5} alignItems="center">
                    <Typography
                      variant="overline"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                    >
                      {section.title}
                    </Typography>
                    <Stack
                      direction={{ xs: "row", md: "column" }}
                      spacing={{ xs: 2, md: 1.5 }}
                      divider={
                        <Divider
                          orientation="vertical"
                          flexItem
                          sx={{ display: { xs: "block", md: "none" } }}
                        />
                      }
                    >
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
                            textAlign: "center",
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
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: 2, md: 3 },
          }}
        >
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            © {currentYear} MakeMyMinutes. All rights reserved.
          </Typography>

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
