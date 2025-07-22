"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  TrendingUp,
  Clock,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  totals: {
    quizzes: string;
    questions: string;
    students: string;
    attempts: string;
    activeQuizzes: string;
  };
  recentAttempts: {
    id: number;
    score: number;
    passed: boolean;
    completedAt: string;
    studentName: string;
    quizTitle: string;
  }[];
  quizStats: {
    quizId: number;
    quizTitle: string;
    totalAttempts: string;
    averageScore: string;
    passRate: string;
  }[];
}

interface RecentQuiz {
  id: number;
  title: string;
  attempts: string;
  avgScore: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard data
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      setDashboardData(data);

      // Fetch recent quizzes data
      const quizzesResponse = await fetch("/api/admin/recent-quizzes");
      if (!quizzesResponse.ok) {
        throw new Error("Failed to fetch recent quizzes");
      }
      const quizzesData = await quizzesResponse.json();
      setRecentQuizzes(quizzesData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB");
  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("en-GB");

  const cardStyle =
    "border bg-white rounded-lg shadow-sm hover:shadow transition-all";
  const cardContent = "p-4 md:p-5";
  const statLabel =
    "text-xs text-gray-500 uppercase font-semibold tracking-wider";
  const statValue = "text-xl md:text-2xl font-bold text-gray-800 mt-1";
  const iconWrap = "bg-gray-100 p-2 rounded-md";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 animate-pulse">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-md border"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <p className="font-medium">Error loading dashboard data</p>
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
              onClick={loadDashboardData}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  // Calculate average score across all quizzes
  const totalAttempts = parseInt(dashboardData.totals.attempts);
  const averageScore = dashboardData.quizStats.reduce((acc, quiz) => {
    return (
      acc +
      (parseFloat(quiz.averageScore) * parseInt(quiz.totalAttempts)) /
        totalAttempts
    );
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500">Quiz Management Overview</p>
          </div>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
          >
            <Link
              href="/admin/quizzes/create"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Quiz
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className={cardStyle}>
            <CardContent className={cardContent}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={statLabel}>Total Quizzes</p>
                  <p className={statValue}>{dashboardData.totals.quizzes}</p>
                </div>
                <div className={iconWrap}>
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cardStyle}>
            <CardContent className={cardContent}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={statLabel}>Total Students</p>
                  <p className={statValue}>{dashboardData.totals.students}</p>
                </div>
                <div className={iconWrap}>
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cardStyle}>
            <CardContent className={cardContent}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={statLabel}>Total Attempts</p>
                  <p className={statValue}>{dashboardData.totals.attempts}</p>
                </div>
                <div className={iconWrap}>
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cardStyle}>
            <CardContent className={cardContent}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={statLabel}>Average Score</p>
                  <p className={statValue}>{averageScore.toFixed(1)}%</p>
                </div>
                <div className={iconWrap}>
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Quiz Statistics */}
        <Card className="bg-white rounded-lg shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Quiz Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {dashboardData.quizStats.map((quiz) => (
              <div
                key={quiz.quizId}
                className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition"
              >
                <div>
                  <h3 className="font-medium text-gray-800">
                    {quiz.quizTitle}
                  </h3>
                  <div className="text-sm text-gray-500 mt-1 space-x-4">
                    <span>{quiz.totalAttempts} attempts</span>
                    <span>
                      Avg Score: {parseFloat(quiz.averageScore).toFixed(1)}%
                    </span>
                    <span>
                      Pass Rate: {parseFloat(quiz.passRate).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    <Link href={`/admin/quizzes/${quiz.quizId}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    <Link href={`/admin/quizzes/${quiz.quizId}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  {/* <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                    `
                      <Trash2 className="w-4 h-4" />
                    
                  </Button> */}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
