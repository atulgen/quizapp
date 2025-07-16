"use client";
import Link from "next/link";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import useSWR from "swr";
import { TSavedAnswer } from "@/types/quiz";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Quiz() {
  const Ref = useRef<number | null>(null);
  const [timer, setTimer] = useState("00:10:00");
  const [pageIndex, setPageIndex] = useState(0);
  const [answered, setAnswered] = useState<TSavedAnswer>({});

  // Timer functions
  const getTimeRemaining = (e: Date) => {
    const total = Date.parse(e.toString()) - Date.parse(new Date().toString());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    return { total, hours, minutes, seconds };
  };

  const startTimer = (e: Date) => {
    const { total, hours, minutes, seconds } = getTimeRemaining(e);
    if (total >= 0) {
      setTimer(
        `${hours > 9 ? hours : "0" + hours}:${
          minutes > 9 ? minutes : "0" + minutes
        }:${seconds > 9 ? seconds : "0" + seconds}`
      );
    }
  };

  const clearTimer = (e: Date) => {
    setTimer("00:10:00");
    if (Ref.current) clearInterval(Ref.current);
    Ref.current = window.setInterval(() => startTimer(e), 1000);
  };

  const getDeadTime = (): Date => {
    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 600);
    return deadline;
  };

  useEffect(() => {
    clearTimer(getDeadTime());
    return () => {
      if (Ref.current) clearInterval(Ref.current);
    };
  }, []);

  // Load saved answers from localStorage
  useEffect(() => {
    const saved = window.localStorage.getItem("quiz");
    if (saved) {
      setAnswered(JSON.parse(saved));
    }
  }, []);

  // Fetch quiz data
  const { data, error } = useSWR(`/api/quiz?page=${pageIndex}`, fetcher);

  const addAnswer = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const latestAnswers = { ...answered, [name]: value };
    setAnswered(latestAnswers);
    window.localStorage.setItem("quiz", JSON.stringify(latestAnswers));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{timer}</h2>
          <h3 className="text-xl text-red-500 mb-6">Failed to load quiz data</h3>
          <Link 
            href="/" 
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{timer}</h2>
          <h3 className="text-xl text-gray-600">Loading quiz...</h3>
          <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const { quiz, next, prev, page, total } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
  {timer === "00:00:00" ? (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md w-full text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Time's up!</h2>
        <p className="text-gray-600 mb-6">Redirecting to results...</p>
        <Link
          href="/result"
          replace
          className="inline-block px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          View Results Now
        </Link>
      </div>
    </div>
  ) : (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header with timer and progress */}
      <div className="bg-gray-800 p-4 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">{timer}</h2>
          <p className="text-sm">
            Question {parseInt(page) + 1} of {total}
          </p>
        </div>
      </div>

      {/* Quiz content */}
      <div className="p-4 md:p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          {quiz.question}
        </h3>
        
        <ul className="space-y-2 mb-6">
          {quiz.options.map((option: string, i: number) => (
            <li key={i}>
              <label className={`flex items-center p-3 border rounded-md cursor-pointer transition-all ${
                answered[quiz.id] === option 
                  ? 'border-gray-800 bg-gray-100' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  id={`quiz-${quiz.id}-option-${i}`}
                  name={quiz.id.toString()}
                  onChange={addAnswer}
                  value={option}
                  checked={answered[quiz.id] === option}
                  className="h-4 w-4 text-gray-800 focus:ring-gray-500"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            </li>
          ))}
        </ul>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          {prev ? (
            <button
              onClick={() => setPageIndex(pageIndex - 1)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              ← Previous
            </button>
          ) : (
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel Quiz
            </Link>
          )}

          {next ? (
            <button
              onClick={() => setPageIndex(pageIndex + 1)}
              disabled={answered[quiz.id] === undefined}
              className={`px-4 py-2 rounded-md transition-colors ${
                answered[quiz.id] === undefined
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Next →
            </button>
          ) : (
            answered[quiz.id] !== undefined && (
              <Link
                href="/result"
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Finish Quiz
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  )}
</div>
  );
}