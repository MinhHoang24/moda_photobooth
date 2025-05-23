const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' })); // để nhận ảnh base64

const cors = require('cors');
app.use(cors({
  origin: 'https://moda-photobooth.onrender.com/'
}));

// API nhận ảnh từ frontend và lưu file
app.post('/upload', (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'Không có ảnh gửi lên' });

  const matches = imageBase64.match(/^data:image\/png;base64,(.+)$/);
  if (!matches) return res.status(400).json({ error: 'Dữ liệu ảnh không hợp lệ' });

  const data = matches[1];
  const buffer = Buffer.from(data, 'base64');

  const filename = `photo_${Date.now()}.png`;
  const filepath = path.join(__dirname, 'uploads', filename);

  fs.writeFile(filepath, buffer, err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Lỗi lưu ảnh' });
    }
    res.json({ message: 'Đã lưu ảnh', url: `/uploads/${filename}` });
  });
});

// Phục vụ ảnh tĩnh từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = 3001;
app.listen(port, () => {
  console.log(`Server chạy trên cổng ${port}`);
});