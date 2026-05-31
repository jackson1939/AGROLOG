"use client";

import React, { useEffect, useRef } from "react";

export function InteractiveAgroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const particleCount = Math.min(60, Math.round((width * height) / 25000)); // Adaptive count
    const connectionDistance = 120;
    const mouse = { x: -1000, y: -1000, radius: 150 };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      pulseSpeed: number;
      pulseTime: number;

      constructor(spawnX?: number, spawnY?: number, isBurst = false) {
        this.x = spawnX !== undefined ? spawnX : Math.random() * width;
        this.y = spawnY !== undefined ? spawnY : Math.random() * height;
        // Slow organic drift speeds, or faster dispersal speeds for click burst
        const speedMultiplier = isBurst ? 2.5 : 0.4;
        this.vx = (Math.random() - 0.5) * speedMultiplier;
        this.vy = (Math.random() - 0.5) * speedMultiplier;
        this.radius = isBurst ? (Math.random() * 1.5 + 1.0) : (Math.random() * 2.5 + 1.5);
        // Green and amber tones representing crops and harvest
        const isAmber = Math.random() > 0.85;
        this.color = isAmber ? "245, 158, 11" : "34, 197, 94"; // Tailwind amber-500 or green-500
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseTime = Math.random() * Math.PI;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off borders gently
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Interactive mouse push (organic repelling)
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 1.8;
          this.y += Math.sin(angle) * force * 1.8;
        }

        this.pulseTime += this.pulseSpeed;
      }

      draw(c: CanvasRenderingContext2D) {
        const opacity = 0.35 + Math.sin(this.pulseTime) * 0.2;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = `rgba(${this.color}, ${opacity})`;
        c.shadowColor = `rgba(${this.color}, 0.6)`;
        c.shadowBlur = 10;
        c.fill();
        c.shadowBlur = 0; // Reset shadow for line rendering efficiency
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation Loop
    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw faint connections (representing networks/data agriculture)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw(ctx);

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Gradient connection line matching active state
            ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Limit particle count dynamically to preserve memory and frame rates
      if (particles.length > 120) {
        particles.splice(particleCount, particles.length - 120);
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    // Event Listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleMouseClick = (e: MouseEvent) => {
      // Spawn a burst of golden/green agrotech seeds at cursor on click
      const burstCount = 10;
      for (let i = 0; i < burstCount; i++) {
        particles.push(new Particle(e.clientX, e.clientY, true));
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleMouseClick);
    window.addEventListener("resize", handleResize);

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleMouseClick);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
