import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

const CheckIn = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    setCameraSupported(typeof window !== 'undefined' && 'BarcodeDetector' in window);
    return () => stopScanning();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitCode = async (ticketCode) => {
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post('/tickets/check-in', { ticketCode });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    submitCode(code.trim());
  };

  const stopScanning = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setScanning(true);

      // eslint-disable-next-line no-undef
      const detector = new BarcodeDetector({ formats: ['qr_code'] });

      const tick = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0) {
            let payload = codes[0].rawValue;
            try {
              payload = JSON.parse(payload).ticketCode || payload;
            } catch {
              // raw value wasn't JSON, use it as-is
            }
            stopScanning();
            setCode(payload);
            submitCode(payload);
            return;
          }
        } catch {
          // detection glitch, keep trying
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      setError('Could not access camera: ' + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-semibold mb-1">Check-in</h1>
      <p className="text-slate-muted mb-8">Scan a ticket's QR code, or enter its code manually.</p>

      {cameraSupported && (
        <div className="card p-4 mb-6">
          {scanning ? (
            <>
              <video ref={videoRef} className="w-full rounded-lg mb-3" muted playsInline />
              <button onClick={stopScanning} className="btn-outline w-full">
                Stop camera
              </button>
            </>
          ) : (
            <button onClick={startScanning} className="btn-primary w-full">
              Scan with camera
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleManualSubmit} className="card p-4 flex gap-2 mb-6">
        <input
          className="input-field"
          placeholder="Paste or type ticket code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button className="btn-amber whitespace-nowrap" disabled={loading}>
          {loading ? 'Checking...' : 'Check in'}
        </button>
      </form>

      {error && <p className="text-danger text-sm bg-danger/10 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {result && (
        <div
          className={`card p-5 border-l-4 ${
            result.alreadyCheckedIn ? 'border-l-amber' : 'border-l-success'
          }`}
        >
          <p className="font-display text-lg font-semibold mb-1">
            {result.alreadyCheckedIn ? 'Already checked in' : 'Attendance registered ✅'}
          </p>
          <p className="text-sm text-slate-muted">{result.data.user?.name} — {result.data.user?.email}</p>
          <p className="text-sm text-slate-muted">{result.data.event?.title}</p>
          {result.data.seatLabel && <p className="text-sm mt-1">Seat: <span className="font-mono">{result.data.seatLabel}</span></p>}
        </div>
      )}
    </div>
  );
};

export default CheckIn;
