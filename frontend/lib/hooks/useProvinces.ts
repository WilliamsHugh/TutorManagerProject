"use client";

import { useState, useEffect } from "react";

const PROVINCES_API = "https://provinces.open-api.vn/api/v2";

export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
}

// Bộ dữ liệu tĩnh Fallback 63 tỉnh thành Việt Nam đề phòng lỗi API/CORS
const FALLBACK_PROVINCES: Province[] = [
  { code: 79, name: "Thành phố Hồ Chí Minh" },
  { code: 1, name: "Thành phố Hà Nội" },
  { code: 48, name: "Thành phố Đà Nẵng" },
  { code: 31, name: "Thành phố Hải Phòng" },
  { code: 92, name: "Thành phố Cần Thơ" },
  { code: 75, name: "Tỉnh Đồng Nai" },
  { code: 74, name: "Tỉnh Bình Dương" },
  { code: 68, name: "Tỉnh Lâm Đồng" },
  { code: 56, name: "Tỉnh Khánh Hòa" },
  { code: 46, name: "Tỉnh Thừa Thiên Huế" },
  { code: 80, name: "Tỉnh Tây Ninh" },
  { code: 77, name: "Tỉnh Bà Rịa - Vũng Tàu" },
  { code: 82, name: "Tỉnh Đồng Tháp" },
  { code: 86, name: "Tỉnh Vĩnh Long" },
  { code: 91, name: "Tỉnh An Giang" },
  { code: 96, name: "Tỉnh Cà Mau" },
  { code: 2, name: "Tỉnh Hà Giang" },
  { code: 4, name: "Tỉnh Cao Bằng" },
  { code: 6, name: "Tỉnh Bắc Kạn" },
  { code: 8, name: "Tỉnh Tuyên Quang" },
  { code: 10, name: "Tỉnh Lào Cai" },
  { code: 11, name: "Tỉnh Điện Biên" },
  { code: 12, name: "Tỉnh Lai Châu" },
  { code: 14, name: "Tỉnh Sơn La" },
  { code: 15, name: "Tỉnh Yên Bái" },
  { code: 17, name: "Tỉnh Hoà Bình" },
  { code: 19, name: "Tỉnh Thái Nguyên" },
  { code: 20, name: "Tỉnh Lạng Sơn" },
  { code: 22, name: "Tỉnh Quảng Ninh" },
  { code: 24, name: "Tỉnh Bắc Giang" },
  { code: 25, name: "Tỉnh Phú Thọ" },
  { code: 26, name: "Tỉnh Vĩnh Phúc" },
  { code: 27, name: "Tỉnh Bắc Ninh" },
  { code: 30, name: "Tỉnh Hải Dương" },
  { code: 33, name: "Tỉnh Hưng Yên" },
  { code: 34, name: "Tỉnh Thái Bình" },
  { code: 35, name: "Tỉnh Hà Nam" },
  { code: 36, name: "Tỉnh Nam Định" },
  { code: 37, name: "Tỉnh Ninh Bình" },
  { code: 38, name: "Tỉnh Thanh Hóa" },
  { code: 40, name: "Tỉnh Nghệ An" },
  { code: 42, name: "Tỉnh Hà Tĩnh" },
  { code: 44, name: "Tỉnh Quảng Trị" },
  { code: 45, name: "Tỉnh Quảng Bình" },
  { code: 49, name: "Tỉnh Quảng Nam" },
  { code: 51, name: "Tỉnh Quảng Ngãi" },
  { code: 52, name: "Tỉnh Bình Định" },
  { code: 54, name: "Tỉnh Phú Yên" },
  { code: 58, name: "Tỉnh Ninh Thuận" },
  { code: 60, name: "Tỉnh Bình Thuận" },
  { code: 62, name: "Tỉnh Kon Tum" },
  { code: 64, name: "Tỉnh Gia Lai" },
  { code: 66, name: "Tỉnh Đắk Lắk" },
  { code: 67, name: "Tỉnh Đắk Nông" },
  { code: 70, name: "Tỉnh Bình Phước" },
  { code: 72, name: "Tỉnh Tây Ninh" },
  { code: 83, name: "Tỉnh Long An" },
  { code: 84, name: "Tỉnh Tiền Giang" },
  { code: 87, name: "Tỉnh Bến Tre" },
  { code: 89, name: "Tỉnh Trà Vinh" },
  { code: 93, name: "Tỉnh Sóc Trăng" },
  { code: 94, name: "Tỉnh Bạc Liêu" },
  { code: 95, name: "Tỉnh Hậu Giang" },
];

