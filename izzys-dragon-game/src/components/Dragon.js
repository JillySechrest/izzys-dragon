import React from 'react';

// Basic representation of the dragon
// In a real 8-bit game, this would be a sprite
const Dragon = ({ position, size }) => {
  const style = {
    position: 'absolute',
    left: `${(800 / 4) - (size / 2)}px`, // Centered horizontally a quarter of the way in
    top: `${position}px`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: 'transparent', // Set to transparent if using a GIF with transparency
    // Add 8-bit dragon image as background here later
    backgroundImage: 'url("/dragon-1-1.png.png")', // Corrected filename to match public folder
    backgroundSize: 'contain', // Or 'cover', depending on the GIF's aspect ratio and desired look
    backgroundRepeat: 'no-repeat', // Changed from 'repeat' to 'no-repeat'
  };
  return <div style={style} className="dragon"></div>;
};

export default Dragon;
