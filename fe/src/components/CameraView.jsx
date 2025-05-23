import React from 'react';
import '../CameraApp.css';

export default function CameraView({ videoRef, selectedFrame }) {
  // selectedFrame có thể là chuỗi (ví dụ "frame1") hoặc đường dẫn đầy đủ ("/frames/frame1.png")
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