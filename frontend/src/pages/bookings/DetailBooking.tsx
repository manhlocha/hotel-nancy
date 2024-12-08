import { useQuery } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import * as apiClient from '../../api-client'; // Assuming you have an API client for fetching booking data
import { BsBuilding, BsCalendar } from 'react-icons/bs';
import { BiMoney, BiUser } from 'react-icons/bi';
import { useState } from 'react';

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const DetailBooking = () => {
  const { bookingId } = useParams<{ bookingId: string }>(); // Get the booking ID from the URL params

  // Fetch the booking details using react-query
  const { data: booking, isLoading, isError } = useQuery(
    ['fetchBookingDetail', bookingId],
    () => apiClient.getBookingbyId(bookingId as string), // Assuming you have an API client method to fetch booking details
    {
      onError: (error) => {
        console.error('Error fetching booking details:', error);
      },
    }
  );


  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError || !booking) {
    return <span>Error fetching booking details</span>;
  }


  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Booking Details</h1>
        <Link
          to={`/hotel/${booking.hotel_id}/manager-bookings`}
          className="bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500 rounded-lg"
        >
          Back to Bookings
        </Link>
      </div>

      <div className="flex flex-col bg-white border border-slate-300 rounded-lg p-6 gap-6 shadow-lg hover:shadow-xl transition-shadow">
        <h2 className="text-2xl font-semibold text-gray-800">{booking.room_type}</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <BsBuilding className="text-blue-500" />
            <span className="text-gray-600">Hotel ID: {booking.hotel_id}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <BiMoney className="text-blue-500" />
            <span className="text-gray-600">Price: {Number(booking.total_price).toLocaleString()} VNĐ</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <BiUser className="text-blue-500" />
            <span className="text-gray-600">Customer ID: {booking.user_id}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <BsCalendar className="text-blue-500" />
            <span className="text-gray-600">Check-in Date: {formatDate(booking.check_in_date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <BsCalendar className="text-blue-500" />
            <span className="text-gray-600">Check-out Date: {formatDate(booking.check_out_date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className={`text-sm font-bold ${status === 'Pending' ? 'text-orange-600' : status === 'Confirmed' ? 'text-green-600' : 'text-red-600'}`}>
              Status: {status}
            </span>
          </div>
        </div>



        {/* Edit button */}
        <div className="flex justify-end space-x-3 mt-4">
          <Link
            to={`/edit-booking/${booking.booking_id}`}
            className="bg-blue-600 text-white text-lg font-bold py-1 px-4 rounded-lg hover:bg-blue-500"
          >
            Edit Booking
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DetailBooking;
