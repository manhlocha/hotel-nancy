
const express = require('express');
const Room = require('../models/room');  // Import Room model
const router = express.Router();
const { upload, uploadToCloudinary } = require('../middleware/upload'); // Import từ middleware
const connection = require('../config/database');


// Route to get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.getAll();
    res.json(rooms);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ message: 'Error fetching rooms', error: err });
  }
});

// Route to get rooms by hotel ID
router.get('/hotel/:hotelId', async (req, res) => {
  const hotelId = req.params.hotelId;
  console.log("Fetching rooms for hotel ID:", hotelId); // Log the hotelId
  try {
    const rooms = await Room.getByHotelId(hotelId);
    if (rooms.length > 0) {
      res.json(rooms);
    } else {
      res.status(404).json({ message: 'No rooms found for this hotel' });
    }
  } catch (err) {
    console.error('Error fetching rooms for hotel:', err);
    res.status(500).json({ message: 'Error fetching rooms for hotel', error: err });
  }
});


// Route to get a single room by ID
router.get('/:id', async (req, res) => {
  const roomId = req.params.id;
  try {
    const room = await Room.getById(roomId);
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ message: 'Error fetching room', error: err });
  }
});

router.post('/', upload.array('images', 10), async (req, res) => {
  const { hotel_id, room_type, price, adult_count, child_count, facilities, availability_status } = req.body;

  // Kiểm tra thông tin đầu vào
  if (!hotel_id || !room_type || !price || !adult_count || !facilities || !availability_status) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
  }

  try {
    // Kiểm tra và chuyển facilities thành mảng thực tế nếu nó là chuỗi JSON
    let facilitiesArray = facilities.split(',');
    if (facilities.startsWith('[') && facilities.endsWith(']')) {
      facilitiesArray = JSON.parse(facilities);
    }

    // Chuyển facilities thành JSON
    const facilitiesJson = JSON.stringify(facilitiesArray);

    // Tải tất cả hình ảnh lên Cloudinary
    const imageUploadPromises = req.files.map(file => uploadToCloudinary(file));
    const imageUrls = await Promise.all(imageUploadPromises);

    // Lấy URLs của các hình ảnh đã được tải lên
    const imageUrlsArray = imageUrls.map(result => result.secure_url); // Lấy URL an toàn từ Cloudinary

    // Tạo đối tượng phòng mới
    const newRoom = {
      hotel_id,
      room_type,
      price,
      adult_count,
      child_count: child_count || 0,  // Nếu không có, mặc định là 0
      facilities: facilitiesJson,
      image_urls: JSON.stringify(imageUrlsArray),  // Lưu các URLs hình ảnh dưới dạng JSON
      availability_status,
    };

    // Insert dữ liệu vào bảng rooms
    const query = 'INSERT INTO rooms SET ?';
    connection.query(query, newRoom, (err, result) => {
      if (err) {
        console.error('Lỗi khi thêm phòng:', err);
        return res.status(500).json({ message: 'Lỗi khi thêm phòng', error: err });
      }

      // Nếu thêm phòng thành công, cập nhật số lượng phòng trong bảng hotels
      const updateQuery = `
        UPDATE hotels 
        SET room = room + 1 
        WHERE hotel_id = ?
      `;
      connection.query(updateQuery, [hotel_id], (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Lỗi khi cập nhật số lượng phòng trong bảng hotels:', updateErr);
          return res.status(500).json({ message: 'Lỗi khi cập nhật số lượng phòng trong bảng hotels', error: updateErr });
        }

        res.status(201).json({
          message: 'Thêm phòng thành công và cập nhật số lượng phòng trong khách sạn!',
          room_id: result.insertId,
        });
      });
    });
  } catch (error) {
    console.error('Lỗi khi tải hình ảnh lên Cloudinary:', error);
    res.status(500).json({ message: 'Lỗi khi tải hình ảnh lên Cloudinary', error: error.message });
  }
});





// Route to update an existing room
router.put('/:id', async (req, res) => {
  const roomId = req.params.id;
  const roomData = req.body;
  try {
    const affectedRows = await Room.update(roomId, roomData);
    if (affectedRows > 0) {
      res.json({ message: 'Room updated' });
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ message: 'Error updating room', error: err });
  }
});

// Route to delete a room
router.delete('/:id', async (req, res) => {
  const roomId = req.params.id;
  try {
    const affectedRows = await Room.delete(roomId);
    if (affectedRows > 0) {
      res.json({ message: 'Room deleted' });
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ message: 'Error deleting room', error: err });
  }
});


// Route to get a single room by ID
router.get('/:hotelId/:id', async (req, res) => {
  const roomId = req.params.id; // Lấy id phòng từ URL
  try {
    const room = await Room.getById(roomId); // Gọi phương thức getById của model Room để lấy thông tin phòng
    if (room) {
      res.json(room); // Nếu tìm thấy phòng, trả về thông tin phòng dưới dạng JSON
    } else {
      res.status(404).json({ message: 'Room not found' }); // Nếu không tìm thấy phòng, trả về lỗi 404
    }
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ message: 'Error fetching room', error: err }); // Nếu có lỗi trong quá trình truy vấn, trả về lỗi 500
  }
});


module.exports = router;