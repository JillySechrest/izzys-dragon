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
    // backgroundImage: 'url("/dragon-1-1.png")', // Temporarily commented out
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    // border: '2px solid red', // Removed temporary border
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // Similar to background-size: contain
  };

  return (
    <div style={style} className="dragon">
      <img src={`${process.env.PUBLIC_URL}/assets/dragon-1-1.png`} alt="Dragon" style={imgStyle} />
    </div>
  );
};

export default Dragon;
