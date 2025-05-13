// Privacy.jsx
import React from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield"; // Example Icon

const Privacy = () => {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        py: { xs: 5, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              textAlign: "center",
              mb: 4,
            }}
          >
            Privacy Policy
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            Your privacy is important to us. It is MakeMyMinutes's policy to
            respect your privacy regarding any information we may collect from
            you across our website, https://makemyminutes.com, and other sites
            we own and operate.
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            2. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We only ask for personal information when we truly need it to
            provide a service to you. We collect it by fair and lawful means,
            with your knowledge and consent. We also let you know why we’re
            collecting it and how it will be used.
          </Typography>
          <Typography variant="body1" paragraph>
            Log data: Like most website operators, we collect information that
            your browser sends whenever you visit our site. This Log Data may
            include information such as your computer’s Internet Protocol ("IP")
            address, browser type, browser version, the pages of our site that
            you visit, the time and date of your visit, the time spent on those
            pages, and other statistics.
          </Typography>
          <Typography variant="body1" paragraph>
            Personal Information: We may ask you to provide us with certain
            personally identifiable information that can be used to contact or
            identify you. Personally identifiable information may include, but
            is not limited to, your email address, name, phone number ("Personal
            Information").
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            3. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect in various ways, including to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <ShieldIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Provide, operate, and maintain our website" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ShieldIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Improve, personalize, and expand our website" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ShieldIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Understand and analyze how you use our website" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ShieldIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Develop new products, services, features, and functionality" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ShieldIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ShieldIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Send you emails" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ShieldIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Find and prevent fraud" />
            </ListItem>
          </List>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            4. Security of Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            The security of your Personal Information is important to us, but
            remember that no method of transmission over the Internet, or method
            of electronic storage is 100% secure. While we strive to use
            commercially acceptable means to protect your Personal Information,
            we cannot guarantee its absolute security.
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            5. Links to Other Sites
          </Typography>
          <Typography variant="body1" paragraph>
            Our Service may contain links to other sites that are not operated
            by us. If you click on a third party link, you will be directed to
            that third party's site. We strongly advise you to review the
            Privacy Policy of every site you visit. We have no control over, and
            assume no responsibility for the content, privacy policies or
            practices of any third party sites or services.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Privacy;
