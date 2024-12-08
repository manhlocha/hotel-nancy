import { useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import * as apiClient from "../../api-client";
import { BsBuilding, BsMap } from "react-icons/bs";
import { BiDoorOpen, BiPhone, BiStar } from "react-icons/bi";
import { useAppContext } from "../../contexts/AppContext";

const MyHotels = () => {
  const { userRole, userId } = useAppContext();
  const navigate = useNavigate();

  // Fetch hotels data
  const { data: hotelData, isLoading, isError } = useQuery(
    "fetchMyHotels",
    () => apiClient.fetchMyHotels(userId ?? ""),
    {
      onError: () => {
        // Handle error state here if necessary
      },
    }
  );
  const handleDelete = (hotelId: string) => {
    // Confirm the deletion action
    const confirmDelete = window.confirm('Bạn chắc chắn muốn xóa khách sạn này?');
  
    if (confirmDelete) {
      // Call your API to delete the hotel
      apiClient.deleteHotelById(hotelId)  // Replace with your actual API function
        .then(response => {
          alert('Khách sạn đã được xóa thành công!');
          // Optionally, you can redirect the user after deletion:
          navigate('/my-hotels');  // Redirect to hotels list or another page
        })
        .catch(error => {
          console.error('Error deleting hotel:', error);
          alert('Có lỗi xảy ra khi xóa khách sạn.');
        });
    }
  };
  
  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError || !hotelData) {
    return (
      <span>
        Không tìm thấy khách sạn
        <Link
          to="/add-hotel"
          className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
        >
          Thêm khách sạn
        </Link>
      </span>
    );
  }

  return (
    <div className="space-y-5">
      <span className="flex justify-between">
        <h1 className="text-3xl font-bold">Khách sạn của tôi</h1>

        <Link
          to="/add-hotel"
          className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
        >
          Thêm khách sạn
        </Link>
      </span>
      <div className="grid grid-cols-1 gap-8">
        {hotelData.map((hotel: any) => (
          <div
            data-testid="hotel-card"
            key={hotel._id}
            className="flex flex-col justify-between border border-slate-300 rounded-lg p-8 gap-5"
          >
            <h2 className="text-2xl font-bold">{hotel.name} {hotel.hotel_id}</h2>

            {/* Check if the image URL exists and is valid */}
            {hotel.image ? (
               <img
               src={hotel.image}
               alt={hotel.name}
               className="w-full h-64 object-cover rounded-md mb-4"
             />

            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md mb-4">
                <span>No Image Available</span>
              </div>
            )}

            <div className="whitespace-pre-line"></div>
            <div className="grid grid-cols-5 gap-2">
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BsMap className="mr-1" />
                {hotel.address}
              </div>
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BsBuilding className="mr-1" />
                {hotel.city}, {hotel.country}
              </div>
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BiDoorOpen className="mr-1" />có {hotel.room} phòng
              </div>
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BiPhone className="mr-1" />
                {hotel.phone}
              </div>
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BiStar className="mr-1" />
                {hotel.rating} Star Rating
              </div>
            </div>
            <span className="flex justify-end space-x-4"> {/* space-x-4 tạo khoảng cách ngang giữa các phần tử */}
            <Link
              to={`/${hotel.hotel_id}/manager-bookings`} // Assuming `hotel._id` is the correct property
              className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
            >
              Xem danh sách đặt phòng
            </Link>
            <Link
              to={`/edit-hotel/${hotel.hotel_id}`} // Assuming `hotel._id` is the correct property
              className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
            >
              Chỉnh sửa khách sạn
            </Link>
            <Link
              to={`/room/${hotel.hotel_id}`} // Assuming `hotel._id` is the correct property
              className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
            >
              Xem các phòng
            </Link>
            <button
              onClick={() => handleDelete(hotel.hotel_id)}  // Function to handle the delete action
              className="flex bg-red-600 text-white text-xl font-bold p-2 hover:bg-red-500"
            >
              Xóa khách sạn
            </button>
          </span>

          </div>
        ))}
      </div>
    </div>
  );
};

export default MyHotels;
