import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  alpha,
  Divider,
  Button,
  useMediaQuery,
  Container,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const teamMembers = [
  {
    name: "Jeegar Desai",
    role: "Founder & CEO",
    bio: "Driving force behind MakeMyMinutes, Jeegar envisions a world where meetings are effortless, efficient, and AI-powered.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "Efficiency isn't just a goal; it's our guiding principle.",
  },
  {
    name: "Sandeep Patel",
    role: "Co-Founder & CTO",
    bio: "Architect of our intelligent engine, Sandeep ensures that every transcription and insight is powered by cutting-edge tech.",
    image: "https://randomuser.me/api/portraits/men/44.jpg",
    quote: "Building the future of smart meetings, one line of code at a time.",
  },
  {
    name: "Sagar Ramani",
    role: "Lead Developer",
    bio: "Backbone of our codebase, Sagar leads the product development with a passion for seamless performance and security.",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    quote: "Performance and security are not features; they are foundational.",
  },
  {
    name: "Darshan Patel",
    role: "Lead Developer",
    bio: "Darshan crafts intuitive and elegant user experiences, making even complex meeting workflows feel simple.",
    image: "https://randomuser.me/api/portraits/men/63.jpg",
    quote: "Simplifying complexity is the ultimate sophistication in design.",
  },
];

const OurTeam = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleBackClick = () => {
    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        bgcolor: alpha(theme.palette.background.default, 0.97),
        backgroundImage: `radial-gradient(${alpha(
          theme.palette.primary.main,
          0.05
        )} 1px, transparent 0)`,
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0",
        py: { xs: 4, md: 6 },
        minHeight: "100vh",
      }}
    >
      <>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Container maxWidth="xl">
            <Box sx={{ textAlign: "left", mb: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleBackClick}
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
                size="small"
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
            </Box>
          </Container>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              mb: 2,
            }}
          >
            Meet Our Team
          </Typography>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Typography
            variant={isMobile ? "body1" : "h6"}
            align="center"
            color="text.secondary"
            sx={{
              mb: { xs: 4, md: 6 },
              maxWidth: 700,
              mx: "auto",
              px: 2,
            }}
          >
            Behind MakeMyMinutes is a dedicated team passionate about
            simplifying your meeting workflows with cutting-edge AI.
          </Typography>
        </motion.div>

        <Grid
          container
          spacing={3}
          justifyContent="center"
          sx={{
            px: { xs: 0, sm: 2 },
            mb: 4,
          }}
        >
          {teamMembers.map((member, index) => (
            <Grid
              item
              key={index}
              xs={12}
              sm={6}
              md={6}
              lg={3}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                style={{ height: "100%", width: "100%" }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[2],
                    maxWidth: 350,
                    mx: "auto",
                    transition: "transform 0.2s",
                    "&:hover": {
                      boxShadow: theme.shadows[6],
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.5
                      )}`,
                    }}
                  >
                    <Avatar
                      src={member.image}
                      alt={member.name}
                      sx={{
                        width: isMobile ? 80 : 100,
                        height: isMobile ? 80 : 100,
                        mb: 2,
                        border: `3px solid ${theme.palette.primary.main}`,
                        boxShadow: `0 0 0 4px ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    />
                    <Typography
                      variant={isMobile ? "subtitle1" : "h6"}
                      fontWeight={600}
                      color="text.primary"
                    >
                      {member.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary.main"
                      sx={{ mt: 0.5 }}
                    >
                      {member.role}
                    </Typography>
                  </Box>
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      pt: isMobile ? 2 : 3,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                      sx={{
                        fontSize: isMobile ? "0.875rem" : "1rem",
                        mb: isMobile ? 1.5 : 2,
                      }}
                    >
                      {member.bio}
                    </Typography>
                    <Divider sx={{ my: isMobile ? 1.5 : 2 }} />
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="text.primary"
                      sx={{
                        fontStyle: "italic",
                        fontSize: isMobile ? "0.875rem" : "1rem",
                      }}
                    >
                      Quote:{" "}
                      <span style={{ fontWeight: 400 }}>{member.quote}</span>
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </>
    </Box>
  );
};

export default OurTeam;
