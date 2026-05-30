"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, isLoggedIn, getUserRole, getTokenTTL, getTokenExpiryDate } from "@/lib/auth";

// --- Cấu hình (có thể tạm thời giảm để test) ---
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 phút không hoạt động
const WARNING_BEFORE_IDLE_MS = 60 * 1000; // Cảnh báo trước 1 phút

export default function SessionTimeoutHandler() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningSeconds, setWarningSeconds] = useState(60);
  // Dùng ref để tránh re-register event listeners khi showWarning thay đổi
  const showWarningRef = useRef(false);

  // Đồng bộ ref với state
  useEffect(() => {
    showWarningRef.current = showWarning;
  }, [showWarning]);

  const handleLogout = useCallback(() => {
    console.log("Phiên làm việc hết hạn do không hoạt động.");
    clearAuth();

    // Clear cookies
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/auth/refresh;";

    setShowWarning(false);

    // Role-based redirect
    const role = getUserRole();
    if (role === "admin" || role === "staff") {
      router.push("/hub/login?reason=timeout");
    } else {
      router.push("/login?reason=timeout");
    }
  }, [router]);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startTimers = useCallback(() => {
    clearAllTimers();

    if (!isLoggedIn()) return;

    // Đặt cảnh báo trước khi logout (1 phút trước)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setWarningSeconds(60);

      // Đếm ngược 60 giây
      countdownRef.current = setInterval(() => {
        setWarningSeconds((prev) => {
          if (prev <= 1) {
            // Hết giờ -> logout
            if (countdownRef.current) clearInterval(countdownRef.current);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_IDLE_MS);

    // Đặt timeout chính (dự phòng)
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, IDLE_TIMEOUT_MS);
  }, [clearAllTimers, handleLogout]);

  // Token TTL check — log cảnh báo nếu token sắp hết hạn (chỉ trong dev)
  useEffect(() => {
    if (!isLoggedIn()) return;

    const checkTokenTTL = () => {
      const ttl = getTokenTTL();
      if (ttl > 0 && ttl < 5 * 60 * 1000) {
        if (process.env.NODE_ENV !== 'production') {
          const expiryDate = getTokenExpiryDate();
          console.log(
            `[TTL] Token sắp hết hạn: còn ${Math.round(ttl / 1000)} giây. Hết hạn lúc: ${expiryDate?.toLocaleTimeString()}`,
          );
        }
      }
    };

    checkTokenTTL();
    const interval = setInterval(checkTokenTTL, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Idle detection — dùng showWarningRef để tránh re-register listeners
  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];

    const handleActivity = () => {
      // Nếu đang hiện warning, tắt khi user tương tác
      if (showWarningRef.current) {
        setShowWarning(false);
        if (countdownRef.current) clearInterval(countdownRef.current);
      }
      startTimers();
    };

    // Phím Escape để đóng warning
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showWarningRef.current) {
        setShowWarning(false);
        if (countdownRef.current) clearInterval(countdownRef.current);
        startTimers();
      }
    };

    if (isLoggedIn()) {
      startTimers();
      events.forEach((event) => window.addEventListener(event, handleActivity));
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      clearAllTimers();
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      window.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTimers, clearAllTimers]);

  // Click outside overlay để đóng warning và reset timer
  const handleOverlayClick = () => {
    if (showWarning) {
      setShowWarning(false);
      if (countdownRef.current) clearInterval(countdownRef.current);
      startTimers();
    }
  };

  return (
    <>
      {showWarning && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-xl p-6 shadow-2xl ring-1"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--card)",
              color: "var(--card-foreground)",
              borderColor: "var(--border)",
            }}
          >
            <div className="mb-1 flex items-center justify-center">
              <span className="text-3xl">⏰</span>
            </div>
            <h3
              className="mb-2 text-center text-lg font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Phiên làm việc sắp hết hạn
            </h3>
            <p
              className="mb-4 text-center text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              Bạn có muốn tiếp tục phiên làm việc?
            </p>
            <div className="mb-4 flex items-center justify-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full ring-2"
                style={{
                  backgroundColor: "rgba(245,158,11,0.2)",
                  borderColor: "rgba(245,158,11,0.5)",
                }}
              >
                <span className="text-2xl font-bold text-amber-400">
                  {warningSeconds}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWarning(false);
                  if (countdownRef.current) clearInterval(countdownRef.current);
                  startTimers();
                }}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition hover:opacity-90 active:scale-95"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                Tiếp tục
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition hover:opacity-90 active:scale-95"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
