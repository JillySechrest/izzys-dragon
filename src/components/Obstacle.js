import React from 'react';

// Represents a single obstacle
const Obstacle = ({ x, y, width, height, type }) => {
  const obstacleStyle = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    imageRendering: 'pixelated',
  };

  // Determine image source based on type
  const imageUrl = type === 'kitty' 
    ? `${process.env.PUBLIC_URL}/assets/one eyed kitty-1.png` 
    : `${process.env.PUBLIC_URL}/assets/mountains-1.png`;

  return (
    <div style={obstacleStyle} className="obstacle">
      <img src={imageUrl} alt={`Obstacle ${type}`} style={imageStyle} />
    </div>
  );
}

export default Obstacle;
