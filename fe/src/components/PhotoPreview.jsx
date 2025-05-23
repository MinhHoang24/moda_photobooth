import React from 'react';

export default function PhotoPreview({ photo, mode }) {
  if (!photo) return <p>Chưa có ảnh nào</p>;

  return (
    <>
      <h3>Ảnh sau khi chụp</h3>
      <img src={photo} alt="Ảnh chụp" className="result-photo" />
      <a href={photo} download={`${mode}_photo.png`} className="download-link">
        Tải ảnh về
      </a>
    </>
  );
}