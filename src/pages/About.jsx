import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const About = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/dashboard");
  };
  return (
    <Box sx={{ backgroundColor: theme.palette.background.subtle }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
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
            About MakeMyMinutes
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
            Transforming meetings into actionable insights with AI
          </Typography>
        </motion.div>
      </Container>

      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" gutterBottom>
              Our Story
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 2 }}>
              Founded in 2022, MakeMyMinutes began with a simple observation:
              too much valuable time was being lost in unproductive meetings.
              Our team of AI enthusiasts and productivity experts came together
              to solve this problem.
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 2 }}>
              What started as a side project quickly grew into a mission to
              revolutionize how teams collaborate and document their
              discussions. Today, thousands of teams worldwide trust our
              platform to capture the essence of their meetings. We are
              committed to continuous improvement and innovation, ensuring
              MakeMyMinutes remains at the forefront of meeting productivity
              solutions. From our early days of manual coding to leveraging the
              latest advancements in AI, our journey has been driven by a
              passion for efficiency and a desire to empower individuals and
              organizations to make the most of their time.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
              onClick={() => {
                navigate("/dashboard");
              }}
            >
              Learn how it works
            </Button>
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Our Values
        </Typography>
        <Divider
          sx={{
            mb: 6,
            mx: "auto",
            width: 100,
            height: 4,
            backgroundColor: theme.palette.primary.main,
          }}
        />

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                borderTop: `4px solid ${theme.palette.primary.main}`,
                "&:hover": {
                  transform: "translateY(-4px)",
                  transition: "transform 0.3s ease",
                },
                display: "flex",
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  Innovation
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  We are committed to pushing the boundaries of what's possible
                  in AI-powered meeting solutions. This means continuously
                  exploring new technologies, experimenting with novel
                  approaches, and relentlessly seeking ways to improve our
                  platform. Our drive for innovation is at the core of our
                  product development, ensuring MakeMyMinutes always provides
                  cutting-edge features and functionalities that empower our
                  users to achieve more. We foster a culture of curiosity and
                  creative problem-solving within our team to consistently
                  deliver solutions that anticipate and meet the evolving needs
                  of modern workplaces.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                borderTop: `4px solid ${theme.palette.primary.main}`,
                "&:hover": {
                  transform: "translateY(-4px)",
                  transition: "transform 0.3s ease",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  Transparency
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  We believe that open communication and honesty are fundamental
                  to building strong relationships, both internally with our
                  team and externally with our valued customers. We strive to be
                  transparent in our processes, pricing, and product updates. By
                  providing clear and accessible information, we aim to foster
                  trust and empower our users to make informed decisions. Our
                  commitment to transparency extends to how we handle user data,
                  ensuring privacy and security are always paramount. We
                  actively seek feedback and are open to dialogue, believing
                  that constructive criticism and collaborative engagement are
                  essential for growth and improvement.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                borderTop: `4px solid ${theme.palette.primary.main}`,
                "&:hover": {
                  transform: "translateY(-4px)",
                  transition: "transform 0.3s ease",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  Customer Focus
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  At MakeMyMinutes, our customers are at the heart of everything
                  we do. We are deeply committed to understanding their needs,
                  challenges, and goals. Your success is our success, and we go
                  the extra mile to ensure our platform provides real value and
                  helps you achieve your objectives. We actively listen to your
                  feedback, using it to guide our product development and
                  improve our services. Our dedicated support team is always
                  ready to assist you, ensuring a positive and seamless
                  experience. We believe in building long-term partnerships with
                  our users, and we are constantly striving to exceed your
                  expectations by delivering a solution that truly makes a
                  difference in how you work.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
