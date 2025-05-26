import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  Button,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const blogPosts = [
  {
    slug: "unlocking-productivity-with-ai-tools",
    title: "Unlocking Productivity: Top 5 AI Tools for Your Workflow",
    excerpt:
      "Discover how artificial intelligence can streamline your daily tasks. We explore five cutting-edge AI tools that can revolutionize your productivity.",
    imageUrl: "https://source.unsplash.com/random/800x600?technology,ai",
    author: {
      name: "Jane Doe",
      avatarUrl: "https://source.unsplash.com/random/100x100?woman,portrait",
    },
    publicationDate: "2025-05-20",
    tags: ["AI", "Productivity", "Tech"],
    readTime: 6,
  },
  {
    slug: "the-art-of-minimalist-web-design",
    title: "The Art of Minimalism in Modern Web Design",
    excerpt:
      "Less is more. This post delves into the principles of minimalist design and how to apply them to create beautiful, functional, and fast-loading websites.",
    imageUrl: "https://source.unsplash.com/random/800x600?design,minimalism",
    author: {
      name: "John Smith",
      avatarUrl: "https://source.unsplash.com/random/100x100?man,portrait",
    },
    publicationDate: "2025-05-15",
    tags: ["Web Design", "UX", "Minimalism"],
    readTime: 8,
  },
  {
    slug: "a-guide-to-sustainable-living",
    title: "A Beginner's Guide to Sustainable Living",
    excerpt:
      "Want to make a positive impact on the planet? Our guide provides simple, actionable steps towards a more sustainable and eco-friendly lifestyle.",
    imageUrl:
      "https://source.unsplash.com/random/800x600?nature,sustainability",
    author: {
      name: "Emily White",
      avatarUrl: "https://source.unsplash.com/random/100x100?person,face",
    },
    publicationDate: "2025-05-10",
    tags: ["Sustainability", "Lifestyle", "Eco-Friendly"],
    readTime: 7,
  },
  {
    slug: "react-best-practices-2025",
    title: "React Best Practices in 2025",
    excerpt:
      "Stay up-to-date with the latest React patterns and best practices that will make your applications more maintainable and performant.",
    imageUrl: "https://source.unsplash.com/random/800x600?code,react",
    author: {
      name: "Alex Johnson",
      avatarUrl: "https://source.unsplash.com/random/100x100?developer",
    },
    publicationDate: "2025-05-05",
    tags: ["React", "JavaScript", "Frontend"],
    readTime: 9,
  },
];

const BlogPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleReadMore = (slug) => {
    navigate(`/blog/${slug}`);
  };

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
          Our Blog
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
          Explore the latest articles, tutorials, and insights from our team of
          experts.
        </Typography>
      </motion.div>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: { xs: 3, sm: 4 },
          py: { xs: 4, md: 6 },
          px: { xs: 2, sm: 4, md: 6 },
          overflowX: "visible",
        }}
      >
        {blogPosts.map((post) => (
          <Card
            key={post.slug}
            sx={{
              width: "100%",
              maxWidth: 360,
              flex: "0 0 auto",
              borderRadius: 4,
              boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
              scrollSnapAlign: "start",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
          >
            <CardMedia
              component="img"
              image={post.imageUrl}
              alt={post.title}
              sx={{
                width: "100%",
                height: 200,
                objectFit: "cover",
              }}
            />
            <CardContent
              sx={{
                flex: 1,
                p: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                  {post.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    mb: 1,
                    cursor: "pointer",
                    "&:hover": { color: "primary.main" },
                  }}
                  onClick={() => handleReadMore(post.slug)}
                >
                  {post.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {post.excerpt}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    sx={{ width: 36, height: 36 }}
                  />
                  <Box>
                    <Typography variant="subtitle2">
                      {post.author.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.publicationDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  onClick={() => handleReadMore(post.slug)}
                  endIcon={<ArrowForwardIcon />}
                >
                  Read
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default BlogPage;
