"use client";

import { useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";

type SignaturePadProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

const PAD_HEIGHT = 180;

export default function SignaturePad({
  value,
  onChange,
  error,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawingRef = useRef(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) {
      return;
    }

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = container.clientWidth;
      canvas.width = width * ratio;
      canvas.height = PAD_HEIGHT * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${PAD_HEIGHT}px`;

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.scale(ratio, ratio);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#143221";
      context.lineWidth = 2.5;
      contextRef.current = context;

      if (!value) {
        context.clearRect(0, 0, width, PAD_HEIGHT);
        return;
      }

      const image = new Image();
      image.onload = () => {
        context.clearRect(0, 0, width, PAD_HEIGHT);
        context.drawImage(image, 0, 0, width, PAD_HEIGHT);
      };
      image.src = value;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [value]);

  function getCoordinates(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const context = contextRef.current;

    if (!context) {
      return;
    }

    drawingRef.current = true;
    const point = getCoordinates(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const context = contextRef.current;

    if (!context || !drawingRef.current) {
      return;
    }

    const point = getCoordinates(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function commitSignature() {
    drawingRef.current = false;
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    onChange(canvas.toDataURL("image/png"));
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = contextRef.current;

    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className={`overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ${
          error ? "ring-rose-400/60" : "ring-black/5"
        }`}
      >
        <canvas
          ref={canvasRef}
          aria-label="Área de firma digital"
          className="block h-[180px] w-full touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={commitSignature}
          onPointerLeave={() => {
            if (drawingRef.current) {
              commitSignature();
            }
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Firma con dedo o mouse dentro del recuadro blanco.
        </p>
        <button
          type="button"
          onClick={clearSignature}
          aria-label="Borrar firma"
          className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs font-medium text-foreground transition hover:bg-muted/80"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Borrar
        </button>
      </div>
    </div>
  );
}
