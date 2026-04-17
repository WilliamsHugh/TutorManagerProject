"use client";

import RegisterSidebar from "./components/RegisterSidebar";
import RegisterForm from "./components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
      {/* Left Sidebar */}
      <RegisterSidebar />

      {/* Right Form Area */}
      <RegisterForm />
    </div>
  );
}
