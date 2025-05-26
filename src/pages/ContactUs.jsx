import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Button,
  useMediaQuery,
  TextField,
  Icon,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SendIcon from "@mui/icons-material/Send";
import { useFormik } from "formik";
import * as Yup from "yup";

const contactDetails = [
  {
    icon: <LocationOnIcon color="primary" />,
    info: "123 Innovation Drive, Tech Park, Silicon Valley, CA 94025",
    label: "Our Office",
  },
  {
    icon: <EmailIcon color="primary" />,
    info: "support@makemyminutes.com",
    label: "Email Us",
  },
  {
    icon: <PhoneIcon color="primary" />,
    info: "+1 (555) 123-4567",
    label: "Call Us",
  },
];

const ContactUs = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleBackClick = () => {
    navigate("/dashboard");
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      message: Yup.string()
        .min(10, "Too short")
        .required("Message is required"),
    }),
    onSubmit: (values, { resetForm }) => {
      console.log("Form submitted:", values);
      resetForm();
    },
  });

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
        px: { xs: 2, sm: 4, md: 6 },
        minHeight: "100vh",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleBackClick}
            startIcon={<ArrowBackIcon />}
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            Back
          </Button>
        </Box>
        <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h1"
            fontWeight={700}
            color={theme.palette.primary.main}
            gutterBottom
          >
            Contact Us
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            color="text.secondary"
            maxWidth={700}
            mx="auto"
          >
            We're here to help and answer any question you might have. We look
            forward to hearing from you.
          </Typography>
        </Box>
      </motion.div>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {/* Contact Information */}
        <Box sx={{ flex: "1 1 300px", maxWidth: 500 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[2],
                "&:hover": {
                  boxShadow: theme.shadows[6],
                },
              }}
            >
              <CardContent>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Contact Information
                </Typography>
                {contactDetails.map((detail, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      gap: 2,
                      my: 3,
                      alignItems: "flex-start",
                    }}
                  >
                    <Icon sx={{ fontSize: 26 }}>{detail.icon}</Icon>
                    <Box>
                      <Typography fontWeight={500}>{detail.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {detail.info}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Contact Form */}
        <Box sx={{ flex: "1 1 300px", maxWidth: 500 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 4,
                height: "100%",
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[2],
                "&:hover": {
                  boxShadow: theme.shadows[6],
                },
              }}
            >
              <CardContent>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Send Us a Message
                </Typography>

                <Box
                  component="form"
                  onSubmit={formik.handleSubmit}
                  sx={{ mt: 2.5 }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="name"
                        label="Your Name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.name && Boolean(formik.errors.name)
                        }
                        helperText={formik.touched.name && formik.errors.name}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="email"
                        label="Your Email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.email && Boolean(formik.errors.email)
                        }
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="subject"
                        label="Subject"
                        value={formik.values.subject}
                        onChange={formik.handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="message"
                        label="Message"
                        multiline
                        rows={isMobile ? 4 : 5}
                        value={formik.values.message}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.message &&
                          Boolean(formik.errors.message)
                        }
                        helperText={
                          formik.touched.message && formik.errors.message
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          fullWidth
                          endIcon={<SendIcon />}
                          sx={{
                            py: 1.5,
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: "1rem",
                          }}
                        >
                          Send Message
                        </Button>
                      </motion.div>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default ContactUs;
