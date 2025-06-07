import React from 'react';

// Represents a single obstacle
const Obstacle = ({ x, y, width, height }) => {
  const obstacleStyle = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: 'transparent', // Placeholder color, image should cover
    backgroundImage: 'url("/mountains-1.png.png")', // Use mountain image
    backgroundSize: 'cover',
    // backgroundPosition can be adjusted if needed, e.g., 'center center'
  };

  return <div style={obstacleStyle} className="obstacle"></div>;
};

export default Obstacle;
