// src/components/layouts/StudentLayout.tsx
'use client';

import Header from "@/components/Header";
import Image from "next/image";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Main content: grows to fill space, scrolls if needed */}
      <main className="flex-1 container mx-auto px-2 py-7 pb-30 md:pb-20">
        {children}
      </main>

      {/* Fixed footer - always visible at bottom */}
      <footer className="fixed inset-x-0 bottom-0 bg-gray-50 border-t z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <div className="flex items-center gap-2 mb-2 md:mb-0">
              <Image
                src="https://rxo5hd130p.ufs.sh/f/q5swrPKmNsM9oTaM85w42eRf7hMqdyWPJ1QctavKoT8OLpVY"
                alt="GenNext Logo"
                width={96}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="text-center md:text-right">
              <p>Empowering the next generation of tech talent</p>
              <p className="mt-1">© {new Date().getFullYear()} GenNext. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}