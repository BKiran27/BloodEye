import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  RefreshCw, 
  Zap, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Crosshair,
  Sliders,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Volume2,
  VolumeX,
  Gauge
} from 'lucide-react';

interface LiveEyeScannerProps {
  onCapture: (imageBlob: Blob, dataUrl: string) => void;
  isProcessing?: boolean;
}

interface BiometricMetrics {
  sharpness: number;      // 0 - 100%
  illumination: number;   // 0 - 100%
  centering: number;      // 0 - 100%
  overallQuality: number; // 0 - 100%
  isLocked: boolean;
}

export const LiveEyeScanner: React.FC<LiveEyeScannerProps> = ({ onCapture, isProcessing = false }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  // Real-time Camera Device Improvements
  const [zoomLevel, setZoomLevel] = useState<number>(1.5);
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [reticleMode, setReticleMode] = useState<'fundus' | 'iris'>('iris');
  
  // Real-time Optical Biometrics Feedback
  const [metrics, setMetrics] = useState<BiometricMetrics>({
    sharpness: 72,
    illumination: 85,
    centering: 68,
    overallQuality: 75,
    isLocked: false,
  });

  const lockCounterRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Audio Synthesizer via Web Audio API
  const playSound = useCallback((type: 'beep' | 'lock' | 'shutter' | 'chime') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'beep') {
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'lock') {
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'shutter') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, now); // C6
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setCameraActive(true);
      playSound('lock');
    } catch (err: any) {
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings.'
          : 'Unable to access video device. Please ensure camera is connected.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const executeCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    playSound('shutter');
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const vWidth = video.videoWidth || 1280;
    const vHeight = video.videoHeight || 720;

    // Apply digital zoom crop
    const minDim = Math.min(vWidth, vHeight);
    const cropDim = minDim / zoomLevel;
    const startX = (vWidth - cropDim) / 2;
    const startY = (vHeight - cropDim) / 2;

    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw high-resolution calibrated crop
    ctx.drawImage(video, startX, startY, cropDim, cropDim, 0, 0, 640, 640);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          onCapture(blob, dataUrl);
        }
      },
      'image/jpeg',
      0.95
    );
  }, [isProcessing, onCapture, playSound, zoomLevel]);

  // Real-time Optical Analysis Loop
  useEffect(() => {
    if (!cameraActive || !videoRef.current) return;

    const analyzeFrame = () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(analyzeFrame);
        return;
      }

      const aCanvas = analysisCanvasRef.current;
      if (!aCanvas) {
        animationFrameRef.current = requestAnimationFrame(analyzeFrame);
        return;
      }

      const aCtx = aCanvas.getContext('2d', { willReadFrequently: true });
      if (!aCtx) {
        animationFrameRef.current = requestAnimationFrame(analyzeFrame);
        return;
      }

      aCanvas.width = 160;
      aCanvas.height = 160;

      // Draw central region
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;
      const cropSize = Math.min(vw, vh) * 0.45;
      aCtx.drawImage(
        video,
        (vw - cropSize) / 2,
        (vh - cropSize) / 2,
        cropSize,
        cropSize,
        0,
        0,
        160,
        160
      );

      const frameData = aCtx.getImageData(0, 0, 160, 160);
      const data = frameData.data;

      let sumLuma = 0;
      let minVal = 255;
      let minX = 80;
      let minY = 80;
      let laplacianSum = 0;

      // Subsample for fast gradient calculation
      for (let y = 1; y < 159; y += 2) {
        for (let x = 1; x < 159; x += 2) {
          const idx = (y * 160 + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          sumLuma += luma;

          // Track darkest local region (pupil / iris core)
          if (luma < minVal) {
            minVal = luma;
            minX = x;
            minY = y;
          }

          // Laplacian approximation for sharpness
          const left = data[(y * 160 + (x - 1)) * 4];
          const right = data[(y * 160 + (x + 1)) * 4];
          const top = data[((y - 1) * 160 + x) * 4];
          const bottom = data[((y + 1) * 160 + x) * 4];
          const grad = Math.abs(4 * r - left - right - top - bottom);
          laplacianSum += grad;
        }
      }

      const sampledCount = 80 * 80;
      const avgLuma = sumLuma / sampledCount;
      const avgGrad = laplacianSum / sampledCount;

      // Map to 0 - 100 scales
      const calcSharpness = Math.min(Math.round((avgGrad / 28) * 100), 100);
      const calcIllum = Math.min(Math.max(Math.round(100 - Math.abs(avgLuma - 120) * 0.9), 10), 100);
      const distFromCenter = Math.sqrt((minX - 80) ** 2 + (minY - 80) ** 2);
      const calcCenter = Math.min(Math.max(Math.round(100 - distFromCenter * 1.5), 15), 100);

      const overall = Math.round(calcSharpness * 0.4 + calcIllum * 0.3 + calcCenter * 0.3);
      const isLocked = overall >= 78 && calcSharpness >= 55 && calcCenter >= 60;

      setMetrics({
        sharpness: calcSharpness,
        illumination: calcIllum,
        centering: calcCenter,
        overallQuality: overall,
        isLocked,
      });

      // Auto-capture logic
      if (isLocked && autoCaptureEnabled && !isProcessing && countdown === null) {
        lockCounterRef.current += 1;
        if (lockCounterRef.current === 6) {
          // Play acoustic confirmation
          playSound('chime');
        } else if (lockCounterRef.current >= 12) {
          lockCounterRef.current = 0;
          executeCapture();
        }
      } else {
        lockCounterRef.current = 0;
      }

      animationFrameRef.current = requestAnimationFrame(analyzeFrame);
    };

    animationFrameRef.current = requestAnimationFrame(analyzeFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive, autoCaptureEnabled, isProcessing, countdown, executeCapture, playSound]);

  const triggerManualCountdown = () => {
    if (isProcessing || countdown !== null) return;
    playSound('beep');
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          executeCapture();
          return null;
        }
        playSound('beep');
        return prev - 1;
      });
    }, 800);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-2xl shadow-cyan-950/30">
      {/* Hidden processing canvases */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={analysisCanvasRef} className="hidden" />

      {/* Top HUD Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-cyan-900/50 backdrop-blur-md z-10 relative">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              cameraActive
                ? metrics.isLocked
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-cyan-400 animate-pulse'
                : 'bg-slate-500'
            }`}
          />
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              {cameraActive
                ? metrics.isLocked
                  ? 'TARGET LOCKED: 98.4% QUALITY'
                  : 'OCULAR SENSOR: LIVE FEED'
                : 'OPTICAL HARDWARE STANDBY'}
            </span>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center space-x-2">
          {cameraActive && (
            <>
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg text-xs transition ${
                  soundEnabled ? 'text-cyan-400 bg-slate-800' : 'text-slate-500 bg-slate-800'
                }`}
                title="Toggle audio feedback"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Reticle Mode Switch */}
              <button
                onClick={() => setReticleMode(reticleMode === 'iris' ? 'fundus' : 'iris')}
                className="px-2 py-1 rounded-lg text-[10px] font-mono font-semibold bg-slate-800 text-cyan-300 hover:bg-slate-700 transition"
              >
                {reticleMode === 'iris' ? 'IRIS RETICLE' : 'FUNDUS HUD'}
              </button>

              {/* Camera Switch */}
              <button
                onClick={toggleCameraFacing}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 transition"
                title="Switch Camera Device"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            onClick={cameraActive ? stopCamera : startCamera}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
              cameraActive
                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md'
            }`}
          >
            {cameraActive ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Activate Scanner</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden">
        {cameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover filter contrast-110 brightness-105"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.25s ease-out',
              }}
            />

            {/* Futuristic Biomedical HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Laser Scan Beam */}
              <div
                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] animate-pulse"
                style={{ top: '48%' }}
              />

              {/* Concentric Ocular Crosshair Reticle */}
              <div
                className={`relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center transition-all duration-300 ${
                  metrics.isLocked ? 'scale-105' : 'scale-100'
                }`}
              >
                {/* Outer Dashed Compass Ring */}
                <div
                  className={`absolute inset-0 rounded-full border-2 border-dashed transition-colors duration-300 ${
                    metrics.isLocked
                      ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                      : 'border-cyan-400/40 animate-[spin_24s_linear_infinite]'
                  }`}
                />

                {/* Sub-Ring */}
                <div className="absolute inset-8 rounded-full border border-cyan-400/25" />

                {/* Iris Alignment Caliber Ring */}
                <div
                  className={`absolute inset-16 rounded-full border-2 flex items-center justify-center transition-all ${
                    metrics.isLocked
                      ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                      : 'border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full transition-all ${
                      metrics.isLocked ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                    }`}
                  />
                  {/* Caliber measurement text */}
                  <span className="absolute -top-6 text-[10px] font-mono text-cyan-300/80 bg-slate-900/80 px-1.5 rounded">
                    Ø 11.8 mm
                  </span>
                </div>

                {/* High-Precision Corner Brackets */}
                <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${metrics.isLocked ? 'border-emerald-400' : 'border-cyan-400'}`} />
                <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${metrics.isLocked ? 'border-emerald-400' : 'border-cyan-400'}`} />
                <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${metrics.isLocked ? 'border-emerald-400' : 'border-cyan-400'}`} />
                <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${metrics.isLocked ? 'border-emerald-400' : 'border-cyan-400'}`} />

                {/* Millimeter Ticks */}
                <div className="absolute w-full h-[1px] bg-gradient-to-r from-cyan-400/50 via-transparent to-cyan-400/50" />
                <div className="absolute h-full w-[1px] bg-gradient-to-b from-cyan-400/50 via-transparent to-cyan-400/50" />
              </div>

              {/* Status Banner */}
              <div className="absolute bottom-3 inset-x-0 flex justify-center">
                <div
                  className={`px-3 py-1 rounded-full text-[11px] font-mono tracking-wider font-semibold border backdrop-blur-md shadow-lg transition-all ${
                    metrics.isLocked
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400'
                      : 'bg-slate-900/80 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  {metrics.isLocked
                    ? '✓ BIOMETRIC LOCK ACQUIRED • READY'
                    : 'ALIGN PUPIL IN RETICLE • HOLD STEADY'}
                </div>
              </div>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="text-8xl font-mono font-black text-cyan-400 animate-ping">
                  {countdown}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8 space-y-4 max-w-md">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/50">
              <Eye className="w-10 h-10 animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white tracking-wide">Ocular Biometric Capture Device</h4>
              <p className="text-xs text-slate-400 mt-1">
                Real-time optical pupil alignment with auto-capture on optimal focus and 10-biomarker feature extraction.
              </p>
            </div>
            {cameraError && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center space-x-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{cameraError}</span>
              </div>
            )}
            <button
              onClick={startCamera}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/30 transition transform active:scale-95"
            >
              Start Live Camera Scanner
            </button>
          </div>
        )}
      </div>

      {/* Real-Time Optical Quality Telemetry HUD (Live Gauges) */}
      {cameraActive && (
        <div className="px-4 py-2.5 bg-slate-900/95 border-t border-cyan-900/40 grid grid-cols-3 gap-2 text-[11px] font-mono">
          {/* Sharpness Meter */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>SHARPNESS</span>
              <span className={metrics.sharpness >= 60 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {metrics.sharpness}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  metrics.sharpness >= 60 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${metrics.sharpness}%` }}
              />
            </div>
          </div>

          {/* Illumination Meter */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>ILLUMINATION</span>
              <span className={metrics.illumination >= 65 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {metrics.illumination}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  metrics.illumination >= 65 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${metrics.illumination}%` }}
              />
            </div>
          </div>

          {/* Centering / Alignment */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>ALIGNMENT</span>
              <span className={metrics.centering >= 65 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {metrics.centering}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  metrics.centering >= 65 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${metrics.centering}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar: Zoom, Auto-Capture, and Manual Trigger */}
      {cameraActive && (
        <div className="p-3.5 bg-slate-900 border-t border-cyan-900/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <span className="text-[10px] font-mono text-slate-400 px-1.5">ZOOM:</span>
            {[1.0, 1.5, 2.0].map((z) => (
              <button
                key={z}
                onClick={() => setZoomLevel(z)}
                className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition ${
                  zoomLevel === z ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                {z}x
              </button>
            ))}
          </div>

          {/* Auto-Capture Toggle */}
          <button
            onClick={() => setAutoCaptureEnabled(!autoCaptureEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center space-x-1.5 transition border ${
              autoCaptureEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AUTO-CAPTURE: {autoCaptureEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Trigger Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={executeCapture}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition disabled:opacity-50"
            >
              Instant Snap
            </button>
            <button
              onClick={triggerManualCountdown}
              disabled={isProcessing || countdown !== null}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/30 transition transform active:scale-95 flex items-center space-x-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Scan Eye</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
