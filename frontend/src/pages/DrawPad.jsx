'use client';

import { useRef, useEffect, useState } from 'react';
import styles from './DrawPad.module.css';

function DrawPad({ onSend, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = 2;
    context.lineCap = 'round';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    context.beginPath();
    context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    context.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSend = () => {
    const canvas = canvasRef.current;
    const drawingData = canvas.toDataURL();
    onSend(drawingData);
  };

  return (
    <div className={styles.drawPadContainer}>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        className={styles.canvas}
      />
      <div className={styles.buttonContainer}>
        <button onClick={handleSend} className={styles.sendButton}>Senden</button>
        <button onClick={onClose} className={styles.closeButton}>Schließen</button>
      </div>
    </div>
  );
}

export default DrawPad;
