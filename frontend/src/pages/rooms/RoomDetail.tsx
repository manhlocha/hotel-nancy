import { useQuery } from "react-query";
import { useParams, Link } from "react-router-dom";
import * as apiClient from "../../api-client";
import { BsBuilding, BsMap } from "react-icons/bs";
import { BiMoney, BiBed, BiStar } from "react-icons/bi";
import Slider from "react-slick";

const RoomDetail = () => {
  const { hotelId, roomId } = useParams();  // Access hotelId and roomId from URL params
  if (!hotelId || !roomId) {
    return <span>Invalid Hotel or Room ID.</span>;
  }

  // Fetch room data using the roomId
  const { data: roomData, isLoading, isError } = useQuery(
    ['fetchRoomDetails', hotelId, roomId],
    () => apiClient.fetchRoom(hotelId, roomId),
    {
      onError: (error) => {
        console.error('Error fetching room details:', error);
      },
    }
  );
  
  // Fetch hotel data using hotelId
  const { data: hotelData } = useQuery(
    ['getHotelById', hotelId],
    () => apiClient.getHotelById(hotelId),
    {
      onError: (error) => {
        console.error('Error fetching hotel details:', error);
      },
    }
  );

  if (isLoading) {
    return <span>Loading room details...</span>;
  }

  if (isError || !roomData) {
    return <span>Room details not available.</span>;
  }

  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // Extract facilities and images (assuming they're in stringified JSON format)
  let facilities = [];
  if (typeof roomData.facilities === 'string') {
    try {
      facilities = JSON.parse(roomData.facilities);
    } catch (error) {
      console.error('Error parsing facilities:', error);
      facilities = [roomData.facilities];
    }
  } else if (Array.isArray(roomData.facilities)) {
    facilities = roomData.facilities;
  }

  let images = [];
  if (typeof roomData.image_urls === 'string') {
    try {
      images = JSON.parse(roomData.image_urls);
    } catch (error) {
      console.error('Error parsing image_urls:', error);
      images = [];
    }
  } else if (Array.isArray(roomData.image_urls)) {
    images = roomData.image_urls;
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{roomData.room_type}</h1>
      </div>

      {/* Display Hotel Name and Address */}
     

      {/* Grid Layout for Room Details and Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side - Room Details */}
        <div className="flex flex-col border border-slate-300 rounded-lg p-6 gap-6">
          <h2 className="text-2xl font-semibold">Chi tiết phòng</h2>
          {hotelData && (
            <div className="flex items-center space-x-4 text-sm">
              <BsBuilding className="text-blue-500" />
              <span className="font-semibold">{hotelData.name}</span>
              {hotelData.address && (
                <span className="text-gray-500">{hotelData.address}</span>
              )}
            </div>
          )}
          {/* Room Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <BiMoney className="text-blue-500" />
              <span>Giá: {roomData.price} VNĐ 1 đêm</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <BiBed className="text-blue-500" />
              <span>
                {roomData.adult_count} người lớn, {roomData.child_count} trẻ em
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <BiStar className="text-blue-500" />
              <span>
                Trạng thái phòng: {roomData.availability_status === 1 ? "Hoạt động" : "Tam dừng"}
              </span>
            </div>

            {/* Display Room Facilities */}
            <div className="flex flex-wrap gap-2">
              <h3 className="font-semibold">Facilities:</h3>
              {facilities.map((facility: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Image Slider */}
        <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden mb-4">
          {Array.isArray(images) && images.length > 0 ? (
            <Slider {...sliderSettings}>
              {images.map((image: string, index: number) => (
                <div key={index}>
                  <img
                    src={image}
                    alt={roomData.room_type}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </Slider>
          ) : (
            <div>
              <img
                src="/default-image.jpg"
                alt={roomData.room_type}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Link
          to={`/bookings/${roomData.hotel_id}/${roomData.room_id}`}
          className="bg-green-600 text-white text-xl font-bold p-2 hover:bg-green-500"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
};

export default RoomDetail;
