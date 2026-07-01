"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";

import { useProvinces, useDistricts, useWards } from "@/lib/hooks/useProvinces";

interface CreateAccountFormProps {
  onCreateAccount: (accountData: any) => void;
}

export function CreateAccountForm({ onCreateAccount }: CreateAccountFormProps) {
  const [newAccount, setNewAccount] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    address: "",
    roleName: "staff",
  });

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  const { provinces } = useProvinces();
  const { districts } = useDistricts(selectedProvinceCode);
  const { wards } = useWards(selectedDistrictCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccount.roleName === "tutor" && (!provinceName || !districtName || !wardName)) {
      alert("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện và Phường/Xã cho gia sư.");
      return;
    }
    const payload = {
      ...newAccount,
      ...(newAccount.roleName === "tutor" ? {
        province: provinceName,
        district: districtName,
        ward: wardName,
      } : {})
    };
    onCreateAccount(payload);
    setNewAccount({
      email: "",
      password: "",
      fullName: "",
      phone: "",
      address: "",
      roleName: "staff",
    });
    setProvinceName("");
    setDistrictName("");
    setWardName("");
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
  };

  return (
    <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <UserPlus className="text-pink-400" />
          Cấp và tạo tài khoản trực tiếp
        </h2>
        <p className="text-xs text-slate-400 mt-1">Cấp tài khoản đăng nhập trực tiếp cho Nhân viên quản lý trung tâm hoặc Gia sư</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs text-slate-400">Email đăng nhập *</label>
            <Input
              type="email"
              className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
              placeholder="staff@tutoredu.com hoặc tutor@tutoredu.com..."
              value={newAccount.email}
              onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5 col-span-2">
            <label className="text-xs text-slate-400">Mật khẩu đăng nhập *</label>
            <Input
              type="password"
              className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
              placeholder="Nhập mật khẩu an toàn..."
              value={newAccount.password}
              onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5 col-span-2">
            <label className="text-xs text-slate-400">Họ và tên *</label>
            <Input
              className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
              placeholder="Ví dụ: Trần Văn Long"
              value={newAccount.fullName}
              onChange={(e) => setNewAccount({ ...newAccount, fullName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-xs text-slate-400">Số điện thoại</label>
            <Input
              className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
              placeholder="Số điện thoại liên lạc..."
              value={newAccount.phone}
              onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })}
            />
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-xs text-slate-400">Vai trò cấp tài khoản *</label>
            <select
              value={newAccount.roleName}
              onChange={(e) => setNewAccount({ ...newAccount, roleName: e.target.value })}
              className="w-full h-9 rounded text-xs bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none custom-select"
              required
            >
              <option value="staff">Nhân viên trung tâm (Staff)</option>
              <option value="tutor">Gia sư giảng dạy (Tutor)</option>
            </select>
          </div>

          {newAccount.roleName === "tutor" && (
            <>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs text-slate-400">Tỉnh / Thành phố nhận dạy *</label>
                <select
                  value={selectedProvinceCode || ""}
                  onChange={(e) => {
                    const code = Number(e.target.value);
                    const name = provinces.find((p) => p.code === code)?.name || "";
                    setSelectedProvinceCode(code);
                    setProvinceName(name);
                    setSelectedDistrictCode(null);
                    setDistrictName("");
                    setWardName("");
                  }}
                  className="w-full h-9 rounded text-xs bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none custom-select"
                  required
                >
                  <option value="">Chọn Tỉnh/Thành...</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs text-slate-400">Quận / Huyện nhận dạy *</label>
                <select
                  value={selectedDistrictCode || ""}
                  onChange={(e) => {
                    const code = Number(e.target.value);
                    const name = districts.find((d) => d.code === code)?.name || "";
                    setSelectedDistrictCode(code);
                    setDistrictName(name);
                    setWardName("");
                  }}
                  disabled={!selectedProvinceCode}
                  className="w-full h-9 rounded text-xs bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none custom-select disabled:opacity-50"
                  required
                >
                  <option value="">Chọn Quận/Huyện...</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs text-slate-400">Phường / Xã nhận dạy *</label>
                <select
                  value={wardName || ""}
                  onChange={(e) => setWardName(e.target.value)}
                  disabled={!selectedDistrictCode}
                  className="w-full h-9 rounded text-xs bg-[#0f172a] border border-slate-700 text-slate-300 px-3 cursor-pointer outline-none custom-select disabled:opacity-50"
                  required
                >
                  <option value="">Chọn Phường/Xã...</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="space-y-1.5 col-span-2">
            <label className="text-xs text-slate-400">Địa chỉ liên hệ</label>
            <Input
              className="bg-[#0f172a] border-slate-700 text-xs text-white h-9"
              placeholder="Địa chỉ liên hệ thường trú... (Nếu bỏ trống, hệ thống sẽ dùng địa chỉ nhận dạy của gia sư)"
              value={newAccount.address}
              onChange={(e) => setNewAccount({ ...newAccount, address: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer mt-2"
        >
          <UserPlus size={16} /> Xác nhận cấp tài khoản
        </button>
      </form>
    </div>
  );
}
