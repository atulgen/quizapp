'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState<{name: string} | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('quizStudent');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('quizStudent');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="  flex items-center justify-center">
            <Image
              src="https://rxo5hd130p.ufs.sh/f/q5swrPKmNsM9oTaM85w42eRf7hMqdyWPJ1QctavKoT8OLpVY"
              alt="GenNext Logo"
              width={96}
              height={40}
              className="object-contain"
            />
          </div>
          
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            {/* <span className="text-gray-700 font-medium">Welcome, {user.name}</span> */}
            <button 
              onClick={handleLogout}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <h1>Welcome, please Register</h1>
        )}
      </div>
    </header>
  );
}