import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import * as apiClient from "../../api-client";
import { BsBuilding, BsMap } from "react-icons/bs";
import { BiMoney, BiBed, BiStar } from "react-icons/bi";
import Slider from "react-slick";

const ViewRoom = () => {
  const { hotelId } = useParams();
  if (!hotelId) {
    return <span>Hotel ID is missing or invalid.</span>;
  }

  const { data: roomData, isLoading, isError } = useQuery(
    ['fetchMyRooms', hotelId],
    () => apiClient.fetchMyRooms(hotelId),
    {
      onError: (error) => {
        console.error('Error fetching rooms:', error);
      },
    }
  );

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError || !roomData || roomData.length === 0) {
    return <span>Không có phòng nào trong khách sạn này.</span>;
  }

  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Các phòng trong khách sạn</h1>
        <Link
          to={`/hotel/${hotelId}/add-room`}
          className="bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
        >
          Thêm phòng
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-8">
        {roomData.map((room: any) => {
          let facilities = [];
          if (typeof room.facilities === 'string') {
            try {
              facilities = JSON.parse(room.facilities);
            } catch (error) {
              console.error('Error parsing facilities:', error);
              facilities = [room.facilities];
            }
          } else if (Array.isArray(room.facilities)) {
            facilities = room.facilities;
          }

          let images = [];
          if (typeof room.image_urls === 'string') {
            try {
              images = JSON.parse(room.image_urls);
            } catch (error) {
              console.error('Error parsing image_urls:', error);
              images = [];
            }
          } else if (Array.isArray(room.image_urls)) {
            images = room.image_urls;
          }

          return (
            <div
              key={room.room_id}
              className="flex flex-col border border-slate-300 rounded-lg p-6 gap-6"
            >
              <h2 className="text-2xl font-semibold">{room.room_type}</h2>
              <div className="flex flex-wrap gap-2">
                {facilities.map((facility: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full"
                  >
                    {facility}
                  </span>
                ))}
              </div>
              <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
                {Array.isArray(images) && images.length > 0 ? (
                  <Slider {...sliderSettings}>
                    {images.map((image: string, index: number) => (
                      <div key={index}>
                        <img
                          src={image}
                          alt={room.room_type}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <div>
                    <img
                      src="/default-image.jpg"
                      alt={room.room_type}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <BsBuilding className="text-blue-500" />
                  <span>Hotel ID: {room.hotel_id}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <BiMoney className="text-blue-500" />
                  <span>Giá: {room.price} VNĐ per night</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <BiBed className="text-blue-500" />
                  <span>{room.adult_count} người lớn, {room.child_count} trẻ em</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <BiStar className="text-blue-500" />
                  <span>Trạng thái: {room.availability_status === 1 ? "Available" : "Unavailable"}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Link
                  to={`/rooms/${room.hotel_id}/${room.room_id}`}
                  className="bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500"
                >
                  Xem chi tiết phòng
                </Link>
                <Link
                  to={`/bookings/${room.hotel_id}/${room.room_id}`}
                  className="bg-green-600 text-white text-xl font-bold p-2 hover:bg-green-500"
                >
                  Đặt lịch ngay
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ViewRoom;
