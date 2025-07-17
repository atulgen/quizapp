'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Users,
  TrendingUp,
  Clock,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface DashboardStats {
  totalQuizzes: number;
  totalStudents: number;
  totalAttempts: number;
  averageScore: number;
}

interface RecentQuiz {
  id: number;
  title: string;
  attempts: number;
  avgScore: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuizzes: 0,
    totalStudents: 0,
    totalAttempts: 0,
    averageScore: 0
  });
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        totalQuizzes: 24,
        totalStudents: 158,
        totalAttempts: 342,
        averageScore: 76.5
      });

      setRecentQuizzes([
        { id: 1, title: "JavaScript Fundamentals", attempts: 45, avgScore: 82.3, createdAt: "2024-01-15" },
        { id: 2, title: "React Basics", attempts: 38, avgScore: 78.9, createdAt: "2024-01-14" },
        { id: 3, title: "Database Design", attempts: 29, avgScore: 71.2, createdAt: "2024-01-13" },
        { id: 4, title: "API Development", attempts: 33, avgScore: 85.1, createdAt: "2024-01-12" }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB');

  const cardStyle = "border bg-white rounded-lg shadow-sm hover:shadow transition-all";
  const cardContent = "p-4 md:p-5";
  const statLabel = "text-xs text-gray-500 uppercase font-semibold tracking-wider";
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

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Quiz Management Overview</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Quiz
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className={cardStyle}>
            <CardContent className={cardContent}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={statLabel}>Total Quizzes</p>
                  <p className={statValue}>{stats.totalQuizzes}</p>
                </div>
                <div className={iconWrap}><FileText className="w-5 h-5 text-blue-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className={cardStyle}>
            <CardContent className={cardContent}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={statLabel}>Total Students</p>
                  <p className={statValue}>{stats.totalStudents}</p>
                </div>
                <div className={iconWrap}><Users className="w-5 h-5 text-green-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className={cardStyle}>
            <CardContent className={cardContent}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={statLabel}>Total Attempts</p>
                  <p className={statValue}>{stats.totalAttempts}</p>
                </div>
                <div className={iconWrap}><Clock className="w-5 h-5 text-yellow-500" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className={cardStyle}>
            <CardContent className={cardContent}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={statLabel}>Average Score</p>
                  <p className={statValue}>{stats.averageScore}%</p>
                </div>
                <div className={iconWrap}><TrendingUp className="w-5 h-5 text-purple-600" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Quizzes */}
        <Card className="bg-white rounded-lg shadow-sm">
          <CardHeader className="  border-b">
            <CardTitle className="text-lg font-semibold text-gray-800">Recent Quizzes</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {recentQuizzes.map(quiz => (
              <div key={quiz.id} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 transition">
                <div>
                  <h3 className="font-medium text-gray-800">{quiz.title}</h3>
                  <div className="text-sm text-gray-500 mt-1 space-x-4">
                    <span>{quiz.attempts} attempts</span>
                    <span>Avg: {quiz.avgScore}%</span>
                    <span>{formatDate(quiz.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-100">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-100">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {/* <Card className="bg-white border rounded-lg shadow-sm">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-lg font-semibold text-gray-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex items-start gap-3 text-left p-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg">
              <FileText className="w-5 h-5 mt-1 text-gray-600" />
              <div>
                <p className="font-medium text-gray-800">Create New Quiz</p>
                <p className="text-sm text-gray-500">Add questions and settings</p>
              </div>
            </Button>
            <Button variant="outline" className="h-20 flex items-start gap-3 text-left p-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg">
              <Users className="w-5 h-5 mt-1 text-gray-600" />
              <div>
                <p className="font-medium text-gray-800">Manage Students</p>
                <p className="text-sm text-gray-500">View and edit student data</p>
              </div>
            </Button>
            <Button variant="outline" className="h-20 flex items-start gap-3 text-left p-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg">
              <TrendingUp className="w-5 h-5 mt-1 text-gray-600" />
              <div>
                <p className="font-medium text-gray-800">View Reports</p>
                <p className="text-sm text-gray-500">Analyze quiz performance</p>
              </div>
            </Button>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
