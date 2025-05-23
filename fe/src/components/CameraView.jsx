import React from 'react';
import '../CameraApp.css';

export default function CameraView({ videoRef, selectedFrame }) {
  const frameSrc = typeof selectedFrame === 'string' && selectedFrame.startsWith('frame')
    ? `/frames/hyeri/${selectedFrame}.png`
    : selectedFrame;

  return (
    <div className="video-wrapper">
      <video ref={videoRef} autoPlay playsInline muted />
      <img
        src={frameSrc}
        alt="Khung ảnh"
        className="frame-overlay"
        draggable={false}
      />
    </div>
  );
}