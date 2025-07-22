// src/components/layouts/StudentLayout.tsx
import Header from "@/components/Header";
import Image from "next/image";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto">
        {children}
      </main>
      
      <footer className="bg-gray-50 border-t fixed bottom-0 left-0 right-0 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-2 md:mb-0">
              <div className="flex items-center justify-center">
                <Image
                  src="https://rxo5hd130p.ufs.sh/f/q5swrPKmNsM9oTaM85w42eRf7hMqdyWPJ1QctavKoT8OLpVY"
                  alt="GenNext Logo"
                  width={96}
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="text-gray-500 text-xs text-center md:text-right">
              <p>Empowering the next generation of tech talent</p>
              <p className="mt-1">© {new Date().getFullYear()} GenNext. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}