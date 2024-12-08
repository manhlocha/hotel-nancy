import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Layout from "./layouts/Layout";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import AddHotel from "./pages/hotels/AddHotel";
import { useAppContext } from "./contexts/AppContext";
import MyHotels from "./pages/hotels/MyHotels";
import EditHotel from "./pages/hotels/EditHotel";
import Search from "./pages/Search";
import Detail from "./pages/Detail";
import Booking from "./pages/bookings/Booking";
import MyBookings from "./pages/bookings/MyBookings";
import Home from "./pages/Home";
import MyRoom from "./pages/rooms/MyRooms";
import RoomDetail from "./pages/rooms/RoomDetail";
import InvoiceManager from "./pages/admin/InvoiceManager";
import HotelManager from "./pages/admin/HotelManager";
import UserManager from "./pages/admin/UserManager";
import Admin from "./pages/admin/Admin";
import AddRoom from "./pages/rooms/AddRooms";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import ViewHotels from "./pages/hotels/ViewHotel";
import ViewRoom from "./pages/rooms/ViewRoom";
import EditRoom from "./pages/rooms/EditRooms";
import ManagerBookings from "./pages/rooms/ManagerBookings";
import DetailBooking from "./pages/bookings/DetailBooking";

const App = () => {
  const { isLoggedIn, userRole, userId } = useAppContext();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/search" element={<Layout><Search /></Layout>} />
        <Route path="/detail/:hotelId" element={<Layout><Detail /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/sign-in" element={<Layout><SignIn /></Layout>} />

        {/* Protected Routes - userRole-based Access */}
        {isLoggedIn
         && (
          <>
            {/* userRole 1 - User userRole 1 */}
            {userRole == "1" && (
              <>
                <Route path="/my-hotels" element={<Layout><MyHotels /></Layout>} />
                <Route path="/my-bookings" element={<Layout><MyBookings /></Layout>} />
                <Route path="/my-rooms" element={<Layout><MyRoom /></Layout>} />
                <Route path="/my-rooms/:roomId" element={<Layout><RoomDetail /></Layout>} />
                <Route path="/my-hotel/:hotelId" element={<Layout><MyHotels /></Layout>} />
                <Route path="/add-hotel" element={<Layout><AddHotel /></Layout>} />
                <Route path="/edit-hotel/:hotelId" element={<Layout><EditHotel /></Layout>} />
                <Route path="/room/:hotelId" element={<Layout><MyRoom /></Layout>} />
                <Route path="/hotel/:hotelId/add-room" element={<Layout><AddRoom /></Layout>} />
                <Route path="/edit-room/:roomId" element={<Layout><EditRoom /></Layout>} />
                <Route path="/:hotelId/manager-bookings" element={<Layout><ManagerBookings /></Layout>} />
                <Route path="/view-booking/:bookingId" element={<Layout><DetailBooking /></Layout>} />

                </>
            )}

            {/* userRole 2 - User userRole 2 */}
            {userRole == "2" && (
              <>
                <Route path="/hotel" element={<Layout><ViewHotels /></Layout>} />
                <Route path="/my-bookings" element={<Layout><MyBookings /></Layout>} />
                <Route path="/rooms/:hotelId" element={<Layout><ViewRoom /></Layout>} />
                <Route path="/rooms/:hotelId/:roomId" element={<Layout><RoomDetail /></Layout>} />
                <Route path="/bookings/:hotelId/:roomId" element={<Layout><Booking /></Layout>} />
              </>
            )}

            {/* userRole 3 - Admin userRole 3 */}
            {userRole == "3" && (
              <>
                <Route path="/admin" element={<Layout><Admin /></Layout>} />
                <Route path="/user-manager" element={<Layout><UserManager /></Layout>} />
                <Route path="/hotel-manager" element={<Layout><HotelManager /></Layout>} />
                <Route path="/invoice-manager" element={<Layout><InvoiceManager /></Layout>} />
              </>
            )}
          </>
        )}

        {/* Fallback for all unknown paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
