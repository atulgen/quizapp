"use client";
import React, { useEffect } from "react";
// import { useRouter } from 'next/router';
import { Brain, Clock, Trophy, Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  // const router = useRouter();

  useEffect(() => {
    // Initialize quiz data (you can replace this with your localStorage logic)
  }, []);

  const handleStartQuiz = () => {
    // Redirect to quiz page
    // router.push('/quiz');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main content card */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Welcome to the Quiz
            </h1>
            <p className="text-gray-600">
              Test your knowledge on programming concepts
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-100 rounded-md p-4 mb-6">
            <h2 className="font-medium text-gray-800 mb-2">How it works</h2>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• Answer all questions within 10 minutes</li>
              <li>• Choose the best answer from four options</li>
              <li>• Results will be displayed after submission</li>
              <li>• You can retake the quiz anytime</li>
            </ul>
          </div>

          {/* Call to action */}
          <div className="text-center">
            <Link href="/quiz">
              <button className="px-6 py-3 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-700 transition-colors">
                Start Quiz
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
