import { useQuery } from "react-query";
import * as apiClient from "../../api-client";
import { useAppContext } from "../../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { BiMoney, BiCalendar, BiCheckCircle } from "react-icons/bi";
import { useState, useMemo } from "react";

const MyBookings = () => {
  const navigate = useNavigate();
  const { userId } = useAppContext();
  const [bookings, setBookings] = useState<any[]>([]);

  if (!userId) {
    return <span>User ID is missing or invalid.</span>;
  }

  // Fetch bookings for the logged-in user
  const { data: userBookingsData, isLoading, isError } = useQuery(
    ["getBookingsByUserId", userId],
    () => apiClient.getBookingsByUserId(userId as string),
    {
      onError: (error) => {
        console.error("Error fetching user bookings:", error);
      },
      onSuccess: (data) => {
        setBookings(data);
      },
    }
  );

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError || !userBookingsData) {
    return <span>Không có dữ liệu đặt phòng cho người dùng này.</span>;
  }

  // Fetch all hotel data for the bookings (avoid fetching in each loop)
  const hotelIds = useMemo(() => {
    return [...new Set(bookings.map((booking) => booking.hotel_id))]; // Get unique hotel IDs
  }, [bookings]);

  // Fetch all hotels data at once
  const { data: hotelsData, isLoading: hotelLoading, isError: hotelError } = useQuery(
    ["getHotelsByIds", hotelIds],
    () => Promise.all(hotelIds.map((id) => apiClient.getHotelById(id))),
    {
      enabled: hotelIds.length > 0, // Only fetch if there are hotel IDs
    }
  );

  if (hotelLoading) {
    return <span>Loading hotel details...</span>;
  }

  if (hotelError || !hotelsData) {
    return <span>Error fetching hotel details</span>;
  }

  // Function to format date to 'Y-M-D'
  const formatDate = (date: string) => {
    const newDate = new Date(date);
    return newDate.toISOString().split('T')[0];
  };

  // Function to determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-yellow-500";
      case "Confirmed":
        return "text-green-500";
      case "Cancel":
        return "text-red-500";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-blue-600 mb-6">My Bookings</h2>

      <div>
        {bookings.length === 0 ? (
          <span>Chưa có đặt phòng nào.</span>
        ) : (
          bookings.map((booking, index) => {
            const hotelData = hotelsData?.find((hotel) => hotel.id === booking.hotel_id);

            return (
              <div key={index} className="bg-white p-6 mb-5 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-600">
                      Phòng {booking.room_id} Hotel {booking.hotel_id}
                    </h3>
                    {hotelData && (
                      <span className="text-gray-500 text-sm">
                        Khách sạn: {hotelData.name} {/* Display hotel name */}
                      </span>
                    )}
                  </div>
                  <span className="text-xl font-semibold text-blue-600">
                    {booking.total_price} VND
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center text-lg text-gray-700">
                    <BiCalendar className="mr-2" />
                    <span>
                      {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                    </span>
                  </div>

                  <div className="flex items-center text-lg text-gray-700 mt-2">
                    <BiCheckCircle className="mr-2" />
                    <span className={`font-semibold ${getStatusColor(booking.booking_status)}`}>
                      Trạng thái: {booking.booking_status || "Pending"}
                    </span>
                  </div>
                </div>

                <div className="flex mt-4">
                  <button
                    onClick={() => navigate(`/bookings/${booking.booking_id}`)}
                    className="text-blue-600 font-semibold mr-3"
                  >
                    Xem Chi Tiết
                  </button>
                  <button
                    onClick={() => {
                      // Implement cancel booking logic here
                    }}
                    className="text-red-600 font-semibold"
                  >
                    Hủy Đặt
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyBookings;
