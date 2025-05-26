import React from "react";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Chip,
  Button,
  useTheme,
  alpha,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const blogPosts = [
  {
    slug: "unlocking-productivity-with-ai-tools",
    title: "Unlocking Productivity: Top 5 AI Tools for Your Workflow",
    excerpt:
      "Discover how artificial intelligence can streamline your daily tasks. We explore five cutting-edge AI tools that can revolutionize your productivity.",
    content: `
      <p>In this digital era, <strong>artificial intelligence</strong> tools are transforming productivity. Here are our top 5 picks:</p>
      <ul>
        <li><strong>ChatGPT:</strong> Assists with writing, coding, and brainstorming ideas.</li>
        <li><strong>Notion AI:</strong> Enhances documentation and project planning.</li>
        <li><strong>Grammarly:</strong> Elevates your writing clarity and grammar.</li>
        <li><strong>Zapier:</strong> Automates repetitive workflows.</li>
        <li><strong>Otter.ai:</strong> Transcribes meetings and voice notes with accuracy.</li>
      </ul>
      <p>These tools, when used together, can save hours of manual effort and help you focus on what truly matters.</p>
    `,
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
    content: `
      <p>Minimalist web design focuses on <em>simplicity</em>, user-centric interfaces, and performance.</p>
      <h3>Key Principles:</h3>
      <ol>
        <li>Use whitespace generously.</li>
        <li>Limit colors and fonts.</li>
        <li>Focus on content hierarchy.</li>
        <li>Improve loading speeds.</li>
      </ol>
      <p>When done right, minimalism makes your site look elegant and professional.</p>
    `,
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
    content: `
      <p>Being sustainable doesn't have to be complicated. Here's a beginner's guide to a more eco-friendly lifestyle:</p>
      <ol>
        <li>Reduce, reuse, and recycle.</li>
        <li>Choose eco-friendly products.</li>
        <li>Support local businesses.</li>
        <li>Plant trees and gardens.</li>
        <li>Reduce your carbon footprint.</li>
      </ol>
      <p>With these simple steps, you can make a positive impact on the planet and live a more sustainable lifestyle.</p>
    `,
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
    content: `
      <p>React is a popular JavaScript library for building user interfaces. Here are some best practices for using React:</p>
      <ul>
        <li>Use hooks for state management.</li>
        <li>Optimize performance by memoizing components.</li>
        <li>Use React Router for client-side routing.</li>
        <li>Use React Context for global state management.</li>
      </ul>
      <p>With these best practices, you can create more maintainable and performant React applications.</p>
    `,
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

const BlogDetails = () => {
  const { slug } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const blog = blogPosts.find((post) => post.slug === slug);

  if (!blog) {
    return (
      <Container>
        <Typography variant="h5" color="error" mt={4}>
          Blog post not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: alpha(theme.palette.background.default, 0.97),
        py: { xs: 4, md: 6 },
        px: { xs: 2, sm: 4, md: 6 },
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="md">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 3,
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant={isMobile ? "h4" : "h3"}
            fontWeight={700}
            gutterBottom
            color="primary"
          >
            {blog.title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            <Avatar
              src={blog.author.avatarUrl}
              alt={blog.author.name}
              sx={{ width: 40, height: 40 }}
            />
            <Box>
              <Typography variant="subtitle2">{blog.author.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(blog.publicationDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                • {blog.readTime} min read
              </Typography>
            </Box>
          </Box>

          <Box
            component="img"
            src={blog.imageUrl}
            alt={blog.title}
            sx={{
              width: "100%",
              height: { xs: 200, md: 400 },
              objectFit: "cover",
              borderRadius: 3,
              mb: 3,
              boxShadow: 3,
            }}
          />

          <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
            {blog.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
          </Stack>

          <Typography
            component="div"
            variant="body1"
            color="text.primary"
            sx={{
              lineHeight: 1.8,
              fontSize: { xs: "1rem", md: "1.1rem" },
              mb: 6,
              "& ul": { pl: 3, mb: 2 },
              "& ol": { pl: 3, mb: 2 },
              "& li": { mb: 1 },
              "& h3": { mt: 3, mb: 1.5, fontWeight: "bold" },
              "& p": { mb: 2 },
            }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </motion.div>
      </Container>
    </Box>
  );
};

export default BlogDetails;
