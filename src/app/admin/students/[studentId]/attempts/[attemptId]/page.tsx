// app/admin/students/[studentId]/attempts/[attemptId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Check, X } from 'lucide-react';
import { useParams } from 'next/navigation';

interface AttemptDetail {
  id: number;
  quizId: number;
  quizTitle: string;
  studentName: string;
  studentEmail: string;
  score: number;
  passed: boolean;
  completedAt: string;
  responses: {
    questionId: number;
    questionText: string;
    selectedOption: string;
    correctOption: string;
    isCorrect: boolean;
  }[];
}

interface AttemptDetailPageProps {
  params: {
    studentId: string;
    attemptId: string;
  };
}

export default function AttemptDetailPage()  {
  const params = useParams();
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttemptDetails();
  }, [params.attemptId]);

  const fetchAttemptDetails = async () => {
    try {
      const response = await fetch(
        `/api/admin/students/${params.studentId}/attempts/${params.attemptId}`
      );
      if (response.ok) {
        const data = await response.json();
        setAttempt(data.attempt);
      }
    } catch (error) {
      console.error('Failed to fetch attempt details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Attempt not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/admin/students/${params.studentId}`}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Student
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold mb-2">Attempt Details</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Student</h3>
              <p>{attempt.studentName}</p>
              <p className="text-sm text-gray-600">{attempt.studentEmail}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Quiz</h3>
              <p>{attempt.quizTitle}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Result</h3>
              <p className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {attempt.score}% - {attempt.passed ? 'Passed' : 'Failed'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Completed on: {new Date(attempt.completedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Responses
          </h2>

          <div className="space-y-6">
            {attempt.responses.map((response, index) => (
              <div key={response.questionId} className="border-l-4 pl-4 py-2 ${response.isCorrect ? 'border-green-500' : 'border-red-500'}">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      Question {index + 1}: {response.questionText}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Selected:</span> {response.selectedOption}
                        {response.isCorrect ? (
                          <Check className="w-4 h-4 ml-2 inline text-green-500" />
                        ) : (
                          <X className="w-4 h-4 ml-2 inline text-red-500" />
                        )}
                      </p>
                      {!response.isCorrect && (
                        <p className="text-sm">
                          <span className="font-medium">Correct:</span> {response.correctOption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}