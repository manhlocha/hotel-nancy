import { Link } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import SignOutButton from "./SignOutButton";

const Header = () => {
  const { isLoggedIn, userRole, userId } = useAppContext();

  return (
    <div className="bg-blue-800 py-6">
      <div className="container mx-auto flex justify-between">
        <span className="text-3xl text-white font-bold tracking-tight">
          <Link to="/">Nancyhotel</Link>
        </span>
        <p className="text-white">
          {/* Check for userRole and userId before displaying */}
          {isLoggedIn ? (
            <>
              Hello {userId || "None"} {userRole || "None" }
            </>
          ) : (
            "Not logged in"
          )}
        </p>
        <span className="flex space-x-2">
          {isLoggedIn ? (
            <>
              {/* Conditional Links Based on useruserRole */}
              {userRole == "1" && (
                <>
                  <Link
                    className="flex items-center text-white px-3 font-bold hover:bg-blue-600"
                    to="/manager-bookings"
                  >
                    Đơn đặt lịch
                  </Link>
                  <Link
                    className="flex items-center text-white px-3 font-bold hover:bg-blue-600"
                    to="/my-hotels"
                  >
                    Khách sạn
                  </Link>
                </>
              )}
              {userRole == "2" && (
                <>
                <Link
                  className="flex items-center text-white px-3 font-bold hover:bg-blue-600"
                  to="/my-bookings"
                >
                  Đơn đặt lịch của tôi
                </Link>

                <Link
                  className="flex items-center text-white px-3 font-bold hover:bg-blue-600"
                  to="/hotel"
                >
                  Danh sách khách sạn
                </Link>
                </>
              )}
              {userRole == "3" && (
                <>
                  <Link
                    className="flex items-center text-white px-3 font-bold hover:bg-blue-600"
                    to="/admin-dashboard"
                  >
                    Bảng điều khiển Quản trị viên
                  </Link>
                  <Link
                    className="flex items-center text-white px-3 font-bold hover:bg-blue-600"
                    to="/user-management"
                  >
                    Quản lý người dùng
                  </Link>
                </>
              )}
              {/* Sign-out button */}
              <SignOutButton />
            </>
          ) : (
            // If not logged in, show the login button
            <Link
              to="/sign-in"
              className="flex bg-white items-center text-blue-600 px-3 font-bold hover:bg-gray-100"
            >
              Đăng nhập
            </Link>
          )}
        </span>
      </div>
    </div>
  );
};

export default Header;
