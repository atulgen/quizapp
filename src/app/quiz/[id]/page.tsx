"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { InferSelectModel } from "drizzle-orm";
import { quizzes, questions, attempts } from "@/db/schema";

type Quiz = InferSelectModel<typeof quizzes>;
type Question = InferSelectModel<typeof questions> & { options: string[] };
type Attempt = InferSelectModel<typeof attempts>;

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answerChoices, setAnswerChoices] = useState<Record<number, string>>(
    {}
  );
  const [quizData, setQuizData] = useState<{
    quiz: Quiz;
    questions: Question[];
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [student, setStudent] = useState<{ id: number; name: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Prevent navigation away from quiz
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(answers).length > 0 && !isSubmitting) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved answers. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [answers, isSubmitting]);

  const cleanOption = (option: any) => {
  let cleaned = String(option);
  
  // Remove all unwanted characters and quotes
  cleaned = cleaned
    .replace(/^\[|\]$/g, '') // Remove [ ] at start/end
    .replace(/^["']|["']$/g, '') // Remove quotes at start/end
    .replace(/\\"/g, '"') // Unescape quotes
    .trim();
  
  return cleaned;
};

  // Load quiz data and initialize timer
useEffect(() => {
    const studentData = localStorage.getItem("quizStudent");
    if (!studentData) {
      router.push("/register");
      return;
    }

    if(localStorage.getItem("")){
      
    }
    const parsedStudent = JSON.parse(studentData);
    setStudent(parsedStudent);


const fetchQuiz = async () => {
  try {
    setIsLoading(true);
    setError(null);

    const response = await fetch(
      `/api/quiz/${quizId}?studentId=${parsedStudent.id}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Quiz not available");
    }

    const data = await response.json();
    
    if (!data.quiz) {
      throw new Error("No quiz found");
    }
    if (data.quiz.timeLimit <= 0) {
      throw new Error("Invalid time limit");
    }

    // ============================================
    // Validate questions - API should have already parsed options
    // ============================================
    const validatedQuestions = data.questions.map((question: any) => {
      // Ensure options is an array with 4 elements
      if (!Array.isArray(question.options)) {
        console.error(`Question ${question.id}: Options is not an array`, question.options);
        return {
          ...question,
          options: ['Option A', 'Option B', 'Option C', 'Option D']
        };
      }
      
      if (question.options.length !== 4) {
        console.warn(
          `Question ${question.id}: Has ${question.options.length} options instead of 4`,
          question.options
        );
        
        if (question.options.length > 4) {
          return {
            ...question,
            options: question.options.slice(0, 4)
          };
        } else {
          return {
            ...question,
            options: ['Option A', 'Option B', 'Option C', 'Option D']
          };
        }
      }

      // Clean each option (remove any extra whitespace)
      return {
        ...question,
        options: question.options.map((opt: string) => String(opt).trim())
      };
    });

    // Final validation
    const invalidQuestions = validatedQuestions.filter(
      (q: any) => !q.options || q.options.length !== 4
    );
    
    if (invalidQuestions.length > 0) {
      console.error('Questions with invalid options:', invalidQuestions);
      throw new Error(
        `${invalidQuestions.length} questions have invalid options. Please contact admin.`
      );
    }

    setQuizData({
      quiz: data.quiz,
      questions: validatedQuestions,
    });

    // Initialize timer
    const quizDuration = data.quiz.timeLimit * 60;
    const savedTime = localStorage.getItem(`quiz_${data.quiz.id}_time`);

    if (savedTime) {
      const { start, remaining } = JSON.parse(savedTime);
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setTimeLeft(Math.max(0, remaining - elapsed));
    } else {
      localStorage.setItem(
        `quiz_${data.quiz.id}_time`,
        JSON.stringify({
          start: Date.now(),
          remaining: quizDuration,
        })
      );
      setTimeLeft(quizDuration);
    }

    setStartTime(Date.now());
    setIsLoading(false);
  } catch (error) {
    console.error("Quiz load error:", error);
    setError(
      error instanceof Error ? error.message : "Failed to load quiz"
    );
    setIsLoading(false);
    setTimeout(() => router.push("/dashboard"), 3000);
  }
};

    if (quizId) fetchQuiz();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [router, quizId]);
  // Timer countdown
  useEffect(() => {
    if (!quizData || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        localStorage.setItem(
          `quiz_${quizData.quiz.id}_time`,
          JSON.stringify({
            start: startTime!,
            remaining: newTime,
          })
        );

        if (newTime <= 0) {
          handleQuizCompletion();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizData, startTime, timeLeft]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getChoiceLetter = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  const handleAnswerSelect = (
    questionId: number,
    option: string,
    optionIndex: number
  ) => {
    const choiceLetter = getChoiceLetter(optionIndex);

    const newAnswers = { ...answers, [questionId]: option };
    const newChoices = { ...answerChoices, [questionId]: choiceLetter };

    setAnswers(newAnswers);
    setAnswerChoices(newChoices);

    if (quizData) {
      localStorage.setItem(
        `quiz_${quizData.quiz.id}_answers`,
        JSON.stringify(newAnswers)
      );
      localStorage.setItem(
        `quiz_${quizData.quiz.id}_choices`,
        JSON.stringify(newChoices)
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
    const correct = quizData.questions.filter((q) => {
      const selectedChoiceLetter = answerChoices[q.id];
      return selectedChoiceLetter === q.correctAnswer;
    }).length;
    return Math.round((correct / quizData.questions.length) * 100);
  };

  const handleQuizCompletion = async () => {
    if (!quizData || !student || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const score = calculateScore();
      const correctAnswers = quizData.questions.filter((q) => {
        const selectedChoiceLetter = answerChoices[q.id];
        return selectedChoiceLetter === q.correctAnswer;
      }).length;

      const responses = quizData.questions.map((question) => ({
        questionId: question.id,
        selectedAnswer: answerChoices[question.id] || null,
        selectedAnswerChoice: answerChoices[question.id] || null,
        isCorrect: answerChoices[question.id] === question.correctAnswer,
      }));

      const timeSpent = startTime
        ? Math.floor((Date.now() - startTime) / 1000)
        : 0;

      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quizData.quiz.id,
          studentId: student.id,
          score,
          totalQuestions: quizData.questions.length,
          correctAnswers,
          passed: score >= (quizData.quiz.passingScore || 70),
          responses,
          timeSpent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      localStorage.removeItem(`quiz_${quizData.quiz.id}_answers`);
      localStorage.removeItem(`quiz_${quizData.quiz.id}_choices`);
      localStorage.removeItem(`quiz_${quizData.quiz.id}_time`);

      localStorage.setItem(
        "quizResult",
        JSON.stringify({
          score,
          totalQuestions: quizData.questions.length,
          correctAnswers,
          passed: score >= (quizData.quiz.passingScore || 70),
          quizTitle: quizData.quiz.title,
          attemptId: result.attemptId,
        })
      );

      window.history.pushState(null, "", "/completion");
      router.push("/completion");
    } catch (error) {
      console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmSubmit = () => {
    if (timeLeft > 60) {
      setShowSubmitConfirm(true);
    } else if (timeLeft > 0) {
      if (confirm(`You have ${formatTime(timeLeft)} remaining. Submit now?`)) {
        handleQuizCompletion();
      }
    } else {
      handleQuizCompletion();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full bg-white rounded-xl shadow-sm p-6">
          <div className="text-red-500 mb-4">
            <svg
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Quiz Error
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No quiz data available</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                {quizData.quiz.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of{" "}
                {quizData.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-normal">
              <div
                className={`text-base sm:text-lg font-mono ${
                  timeLeft <= 300 ? "text-red-600" : "text-gray-700"
                }`}
              >
                ⏰ {formatTime(timeLeft)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {answeredCount}/{quizData.questions.length} answered
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2">
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 mb-2">
          {/* Question */}
          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-4">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => {
                const choiceLetter = getChoiceLetter(index);
                const isSelected = answers[currentQuestion.id] === option;

                return (
                  <label
                    key={index}
                    className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={isSelected}
                      onChange={() =>
                        handleAnswerSelect(currentQuestion.id, option, index)
                      }
                      className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start space-x-2">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {choiceLetter}
                        </span>
                        <span className="text-gray-700 break-words">
                          {option}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation */}
<div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
  {/* Previous + Next together */}
  <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
    <button
      onClick={goToPreviousQuestion}
      disabled={currentQuestionIndex === 0}
      className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      <span>Previous</span>
    </button>

    <button
      onClick={goToNextQuestion}
      disabled={currentQuestionIndex === quizData.questions.length - 1}
      className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
    >
      <span>Next</span>
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  </div>

  {/* Submit Quiz stays separate */}
  <button
    onClick={confirmSubmit}
    disabled={isSubmitting}
    className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
  >
    {isSubmitting ? (
      <span className="flex items-center justify-center">
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Submitting...
      </span>
    ) : (
      "Submit Quiz"
    )}
  </button>
</div>


      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Submit Quiz?</h3>
            <p className="text-gray-600 mb-6">
              You still have {formatTime(timeLeft)} remaining. Are you sure you
              want to submit now?
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleQuizCompletion}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
