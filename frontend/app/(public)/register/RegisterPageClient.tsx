"use client";

import RegisterSidebar from "./_components/RegisterSidebar";
import RegisterForm from "./_components/RegisterForm";

export default function RegisterPageClient() {
  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
      {/* Left Sidebar */}
      <RegisterSidebar />

      {/* Right Form Area */}
      <RegisterForm />
    </div>
  );
}
