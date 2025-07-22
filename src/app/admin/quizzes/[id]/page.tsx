"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  BarChart3,
  Clock,
  Target,
  Calendar,
  Users,
  TrendingUp,
  Award,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  category?: string;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  type?: "multiple-choice" | "true-false" | "short-answer";
  points?: number;
}

interface QuizStats {
  totalAttempts: number;
  averageScore?: number | null;
  passRate?: number | null;
  completionRate?: number | null;
  lastAttempt?: string;
}

interface QuizResponse {
  quiz: Quiz;
  questions: Question[];
  stats: QuizStats;
}

export default function QuizDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState<QuizResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuizData();
    }
  }, [id]);

  const loadQuizData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/quizzes/${id}`);
      if (!response.ok) throw new Error("Failed to fetch quiz data");
      const quizData: QuizResponse = await response.json();
      setData(quizData);
    } catch (error) {
      console.error("Error loading quiz:", error);
      alert("Failed to load quiz data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuiz = async () => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return;
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete quiz");
      router.push("/admin/quizzes?success=Quiz+deleted+successfully");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Failed to delete quiz. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">Quiz not found</p>
        <Link href="/admin/quizzes">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Button>
        </Link>
      </div>
    );
  }

  const { quiz, questions, stats } = data;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/quizzes">
            <Button variant="outline" size="sm" className="shrink-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold line-clamp-2">{quiz.title}</h1>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            quiz.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {quiz.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href={`/admin/quizzes/${quiz.id}/edit`} className="flex-1 sm:flex-none">
            <Button variant="default" size="sm" className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteQuiz}
            disabled={isDeleting}
            className="flex-1 sm:flex-none"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quiz Details Card */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b">
            <h2 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              Quiz Details
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <table className="w-full">
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-500 w-1/3">Description</td>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm">{quiz.description || "-"}</td>
                </tr>
                <tr>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-500">Time Limit</td>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm">{quiz.timeLimit} minutes</td>
                </tr>
                <tr>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-500">Passing Score</td>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm">{quiz.passingScore}%</td>
                </tr>
                <tr>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-500">Created</td>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm">{formatDate(quiz.createdAt)}</td>
                </tr>
                {quiz.updatedAt && (
                  <tr>
                    <td className="py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-500">Updated</td>
                    <td className="py-2 sm:py-3 text-xs sm:text-sm">{formatDate(quiz.updatedAt)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b">
            <h2 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              Statistics
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <table className="w-full">
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-500 w-1/3">Total Attempts</td>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm">{stats.totalAttempts}</td>
                </tr>
                <tr>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-500">Average Score</td>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm">
                    {stats.averageScore ? `${Number(stats.averageScore).toFixed(1)}%` : "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-500">Pass Rate</td>
                  <td className="py-2 sm:py-3 text-xs sm:text-sm">
                    {stats.passRate ? `${Number(stats.passRate).toFixed(1)}%` : "N/A"}
                  </td>
                </tr>
                {stats.lastAttempt && (
                  <tr>
                    <td className="py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-500">Last Attempt</td>
                    <td className="py-2 sm:py-3 text-xs sm:text-sm">{formatDate(stats.lastAttempt)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

       
      </div>

      {/* Questions Section */}
      <div className="mt-6 sm:mt-8 bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="font-semibold text-sm sm:text-base">Questions ({questions.length})</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href={`/admin/quizzes/${quiz.id}/edit`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Manage</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </Link>
            
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            <p>No questions added yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Type
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Points
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Correct
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((question, index) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-gray-500 max-w-[200px] sm:max-w-xs">
                      <div className="line-clamp-2">{question.text}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {question.type || "Multiple Choice"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                      {question.points || 1}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                      {question.correctAnswer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}