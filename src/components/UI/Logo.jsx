import React from "react";
import { Box, Typography, useTheme, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import { RecordVoiceOver } from "@mui/icons-material";
const sizes = {
  small: {
    width: 32,
    height: 32,
    fontSize: "1rem",
  },
  medium: {
    width: 40,
    height: 40,
    fontSize: "1.25rem",
  },
  large: {
    width: 48,
    height: 48,
    fontSize: "1.5rem",
  },
  xlarge: {
    width: 64,
    height: 64,
    fontSize: "2rem",
  },
};

const Logo = ({ size = "medium", withText = true, textColor }) => {
  const theme = useTheme();
  const dimensions = sizes[size] || sizes.medium;
  const logoTextColor = textColor || theme.palette.primary.main;
  const secondaryTextColor = theme.palette.secondary.main;

  const logoContainerSize = 60;
  const iconButtonSize = 30;
  const circleBaseSize = 30;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        style={{
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: logoContainerSize,
            height: logoContainerSize,
            opacity: 0.9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.7, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 + i * 0.4 }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut",
              }}
              style={{
                position: "absolute",
                width: circleBaseSize,
                height: circleBaseSize,
                borderRadius: "50%",
                border: `1.5px solid ${theme.palette.primary.main}`,
              }}
            />
          ))}

          <motion.div
            animate={{
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
            }}
          >
            <IconButton
              size="small"
              sx={{
                width: iconButtonSize,
                height: iconButtonSize,
                backgroundColor: theme.palette.primary.main,
                color: "white",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
                boxShadow: theme.shadows[2],
              }}
            >
              <RecordVoiceOver sx={{ fontSize: iconButtonSize * 0.6 }} />
            </IconButton>
          </motion.div>
        </Box>
      </motion.div>

      {withText && (
        <Typography
          variant="h6"
          component="span"
          sx={{
            fontWeight: 700,
            fontSize: dimensions.fontSize,
            color: logoTextColor,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          MakeMy<span style={{ color: secondaryTextColor }}>Minutes</span>
        </Typography>
      )}
    </Box>
  );
};

export default Logo;
