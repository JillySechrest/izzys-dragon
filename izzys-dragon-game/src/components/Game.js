import React, { useState, useEffect, useCallback } from 'react';
import './Game.css'; // We'll create this for styling
import Dragon from './Dragon'; // Dragon component
import Obstacle from './Obstacle'; // Obstacle component

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const DRAGON_SIZE = 50;
const OBSTACLE_WIDTH = 60;
const OBSTACLE_HEIGHT = 60; // Added constant for obstacle height
const GRAVITY = 0.8;
const FLAP_STRENGTH = 12;
const OBSTACLE_SPAWN_RATE = 2000; // milliseconds
const INITIAL_OBSTACLE_SPEED = 3;
const SPEED_INCREASE_INTERVAL = 5000; // milliseconds
const SPEED_INCREASE_AMOUNT = 0.5;
const WIN_SCORE = 3; // Updated win condition to 3

function Game() {
  const [dragonPosition, setDragonPosition] = useState(GAME_HEIGHT / 2);
  const [dragonVelocity, setDragonVelocity] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [obstacleSpeed, setObstacleSpeed] = useState(INITIAL_OBSTACLE_SPEED);
  const [gameWon, setGameWon] = useState(false);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || gameWon) return;

    const gameLoopInterval = setInterval(() => {
      // Dragon physics
      setDragonVelocity(prev => prev + GRAVITY);
      setDragonPosition(prev => {
        const newPos = prev + dragonVelocity;
        if (newPos > GAME_HEIGHT - DRAGON_SIZE) return GAME_HEIGHT - DRAGON_SIZE;
        if (newPos < 0) return 0;
        return newPos;
      });

      // Move obstacles
      setObstacles(prevObstacles =>
        prevObstacles.map(obs => ({ ...obs, x: obs.x - obstacleSpeed }))
                     .filter(obs => obs.x > -OBSTACLE_WIDTH)
      );

      // Check for collisions
      obstacles.forEach(obstacle => {
        const dragonRect = { x: GAME_WIDTH / 4, y: dragonPosition, width: DRAGON_SIZE, height: DRAGON_SIZE };
        // const upperObstacleRect = { x: obstacle.x, y: 0, width: OBSTACLE_WIDTH, height: obstacle.topHeight }; // OLD
        // const lowerObstacleRect = { x: obstacle.x, y: obstacle.topHeight + OBSTACLE_GAP, width: OBSTACLE_WIDTH, height: GAME_HEIGHT - obstacle.topHeight - OBSTACLE_GAP }; // OLD

        const obstacleRect = { x: obstacle.x, y: obstacle.y, width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT }; // NEW

        if (
          // checkCollision(dragonRect, upperObstacleRect) || // OLD
          // checkCollision(dragonRect, lowerObstacleRect) // OLD
          checkCollision(dragonRect, obstacleRect) // NEW
        ) {
          setGameOver(true);
        }
      });

      // Update score
      const passedObstacle = obstacles.find(obs => obs.x + OBSTACLE_WIDTH < GAME_WIDTH / 4 && !obs.passed);
      if (passedObstacle) {
        setScore(prevScore => prevScore + 1);
        setObstacles(prevObstacles =>
          prevObstacles.map(obs =>
            obs.id === passedObstacle.id ? { ...obs, passed: true } : obs
          )
        );
      }

    }, 20);

    return () => clearInterval(gameLoopInterval);
  }, [gameStarted, gameOver, gameWon, dragonVelocity, obstacles, obstacleSpeed, dragonPosition]);

  // Spawn obstacles
  useEffect(() => {
    if (!gameStarted || gameOver || gameWon) return;

    const spawnObstacleInterval = setInterval(() => {
      // const topHeight = Math.random() * (GAME_HEIGHT - OBSTACLE_GAP - 100) + 50; // OLD
      const obstacleY = Math.random() * (GAME_HEIGHT - OBSTACLE_HEIGHT); // NEW: Random Y position for the top of the obstacle

      setObstacles(prevObstacles => [
        ...prevObstacles,
        {
          id: Date.now(),
          x: GAME_WIDTH,
          // topHeight: topHeight, // OLD
          y: obstacleY, // NEW
          passed: false,
        },
      ]);
    }, OBSTACLE_SPAWN_RATE);

    return () => clearInterval(spawnObstacleInterval);
  }, [gameStarted, gameOver, gameWon]);

  // Increase speed
  useEffect(() => {
    if (!gameStarted || gameOver || gameWon) return;

    const increaseSpeedInterval = setInterval(() => {
      setObstacleSpeed(prevSpeed => prevSpeed + SPEED_INCREASE_AMOUNT);
    }, SPEED_INCREASE_INTERVAL);

    return () => clearInterval(increaseSpeedInterval);
  }, [gameStarted, gameOver, gameWon]);

  // Handle flap
  const handleFlap = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (gameOver || gameWon) return;
    setDragonVelocity(-FLAP_STRENGTH);
  }, [gameStarted, gameOver, gameWon]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        handleFlap();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleFlap]);

  // Check for win condition
  useEffect(() => {
    if (score >= WIN_SCORE) {
      setGameWon(true);
      // Play win music (to be implemented)
    }
  }, [score]);

  const checkCollision = (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  const restartGame = () => {
    setDragonPosition(GAME_HEIGHT / 2);
    setDragonVelocity(0);
    setObstacles([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setObstacleSpeed(INITIAL_OBSTACLE_SPEED);
    setGameWon(false);
  };

  if (!gameStarted && !gameOver && !gameWon) {
    return (
      <div className="game-area" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }} onClick={handleFlap}>
        <div className="start-screen">
          <h1>Izzy's Dragon Adventure</h1>
          <p>Click or Press Space to Start</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-area" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }} onClick={handleFlap}>
      <Dragon position={dragonPosition} size={DRAGON_SIZE} />
      {obstacles.map(obstacle => (
        <Obstacle
          key={obstacle.id}
          x={obstacle.x}
          // topHeight={obstacle.topHeight} // OLD
          // gap={OBSTACLE_GAP} // OLD
          y={obstacle.y} // NEW
          width={OBSTACLE_WIDTH}
          height={OBSTACLE_HEIGHT} // NEW
          // gameHeight={GAME_HEIGHT} // No longer needed by Obstacle component
        />
      ))}
      <div className="score">Score: {score}</div>
      {gameOver && (
        <div className="game-over-message">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <button onClick={restartGame}>Play Again</button>
        </div>
      )}
      {gameWon && (
        <div className="game-won-message">
          {/* The div itself will be styled to be full-screen */}
          {/* <img src="/celebration.gif" alt="Celebration" className="celebration-graphic-img" /> */}
          <video src="/celebration.mp4" autoPlay loop muted className="celebration-video-player">
            Your browser does not support the video tag.
          </video>
          <audio src="/win-music.mp3" autoPlay loop /> {/* Added loop to audio */}
          <div className="win-screen-buttons">
            <button onClick={restartGame}>Play Again</button>
            <button onClick={restartGame} className="stop-button">Stop</button> {/* New Stop button */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
