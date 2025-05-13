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
import CookieIcon from "@mui/icons-material/Cookie";

const Cookies = () => {
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
            Cookie Policy
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            1. What Are Cookies
          </Typography>
          <Typography variant="body1" paragraph>
            As is common practice with almost all professional websites, this
            site uses cookies, which are tiny files that are downloaded to your
            computer, to improve your experience. This page describes what
            information they gather, how we use it and why we sometimes need to
            store these cookies. We will also share how you can prevent these
            cookies from being stored however this may downgrade or 'break'
            certain elements of the sites functionality.
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            2. How We Use Cookies
          </Typography>
          <Typography variant="body1" paragraph>
            We use cookies for a variety of reasons detailed below.
            Unfortunately, in most cases, there are no industry standard options
            for disabling cookies without completely disabling the functionality
            and features they add to this site. It is recommended that you leave
            on all cookies if you are not sure whether you need them or not in
            case they are used to provide a service that you use.
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            3. Disabling Cookies
          </Typography>
          <Typography variant="body1" paragraph>
            You can prevent the setting of cookies by adjusting the settings on
            your browser (see your browser Help for how to do this). Be aware
            that disabling cookies will affect the functionality of this and
            many other websites that you visit. Disabling cookies will usually
            result in also disabling certain functionality and features of this
            site. Therefore it is recommended that you do not disable cookies.
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            4. The Cookies We Set
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CookieIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Account related cookies: If you create an account with us, then we will use cookies for the management of the signup process and general administration." />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CookieIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Login related cookies: We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page." />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CookieIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Site preferences cookies: In order to provide you with a great experience on this site, we provide the functionality to set your preferences for how this site runs when you use it." />
            </ListItem>
          </List>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mt: 3, mb: 1.5, color: "primary.dark" }}
          >
            5. Third-Party Cookies
          </Typography>
          <Typography variant="body1" paragraph>
            In some special cases, we also use cookies provided by trusted third
            parties. The following section details which third party cookies you
            might encounter through this site. For example, this site uses
            Google Analytics which is one of the most widespread and trusted
            analytics solutions on the web for helping us to understand how you
            use the site and ways that we can improve your experience. These
            cookies may track things such as how long you spend on the site and
            the pages that you visit so we can continue to produce engaging
            content.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Cookies;
