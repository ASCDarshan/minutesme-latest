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
  useTheme,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Link as RouterLink } from "react-router-dom";

const Copyright = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        py: { xs: 5, md: 5 },
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            boxShadow: theme.shadows[3],
            mb: 4,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.palette.primary.main,
              textAlign: "center",
              mb: 4,
            }}
          >
            Copyright Notice
          </Typography>

          <Typography
            variant="body2"
            color="error"
            sx={{ mb: 3, fontWeight: "bold" }}
          >
            Disclaimer: This is a placeholder Copyright Notice template. It is
            not legal advice and should not be used as such. Please consult with
            a legal professional to draft a comprehensive and legally compliant
            Copyright Notice for your specific business.
          </Typography>

          <Typography variant="body1" paragraph>
            © {currentYear} MakeMyMinutes. All rights reserved.
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: theme.palette.primary.dark }}
          >
            1. Ownership of Content
          </Typography>
          <Typography variant="body1" paragraph>
            All content and materials available on MakeMyMinutes.com, including
            but not limited to text, graphics, website name, code, images, and
            logos, are the intellectual property of MakeMyMinutes and are
            protected by applicable copyright and trademark law. Any
            inappropriate use, including but not limited to the reproduction,
            distribution, display, or transmission of any content on this site
            is strictly prohibited, unless specifically authorized by
            MakeMyMinutes.
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: theme.palette.primary.dark }}
          >
            2. Permissible Use
          </Typography>
          <Typography variant="body1" paragraph>
            You are permitted to use the Service and its content for your
            personal, non-commercial use to create and manage meeting minutes.
            Any other use, including commercial use, reproduction, modification,
            distribution, transmission, republication, display, or performance,
            without the prior written permission of MakeMyMinutes, is strictly
            prohibited.
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: theme.palette.primary.dark }}
          >
            3. User-Generated Content
          </Typography>
          <Typography variant="body1" paragraph>
            While you retain ownership of the content you create and upload to
            the Service (e.g., your meeting minute data), by using the Service,
            you grant MakeMyMinutes a license to host, display, and process your
            content as necessary to provide the Service. You are solely
            responsible for ensuring that your content does not infringe upon
            the intellectual property rights of any third party.
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: theme.palette.primary.dark }}
          >
            4. Reporting Copyright Infringement
          </Typography>
          <Typography variant="body1" paragraph>
            If you believe that any content on MakeMyMinutes.com infringes upon
            your copyright, please contact us immediately with the following
            information:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <InfoOutlinedIcon color="primary" />{" "}
              </ListItemIcon>
              <ListItemText primary="A description of the copyrighted work that you claim has been infringed." />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoOutlinedIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="A description of where the material that you claim is infringing is located on the Service." />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoOutlinedIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Your address, telephone number, and email address." />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoOutlinedIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law." />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoOutlinedIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="A statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf." />
            </ListItem>
          </List>
          <Typography variant="body1" paragraph>
            Please send all infringement notices to: [Your Contact Email for
            Legal Notices].
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Copyright;
