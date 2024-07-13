import React, { useEffect, useRef, useState, useCallback } from "react";
import style from "@styles/Home.module.css";

const CELL_SIZE = 20;
const WIDTH = 1000;
const HEIGHT = 1000;
const ROWS = HEIGHT / CELL_SIZE;
const COLS = WIDTH / CELL_SIZE;
const MIN_SPEED = 1;
const MAX_SPEED = 1000;

function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<number[][]>([]);
  const [scale, setScale] = useState(1);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  runningRef.current = running;
  const [isDrawing, setIsDrawing] = useState(false);
  const [value, setValue] = useState(0);
  const [speed, setSpeed] = useState(50);
  const speedRef = useRef(speed);
  speedRef.current = speed;

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
        ctx.fillStyle = "white";

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

  const getCellCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / (CELL_SIZE * scale));
      const y = Math.floor((event.clientY - rect.top) / (CELL_SIZE * scale));
      return { x, y };
    }
    return null;
  };

  const toggleCell = (x: number, y: number) => {
    if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((row) => [...row]);
        newGrid[y][x] = value;
        return newGrid;
      });
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const coords = getCellCoordinates(event);
    if (coords) {
      setValue(grid.map((row) => [...row])[coords.y][coords.x] ? 0 : 1);
      toggleCell(coords.x, coords.y);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCellCoordinates(event);
    if (coords) {
      toggleCell(coords.x, coords.y);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
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

    setTimeout(runSimulation, speedRef.current);
  }, []);

  useEffect(() => {
    if (running) {
      runSimulation();
    }
  }, [running, runSimulation]);

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = MAX_SPEED - parseInt(event.target.value) + MIN_SPEED;
    setSpeed(newSpeed);
  };

  return (
    <div className={style.container}>
      <canvas
        className={style.canvas}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className={style.control_panel}>
        <h1>Control Panel</h1>
        <div className={style.speedControl}>
          <label htmlFor="speed">Speed: </label>
          <input
            type="range"
            id="speed"
            min={MIN_SPEED}
            max={MAX_SPEED}
            value={MAX_SPEED - speed + MIN_SPEED}
            onChange={handleSpeedChange}
          />
          <span>{speed} ms</span>
        </div>
        <button
          className={`${style.startStopButton} ${
            running ? style.stopButton : style.startButton
          }`}
          onClick={() => {
            setRunning(!running);
          }}
        >
          {running ? "Stop" : "Start"}
        </button>
        <button className={style.button} onClick={stepSimulation}>
          Step
        </button>
        <button
          className={style.button}
          onClick={() => {
            setGrid(
              Array.from({ length: ROWS }, () =>
                Array.from({ length: COLS }, () => 0)
              )
            );
            setRunning(false);
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default Index;
