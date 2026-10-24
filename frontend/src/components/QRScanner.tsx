import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, CameraOff, AlertTriangle, RefreshCw, EyeOff } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (token: string) => Promise<void> | void;
  isProcessing?: boolean;
}

type CameraState = 'idle' | 'requesting' | 'scanning' | 'permission_denied' | 'no_camera' | 'error';

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, isProcessing = false }) => {
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'clubpulse-qr-reader';
  const isStoppingRef = useRef<boolean>(false);
  const lastScanTimeRef = useRef<number>(0);

  const stopScanner = useCallback(async () => {
    if (isStoppingRef.current) return;
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        isStoppingRef.current = true;
        const state = scanner.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scanner.stop();
        }
        scanner.clear();
      } catch (err) {
        console.warn('Error while stopping QR scanner:', err);
      } finally {
        scannerRef.current = null;
        isStoppingRef.current = false;
        setCameraState('idle');
      }
    } else {
      setCameraState('idle');
    }
  }, []);

  const startScanner = useCallback(async () => {
    setErrorMessage(null);
    setCameraState('requesting');

    try {
      // Check for available cameras
      let cameras;
      try {
        cameras = await Html5Qrcode.getCameras();
      } catch (camErr: any) {
        const errorName = camErr?.name || '';
        const errorStr = (camErr?.message || camErr?.toString() || '').toLowerCase();
        if (errorName === 'NotAllowedError' || errorStr.includes('permission') || errorStr.includes('denied')) {
          setCameraState('permission_denied');
          setErrorMessage('Camera access was denied by your browser. Please allow camera permissions in your browser address bar/settings, or use manual token entry.');
          return;
        }
        if (errorName === 'NotFoundError' || errorStr.includes('devicesnotfound') || errorStr.includes('no camera')) {
          setCameraState('no_camera');
          setErrorMessage('No camera hardware was detected on this device. Please use the manual token entry fallback below.');
          return;
        }
        throw camErr;
      }

      if (!cameras || cameras.length === 0) {
        setCameraState('no_camera');
        setErrorMessage('No camera hardware found on this device. Please use the manual token entry fallback below.');
        return;
      }

      // Stop previous instance if exists
      if (scannerRef.current) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode(containerId, /* verbose= */ false);
      scannerRef.current = html5QrCode;

      // Prefer back camera ("environment"), fallback to available camera
      const cameraConfig = { facingMode: 'environment' };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        async (decodedText: string) => {
          // Debounce rapid continuous scans (wait at least 2 seconds between scans)
          const now = Date.now();
          if (now - lastScanTimeRef.current < 2000 || isProcessing) {
            return;
          }
          lastScanTimeRef.current = now;

          try {
            await onScanSuccess(decodedText.trim());
          } catch (err) {
            console.error('Scan success handler error:', err);
          }
        },
        () => {
          // Continuous frame scan miss - no-op
        }
      );

      setCameraState('scanning');
    } catch (err: any) {
      const errorName = err?.name || '';
      const errorStr = (err?.message || err?.toString() || '').toLowerCase();

      if (errorName === 'NotAllowedError' || errorStr.includes('permission') || errorStr.includes('denied')) {
        setCameraState('permission_denied');
        setErrorMessage('Camera permission denied. Please grant camera access in your browser to scan QR codes, or enter token manually.');
      } else if (errorName === 'NotFoundError' || errorStr.includes('not found') || errorStr.includes('devicesnotfound')) {
        setCameraState('no_camera');
        setErrorMessage('No camera found on this device. Please use the manual token entry fallback below.');
      } else if (errorName === 'NotReadableError' || errorStr.includes('in use')) {
        setCameraState('error');
        setErrorMessage('Camera is currently in use by another application. Please free the camera or use manual token entry.');
      } else {
        setCameraState('error');
        setErrorMessage(err?.message || 'Failed to start camera scanner. Use manual token entry below.');
      }

      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch {
          // ignore
        }
        scannerRef.current = null;
      }
    }
  }, [onScanSuccess, isProcessing, stopScanner]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
      {/* Scanner Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600 }}>
          <Camera size={16} color="var(--brand-400)" />
          <span>Camera Scanner</span>
        </div>

        {cameraState === 'scanning' ? (
          <button
            type="button"
            onClick={stopScanner}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <CameraOff size={13} />
            <span>Stop Camera</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startScanner}
            disabled={cameraState === 'requesting' || isProcessing}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {cameraState === 'requesting' ? (
              <>
                <RefreshCw size={13} className="spin" />
                <span>Requesting...</span>
              </>
            ) : (
              <>
                <Camera size={13} />
                <span>{cameraState === 'permission_denied' || cameraState === 'error' ? 'Retry Camera' : 'Start Camera'}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Camera Viewport Area */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          minHeight: cameraState === 'scanning' ? '280px' : '150px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: cameraState === 'scanning' ? '0.5rem' : '1.5rem',
        }}
      >
        {/* html5-qrcode target container */}
        <div
          id={containerId}
          style={{
            width: '100%',
            maxWidth: '380px',
            display: cameraState === 'scanning' ? 'block' : 'none',
          }}
        />

        {/* Idle State Prompt */}
        {cameraState === 'idle' && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <Camera size={34} style={{ opacity: 0.4, margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Camera Scanner Ready</div>
            <p style={{ fontSize: '0.76rem', margin: '0.25rem 0 0.85rem 0' }}>
              Click &quot;Start Camera&quot; to begin scanning attendee pass or dynamic event QR codes.
            </p>
            <button
              type="button"
              onClick={startScanner}
              disabled={isProcessing}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.785rem' }}
            >
              Open Camera
            </button>
          </div>
        )}

        {/* Requesting State */}
        {cameraState === 'requesting' && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin" style={{ margin: '0 auto 0.5rem auto', color: 'var(--brand-400)' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Accessing Camera...</div>
            <p style={{ fontSize: '0.75rem', margin: '0.2rem 0 0 0' }}>
              Please allow browser camera permissions when prompted.
            </p>
          </div>
        )}

        {/* Permission Denied Banner */}
        {cameraState === 'permission_denied' && (
          <div style={{ textAlign: 'center', padding: '0.5rem' }}>
            <AlertTriangle size={30} color="#f59e0b" style={{ margin: '0 auto 0.4rem auto' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
              Camera Permission Denied
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.35rem 0 0.75rem 0', lineHeight: 1.4 }}>
              {errorMessage || 'Camera access was blocked. Please enable camera access in browser site settings, or use manual token entry.'}
            </p>
            <button
              type="button"
              onClick={startScanner}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Retry Permission
            </button>
          </div>
        )}

        {/* No Camera Detected Banner */}
        {cameraState === 'no_camera' && (
          <div style={{ textAlign: 'center', padding: '0.5rem' }}>
            <EyeOff size={30} color="var(--text-dim)" style={{ margin: '0 auto 0.4rem auto' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
              No Camera Detected
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
              {errorMessage || 'No camera hardware found on this device. Please use the manual token entry fallback below.'}
            </p>
          </div>
        )}

        {/* General Error Banner */}
        {cameraState === 'error' && (
          <div style={{ textAlign: 'center', padding: '0.5rem' }}>
            <AlertTriangle size={30} color="#ef4444" style={{ margin: '0 auto 0.4rem auto' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>
              Camera Error
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.35rem 0 0.75rem 0', lineHeight: 1.4 }}>
              {errorMessage || 'Unable to start camera stream. Use manual token entry fallback.'}
            </p>
            <button
              type="button"
              onClick={startScanner}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              zIndex: 10,
              backdropFilter: 'blur(2px)',
            }}
          >
            <RefreshCw size={24} className="spin" color="var(--brand-400)" />
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Verifying Attendance with Server...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
