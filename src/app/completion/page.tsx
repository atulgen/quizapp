"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CompletionPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds

  const handleNavigation = () => {
    // Clear all quiz-related data
    localStorage.removeItem('quizStudent');
    // Prevent going back to quiz
    window.history.pushState(null, '', '/');
    router.push('/');
  };

  useEffect(() => {
    // Check if quiz was completed
    const student = localStorage.getItem('quizStudent');
    if (!student) {
      handleNavigation();
      return;
    }
    
    // Set up countdown timer (corrected to 1000ms)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNavigation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Changed from 8000 to 1000 for 1-second intervals

    // Prevent going back
    window.history.pushState(null, '', '/completion');
    const handlePopState = () => {
      window.history.pushState(null, '', '/completion');
      handleNavigation();
    };
    
    window.addEventListener('popstate', handlePopState);

    return () => {
      clearInterval(timer);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for taking the quiz. Your results will be reviewed and you'll be notified shortly.
        </p>
        
        <p className="text-sm text-gray-500 mb-4">
          You will be automatically redirected in {timeLeft} seconds
        </p>
        
        <button
          onClick={handleNavigation}
          className="inline-block px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}