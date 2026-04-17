"use client";

import RegisterSidebar from "./components/RegisterSidebar";
import RegisterForm from "./components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
      {/* Left Sidebar */}
      <RegisterSidebar />

      {/* Right Form Area */}
      <RegisterForm />
    </div>
  );
}
