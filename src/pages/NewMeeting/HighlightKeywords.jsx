// components/NewMeeting/HighlightKeywords.jsx
// (Or place it in a suitable shared components folder)

import React from 'react';
import { Box } from '@mui/material'; // Make sure Box is imported

const HighlightKeywords = React.memo(({ text, keywords, highlightColor }) => {
  // If no keywords, text, or highlight color, return the original text
  if (!keywords?.length || !text || !highlightColor) {
    return text;
  }

  // Escape keywords to be safely used in a RegExp
  const escapedKeywords = keywords.map((kw) =>
    kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escapes special regex characters
  );

  // Create a regular expression to find whole words matching the keywords (case-insensitive)
  // \b ensures matching whole words only
  const regex = new RegExp(`\\b(${escapedKeywords.join("|")})\\b`, "gi");

  // Split the text into parts based on the regex matches
  const parts = text.split(regex);

  return (
    <>
      {/* Map over the parts array */}
      {parts.map((part, index) =>
        // Test if the current part is one of the keywords matched by the regex
        // We check against the original regex, not the escaped string directly
        // Need to re-create the regex test logic here, essentially checking if 'part' is one of the keywords
        // A simpler way might be to check if the original regex (case-insensitive) matches the part.
        // Let's refine the check: check if the part *is* one of the matched keywords.
        // The split behaviour puts the delimiters (matched keywords) into the array.
        // Odd indices in `parts` *should* be the matched keywords, while even are the text in between.
        // However, checking `regex.test(part)` is more robust as it handles edge cases.
        // Re-testing ensures we only highlight the actual keyword matches.

        // A more direct check: is this part one of the keywords? (Case-insensitive)
        keywords.some(kw => part?.toLowerCase() === kw?.toLowerCase()) ? (
          // If it's a keyword, wrap it in a styled Box
          <Box
            component="span"
            key={index}
            sx={{
              backgroundColor: highlightColor,
              borderRadius: "3px",
              p: "0.5px 2px", // Small padding around the highlight
              // Optionally add font weight or other styles
              // fontWeight: 'bold',
            }}
          >
            {part} {/* Render the matched keyword */}
          </Box>
        ) : (
          // If it's not a keyword, render the text part as is
          part
        )
      )}
    </>
  );
});

// Export the component for use in other files
export default HighlightKeywords;