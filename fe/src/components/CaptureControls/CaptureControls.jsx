import './CaptureControls.css';
import React from 'react';

export default function CaptureControls({
  mode,
  setMode,
  photoboothStyle,
  setPhotoboothStyle,
  selectedFrame,
  setSelectedFrame,
  onCapture,
}) {
  return (
    <div className="capture-controls">
      <h2>Chọn chế độ chụp</h2>

      {/* Chọn mode */}
      <div className="button-group">
        <button
          type="button"
          className={mode === 'polaroid' ? 'active' : ''}
          onClick={() => setMode('polaroid')}
        >
          Polaroid
        </button>
        <button
          type="button"
          className={mode === 'photobooth' ? 'active' : ''}
          onClick={() => setMode('photobooth')}
        >
          Photobooth
        </button>
      </div>

      {/* Nếu mode là photobooth thì chọn style */}
      {mode === 'photobooth' && (
        <>
          <h3>Kiểu ghép ảnh</h3>
          <div className="button-group">
            <button
              type="button"
              className={photoboothStyle === 'grid' ? 'active' : ''}
              onClick={() => setPhotoboothStyle('grid')}
            >
              4 ảnh ghép 2x2
            </button>
            <button
              type="button"
              className={photoboothStyle === 'vertical' ? 'active' : ''}
              onClick={() => setPhotoboothStyle('vertical')}
            >
              4 ảnh thẳng hàng dọc
            </button>
          </div>
        </>
      )}

      {/* Nếu mode là polaroid thì chọn frame */}
      {mode === 'polaroid' && (
        <>
          <h3>Chọn khung ảnh</h3>
          <div className="button-group">
            {['frame1', 'frame2', 'frame3', 'frame4'].map((frame) => (
              <button
                key={frame}
                type="button"
                className={selectedFrame === frame ? 'active' : ''}
                onClick={() => setSelectedFrame(frame)}
              >
                {`Khung ${frame.slice(-1)}`}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Nút chụp ảnh */}
      <button className="button" onClick={onCapture} type="button">
        {mode === 'polaroid' ? 'Chụp ảnh Polaroid' : 'Chụp ảnh Photobooth'}
      </button>
    </div>
  );
}
