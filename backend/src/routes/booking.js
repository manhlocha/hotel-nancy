const express = require('express');
const Booking = require('../models/booking'); // Import Booking model
const router = express.Router();
const connection = require('../config/database'); // Import database connection

// Route to get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.getAll();
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Error fetching bookings', error: err });
  }
});
// Route to get a single booking by ID
router.get('/:id', async (req, res) => {
  const bookingId = req.params.id;
  try {
    const booking = await Booking.getById(bookingId);
    if (booking) {
      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ message: 'Error fetching booking', error: err });
  }
});
// Route to get bookings by hotel ID
router.get('/hotel/:hotelId', async (req, res) => {
  const hotelId = req.params.hotelId;

  // Kiểm tra xem hotelId có hợp lệ không (ví dụ: là một số)
  if (!hotelId || isNaN(hotelId)) {
    return res.status(400).json({ message: 'Invalid hotel ID provided' });
  }

  // SQL query để lấy bookings của khách sạn theo hotelId
  const query = 'SELECT * FROM bookings WHERE hotel_id = ?';

  try {
    // Thực hiện truy vấn SQL
    connection.execute(query, [hotelId], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ message: 'Error fetching bookings for hotel', error: err.message });
      }

      // Kiểm tra nếu không có booking nào
      if (results.length === 0) {
        return res.status(404).json({ message: 'No bookings found for this hotel' });
      }

      // Nếu có booking, trả về kết quả dưới dạng JSON
      return res.json(results);
    });
  } catch (err) {
    // Lỗi nếu xảy ra vấn đề ngoài query (chẳng hạn kết nối database)
    console.error('Error fetching bookings for hotel:', err);
    return res.status(500).json({ message: 'Error fetching bookings for hotel', error: err.message });
  }
});

// Route to get all bookings by hotel and room id
router.get('/:hotelId/:roomId', async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    const roomId = req.params.roomId;
    const bookings = await Booking.getByHotelRoomId(hotelId, roomId);
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Error fetching bookings', error: err });
  }
});

// Route to get bookings by user ID
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const bookings = await Booking.getByUserId(userId);
    if (bookings.length > 0) {
      res.json(bookings);
    } else {
      res.status(404).json({ message: 'No bookings found for this user' });
    }
  } catch (err) {
    console.error('Error fetching bookings for user:', err);
    res.status(500).json({ message: 'Error fetching bookings for user', error: err });
  }
});

// Endpoint để cập nhật trạng thái đặt phòng
router.patch('/status/:id/:booking_status', (req, res) => {
  const { id } = req.params;
  const { booking_status } = req.body;

  // // Kiểm tra trạng thái hợp lệ
  // if (!['Pending', 'Confirmed', 'Cancelled'].includes(booking_status)) {
  //   return res.status(400).json({ message: 'Invalid booking status' });
  // }

  // Cập nhật trạng thái trong MySQL
  const query = 'UPDATE bookings SET booking_status = ? WHERE booking_id = ?';
  connection.query(query, [booking_status, id], (err, result) => {
    if (err) {
      console.error('Error updating booking status:', err);
      return res.status(500).json({ message: 'An error occurred while updating booking status' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.status(200).json({
      message: 'Booking status updated successfully',
      booking_id: id,
      booking_status: booking_status,
    });
  });
});






// Route to create a new booking
router.post('/', async (req, res) => {
  const {
    hotel_id,
    room_id,
    user_id,
    check_in_date,
    check_out_date,
    total_price,
    booking_status,
  } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!hotel_id || !room_id || !user_id || !check_in_date || !check_out_date || !total_price || !booking_status) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.', data: req.body });
  }

  try {
    const newBooking = {
      hotel_id,
      room_id,
      user_id,
      check_in_date,
      check_out_date,
      total_price,
      booking_status,
    };

    // Thêm booking mới vào database
    const bookingId = await Booking.create(newBooking);

    // Nếu thành công, giảm số lượng phòng khả dụng trong bảng rooms
    const updateRoomQuery = `
      UPDATE rooms
      SET availability_status = availability_status - 1
      WHERE id_room = ?
    `;
    connection.query(updateRoomQuery, [room_id], (err) => {
      if (err) {
        console.error('Lỗi khi cập nhật trạng thái phòng:', err);
        return res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái phòng', error: err });
      }

      res.status(201).json({
        message: 'Booking thành công!',
        booking_id: bookingId,
      });
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: 'Error creating booking', error: err });
  }
});

// Route to update a booking
router.put('/:id', async (req, res) => {
  const bookingId = req.params.id;
  const bookingData = req.body;

  try {
    const affectedRows = await Booking.update(bookingId, bookingData);
    if (affectedRows > 0) {
      res.json({ message: 'Booking updated successfully' });
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ message: 'Error updating booking', error: err });
  }
});

// Route to delete a booking
router.delete('/:id', async (req, res) => {
  const bookingId = req.params.id;

  try {
    const affectedRows = await Booking.delete(bookingId);
    if (affectedRows > 0) {
      res.json({ message: 'Booking deleted successfully' });
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ message: 'Error deleting booking', error: err });
  }
});

module.exports = router;
