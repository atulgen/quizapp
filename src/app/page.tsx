// app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if student is already registered
    const student = localStorage.getItem('quizStudent');
    if (student) {
      router.push('/quiz');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <Image
            src="/Gennextlogoxdarkblue.jpg"
            alt="Quiz Image"
            width={200}
            height={200}
            className="rounded-lg mb-6 items-center justify-center mx-auto"
          />
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Welcome to the Quiz
            </h1>
            <p className="text-gray-600">
              Test your knowledge on programming concepts
            </p>
          </div>

          <div className="text-center">
            <button 
              onClick={() => router.push('/register')}
              className="px-6 py-3 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Register to Start Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}