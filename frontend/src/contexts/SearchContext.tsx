import React, { useContext, useState } from "react";

type SearchContextType = {
  destination: string; // Địa chỉ khách sạn
  hotelId: string; // ID khách sạn
  checkIn: Date; // Ngày nhận phòng
  checkOut: Date; // Ngày trả phòng
  adultCount: number; // Số người lớn
  childCount: number; // Số trẻ em
  saveHotelInfo: (destination: string, hotelId: string) => void; // Lưu thông tin khách sạn
  saveRoomInfo: (
    checkIn: Date,
    checkOut: Date,
    adultCount: number,
    childCount: number
  ) => void; // Lưu thông tin phòng
};

const SearchContext = React.createContext<SearchContextType | undefined>(
  undefined
);

type SearchContextProviderProps = {
  children: React.ReactNode;
};

export const SearchContextProvider = ({
  children,
}: SearchContextProviderProps) => {
  // Thông tin khách sạn
  const [destination, setDestination] = useState<string>(
    sessionStorage.getItem("destination") || ""
  );
  const [hotelId, setHotelId] = useState<string>(
    sessionStorage.getItem("hotelId") || ""
  );

  // Thông tin phòng
  const [checkIn, setCheckIn] = useState<Date>(() => {
    const savedCheckIn = sessionStorage.getItem("checkIn");
    return savedCheckIn ? new Date(savedCheckIn) : new Date();
  });
  const [checkOut, setCheckOut] = useState<Date>(() => {
    const savedCheckOut = sessionStorage.getItem("checkOut");
    return savedCheckOut ? new Date(savedCheckOut) : new Date();
  });
  const [adultCount, setAdultCount] = useState<number>(
    parseInt(sessionStorage.getItem("adultCount") || "1")
  );
  const [childCount, setChildCount] = useState<number>(
    parseInt(sessionStorage.getItem("childCount") || "0")
  );

  // Lưu thông tin khách sạn
  const saveHotelInfo = (destination: string, hotelId: string) => {
    setDestination(destination);
    setHotelId(hotelId);

    sessionStorage.setItem("destination", destination);
    sessionStorage.setItem("hotelId", hotelId);
  };

  // Lưu thông tin phòng
  const saveRoomInfo = (
    checkIn: Date,
    checkOut: Date,
    adultCount: number,
    childCount: number
  ) => {
    setCheckIn(checkIn);
    setCheckOut(checkOut);
    setAdultCount(adultCount);
    setChildCount(childCount);

    sessionStorage.setItem("checkIn", checkIn.toISOString());
    sessionStorage.setItem("checkOut", checkOut.toISOString());
    sessionStorage.setItem("adultCount", adultCount.toString());
    sessionStorage.setItem("childCount", childCount.toString());
  };

  return (
    <SearchContext.Provider
      value={{
        destination,
        hotelId,
        checkIn,
        checkOut,
        adultCount,
        childCount,
        saveHotelInfo,
        saveRoomInfo,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error(
      "useSearchContext must be used within a SearchContextProvider"
    );
  }
  return context;
};
