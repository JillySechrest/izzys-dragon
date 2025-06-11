import React, { useMemo } from 'react';

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
    width: '170%',
    height: '170%',
    imageRendering: 'pixelated',
  };

  const imageUrl = useMemo(() => {
    const obstacleImageFiles = [
      'one eyed kitty-1.png', 
      'mountains-1.png', 
      'poisey.png', 
      'schneke.png', 
      'creeper.png', 
      'grassblock-dino.png', 
      'banan-yuh.png',
      'ghast.png',
      'enderman.png',
      'enderdragon.png',
      'foxy.png',
      'coiled-snek.png'
    ];

    const randomImageFile = obstacleImageFiles[Math.floor(Math.random() * obstacleImageFiles.length)];
    return `${process.env.PUBLIC_URL}/assets/${randomImageFile}`;
  }, []); // Empty dependency array ensures this runs only once per component instance

  return (
    <div style={obstacleStyle} className="obstacle">
      <img src={imageUrl} alt={`Obstacle ${type}`} style={imageStyle} />
    </div>
  );
}

export default Obstacle;
