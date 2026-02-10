'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface SelfieCaptureProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function SelfieCapture({ open, onClose, onCapture }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<'camera' | 'preview'>('camera');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      setError('Camera access denied. Please allow camera permissions in your browser settings and try again.');
    }
  }, []);

  // Start/stop camera when modal opens/closes
  useEffect(() => {
    if (open) {
      setMode('camera');
      setPreviewUrl(null);
      setCapturedFile(null);
      setError(null);
      startCamera();
    } else {
      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crop to center square and mirror horizontally
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setCapturedFile(file);
        setPreviewUrl(url);
        setMode('preview');
        stopCamera();
      },
      'image/jpeg',
      0.9
    );
  };

  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCapturedFile(null);
    setMode('camera');
    startCamera();
  };

  const handleSubmit = () => {
    if (capturedFile) {
      onCapture(capturedFile);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <h2 className="text-white font-bold text-lg">Face Verification</h2>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Camera / Preview area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {error ? (
          <div className="text-center px-8">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-white text-sm mb-4">{error}</p>
            <button
              type="button"
              onClick={startCamera}
              className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : mode === 'camera' ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            {/* Circular guide overlay */}
            {cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-80 sm:w-72 sm:h-96 rounded-[50%] border-2 border-dashed border-white/50" />
              </div>
            )}
            {!cameraReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera size={32} className="text-white/50 mx-auto mb-2 animate-pulse" />
                  <p className="text-white/50 text-sm">Starting camera...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <img
            src={previewUrl!}
            alt="Captured selfie"
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-black/80 px-4 py-6">
        {mode === 'camera' ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-white/60 text-xs text-center">Position your face within the circle</p>
            <button
              type="button"
              onClick={handleCapture}
              disabled={!cameraReady}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-30"
            >
              <Camera size={28} className="text-black" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={handleRetake}
              className="flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <RotateCcw size={18} />
              Retake
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors"
            >
              <Check size={18} />
              Submit
            </button>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
