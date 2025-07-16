/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { TQuiz, TSavedAnswer } from "@/types/quiz";

export default function Result() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [answers, setAnswers] = useState<TSavedAnswer>({});

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR(`/api/quiz`, fetcher);

  // Load answers from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAnswers = localStorage.getItem("quiz");
      setAnswers(savedAnswers ? JSON.parse(savedAnswers) : {});
    }
  }, []);

  // Submit responses to database
  const submitResponses = async (quizData: TQuiz[]) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      const responsePromises = quizData.map(async (quiz) => {
        const userAnswer = answers[quiz.id];
        if (userAnswer) {
          const response = await fetch('/api/quiz?action=response', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              quizId: quiz.id,
              userAnswer: userAnswer,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to submit response for question ${quiz.id}`);
          }
          
          return response.json();
        }
      });

      await Promise.all(responsePromises);
      setSubmissionSuccess(true);
      localStorage.removeItem("quiz");
    } catch (err) {
      console.error('Error submitting responses:', err);
      setSubmissionError(err instanceof Error ? err.message : 'Failed to submit responses');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit responses when component mounts and data is available
  useEffect(() => {
    if (data && !submissionSuccess && !isSubmitting && Object.keys(answers).length > 0) {
      submitResponses(data);
    }
  }, [data, submissionSuccess, isSubmitting, answers]);

  if (error) return <div className="text-red-500 text-center py-8">Failed to load quiz data</div>;
  if (isLoading) return <div className="text-center py-8">Loading results...</div>;

  const correctAnswers = data ? data.reduce((count: number, quiz: TQuiz) => 
    quiz.answer === answers[quiz.id] ? count + 1 : count, 0) : 0;

  const passed = correctAnswers > (data.length / 100) * 70;

  return (
   <div className="min-h-screen bg-gray-50 p-4 md:p-8">
  <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-gray-800">Quiz Results</h1>
      <Link 
        href="/" 
        className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Retake Quiz
      </Link>
    </div>
    
    {/* Submission status */}
    {isSubmitting && (
      <div className="bg-blue-100 text-blue-800 p-3 rounded-md mb-4 text-sm">
        <p>Submitting your responses...</p>
      </div>
    )}
    
    {submissionError && (
      <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 text-sm">
        <p>Error: {submissionError}</p>
      </div>
    )}
    
    {submissionSuccess && (
      <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4 text-sm">
        <p>Your responses have been saved successfully</p>
      </div>
    )}

    <div className={`p-4 mb-6 rounded-md ${passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      <h2 className="text-lg font-medium">
        You answered {correctAnswers} out of {data.length} questions correctly.
      </h2>
      <p className="mt-1">
        {passed ? "Congratulations, you passed!" : "Sorry, you didn't pass this time."}
      </p>
    </div>

    <div className="space-y-6">
      {data.map((quiz: TQuiz) => {
        const isCorrect = quiz.answer === answers[quiz.id];
        const userAnswer = answers[quiz.id];
        
        return (
          <div key={quiz.id} className="border border-gray-200 p-4 rounded-md">
            <h3 className="font-medium text-gray-800 mb-3">{quiz.question}</h3>
            <ul className="space-y-2">
              {quiz.options.map((option: string, i: number) => {
                const isSelected = userAnswer === option;
                const isActualAnswer = option === quiz.answer;
                
                return (
                  <li 
                    key={i} 
                    className={`p-2 rounded ${
                      isActualAnswer 
                        ? isSelected 
                          ? 'bg-green-50 text-green-700' 
                          : ''
                        : isSelected 
                          ? 'bg-red-50 text-red-700' 
                          : ''
                    }`}
                  >
                    <div className="flex items-center">
                      {isSelected && !isActualAnswer && <span className="line-through mr-2">{option}</span>}
                      {!isSelected && !isActualAnswer && <span>{option}</span>}
                      {isActualAnswer && <span className="font-medium">{option}</span>}
                      
                      {isActualAnswer && isSelected && (
                        <span className="ml-2 text-green-600 text-sm">(Your correct answer)</span>
                      )}
                      {!isActualAnswer && isSelected && (
                        <span className="ml-2 text-red-600 text-sm">(Your incorrect answer)</span>
                      )}
                      {isActualAnswer && !isSelected && (
                        <span className="ml-2 text-green-600 text-sm">(Correct answer)</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  </div>
</div>
  );
}