const FALLBACK_DISTRICTS: Record<number, District[]> = {
  79: [
    { code: 1, name: "Quận 1" },
    { code: 2, name: "Quận 3" },
    { code: 3, name: "Quận 4" },
    { code: 4, name: "Quận 5" },
    { code: 5, name: "Quận 6" },
    { code: 6, name: "Quận 7" },
    { code: 7, name: "Quận 8" },
    { code: 8, name: "Quận 10" },
    { code: 9, name: "Quận 11" },
    { code: 10, name: "Quận 12" },
    { code: 11, name: "Quận Bình Thạnh" },
    { code: 12, name: "Quận Gò Vấp" },
    { code: 13, name: "Quận Phú Nhuận" },
    { code: 14, name: "Quận Tân Bình" },
    { code: 15, name: "Quận Tân Phú" },
    { code: 16, name: "Quận Bình Tân" },
    { code: 17, name: "Thành phố Thủ Đức" },
    { code: 18, name: "Huyện Hóc Môn" },
    { code: 19, name: "Huyện Củ Chi" },
    { code: 20, name: "Huyện Nhà Bè" },
    { code: 21, name: "Huyện Bình Chánh" },
    { code: 22, name: "Huyện Cần Giờ" },
  ],
  1: [
    { code: 101, name: "Quận Ba Đình" },
    { code: 102, name: "Quận Hoàn Kiếm" },
    { code: 103, name: "Quận Tây Hồ" },
    { code: 104, name: "Quận Long Biên" },
    { code: 105, name: "Quận Cầu Giấy" },
    { code: 106, name: "Quận Đống Đa" },
    { code: 107, name: "Quận Hai Bà Trưng" },
    { code: 108, name: "Quận Hoàng Mai" },
    { code: 109, name: "Quận Thanh Xuân" },
    { code: 110, name: "Quận Nam Từ Liêm" },
    { code: 111, name: "Quận Bắc Từ Liêm" },
    { code: 112, name: "Thị xã Sơn Tây" },
    { code: 113, name: "Huyện Gia Lâm" },
    { code: 114, name: "Huyện Đông Anh" },
    { code: 115, name: "Huyện Sóc Sơn" },
    { code: 116, name: "Huyện Thanh Trì" },
  ],
  48: [
    { code: 201, name: "Quận Hải Châu" },
    { code: 202, name: "Quận Thanh Khê" },
    { code: 203, name: "Quận Sơn Trà" },
    { code: 204, name: "Quận Ngũ Hành Sơn" },
    { code: 205, name: "Quận Liên Chiểu" },
    { code: 206, name: "Quận Cẩm Lệ" },
    { code: 207, name: "Huyện Hòa Vang" },
  ],
};

let cachedProvinces: Province[] | null = null;

export function useProvinces() {
  const [provinces, setProvinces] = useState<Province[]>(cachedProvinces || FALLBACK_PROVINCES);
  const [loading, setLoading] = useState(!cachedProvinces);

  useEffect(() => {
    if (cachedProvinces) {
      setProvinces(cachedProvinces);
      setLoading(false);
      return;
    }

    fetch(`${PROVINCES_API}/p/`)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data: Province[]) => {
        if (Array.isArray(data) && data.length > 0) {
          cachedProvinces = data;
          setProvinces(data);
        } else {
          // Dùng dữ liệu tĩnh nếu định dạng không khớp
          cachedProvinces = FALLBACK_PROVINCES;
          setProvinces(FALLBACK_PROVINCES);
        }
      })
      .catch((err) => {
        console.warn("Lỗi API tỉnh thành, chuyển sang dữ liệu tĩnh fallback:", err);
        cachedProvinces = FALLBACK_PROVINCES;
        setProvinces(FALLBACK_PROVINCES);
      })
      .finally(() => setLoading(false));
  }, []);

  return { provinces, loading };
}

const districtCache = new Map<number, District[]>();

export function useDistricts(provinceCode: number | null) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      return;
    }

    if (districtCache.has(provinceCode)) {
      setDistricts(districtCache.get(provinceCode)!);
      return;
    }

    setLoading(true);
    fetch(`${PROVINCES_API}/p/${provinceCode}?depth=2`)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data: { districts: District[] }) => {
        const ds = data.districts || [];
        if (ds.length > 0) {
          districtCache.set(provinceCode, ds);
          setDistricts(ds);
        } else {
          // Fallback quận huyện tĩnh
          const localFallback = FALLBACK_DISTRICTS[provinceCode] || [];
          districtCache.set(provinceCode, localFallback);
          setDistricts(localFallback);
        }
      })
      .catch((err) => {
        console.warn(`Lỗi tải quận/huyện cho code ${provinceCode}, dùng fallback tĩnh:`, err);
        const localFallback = FALLBACK_DISTRICTS[provinceCode] || [];
        districtCache.set(provinceCode, localFallback);
        setDistricts(localFallback);
      })
      .finally(() => setLoading(false));
  }, [provinceCode]);

  return { districts, loading };
}
