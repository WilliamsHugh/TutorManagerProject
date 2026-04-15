"use client";

import { useState } from "react";
import RoleSelection from "./components/RoleSelection";
import StudentSignup from "./components/StudentSignup";
import TutorSignup from "./components/TutorSignup";

type UserRole = "student" | "tutor" | null;

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  return (
    <div
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        minHeight: "100vh",
      }}
    >
      {!selectedRole ? (
        <RoleSelection onSelectRole={setSelectedRole} />
      ) : selectedRole === "student" ? (
        <StudentSignup onBack={() => setSelectedRole(null)} />
      ) : (
        <TutorSignup onBack={() => setSelectedRole(null)} />
      )}
    </div>
  );
}
