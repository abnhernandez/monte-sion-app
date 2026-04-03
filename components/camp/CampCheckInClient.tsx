"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Camera, CameraOff, QrCode, RefreshCcw } from "lucide-react";
import { performCampCheckIn, type CampCheckInResponse } from "@/lib/camp-actions";

type CheckInState =
  | { tone: "neutral"; message: string }
  | { tone: "success"; message: string }
  | { tone: "warning"; message: string }
  | { tone: "danger"; message: string };

function getToneClasses(tone: CheckInState["tone"]) {
  if (tone === "success") {
    return "border-emerald-400/25 bg-emerald-500/10 text-emerald-100";
  }

  if (tone === "warning") {
    return "border-amber-400/25 bg-amber-500/10 text-amber-100";
  }

  if (tone === "danger") {
    return "border-rose-400/25 bg-rose-500/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.03] text-white/70";
}

export default function CampCheckInClient() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const intervalRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const lastScanRef = useRef<{ value: string; at: number }>({
    value: "",
    at: 0,
  });

  const [manualValue, setManualValue] = useState("");
  const [scannerReady, setScannerReady] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CampCheckInResponse | null>(null);
  const [state, setState] = useState<CheckInState>({
    tone: "neutral",
    message: "Listo para escanear. Si tu navegador no soporta QR, usa el modo manual.",
  });

  function stopCamera() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    detectorRef.current = null;
    setCameraEnabled(false);
    setScannerReady(false);
  }

  async function initializeCamera() {
    stopCamera();

    if (!navigator.mediaDevices?.getUserMedia) {
      setState({
        tone: "warning",
        message: "Este navegador no permite acceso a cámara. Usa el ticket manual.",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraEnabled(true);

      if ("BarcodeDetector" in window) {
        detectorRef.current = new window.BarcodeDetector({
          formats: ["qr_code"],
        });
        intervalRef.current = window.setInterval(() => {
          void scanFrame();
        }, 950);
        setScannerReady(true);
        setState({
          tone: "neutral",
          message: "Cámara activa. Apunta al QR del ticket.",
        });
      } else {
        setScannerReady(false);
        setState({
          tone: "warning",
          message:
            "La cámara está activa, pero este navegador no soporta detección QR. Usa el modo manual.",
        });
      }
    } catch {
      setCameraEnabled(false);
      setScannerReady(false);
      setState({
        tone: "danger",
        message:
          "No se pudo iniciar la cámara. Revisa permisos y usa el ingreso manual si hace falta.",
      });
    }
  }

  const startCameraOnMount = useEffectEvent(async () => {
    await initializeCamera();
  });

  useEffect(() => {
    void startCameraOnMount();

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      detectorRef.current = null;
    };
  }, []);

  async function scanFrame() {
    if (
      busyRef.current ||
      !detectorRef.current ||
      !videoRef.current ||
      videoRef.current.readyState < 2
    ) {
      return;
    }

    const detections = await detectorRef.current.detect(videoRef.current);
    const rawValue = detections.find((item) => item.rawValue)?.rawValue;

    if (!rawValue) {
      return;
    }

    const now = Date.now();

    if (
      lastScanRef.current.value === rawValue &&
      now - lastScanRef.current.at < 4500
    ) {
      return;
    }

    lastScanRef.current = { value: rawValue, at: now };
    await submitCheckIn({ qrPayload: rawValue });
  }

  async function submitCheckIn(payload: { qrPayload?: string; ticketId?: string }) {
    if (submitting) {
      return;
    }

    try {
      busyRef.current = true;
      setSubmitting(true);
      const json = await performCampCheckIn(payload);

      if (!json.success) {
        setResult(null);
        setState({
          tone: "danger",
          message: json.message,
        });
        return;
      }

      setResult(json);
      setState({
        tone: json.alreadyCheckedIn ? "warning" : "success",
        message: json.message,
      });
      setManualValue("");
    } finally {
      setSubmitting(false);
      busyRef.current = false;
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d9b65d]">
              Escaneo QR
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Check-in en tiempo real
            </h2>
          </div>
          <button
            type="button"
            onClick={() => void initializeCamera()}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
          >
            <RefreshCcw className="h-4 w-4" />
            Reiniciar cámara
          </button>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30">
          <video
            ref={videoRef}
            muted
            playsInline
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <div
          className={`rounded-[1.5rem] border px-4 py-3 text-sm ${getToneClasses(
            state.tone
          )}`}
        >
          {state.message}
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-white/65">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
            {cameraEnabled ? (
              <Camera className="h-4 w-4 text-[#d9b65d]" />
            ) : (
              <CameraOff className="h-4 w-4 text-white/45" />
            )}
            {cameraEnabled ? "Cámara activa" : "Cámara inactiva"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
            <QrCode className="h-4 w-4 text-[#d9b65d]" />
            {scannerReady ? "Detección QR lista" : "Usa captura manual"}
          </span>
        </div>
      </section>

      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d9b65d]">
            Modo manual
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Ticket o enlace del QR
          </h2>
        </div>

        <div className="space-y-3">
          <input
            value={manualValue}
            onChange={(event) => setManualValue(event.target.value)}
            placeholder="CMS26-ABC123... o pega la URL del ticket"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#d9b65d]/50"
          />
          <button
            type="button"
            onClick={() => void submitCheckIn({ ticketId: manualValue })}
            disabled={!manualValue.trim() || submitting}
            className="w-full rounded-full bg-[#d9b65d] px-5 py-3 text-sm font-semibold text-[#102116] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {submitting ? "Validando..." : "Registrar acceso"}
          </button>
        </div>

    {result?.success ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-[#08120c] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d9b65d]">
              Último resultado
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {result.registration.attendeeName}
            </h3>
            <div className="mt-4 grid gap-3 text-sm text-white/70">
              <p>Ticket: {result.registration.ticketId}</p>
              <p>
                Estado:{" "}
                {result.alreadyCheckedIn ? "Ya registrado previamente" : "Check-in exitoso"}
              </p>
              <p>Rol: {result.registration.campRole}</p>
              <p>
                Hora: {result.registration.checkedInAt ?? "Registrado en este momento"}
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
