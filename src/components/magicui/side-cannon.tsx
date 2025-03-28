"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

export function ConfettiSideCannons() {
  useEffect(() => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      // Confetti keeps firing indefinitely
      confetti({
        particleCount: 1,
        angle: 270,
        spread: 5,
        startVelocity: 70,
        origin: { x: 0.2, y: -0.9 },
        colors: colors,
      });
      confetti({
        particleCount: 1,
        angle: 270,
        spread: 5,
        startVelocity: 70,
        origin: { x: 0.8, y: -0.9 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();

    // Cleanup function to stop animation when component is unmounted
    return () => {
      // Here we could clear any set intervals or timeouts if needed, but as `requestAnimationFrame` runs continuously, we rely on the component unmounting to stop it
    };
  }, []); // Empty dependency array ensures it only runs once when the component is mounted

  return (
    <div className="fixed z-0">
      {/* The button is no longer needed for triggering, so it can be removed */}
    </div>
  );
}
