import React, { useRef, useState, useEffect } from 'react';
import CameraView from './components/CameraView';
import CaptureControls from './components/CaptureControls/CaptureControls';
import PhotoPreview from './components/PhotoPreview';
import Header from './components/Header/Header';
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
      polaroidCtx.fillText('Polaroid Moda Photo', newWidth / 2, newHeight - border);

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
      const borderSize = 40; // độ rộng viền trắng

      // Tính kích thước canvas tổng thể bao gồm viền trắng
      let canvasWidth, canvasHeight;
      if (style === 'grid') {
        canvasWidth = w * 2 + borderSize * 2;
        canvasHeight = h * 2 + borderSize * 2;
      } else {
        canvasWidth = w + borderSize * 2;
        canvasHeight = h * 4 + borderSize * 2;
      }

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      // Vẽ nền viền trắng
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

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
              // Vẽ từng ảnh nhỏ đã có viền lên canvas lớn (cách đều với borderSize)
              photosWithFrames.forEach((smallCvs, idx) => {
                let x, y;
                if (style === 'grid') {
                  x = borderSize + (idx % 2) * w;
                  y = borderSize + Math.floor(idx / 2) * h;
                } else {
                  x = borderSize;
                  y = borderSize + idx * h;
                }
                ctx.drawImage(smallCvs, x, y, w, h);
              });

              // Vẽ dòng chữ nhỏ ở viền trắng dưới cùng, căn giữa
              const text = 'moda photo';
              ctx.fillStyle = '#666';
              ctx.font = '18px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';

              // Vị trí chữ: nằm giữa chiều ngang, ở ngay trên mép dưới canvas (cách đáy 10px)
              ctx.fillText(text, canvasWidth / 2, canvasHeight - 10);

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
    <>
      <Header />

      <div className="container">
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
        <div className="left-side">
          <PhotoPreview photo={photo} mode={mode} />
        </div>
      </div>

      <footer className="app-footer">
        moda photobooth and polaroid
      </footer>
    </>
  );
}