import { useEffect, useState } from "react";

export default function Snowfall() {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 10,
      size: 4 + Math.random() * 8,
      opacity: 0.3 + Math.random() * 0.5
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="snowfall">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left + "%",
            width: flake.size + "px",
            height: flake.size + "px",
            opacity: flake.opacity,
            animation: "snow-fall " + flake.duration + "s linear infinite",
            animationDelay: flake.delay + "s"
          }}
        />
      ))}
    </div>
  );
}
