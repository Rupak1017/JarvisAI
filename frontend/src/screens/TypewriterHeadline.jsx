import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TypewriterHeadline = ({ text, speed = 75 }) => {
  if (!text) {
    console.error('TypewriterHeadline received no text');
    return null;
  }

  // Using a state variable for the current index
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Reset index when text changes
    setIndex(0);
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => {
        // If there are still characters to show, increment index
        if (prevIndex < text.length) {
          return prevIndex + 1;
        } else {
          clearInterval(intervalId);
          console.log('Typewriter animation complete');
          return prevIndex;
        }
      });
    }, speed);

    // Cleanup interval on unmount or when text changes
    return () => clearInterval(intervalId);
  }, [text, speed]);

  // Compute the displayed text as a substring
  const displayedText = text.substring(0, index);

  return (
    <h1 className="text-3xl font-bold text-gray-900">
      {displayedText}
      {index < text.length && (
        <motion.span
          className="inline-block bg-gray-900 ml-1 align-middle"
          style={{ width: '2px', height: '1em' }}
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        />
      )}
    </h1>
  );
};

export default TypewriterHeadline;
