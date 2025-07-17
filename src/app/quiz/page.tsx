// app/quiz/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { InferSelectModel } from "drizzle-orm";
import { quizzes, questions, attempts } from "@/db/schema";

type Quiz = InferSelectModel<typeof quizzes>;
type Question = InferSelectModel<typeof questions> & { options: string[] };
type Attempt = InferSelectModel<typeof attempts>;

export default function QuizPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizData, setQuizData] = useState<{
    quiz: Quiz;
    questions: Question[];
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [student, setStudent] = useState<{id: number, name: string} | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Prevent reload/refresh and back navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(answers).length > 0 && !isSubmitting) {
        e.preventDefault();
        e.returnValue = 'You have unsaved answers. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const handlePopState = () => {
      if (isSubmitting || Object.keys(answers).length > 0) {
        router.push('/');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [answers, isSubmitting, router]);

  // Load student and quiz data
  useEffect(() => {
    const studentData = localStorage.getItem("quizStudent");
    if (!studentData) {
      router.push("/register");
      return;
    }
    setStudent(JSON.parse(studentData));

    const fetchQuiz = async () => {
      try {
        const response = await fetch("/api/quiz");
        if (!response.ok) throw new Error("Quiz not available");
        
        const data = await response.json();
        if (!data.quiz) throw new Error("No active quiz found");
        
        // Check if student already attempted this quiz
        const attemptCheck = await fetch(
          `/api/attempts?studentId=${JSON.parse(studentData).id}&quizId=${data.quiz.id}`
        );
        
        if (attemptCheck.ok) {
          const existingAttempts = await attemptCheck.json();
          if (existingAttempts.length > 0) {
            alert('You have already attempted this quiz.');
            router.push('/');
            return;
          }
        }

        // Clean up options by removing any surrounding quotes or brackets
        const cleanedQuestions = data.questions.map((question: Question) => ({
          ...question,
          options: question.options.map(opt => 
            typeof opt === 'string' 
              ? opt.replace(/^["'\[ ]+|["'\] ]+$/g, '') 
              : opt
          )
        }));
        
        setQuizData({
          quiz: data.quiz,
          questions: cleanedQuestions
        });
        
        // Load saved answers and timer if exists
        const savedAnswers = localStorage.getItem(`quiz_${data.quiz.id}_answers`);
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));

        const savedTime = localStorage.getItem(`quiz_${data.quiz.id}_time`);
        if (savedTime) {
          const { start, duration } = JSON.parse(savedTime);
          const elapsed = Math.floor((Date.now() - start) / 1000);
          setTimeLeft(Math.max(0, duration - elapsed));
        } else {
          localStorage.setItem(
            `quiz_${data.quiz.id}_time`,
            JSON.stringify({ start: Date.now(), duration: 600 })
          );
        }
        
        setStartTime(Date.now());
      } catch (error) {
        console.error("Quiz load error:", error);
        router.push("/?error=quiz_not_available");
      }
    };

    fetchQuiz();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [router]);

  // Timer management
  useEffect(() => {
    if (!quizData || !startTime) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        // Save time progress
        if (quizData) {
          localStorage.setItem(
            `quiz_${quizData.quiz.id}_time`,
            JSON.stringify({ 
              start: startTime, 
              duration: 600 - (600 - newTime) 
            })
          );
        }

        if (newTime <= 0) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          handleQuizCompletion();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizData, startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, option: string) => {
    const newAnswers = { ...answers, [questionId]: option };
    setAnswers(newAnswers);
    if (quizData) {
      localStorage.setItem(
        `quiz_${quizData.quiz.id}_answers`,
        JSON.stringify(newAnswers)
      );
    }
  };

  const goToNextQuestion = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    
    const correct = quizData.questions.filter(
      (q) => answers[q.id] === q.correctAnswer
    ).length;
    
    return Math.round((correct / quizData.questions.length) * 100);
  };

  const handleQuizCompletion = async () => {
    if (!quizData || !student || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const score = calculateScore();
      
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quizData.quiz.id,
          studentId: student.id,
          score,
          passed: score >= (quizData.quiz.passingScore || 70),
        }),
      });

      if (!response.ok) throw new Error('Submission failed');

      // Clean up
      localStorage.removeItem(`quiz_${quizData.quiz.id}_answers`);
      localStorage.removeItem(`quiz_${quizData.quiz.id}_time`);
      localStorage.removeItem('quizStudent');
      
      // Prevent going back
      window.history.pushState(null, '', '/completion');
      router.push("/completion");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quizData || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const totalQuestions = quizData.questions.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Quiz Header with Timer */}
        <div className="bg-gray-800 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{quizData.quiz.title}</h1>
              <p className="text-sm">Student: {student.name}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono bg-gray-900 px-3 py-1 rounded">
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm mt-1">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
          ></div>
        </div>

        {/* Question Area */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">{currentQuestion.text}</h2>
          
          <ul className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);
              return (
                <li key={index}>
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.id] === optionLetter
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name={`q_${currentQuestion.id}`}
                      className="mr-3 h-4 w-4"
                      checked={answers[currentQuestion.id] === optionLetter}
                      onChange={() => handleAnswerSelect(currentQuestion.id, optionLetter)}
                    />
                    <span className="font-medium">{optionLetter}.</span>
                    <span className="ml-2">{option}</span>
                  </label>
                </li>
              );
            })}
          </ul>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleQuizCompletion}
                disabled={!answers[currentQuestion.id] || isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Quiz'
                )}
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                disabled={!answers[currentQuestion.id]}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}