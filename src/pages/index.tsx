import React, { useEffect, useRef, useState, useCallback } from "react";
import style from "@styles/Home.module.css";

const CELL_SIZE = 10;
const WIDTH = 800;
const HEIGHT = 800;
const ROWS = HEIGHT / CELL_SIZE;
const COLS = WIDTH / CELL_SIZE;
const SPEED = 50;

function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<number[][]>([]);
  const [scale, setScale] = useState(1);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  runningRef.current = running;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        setScale(rect.width / WIDTH);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";

        grid.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell) {
              ctx.fillRect(
                x * CELL_SIZE * scale,
                y * CELL_SIZE * scale,
                CELL_SIZE * scale,
                CELL_SIZE * scale
              );
            }
          });
        });
      }
    }
  }, [grid, scale]);

  useEffect(() => {
    const initialGrid = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => 0)
    );
    setGrid(initialGrid);
  }, []);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / (CELL_SIZE * scale));
      const y = Math.floor((event.clientY - rect.top) / (CELL_SIZE * scale));

      if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((row) => [...row]);
          newGrid[y][x] = newGrid[y][x] ? 0 : 1;
          return newGrid;
        });
      }
    }
  };

  const stepSimulation = () => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => [...row]);

      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          let neighbors = 0;
          for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
              if (i === 0 && j === 0) continue;
              const newY = y + i;
              const newX = x + j;
              if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
                neighbors += prevGrid[newY][newX];
              }
            }
          }

          if (prevGrid[y][x] === 1 && (neighbors < 2 || neighbors > 3)) {
            newGrid[y][x] = 0;
          } else if (prevGrid[y][x] === 0 && neighbors === 3) {
            newGrid[y][x] = 1;
          }
        }
      }
      return newGrid;
    });
  };

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    stepSimulation();

    setTimeout(runSimulation, SPEED);
  }, []);

  useEffect(() => {
    if (running) {
      runSimulation();
    }
  }, [running, runSimulation]);

  return (
    <div className={style.container}>
      <canvas
        className={style.canvas}
        ref={canvasRef}
        onClick={handleCanvasClick}
      />
      <button onClick={() => setRunning(!running)}>
        {running ? "Stop" : "Start"}
      </button>
    </div>
  );
}

export default Index;
