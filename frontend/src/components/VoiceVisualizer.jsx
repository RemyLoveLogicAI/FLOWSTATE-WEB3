import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

/**
 * Voice Visualizer - Shows audio waveform animation
 * Displays visual feedback for voice input and output
 */
export function VoiceVisualizer({ 
  isListening, 
  isSpeaking, 
  isPushToTalk,
  onToggleListening,
  onToggleSpeaking,
  onTranscript,
  onFinalTranscript,
  className = '' 
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let time = 0;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (isListening || isSpeaking) {
        // Draw animated waveform
        const centerY = height / 2;
        const amplitude = isListening ? 30 : 20;
        const frequency = 0.02;
        const numWaves = isListening ? 3 : 2;

        ctx.lineWidth = 2;

        for (let wave = 0; wave < numWaves; wave++) {
          ctx.beginPath();
          
          // Set color based on state
          const alpha = 1 - (wave * 0.3);
          if (isListening) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`; // Blue
          } else if (isSpeaking) {
            ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`; // Green
          }

          for (let x = 0; x < width; x++) {
            const y = centerY + Math.sin(x * frequency + time + wave) * amplitude * (1 + audioLevel);
            
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          ctx.stroke();
        }

        time += 0.05;
      } else {
        // Draw flat line when inactive
        ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, isSpeaking, audioLevel]);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Listening Button */}
      <button
        onClick={onToggleListening}
        className={`relative p-4 rounded-full transition-all duration-200 ${
          isListening
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-110'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
        title={isListening ? 'Stop listening' : isPushToTalk ? 'Push to talk' : 'Start listening'}
      >
        {isListening ? (
          <>
            <Mic className="w-6 h-6" />
            {!isPushToTalk && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </>
        ) : (
          <MicOff className="w-6 h-6" />
        )}
      </button>

      {/* Waveform Canvas */}
      <div className="flex-1 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={400}
          height={80}
          className="w-full h-full"
        />
      </div>

      {/* Speaking Button */}
      <button
        onClick={onToggleSpeaking}
        className={`p-4 rounded-full transition-all duration-200 ${
          isSpeaking
            ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
        title={isSpeaking ? 'Stop speaking' : 'Enable voice output'}
      >
        {isSpeaking ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
      </button>
    </div>
  );
}
