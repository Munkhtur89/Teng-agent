import React, { useEffect, useState } from "react";

interface CounterProps {
  targetNumber: number;
  startNumber?: number;
  duration?: number; // milliseconds, default 1000ms
}

const Counter: React.FC<CounterProps> = ({
  targetNumber,
  startNumber = 0,
  duration = 1000,
}) => {
  const [count, setCount] = useState(startNumber);

  useEffect(() => {
    if (startNumber === targetNumber) return;

    const frameRate = 30;
    const totalFrames = Math.round(duration / frameRate);
    const increment = (targetNumber - startNumber) / totalFrames;

    let current = startNumber;
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      current += increment;
      if (
        (increment > 0 && current >= targetNumber) ||
        (increment < 0 && current <= targetNumber) ||
        frame >= totalFrames
      ) {
        setCount(targetNumber);
        clearInterval(counter);
      } else {
        setCount(Math.round(current));
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [targetNumber, startNumber, duration]);

  return <span>{count}</span>;
};

export default Counter;
