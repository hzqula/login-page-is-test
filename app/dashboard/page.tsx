// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Define interface for user type
interface User {
  id: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      // Type guard to ensure parsed data has email property
      if (
        typeof parsedUser === "object" &&
        parsedUser !== null &&
        "email" in parsedUser
      ) {
        setUser(parsedUser as User);
      } else {
        console.error("Invalid user data format");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) {
    return null; // or loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">
              Welcome to your dashboard!
            </h2>
            <p className="text-gray-600">
              You are logged in as {user.email}. This is a simple dashboard page
              that you can customize according to your needs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
