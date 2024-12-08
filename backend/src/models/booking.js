const mysql = require('mysql2/promise');
require('dotenv').config();

// Create MySQL connection pool
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create the bookings table if it does not exist
(async () => {
  const createBookingTable = `
    CREATE TABLE IF NOT EXISTS bookings (
      booking_id INT AUTO_INCREMENT PRIMARY KEY,
      hotel_id INT NOT NULL,
      room_id INT NOT NULL,
      user_id INT NOT NULL,
      check_in_date DATE NOT NULL,
      check_out_date DATE NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,
      booking_status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending',
      FOREIGN KEY (hotel_id) REFERENCES hotels(id_hotel),
      FOREIGN KEY (room_id) REFERENCES rooms(room_id),
      FOREIGN KEY (user_id) REFERENCES users(id_user)
    );
  `;
  try {
    await connection.execute(createBookingTable);
    console.log('Table "bookings" created or already exists.');
  } catch (err) {
    console.error('Error creating "bookings" table:', err);
  }
})();

// Booking Model
const Booking = {
  // Get all bookings
  getAll: async () => {
    const query = 'SELECT * FROM bookings';
    try {
      const [results] = await connection.execute(query);
      return results;
    } catch (err) {
      console.error('Error fetching all bookings:', err);
      throw err;
    }
  },

  // Get booking by specific field and value
  findOne: async (field, value) => {
    if (!field || value === undefined) {
      throw new Error('Field and value are required for findOne');
    }
    const query = `SELECT * FROM bookings WHERE ${field} = ? LIMIT 1`;
    try {
      const [results] = await connection.execute(query, [value]);
      return results[0] || null;
    } catch (err) {
      console.error('Error finding booking by field:', err);
      throw err;
    }
  },

  // Get booking by ID
  getById: async (id) => {
    const query = 'SELECT * FROM bookings WHERE booking_id = ?';
    try {
      const [results] = await connection.execute(query, [id]);
      return results[0] || null; // Return the single record
    } catch (err) {
      console.error('Error fetching booking by ID:', err);
      throw err;
    }
  },

  // Get booking by hotelId, roomId
  getByHotelRoomId: async (hotelId, roomId) => {
    const query = 'SELECT * FROM bookings WHERE hotel_id = ? and room_id = ?';
    try {
      const [results] = await connection.execute(query, [hotelId, roomId]);
      return results; // Return record
    } catch (err) {
      console.error('Error fetching booking by ID:', err);
      throw err;
    }
  },
  // Get booking by hotelId, roomId
  getByHotelId: async (hotelId) => {
    const query = 'SELECT * FROM bookings WHERE hotel_id = ?';
    try {
      const [results] = await connection.execute(query, [hotelId]);
      return results; // Return record
    } catch (err) {
      console.error('Error fetching booking by ID:', err);
      throw err;
    }
  },
  
  
  // Create a new booking
  create: async (bookingData) => {
    const query = `
      INSERT INTO bookings (hotel_id, room_id, user_id, check_in_date, check_out_date, total_price, booking_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const { hotel_id, room_id, user_id, check_in_date, check_out_date, total_price, booking_status } = bookingData;
    try {
      const [results] = await connection.execute(query, [
        hotel_id, room_id, user_id, check_in_date, check_out_date, total_price, booking_status,
      ]);
      return results.insertId; // Return the new booking ID
    } catch (err) {
      console.error('Error creating booking:', err);
      throw err;
    }
  },

  // Update booking information
  update: async (id, bookingData) => {
    const query = `
      UPDATE bookings
      SET hotel_id = ?, room_id = ?, user_id = ?, check_in_date = ?, check_out_date = ?, 
          total_price = ?, booking_status = ?
      WHERE booking_id = ?
    `;
    const { hotel_id, room_id, user_id, check_in_date, check_out_date, total_price, booking_status } = bookingData;
    try {
      const [results] = await connection.execute(query, [
        hotel_id, room_id, user_id, check_in_date, check_out_date, total_price, booking_status, id,
      ]);
      return results.affectedRows; // Return number of affected rows
    } catch (err) {
      console.error('Error updating booking:', err);
      throw err;
    }
  },

  // Delete a booking
  delete: async (id) => {
    const query = 'DELETE FROM bookings WHERE booking_id = ?';
    try {
      const [results] = await connection.execute(query, [id]);
      return results.affectedRows; // Return number of affected rows
    } catch (err) {
      console.error('Error deleting booking:', err);
      throw err;
    }
  }
};

// Export the Booking model to use in other files
module.exports = Booking;
