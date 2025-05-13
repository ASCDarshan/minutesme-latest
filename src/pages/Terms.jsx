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
import GavelIcon from "@mui/icons-material/Gavel";

const Terms = () => {
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
            p: { xs: 4, sm: 3, md: 4 },
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
            Terms and Conditions
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
            Welcome to MakeMyMinutes.com. These terms and conditions outline the
            rules and regulations for the use of MakeMyMinutes's Website,
            located at https://makemyminutes.com/. By accessing this website, we
            assume you accept these terms and conditions. Do not continue to use
            MakeMyMinutes if you do not agree to take all of the terms and
            conditions stated on this page.
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            2. Intellectual Property Rights
          </Typography>
          <Typography variant="body1" paragraph>
            Other than the content you own, under these Terms, MakeMyMinutes
            and/or its licensors own all the intellectual property rights and
            materials contained in this Website. You are granted a limited
            license only for purposes of viewing the material contained on this
            Website.
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            3. Restrictions
          </Typography>
          <Typography variant="body1" paragraph>
            You are specifically restricted from all of the following:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <GavelIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Publishing any Website material in any other media." />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <GavelIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Selling, sublicensing and/or otherwise commercializing any Website material." />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <GavelIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Publicly performing and/or showing any Website material." />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <GavelIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Using this Website in any way that is or may be damaging to this Website." />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <GavelIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity." />
            </ListItem>
          </List>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            4. Your Content
          </Typography>
          <Typography variant="body1" paragraph>
            In these Website Standard Terms and Conditions, “Your Content” shall
            mean any audio, video text, images or other material you choose to
            display on this Website. By displaying Your Content, you grant
            MakeMyMinutes a non-exclusive, worldwide irrevocable, sub-licensable
            license to use, reproduce, adapt, publish, translate and distribute
            it in any and all media.
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            5. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            In no event shall MakeMyMinutes, nor any of its officers, directors
            and employees, be held liable for anything arising out of or in any
            way connected with your use of this Website whether such liability
            is under contract. MakeMyMinutes, including its officers, directors
            and employees shall not be held liable for any indirect,
            consequential or special liability arising out of or in any way
            related to your use of this Website.
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            6. Governing Law & Jurisdiction
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms will be governed by and interpreted in accordance with
            the laws of the State of India, and you submit to the non-exclusive
            jurisdiction of the state and federal courts located in India for
            the resolution of any disputes.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Terms;
