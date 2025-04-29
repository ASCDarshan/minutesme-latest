import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

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

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={dimensions.width}
        height={dimensions.height}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="logoGradientPrimary"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#b39ddb" />
            <stop offset="100%" stopColor="#673ab7" />
          </linearGradient>
          <linearGradient
            id="logoGradientLight"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#d1c4e9" />
            <stop offset="100%" stopColor="#9575cd" />
          </linearGradient>
        </defs>
        <path
          stroke="#9575cd"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M18 8h28a2 2 0 0 1 2 2v44a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z"
        />
        <path
          fill="#ede7f6"
          stroke="#9575cd"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M16 10v-0.5A1.5 1.5 0 0 1 17.5 8h29A1.5 1.5 0 0 1 48 9.5V10c0 2.21-1.79 4-4 4H20c-2.21 0-4-1.79-4-4z"
        />
        <circle
          cx="32"
          cy="34"
          r="10"
          stroke="url(#logoGradientPrimary)"
          strokeWidth="2.5"
        />
        <path
          stroke="#673ab7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M32 34V27"
        />
        <path
          stroke="#673ab7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M32 34l5 3.5"
        />
        <path
          stroke="#d1c4e9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M22 49h20"
        />
        <path
          stroke="#d1c4e9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M22 54h16"
        />
      </svg>
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
