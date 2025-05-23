import React, { useRef, useState, useEffect } from 'react';
import CameraView from './components/CameraView';
import CaptureControls from './components/CaptureControls';
import PhotoPreview from './components/PhotoPreview';
import './CameraApp.css';

export default function App() {
  const videoRef = useRef(null);
  const [mode, setMode] = useState('polaroid'); // polaroid hoặc photobooth
  const [photoboothStyle, setPhotoboothStyle] = useState('grid'); // grid hoặc vertical
  const [selectedFrame, setSelectedFrame] = useState('frame1'); // Khung chọn polaroid
  const [frameIndex, setFrameIndex] = useState(0); // Khung cho photobooth (4 khung khác nhau)
  const [photos, setPhotos] = useState([]); // Ảnh chụp photobooth từng lần
  const [photo, setPhoto] = useState(null); // Ảnh hiện tại (polaroid hoặc photobooth ghép)
  const [message, setMessage] = useState('');

  const frameImages = [
    '/frames/hyeri/frame1.png',
    '/frames/hyeri/frame2.png',
    '/frames/hyeri/frame3.png',
    '/frames/hyeri/frame4.png',
  ];

  // Khởi động camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Lỗi truy cập camera:', err);
        setMessage('Không thể truy cập camera');
      }
    }
    startCamera();
  }, []);

  // Hàm chụp ảnh Polaroid với khung chọn
  function takePolaroid() {
    const video = videoRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const frameSrc = `/frames/hyeri/${selectedFrame}.png`;
    const frameImage = new Image();

    frameImage.onload = () => {
      const border = 30;
      const newWidth = width + border * 2;
      const newHeight = height + border * 3;

      const polaroidCanvas = document.createElement('canvas');
      polaroidCanvas.width = newWidth;
      polaroidCanvas.height = newHeight;
      const polaroidCtx = polaroidCanvas.getContext('2d');

      polaroidCtx.fillStyle = 'white';
      polaroidCtx.fillRect(0, 0, newWidth, newHeight);

      polaroidCtx.drawImage(canvas, border, border, width, height);
      polaroidCtx.drawImage(frameImage, border, border, width, height);

      polaroidCtx.fillStyle = '#333';
      polaroidCtx.font = '20px Arial';
      polaroidCtx.textAlign = 'center';
      polaroidCtx.fillText('Polaroid Photo', newWidth / 2, newHeight - border);

      const dataURL = polaroidCanvas.toDataURL('image/png');
      setPhoto(dataURL);
      setMessage('Đã chụp ảnh Polaroid');
    };

    frameImage.onerror = () => {
      setMessage('Không tải được khung ảnh Polaroid.');
    };

    frameImage.src = frameSrc;
  }


  // Hàm ghép ảnh photobooth
  function mergePhotos(photoArray, w, h, style) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (style === 'grid') {
        canvas.width = w * 2;
        canvas.height = h * 2;
      } else {
        canvas.width = w;
        canvas.height = h * 4;
      }

      const frames = frameImages;

      let loadedCount = 0;
      const photosWithFrames = [];

      frames.forEach((frameSrc, index) => {
        const frameImage = new Image();
        frameImage.src = frameSrc;

        frameImage.onload = () => {
          const img = new Image();
          img.onload = () => {
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = w;
            smallCanvas.height = h;
            const smallCtx = smallCanvas.getContext('2d');

            smallCtx.drawImage(img, 0, 0, w, h);
            smallCtx.drawImage(frameImage, 0, 0, w, h);

            photosWithFrames[index] = smallCanvas;
            loadedCount++;

            if (loadedCount === photoArray.length) {
              photosWithFrames.forEach((smallCvs, idx) => {
                if (style === 'grid') {
                  const x = (idx % 2) * w;
                  const y = Math.floor(idx / 2) * h;
                  ctx.drawImage(smallCvs, x, y, w, h);
                } else {
                  ctx.drawImage(smallCvs, 0, idx * h, w, h);
                }
              });
              resolve(canvas.toDataURL('image/png'));
            }
          };
          img.src = photoArray[index];
        };

        frameImage.onerror = () => {
          console.error(`Không tải được khung ảnh ${frameSrc}`);
          resolve(null);
        };
      });
    });
  }

  // Hàm chụp ảnh Photobooth
  async function takePhotobooth() {
    const video = videoRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const dataURL = canvas.toDataURL('image/png');
    const newPhotos = [...photos, dataURL];
    setPhotos(newPhotos);

    if (newPhotos.length === 4) {
      setMessage('Đang ghép ảnh với khung...');
      const merged = await mergePhotos(newPhotos, width, height, photoboothStyle);
      if (merged) {
        setPhoto(merged);
        setMessage('Đã ghép ảnh photobooth với khung!');
      } else {
        setMessage('Lỗi khi tải khung ảnh.');
      }
      setPhotos([]);
      setFrameIndex(0);
    } else {
      setMessage(`Đã chụp ${newPhotos.length}/4 ảnh photobooth`);
      setFrameIndex((prev) => (prev + 1) % frameImages.length);
    }
  }

  function onCapture() {
    if (mode === 'polaroid') {
      takePolaroid();
    } else {
      takePhotobooth();
    }
  }

  return (
    <div className="container">
      <div className="left-side">
        <PhotoPreview photo={photo} mode={mode} />
      </div>
      <div className="right-side">
        <CaptureControls
          mode={mode}
          setMode={setMode}
          photoboothStyle={photoboothStyle}
          setPhotoboothStyle={setPhotoboothStyle}
          selectedFrame={selectedFrame}
          setSelectedFrame={setSelectedFrame}
          onCapture={onCapture}
        />
        <CameraView videoRef={videoRef} selectedFrame={mode === 'polaroid' ? selectedFrame : frameImages[frameIndex]} />
        <p className="message">{message}</p>
      </div>
    </div>
  );
}