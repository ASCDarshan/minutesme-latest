import {
  Container,
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
        py: { xs: 5, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: "left", mb: 4 }}>
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
          <Typography
            variant="h3"
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
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: { xs: 6, md: 8 }, maxWidth: 700, mx: "auto" }}
          >
            Behind MakeMyMinutes is a dedicated team passionate about
            simplifying your meeting workflows with cutting-edge AI.
          </Typography>
        </motion.div>

        <Box sx={{ overflowX: "auto", pb: 2 }}>
          <Grid container spacing={3} sx={{ flexWrap: "nowrap" }}>
            {teamMembers.map((member, index) => (
              <Grid item key={index} sx={{ minWidth: 300 }}>
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[3],
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
                        width: 100,
                        height: 100,
                        mb: 2,
                        border: `3px solid ${theme.palette.primary.main}`,
                        boxShadow: `0 0 0 4px ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    />
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="text.primary"
                    >
                      {member.name}
                    </Typography>
                    <Typography variant="body2" color="primary.main">
                      {member.role}
                    </Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {member.bio}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="text.primary"
                      sx={{ fontStyle: "italic" }}
                    >
                      Quote:{" "}
                      <span style={{ fontWeight: 400 }}>{member.quote}</span>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default OurTeam;
