"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface BackgroundProps {
  className?: string;
  intensity?: "subtle" | "normal" | "strong";
  animate?: boolean;
}

export function Background({ className, intensity = "normal", animate = true }: BackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  const intensities = {
    subtle: { opacity: 0.3, lineCount: 20, nodeCount: 8 },
    normal: { opacity: 0.6, lineCount: 40, nodeCount: 16 },
    strong: { opacity: 0.9, lineCount: 60, nodeCount: 24 },
  };

  const config = intensities[intensity];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const lines: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      opacity: number;
      speed: number;
      offset: number;
      accent: boolean;
    }> = [];

    const nodes: Array<{
      x: number;
      y: number;
      radius: number;
      opacity: number;
      pulseSpeed: number;
      pulseOffset: number;
      accent: boolean;
    }> = [];

    const panels: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
      opacity: number;
      accent: boolean;
    }> = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      lines.length = 0;
      nodes.length = 0;
      panels.length = 0;

      const gridSize = Math.min(width, height) / 8;

      for (let i = 0; i < config.lineCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = gridSize * (0.5 + Math.random() * 1.5);
        const cx = Math.random() * width;
        const cy = Math.random() * height;
        const accent = Math.random() < 0.15;

        lines.push({
          x1: cx - Math.cos(angle) * length / 2,
          y1: cy - Math.sin(angle) * length / 2,
          x2: cx + Math.cos(angle) * length / 2,
          y2: cy + Math.sin(angle) * length / 2,
          opacity: 0.02 + Math.random() * 0.06,
          speed: 0.0001 + Math.random() * 0.0003,
          offset: Math.random() * Math.PI * 2,
          accent,
        });
      }

      for (let i = 0; i < config.nodeCount; i++) {
        const accent = Math.random() < 0.2;
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 1 + Math.random() * 2,
          opacity: 0.03 + Math.random() * 0.08,
          pulseSpeed: 0.0005 + Math.random() * 0.001,
          pulseOffset: Math.random() * Math.PI * 2,
          accent,
        });
      }

      for (let i = 0; i < 8; i++) {
        const accent = Math.random() < 0.1;
        panels.push({
          x: Math.random() * width,
          y: Math.random() * height,
          width: 80 + Math.random() * 200,
          height: 40 + Math.random() * 120,
          rotation: (Math.random() - 0.5) * 0.3,
          opacity: 0.015 + Math.random() * 0.025,
          accent,
        });
      }
    }

    function draw() {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, width, height);

      ctx.globalAlpha = config.opacity;

      ctx.strokeStyle = "#2A2C25";
      ctx.lineWidth = 0.5;

      for (const line of lines) {
        ctx.globalAlpha = line.opacity * config.opacity;
        ctx.strokeStyle = line.accent ? "#D8A84E" : "#2A2C25";
        ctx.lineWidth = line.accent ? 1 : 0.5;

        if (animate) {
          const wave = Math.sin(timeRef.current * line.speed + line.offset) * 4;
          const midX = (line.x1 + line.x2) / 2;
          const midY = (line.y1 + line.y2) / 2;
          const dx = line.x2 - line.x1;
          const dy = line.y2 - line.y1;
          const perpX = -dy * 0.1;
          const perpY = dx * 0.1;

          ctx.beginPath();
          ctx.moveTo(line.x1, line.y1);
          ctx.quadraticCurveTo(midX + perpX + wave, midY + perpY + wave, line.x2, line.y2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(line.x1, line.y1);
          ctx.lineTo(line.x2, line.y2);
          ctx.stroke();
        }
      }

      for (const panel of panels) {
        ctx.globalAlpha = panel.opacity * config.opacity;
        ctx.strokeStyle = panel.accent ? "#D8A84E" : "#2A2C25";
        ctx.lineWidth = panel.accent ? 1 : 0.5;
        ctx.fillStyle = panel.accent ? "rgba(216, 168, 78, 0.02)" : "rgba(42, 44, 37, 0.015)";

        ctx.save();
        ctx.translate(panel.x, panel.y);
        ctx.rotate(panel.rotation);
        
        ctx.beginPath();
        ctx.roundRect(-panel.width / 2, -panel.height / 2, panel.width, panel.height, 4);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }

      for (const node of nodes) {
        const pulse = Math.sin(timeRef.current * node.pulseSpeed + node.pulseOffset) * 0.3 + 0.7;
        ctx.globalAlpha = node.opacity * pulse * config.opacity;
        ctx.fillStyle = node.accent ? "#D8A84E" : "#2A2C25";
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
        ctx.fill();

        if (node.accent) {
          ctx.globalAlpha = node.opacity * 0.3 * config.opacity;
          ctx.strokeStyle = "#D8A84E";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * pulse * 2.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
    }

    function animate() {
      timeRef.current += 16;
      draw();
      animationRef.current = requestAnimationFrame(animate);
    }

    resize();
    draw();

    if (animate) {
      animationRef.current = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 pointer-events-none z-[-1]",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function BackgroundPattern({ className, opacity = 0.6 }: { className?: string; opacity?: number }) {
  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none z-[-1]",
        "bg-[linear-gradient(rgba(42,44,37,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(42,44,37,0.03)_1px,transparent_1px)]",
        "[background-size:80px_80px]",
        "[mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black_30%,transparent_80%)]",
        className
      )}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}