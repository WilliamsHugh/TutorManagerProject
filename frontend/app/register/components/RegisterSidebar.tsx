"use client";

import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function RegisterSidebar() {
    return (
        <aside
            className="hidden lg:flex lg:w-[440px] flex-shrink-0 flex-col px-12 py-12 overflow-hidden"
            style={{
                backgroundColor: "#1e3a8a",
                color: "white",
            }}
        >
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 text-2xl font-bold mb-20">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "white" }}
                >
                    <BookOpen size={24} style={{ color: "#1e3a8a" }} />
                </div>
                <span>TutorHub</span>
            </Link>

            {/* Quote Section */}
            <div className="mb-auto">
                <h2 className="text-4xl font-bold mb-4 leading-tight">
                    Tham gia cộng đồng học tập hàng đầu
                </h2>
                <p className="text-lg opacity-80 leading-relaxed">
                    Kết nối hàng ngàn gia sư chất lượng cao và học viên trên toàn quốc. Đăng ký ngay để bắt đầu hành trình của bạn.
                </p>
            </div>

            {/* Illustration */}
            <div className="mt-auto w-full">
                <Image
                    src="https://storage.googleapis.com/banani-generated-images/generated-images/85f6ae38-4476-462d-883e-521daf93b7af.jpg"
                    alt="Education Illustration"
                    width={344}
                    height={258}
                    className="w-full rounded-xl shadow-2xl object-cover"
                    unoptimized
                />
            </div>
        </aside>
    );
}
