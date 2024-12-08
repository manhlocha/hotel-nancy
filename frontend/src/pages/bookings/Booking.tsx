import { useQuery } from "react-query";
import { json, Link, useParams, useNavigate } from "react-router-dom";
import * as apiClient from "../../api-client";
import { BiMoney, BiCalendar, BiUser, BiCheckCircle } from "react-icons/bi";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css"
import { useEffect, useState } from "react";
import { useAppContext } from "../../contexts/AppContext";

const Bookings = () => {
  const navigate = useNavigate();

  const [selectedInDate, setSelectedInDate] = useState([]);
  const [selectedOutDate, setSelectedOutDate] = useState([]);
  const [excludedDates, setExcludedDates] = useState([]);
  const { hotelId, roomId } = useParams(); // Lấy hotelId từ URL
  const {userId} = useAppContext();
  if (!hotelId) {
    return <span>Hotel ID is missing or invalid.</span>;
  }  


  const getBookedDate = (data) => {
    let dates = [];
    data.forEach(element => {
      // Chuyển đổi ngày và trừ đi một ngày
    const checkInDate = new Date(element.check_in_date);
    checkInDate.setDate(checkInDate.getDate()+1);

    const checkOutDate = new Date(element.check_out_date);
    checkOutDate.setDate(checkOutDate.getDate()+1);

    // Tạo đối tượng với ngày đã xử lý
    let dateBooking = {
      from: checkInDate.toISOString().split('T')[0], // Chuyển thành dạng Y-M-D
      to: checkOutDate.toISOString().split('T')[0]
    };
      dates.push(dateBooking);      
    });
    return dates;
  };

  // Lấy danh sách bookings từ API dựa trên hotelId
  const { data: bookingData } = useQuery(
    ["getBookingByHotelAndRoomId", hotelId, roomId],
    () => apiClient.getBookingByHotelAndRoomId(hotelId as string, roomId as string), // Gọi API lấy danh sách bookings
    {
      onError: (error) => {
        console.error("Error fetching bookings:", error);
      },
      onSuccess: (data) => {
        let resuft = getBookedDate(data);
        setExcludedDates(resuft);        
      },
    }
  );  


  // Lấy thông tin phòng từ API dựa trên roomId và hotelId
  const { data: roomData, isLoading, isError } = useQuery(
    ["fetchRoom", hotelId, roomId],
    () => apiClient.fetchRoom(hotelId as string, roomId as string), // Gọi API lấy danh sách bookings
    {
      onError: (error) => {
        console.error("Error fetching room:", error);
      },
    }
  );
  const { data: userData } = useQuery(
    ["getUserById", userId],
    () => apiClient.getUserById(userId as string), 
    {
      onError: (error) => {
        console.error("Error fetching user:", error);
      },
    }
  );

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError || !roomData) {
    return <span>Không có đặt phòng nào cho khách sạn này.</span>;
  }

  const calculateTotalAmount = (price, inDate, outDate) => {
    const startDate = new Date(inDate);
    const endDate = new Date(outDate);
    const timeDifference = endDate - startDate;
    const dayDifference = timeDifference / (1000 * 3600 * 24); // Tính số ngày
    return price * ((dayDifference == 0)?1:dayDifference);
  };

  // tạo booking
  const createBookingF = () => {
    const checkInDate = new Date(selectedInDate[0]);
    checkInDate.setDate(checkInDate.getDate()+1);

    const checkOutDate = new Date(selectedOutDate[0]);
    checkOutDate.setDate(checkOutDate.getDate()+1);
    const booking = {
      hotel_id: hotelId,
      room_id: roomId,
      user_id: userId,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      total_price: calculateTotalAmount(roomData.price, selectedInDate, selectedOutDate),
      booking_status: "Pending",
    }

    const status = apiClient.createBooking(booking);

    if(status){
      alert("tao duojwc");
      console.log(status);
      navigate(-1);
    }
  }
  
  return (

    <>
  <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
    {/* Thông tin phòng */}
    <div className="bg-blue-600 text-white p-6 rounded-lg mb-6 shadow-md">
      <div className="text-3xl font-semibold">{roomData?.room_type || ""}</div>
      <div className="text-xl font-bold text-yellow-400 mt-2">Giá: {roomData?.price || ""} VND</div>
      <div className="mt-4">
        <span className="block text-lg">Người lớn: <span className="font-medium">{roomData?.adult_count || ""}</span></span>
        <span className="block text-lg">Trẻ em: <span className="font-medium">{roomData?.child_count || ""}</span></span>
      </div>
      <div className="mt-4">
        <span className="block font-semibold text-lg mb-2">Dịch vụ:</span>
        <div className="flex flex-wrap gap-2">
          {JSON.parse(roomData?.facilities || "[]").map((item, index) => (
            <span
              key={index}
              className="bg-gray-100 text-blue-600 px-3 py-1 text-sm rounded-full border border-blue-200"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* Form đặt phòng */}
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">Thông tin đặt phòng</h2>

      {/* Tên */}
      <div className="mb-5">
        <label className="font-bold text-gray-700 block mb-2" htmlFor="name-input">
          Tên
        </label>
        <input
          id="name-input"
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="Nhập tên của bạn"
          value={userData?.first_name +" "+userData?.last_name}
        />
      </div>

      {/* Số Điện Thoại */}
      <div className="mb-5">
        <label className="font-bold text-gray-700 block mb-2" htmlFor="phone-input">
          Số Điện Thoại
        </label>
        <input
          id="phone-input"
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="Nhập số điện thoại"
          value={userData?.phone}
        />
      </div>

      {/* Ngày Ở */}
      <div className="mb-5">
        <label className="font-bold text-gray-700 block mb-2" htmlFor="indate-input">
          Ngày Ở
        </label>
        <Flatpickr
          id="indate-input"
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          options={{
            disable: excludedDates,
            dateFormat: "Y-m-d", // Định dạng ngày
          }}
          value={selectedInDate}
          onChange={(date) => {
            setSelectedInDate(date);
            // Cập nhật lại ngày đi nếu ngày vào thay đổi và ngày đi nhỏ hơn ngày vào
            if (selectedOutDate && new Date(date) > new Date(selectedOutDate)) {
              setSelectedOutDate(null); // Xoá ngày đi nếu ngày vào lớn hơn
            }
          }}
        />
      </div>

      {/* Ngày Đi */}
      <div className="mb-5">
        <label className="font-bold text-gray-700 block mb-2" htmlFor="outdate-input">
          Ngày Đi
        </label>
        <Flatpickr
          id="outdate-input"
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          options={{
            disable: excludedDates,
            dateFormat: "Y-m-d", // Định dạng ngày
            minDate: selectedInDate ? new Date(selectedInDate) : new Date(), // Ngày đi phải lớn hơn hoặc bằng ngày vào
          }}
          value={selectedOutDate}
          onChange={(date) => {
            setSelectedOutDate(date);
          }}
        />
        {/* Thông báo lỗi nếu ngày vào lớn hơn ngày đi */}
        {selectedInDate && selectedOutDate && new Date(selectedInDate) > new Date(selectedOutDate) && (
          <p className="text-red-500 text-sm mt-2">Ngày đi phải lớn hơn hoặc bằng ngày ở!</p>
        )}
      </div>

      {/* Tổng tiền */}
      <div className="mb-5 mt-6">
        <div className="flex justify-between font-semibold text-xl">
          <span>Tổng Tiền:</span>
          <span className="text-blue-600">
            {roomData?.price && selectedInDate.length > 0 && selectedOutDate.length > 0
              ? (calculateTotalAmount(roomData.price, selectedInDate, selectedOutDate))
              : 0} VND
          </span>
        </div>
      </div>

      {/* Nút gửi */}
      <button
        onClick={createBookingF}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow hover:bg-blue-700 transition duration-300"
        disabled={!selectedInDate || !selectedOutDate || new Date(selectedInDate) > new Date(selectedOutDate)} // Disable button nếu không hợp lệ
      >
        Đặt Phòng
      </button>
    </div>
  </div>
</>




    // <div className="space-y-5">
    //   <h1 className="text-3xl font-bold">Danh sách đặt phòng</h1>
    //   <div className="grid grid-cols-1 gap-8">
    //     {bookingData.map((booking: any) => {
    //       return (
    //         <div
    //           key={booking.booking_id}
    //           className="flex flex-col border border-slate-300 rounded-lg p-6 gap-6"
    //         >
    //           <h2 className="text-2xl font-semibold">Đặt phòng #{booking.booking_id}</h2>
    //           <div className="space-y-3">
    //             <div className="flex items-center space-x-2 text-sm">
    //               <BiUser className="text-blue-500" />
    //               <span>User ID: {booking.user_id}</span>
    //             </div>
    //             <div className="flex items-center space-x-2 text-sm">
    //               <BiMoney className="text-blue-500" />
    //               <span>Tổng giá: {booking.total_price} VNĐ</span>
    //             </div>
    //             <div className="flex items-center space-x-2 text-sm">
    //               <BiCalendar className="text-blue-500" />
    //               <span>
    //                 Ngày nhận phòng: {booking.check_in_date} - Ngày trả phòng:{" "}
    //                 {booking.check_out_date}
    //               </span>
    //             </div>
    //             <div className="flex items-center space-x-2 text-sm">
    //               <BiCheckCircle className="text-blue-500" />
    //               <span>
    //                 Trạng thái:{" "}
    //                 {booking.booking_status === "confirmed"
    //                   ? "Xác nhận"
    //                   : booking.booking_status === "pending"
    //                   ? "Đang chờ"
    //                   : "Hủy"}
    //               </span>
    //             </div>
    //           </div>
    //           <div className="flex justify-end">
    //             <Link
    //               to={`/bookings/${hotelId}/${booking.booking_id}/details`} // Đường dẫn chi tiết đặt phòng
    //               className="bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
    //             >
    //               Chi tiết đặt phòng
    //             </Link>
    //           </div>
    //         </div>
    //       );
    //     })}
    //   </div>
    // </div>
  );
};

export default Bookings;
