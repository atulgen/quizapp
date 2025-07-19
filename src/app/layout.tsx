import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GenNext Quiz Platform",
  description: "Prove your skills and earn internships with GenNext's assessment platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        {/* Fixed Header */}
        <Header />

        {/* Main Content with padding to account for fixed header/footer */}
        <main className="flex-grow container mx-auto ">
          {children}
        </main>

        {/* Fixed Footer */}
        <footer className="bg-gray-50 border-t fixed bottom-0 left-0 right-0 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-2 md:mb-0">
                <div className=" flex items-center justify-center">
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
      </body>
    </html>
  );
}