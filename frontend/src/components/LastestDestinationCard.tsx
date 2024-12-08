import { Link } from "react-router-dom";
import { HotelType } from "../types";

type Props = {
  hotel: HotelType;
};

const LatestDestinationCard = ({ hotel }: Props) => {
  // Define the image URL and fallback to a default image if not available
  const imageUrl = hotel.image || "/path/to/default-image.jpg";  // Use hotel image or fallback

  return (
    <Link
      to={`/room/${hotel._id}`}
      className="relative cursor-pointer overflow-hidden rounded-md"
    >
      <div className="h-[300px]">
        {/* Conditionally render image if hotel.image exists */}
        {hotel.image ? (
          <img
            src={imageUrl}
            alt={hotel.name}
            className="w-full h-64 object-cover rounded-md mb-4"
          />
        ) : (
          <img
            src="/path/to/default-image.jpg" // fallback image
            alt="Default Image"
            className="w-full h-64 object-cover rounded-md mb-4"
          />
        )}
      </div>

      <div className="absolute bottom-0 p-4 bg-black bg-opacity-50 w-full rounded-b-md">
        <span className="text-white font-bold tracking-tight text-3xl">
          {hotel.name}
        </span>
      </div>
    </Link>
  );
};

export default LatestDestinationCard;
