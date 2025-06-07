import React, { useState, useEffect, useCallback } from 'react';
import './Game.css'; // We'll create this for styling
import Dragon from './Dragon'; // Dragon component
import Obstacle from './Obstacle'; // Obstacle component
import Swal from 'sweetalert2'; // Import SweetAlert2

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const DRAGON_SIZE = 100; // Increased from 70
const OBSTACLE_WIDTH = 50;
const OBSTACLE_HEIGHT = 50; // Added constant for obstacle height
const GRAVITY = 0.7;
const FLAP_STRENGTH = 12;
const OBSTACLE_SPAWN_RATE = 2000; // milliseconds
const INITIAL_OBSTACLE_SPEED = 3;
const SPEED_INCREASE_INTERVAL = 5000; // milliseconds
const SPEED_INCREASE_AMOUNT = 0.5;
const WIN_SCORE = 15; 

function Game() {
  const [dragonPosition, setDragonPosition] = useState(GAME_HEIGHT / 2);
  const [dragonVelocity, setDragonVelocity] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [obstacleSpeed, setObstacleSpeed] = useState(INITIAL_OBSTACLE_SPEED);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    console.log('Game State Update: gameStarted:', gameStarted, 'gameOver:', gameOver, 'gameWon:', gameWon, 'score:', score);
  }, [gameStarted, gameOver, gameWon, score]);

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

    const obstacleTypes = ['mountain', 'kitty']; // Define available obstacle types

    const spawnObstacleInterval = setInterval(() => {
      const obstacleY = Math.random() * (GAME_HEIGHT - OBSTACLE_HEIGHT);
      const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]; // Randomly select a type

      setObstacles(prevObstacles => [
        ...prevObstacles,
        {
          id: Date.now(),
          x: GAME_WIDTH,
          y: obstacleY,
          type: randomType, // Add type to obstacle data
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
    if (score >= WIN_SCORE && !gameWon) { // Add !gameWon to prevent multiple logs if score keeps increasing
      console.log('WIN CONDITION MET! Score:', score, 'WIN_SCORE:', WIN_SCORE);
      setGameWon(true);
    }
  }, [score, WIN_SCORE, gameWon]); // Added gameWon to dependencies

  const restartGame = useCallback(() => {
    setDragonPosition(GAME_HEIGHT / 2);
    setDragonVelocity(0);
    setObstacles([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setObstacleSpeed(INITIAL_OBSTACLE_SPEED);
    setGameWon(false);
  }, []); // Empty dependency array as setters are stable

  // Show game over alert
  useEffect(() => {
    if (gameOver) {
      const failVideos = ['fail.mp4', 'fail2.mp4', 'fail3.mp4'];
      const randomFailVideo = failVideos[Math.floor(Math.random() * failVideos.length)];

      Swal.fire({
        title: 'Game Over!',
        html: `
          <div>
            <video src="${process.env.PUBLIC_URL}/assets/${randomFailVideo}" autoplay loop muted style="width: 100%; height: 450px; object-fit: cover;"></video>
            <audio src="${process.env.PUBLIC_URL}/assets/game-over.mp3" autoplay></audio>
            <p>Final Score: ${score}</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Play Again',
        cancelButtonText: 'Quit',
        allowOutsideClick: false,
        allowEscapeKey: false,
        width: '750px', // Increased width
        customClass: {
          popup: 'game-over-swal', // For custom styling if needed
        },
        didOpen: () => {
          // Ensure video and audio play if autoplay is restricted
          const video = document.querySelector('.swal2-html-container video');
          const audio = document.querySelector('.swal2-html-container audio');
          if (video) video.play().catch(e => console.error("Video play failed", e));
          if (audio) audio.play().catch(e => console.error("Audio play failed", e));
        }
      }).then((result) => {
        if (result.isConfirmed) {
          restartGame();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          window.location.reload(); // Or navigate to a main menu, etc.
        }
      });
    }
  }, [gameOver, score, restartGame]); // restartGame added as dependency

  // Show game won alert
  useEffect(() => {
    if (gameWon) {
      const winVideos = ['celebration.mp4', 'celebration2.mp4', 'celebration3.mp4'];
      const randomWinVideo = winVideos[Math.floor(Math.random() * winVideos.length)];

      Swal.fire({
        title: 'You Won!',
        html: `
          <div>
            <video src="${process.env.PUBLIC_URL}/assets/${randomWinVideo}" autoplay loop muted style="width: 100%; height: 450px; object-fit: cover;"></video>
            <audio src="${process.env.PUBLIC_URL}/assets/win-music.mp3" autoplay loop></audio>
            <p>Congratulations! Final Score: ${score}</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Play Again',
        cancelButtonText: 'Quit',
        allowOutsideClick: false,
        allowEscapeKey: false,
        width: '750px', // Increased width
        customClass: {
          popup: 'game-won-swal', // For custom styling if needed
        },
        didOpen: () => {
          const video = document.querySelector('.swal2-html-container video');
          const audio = document.querySelector('.swal2-html-container audio');
          if (video) video.play().catch(e => console.error("Video play failed", e));
          if (audio) audio.play().catch(e => console.error("Audio play failed", e));
        }
      }).then((result) => {
        if (result.isConfirmed) {
          restartGame();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // For the win screen, "Quit" might just close the alert or reload
          window.location.reload(); 
        }
      });
    }
  }, [gameWon, score, restartGame]); // restartGame added as dependency


  const checkCollision = (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  // const restartGame = () => {
  //   setDragonPosition(GAME_HEIGHT / 2);
  //   setDragonVelocity(0);
  //   setObstacles([]);
  //   setScore(0);
  //   setGameOver(false);
  //   setGameStarted(false);
  //   setObstacleSpeed(INITIAL_OBSTACLE_SPEED);
  //   setGameWon(false);
  // };

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
          y={obstacle.y}
          width={OBSTACLE_WIDTH}
          height={OBSTACLE_HEIGHT}
          type={obstacle.type} // Pass type to Obstacle component
        />
      ))}
      <div className="score">Score: {score}</div>
      {/* Game Over and Game Won messages are now handled by SweetAlert2 */}
      {/* No need for the old gameOver && (...) and gameWon && (...) blocks here */}
    </div>
  );
}

export default Game;
