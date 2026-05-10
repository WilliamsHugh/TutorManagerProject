"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, isLoggedIn } from "@/lib/auth";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 phút

export default function SessionTimeoutHandler() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (isLoggedIn()) {
      timeoutRef.current = setTimeout(() => {
        handleLogout();
      }, TIMEOUT_MS);
    }
  };

  const handleLogout = () => {
    console.log("Phiên làm việc hết hạn sau 30 phút không hoạt động.");
    clearAuth();
    router.push("/login?reason=timeout");
  };

  useEffect(() => {
    // Các sự kiện đánh dấu người dùng đang hoạt động
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    
    const handleActivity = () => resetTimer();

    if (isLoggedIn()) {
      resetTimer();
      events.forEach((event) => {
        window.addEventListener(event, handleActivity);
      });
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [router]);

  return null;
}
