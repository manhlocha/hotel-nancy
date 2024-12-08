import { useQuery, useMutation, useQueryClient } from "react-query";
import { Link, useParams } from "react-router-dom";
import * as apiClient from "../../api-client";
import { BsBuilding, BsCalendar } from "react-icons/bs";
import { BiMoney, BiUser } from "react-icons/bi";

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const ManagerBookings = () => {
  // Get hotelId from URL params
  const { hotelId } = useParams();
  const queryClient = useQueryClient();

  if (!hotelId) {
    return <span>Hotel ID is missing or invalid.</span>;
  }

  // Fetch booking data for the specified hotelId using react-query
  const { data: bookingData, isLoading, isError } = useQuery(
    ['fetchManagerBookings', hotelId],
    () => apiClient.fetchManagerBookings(hotelId),
    {
      onError: (error) => {
        console.error('Error fetching bookings:', error);
      }
    }
  );

  // Mutation to update booking status
  const mutation = useMutation(
    ({ bookingId, newStatus }) => apiClient.updateBookingStatus(bookingId, newStatus),
    {
      onSuccess: () => {
        // Invalidate and refetch the bookings after the update
        queryClient.invalidateQueries(['fetchManagerBookings', hotelId]);
      },
      onError: (error) => {
        console.error("Error updating booking status:", error);
      }
    }
  );

  const handleStatusChange = (bookingId, newStatus) => {
    mutation.mutate({ bookingId, newStatus });
  };

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError || !bookingData || bookingData.length === 0) {
    return (
      <div className="flex justify-between items-center bg-gray-100 p-6 rounded-lg shadow-lg">
        <div>
          <p className="text-xl font-semibold text-gray-700">Không có đặt phòng nào cho khách sạn này.</p>
          <p className="text-sm text-gray-500">Vui lòng thêm đặt phòng mới để quản lý.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Các đặt phòng trong khách sạn</h1>
        <Link
          to={`/hotel/${hotelId}/add-booking`} // Navigate to the add booking page
          className="bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500 rounded-lg"
        >
          Thêm đặt phòng
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-8">
        {bookingData.map((booking) => (
          <div key={booking.booking_id} className="flex flex-col bg-white border border-slate-300 rounded-lg p-6 gap-6 shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold text-gray-800">{booking.room_type}</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <BsBuilding className="text-blue-500" />
                <span className="text-gray-600">Hotel ID: {booking.hotel_id}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <BiMoney className="text-blue-500" />
                <span className="text-gray-600">Giá: {Number(booking.total_price).toLocaleString()} VNĐ</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <BiUser className="text-blue-500" />
                <span className="text-gray-600">Khách hàng ID: {booking.user_id}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <BsCalendar className="text-blue-500" />
                <span className="text-gray-600">Ngày nhận phòng: {formatDate(booking.check_in_date)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <BsCalendar className="text-blue-500" />
                <span className="text-gray-600">Ngày trả phòng: {formatDate(booking.check_out_date)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className={`text-sm font-bold ${booking.booking_status === 'Pending' ? 'text-orange-600' : 'text-green-600'}`}>
                  Trạng thái: {booking.booking_status}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => handleStatusChange(booking.booking_id, booking.booking_status === 'Pending' ? 'Confirmed' : 'Pending')}
                className="bg-blue-600 text-white text-lg font-bold py-1 px-4 rounded-lg hover:bg-blue-500"
              >
                Cập nhật trạng thái
              </button>
              <Link
                to={`/view-booking/${booking.booking_id}`} // Navigate to view booking page
                className="bg-gray-600 text-white text-lg font-bold py-1 px-4 rounded-lg hover:bg-gray-500"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerBookings;
