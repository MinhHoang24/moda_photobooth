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
    <div>
      <h2>Polaroid or Photobooth</h2>
      <div className="mode-select">
        <label>
          <input
            type="radio"
            name="mode"
            value="polaroid"
            checked={mode === 'polaroid'}
            onChange={() => setMode('polaroid')}
          />
          Polaroid
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="photobooth"
            checked={mode === 'photobooth'}
            onChange={() => setMode('photobooth')}
          />
          Photobooth
        </label>
      </div>

      {mode === 'photobooth' && (
        <div className="style-select">
          <label>
            <input
              type="radio"
              name="style"
              value="grid"
              checked={photoboothStyle === 'grid'}
              onChange={() => setPhotoboothStyle('grid')}
            />
            4 ảnh ghép 2x2
          </label>
          <label>
            <input
              type="radio"
              name="style"
              value="vertical"
              checked={photoboothStyle === 'vertical'}
              onChange={() => setPhotoboothStyle('vertical')}
            />
            4 ảnh thẳng hàng dọc
          </label>
        </div>
      )}

      {mode === 'polaroid' && (
        <div className="frame-select">
          {['frame1', 'frame2', 'frame3', 'frame4'].map((frame) => (
            <label key={frame}>
              <input
                type="radio"
                name="frame"
                value={frame}
                checked={selectedFrame === frame}
                onChange={() => setSelectedFrame(frame)}
              />
              {`Khung ${frame.slice(-1)}`}
            </label>
          ))}
        </div>
      )}

      <button className="button" onClick={onCapture}>
        {mode === 'polaroid' ? 'Chụp ảnh Polaroid' : 'Chụp ảnh Photobooth'}
      </button>
    </div>
  );
}