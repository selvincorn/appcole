import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Student, AttendanceEventType, AttendanceStatus } from '../../types/database.types';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import jsQR from 'jsqr';
import { 
  Camera, 
  CameraOff, 
  ScanLine, 
  CheckCircle2, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  UserCheck, 
  RefreshCw,
  Sparkles,
  Loader2
} from 'lucide-react';

interface GateScannerViewProps {
  initialCode?: string;
  onScanComplete?: (student: Student) => void;
}

export const GateScannerView: React.FC<GateScannerViewProps> = ({
  initialCode = '',
  onScanComplete,
}) => {
  const [manualCode, setManualCode] = useState(initialCode);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [eventType, setEventType] = useState<AttendanceEventType>('IN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    student?: Student;
    message: string;
    time?: string;
  } | null>(null);
  const [detectedQR, setDetectedQR] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const isProcessingRef = useRef(false);

  // Sonido beep
  const playBeep = useCallback((type: 'success' | 'error' = 'success') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'success') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // AudioContext blocked until user interaction
    }
  }, []);

  // Procesar código
  const handleProcessScan = useCallback(async (codeToScan?: string) => {
    const code = (codeToScan || manualCode).trim().toUpperCase();
    if (!code || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    setScanResult(null);
    setDetectedQR(null);

    try {
      const currentHour = new Date().getHours();
      const currentMin = new Date().getMinutes();
      const isLate = eventType === 'IN' && (currentHour > 7 || (currentHour === 7 && currentMin > 30));
      const status: AttendanceStatus = isLate ? 'LATE' : 'ON_TIME';
      const notes = isLate
        ? `Ingreso con retraso (${new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })})`
        : eventType === 'IN' ? 'Ingreso puntual por garita' : 'Salida normal registrada';

      const res = await api.recordAttendanceScan({
        studentCode: code,
        eventType,
        status,
        notes,
        scannedBy: 'p-staff-001',
        deviceInfo: 'Garita Principal (Lector Móvil)',
      });

      if (res.success && res.student) {
        playBeep('success');
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
        const timeStr = new Date().toLocaleTimeString('es-GT', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        setScanResult({
          success: true,
          student: res.student,
          message: `${eventType === 'IN' ? 'INGRESO' : 'SALIDA'} REGISTRADO EXITOSAMENTE`,
          time: timeStr,
        });
        if (onScanComplete) onScanComplete(res.student);
      } else {
        playBeep('error');
        setScanResult({ success: false, message: res.error || 'Carnet no reconocido' });
      }
    } catch (e: any) {
      playBeep('error');
      setScanResult({ success: false, message: e.message || 'Error al procesar el código' });
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  }, [eventType, manualCode, onScanComplete, playBeep]);

  // Bucle de escaneo con setInterval (más estable en móvil que rAF)
  const startScanLoop = useCallback(() => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) return;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;
      if (isProcessingRef.current) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Limitar resolución a 640px para mejor rendimiento en móvil
      const MAX_SIZE = 640;
      const scale = Math.min(1, MAX_SIZE / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.floor(video.videoWidth * scale);
      canvas.height = Math.floor(video.videoHeight * scale);

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        const now = Date.now();
        if (now - lastScannedTimeRef.current > 3500) {
          lastScannedTimeRef.current = now;
          setDetectedQR(code.data);
          setManualCode(code.data);
          handleProcessScan(code.data);
        }
      }
    }, 250); // escanear cada 250ms
  }, [handleProcessScan]);

  const stopScanLoop = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);

  // Cuando el video está listo → iniciar loop
  const handleVideoReady = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(console.error);
    setIsVideoReady(true);
    startScanLoop();
  }, [startScanLoop]);

  // Iniciar cámara
  const startCamera = async () => {
    setCameraError(null);
    setIsVideoReady(false);
    setScanResult(null);
    try {
      // Primero intentar cámara trasera (móvil), luego cualquier cámara
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Permiso de cámara denegado. Ve a Ajustes del navegador → Permisos → Cámara → Permitir.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No se encontró ninguna cámara en este dispositivo.');
      } else {
        setCameraError(`Error al acceder a la cámara: ${err.message}`);
      }
      setIsCameraActive(false);
    }
  };

  const stopCamera = useCallback(() => {
    stopScanLoop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsVideoReady(false);
    setDetectedQR(null);
  }, [stopScanLoop]);

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  return (
    <div className="space-y-4">
      {/* Canvas invisible para decodificación */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Selector Entrada / Salida */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft flex gap-2">
        <button
          type="button"
          onClick={() => setEventType('IN')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
            eventType === 'IN'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Registrar ENTRADA</span>
        </button>
        <button
          type="button"
          onClick={() => setEventType('OUT')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
            eventType === 'OUT'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Registrar SALIDA</span>
        </button>
      </div>

      {/* Visor de Cámara */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 aspect-[4/3] flex items-center justify-center border-2 border-slate-800 shadow-xl">
        {/* Video siempre en DOM para que el evento onLoadedMetadata funcione */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleVideoReady}
          onCanPlay={handleVideoReady}
          className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
        />

        {isCameraActive ? (
          <>
            {/* Overlay de escaneo */}
            {isVideoReady && (
              <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                <div className="relative w-52 h-52 sm:w-56 sm:h-56">
                  {/* Borde con animación */}
                  <div className={`absolute inset-0 rounded-2xl border-2 transition-colors duration-300 ${
                    detectedQR ? 'border-emerald-400 shadow-lg shadow-emerald-400/30' : 'border-brand-400/80'
                  }`} />
                  {/* Esquinas */}
                  <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />
                  {/* Línea láser */}
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-red-500 via-brand-400 to-red-500 shadow-md animate-laser" />
                </div>
              </div>
            )}

            {/* Estado de carga del video */}
            {!isVideoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Iniciando cámara...</p>
                </div>
              </div>
            )}

            {/* Badge activo */}
            {isVideoReady && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5 z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Escaneando QR...</span>
              </div>
            )}

            {/* Botón apagar */}
            <button
              onClick={stopCamera}
              className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-900 backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-colors z-20"
            >
              <CameraOff className="w-4 h-4" />
              <span>Apagar</span>
            </button>
          </>
        ) : (
          <div className="text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-brand-950/80 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto shadow-inner">
              <ScanLine className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Escáner Óptico de Carnet QR</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Apunta la cámara trasera al código QR del carnet para detección automática.
              </p>
            </div>
            <button
              onClick={startCamera}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Activar Cámara</span>
            </button>
            {cameraError && (
              <div className="mt-2 px-3 py-2 rounded-xl bg-rose-950/60 border border-rose-700 text-rose-300 text-xs text-left">
                <p className="font-bold mb-1">⚠️ Error de cámara</p>
                <p>{cameraError}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Entrada Manual */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ScanLine className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Entrada Manual / Lector USB</span>
          </label>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Enter para registrar</span>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); handleProcessScan(); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Ej: ALU-2026-001"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 uppercase tracking-wider"
          />
          <button
            type="submit"
            disabled={isProcessing || !manualCode.trim()}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            <span>Registrar</span>
          </button>
        </form>

        {/* Botones de prueba rápida */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Prueba Rápida:</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { code: 'ALU-2026-001', name: 'Mateo Morales', img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=60&h=60&fit=crop&crop=faces' },
              { code: 'ALU-2026-002', name: 'Sofía Morales', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=faces' },
            ].map(({ code, name, img }) => (
              <button
                key={code}
                type="button"
                disabled={isProcessing}
                onClick={() => { setManualCode(code); handleProcessScan(code); }}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-left transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <img src={img} alt={name} className="w-7 h-7 rounded-full object-cover" />
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{name}</p>
                  <p className="text-[10px] font-mono text-brand-600 dark:text-brand-400">{code}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultado del escaneo */}
      {scanResult && (
        <div
          className={`p-5 rounded-3xl border transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            scanResult.success
              ? 'bg-emerald-50/90 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100'
          }`}
        >
          <div className="flex items-start gap-3.5">
            {scanResult.success ? (
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <AlertCircle className="w-6 h-6" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold tracking-wide uppercase">{scanResult.message}</p>
              {scanResult.student && (
                <div className="mt-3 flex items-center gap-3 bg-white/80 dark:bg-slate-900/90 p-3 rounded-2xl border border-emerald-200/80 dark:border-emerald-700/60">
                  <img
                    src={scanResult.student.photo_url || ''}
                    alt={scanResult.student.first_name}
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-300 dark:border-emerald-600"
                  />
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {scanResult.student.first_name} {scanResult.student.last_name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {scanResult.student.grade_level} · Sec. {scanResult.student.section}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
                      Hora: {scanResult.time}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
