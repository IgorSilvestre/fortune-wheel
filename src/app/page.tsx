'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import fpPromise from '@fingerprintjs/fingerprintjs';
import { getWheelOptions, saveResult } from '@/app/actions';

export default function Home() {
  const [options, setOptions] = useState<{ id: number; text: string }[]>([]);
  const [name, setName] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [error, setError] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentRotationRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  const drawWheel = (rotation: number, opts: { id: number; text: string }[] = options) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const center = { x: width / 2, y: height / 2 };
    const radius = Math.min(width, height) / 2 - 10;

    ctx.clearRect(0, 0, width, height);

    if (opts.length === 0) {
      // Draw empty wheel
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#f3f4f6'; // tailwind gray-100
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#d1d5db'; // tailwind gray-300
      ctx.stroke();

      ctx.fillStyle = '#6b7280'; // tailwind gray-500
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No options added yet', center.x, center.y);
      return;
    }

    const sliceAngle = (2 * Math.PI) / opts.length;
    const startOffset = -Math.PI / 2;
    const colors = ['#dc2626', '#f87171', '#ef4444', '#b91c1c', '#fca5a5'];

    opts.forEach((opt, index) => {
      const startAngle = rotation + startOffset + index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.arc(center.x, center.y, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(opt.text, radius - 20, 5);
      ctx.restore();
    });

    // Draw center dot
    ctx.beginPath();
    ctx.arc(center.x, center.y, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  };

  useEffect(() => {
    let active = true;
    const loadOptions = async () => {
      const data = await getWheelOptions();
      if (!active) return;
      setOptions(data);
      drawWheel(currentRotationRef.current, data);
    };

    loadOptions();

    // Cleanup animation on unmount
    return () => {
      active = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSpin = async () => {
    if (options.length === 0) {
      setError('Please add some options first!');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name to spin!');
      return;
    }
    if (isSpinning) return;

    setError('');
    setWinner(null);
    setIsSpinning(true);

    const fp = await fpPromise.load();
    const result = await fp.get();
    const visitorId = result.visitorId;

    // determine winner index
    const targetIndex = Math.floor(Math.random() * options.length);
    const sliceAngle = (2 * Math.PI) / options.length;

    // We want to stop such that targetIndex is at the top.
    // The top is where the angle is 0 relative to the start of slice 0 drawing.
    // Since we start drawing slice 0 at rotation angle.
    // Top of wheel slice index falls into top pointer when:
    // rotation + index * sliceAngle + sliceAngle/2 = 0 (mod 2PI)
    // Actually we want rotation = 2PI - (index * sliceAngle + randomOffset within slice)

    const randomOffsetInSlice = (Math.random() * 0.8 + 0.1) * sliceAngle; // avoid exact edges
    const targetAngleForTop = (2 * Math.PI) - (targetIndex * sliceAngle + randomOffsetInSlice);

    // add full spins
    const fullSpins = 5 + Math.floor(Math.random() * 5); // 5 to 9 full spins
    const finalRotation = targetAngleForTop + (fullSpins * 2 * Math.PI);

    const duration = 5000; // 5 seconds
    const startRotation = currentRotationRef.current % (2 * Math.PI); // normalize start
    currentRotationRef.current = startRotation; // reset current rotation to normalized
    const targetRotation = startRotation + finalRotation;

    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: easeOutQuart
      const easeOut = 1 - Math.pow(1 - progress, 4);

      currentRotationRef.current = startRotation + (targetRotation - startRotation) * easeOut;
      drawWheel(currentRotationRef.current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winningOption = options[targetIndex].text;
        setWinner(winningOption);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        saveResult(visitorId, name.trim(), winningOption);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center py-8">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 mb-8 text-center drop-shadow-sm">
        Spin to Win!
      </h1>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 mb-10 transform transition-all hover:scale-[1.01]">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter your name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSpinning}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-shadow"
            placeholder="John Doe"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4 font-medium animate-pulse">{error}</p>}
        <button
          onClick={handleSpin}
          disabled={isSpinning || options.length === 0}
          className={`w-full py-4 rounded-lg font-bold text-lg uppercase tracking-wider text-white transition-all shadow-lg
            ${isSpinning || options.length === 0
              ? 'bg-gray-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 hover:shadow-red-500/30 transform hover:-translate-y-1'
            }`}
        >
          {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
        </button>
      </div>

      <div className="relative">
        {/* Pointer (fixed at the top) */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"></div>

        {/* Wheel container with shadow */}
        <div className="rounded-full shadow-2xl bg-white p-2">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="max-w-full rounded-full"
          />
        </div>
      </div>

      {winner && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-black/60 absolute inset-0 backdrop-blur-sm transition-opacity"></div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl relative z-10 text-center animate-bounce pointer-events-auto border-4 border-red-500">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🎉 We have a winner! 🎉</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Congratulations <span className="font-bold text-red-600">{name}</span>, you won:
            </p>
            <div className="mt-6 text-5xl font-extrabold text-red-600 drop-shadow-md">
              {winner}
            </div>
            <button
              onClick={() => setWinner(null)}
              className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-colors"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
