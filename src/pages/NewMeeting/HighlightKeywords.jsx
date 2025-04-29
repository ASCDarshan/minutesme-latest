import React from "react";
import { Box } from "@mui/material";

const HighlightKeywords = React.memo(({ text, keywords, highlightColor }) => {
  if (!keywords?.length || !text || !highlightColor) {
    return text;
  }

  const escapedKeywords = keywords.map((kw) =>
    kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const regex = new RegExp(`\\b(${escapedKeywords.join("|")})\\b`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        keywords.some((kw) => part?.toLowerCase() === kw?.toLowerCase()) ? (
          <Box
            component="span"
            key={index}
            sx={{
              backgroundColor: highlightColor,
              borderRadius: "3px",
              p: "0.5px 2px",
            }}
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </>
  );
});

export default HighlightKeywords;
