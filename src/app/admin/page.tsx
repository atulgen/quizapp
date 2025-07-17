// app/admin/page.tsx
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
      // Simulate API calls with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalQuizzes: 24,
        totalStudents: 158,
        totalAttempts: 342,
        averageScore: 76.5
      });

      setRecentQuizzes([
        {
          id: 1,
          title: "JavaScript Fundamentals",
          attempts: 45,
          avgScore: 82.3,
          createdAt: "2024-01-15"
        },
        {
          id: 2,
          title: "React Basics",
          attempts: 38,
          avgScore: 78.9,
          createdAt: "2024-01-14"
        },
        {
          id: 3,
          title: "Database Design",
          attempts: 29,
          avgScore: 71.2,
          createdAt: "2024-01-13"
        },
        {
          id: 4,
          title: "API Development",
          attempts: 33,
          avgScore: 85.1,
          createdAt: "2024-01-12"
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-2 border-black">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your quiz management system</p>
        </div>
        <Button className="bg-black hover:bg-gray-800 text-white border-2 border-black">
          <Plus className="w-4 h-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold text-black">{stats.totalQuizzes}</p>
              </div>
              <div className="bg-black p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-black">{stats.totalStudents}</p>
              </div>
              <div className="bg-black p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-black">{stats.totalAttempts}</p>
              </div>
              <div className="bg-black p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-black">{stats.averageScore}%</p>
              </div>
              <div className="bg-black p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quizzes */}
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-black">Recent Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentQuizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-medium text-black">{quiz.title}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>{quiz.attempts} attempts</span>
                    <span>Avg: {quiz.avgScore}%</span>
                    <span>Created: {formatDate(quiz.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="border-black hover:bg-black hover:text-white">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-black hover:bg-black hover:text-white">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-black">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-24 border-2 border-black hover:bg-black hover:text-white justify-start"
            >
              <div className="text-left">
                <FileText className="w-6 h-6 mb-2" />
                <p className="font-medium">Create New Quiz</p>
                <p className="text-sm opacity-70">Add questions and settings</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 border-2 border-black hover:bg-black hover:text-white justify-start"
            >
              <div className="text-left">
                <Users className="w-6 h-6 mb-2" />
                <p className="font-medium">Manage Students</p>
                <p className="text-sm opacity-70">View and edit student data</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 border-2 border-black hover:bg-black hover:text-white justify-start"
            >
              <div className="text-left">
                <TrendingUp className="w-6 h-6 mb-2" />
                <p className="font-medium">View Reports</p>
                <p className="text-sm opacity-70">Analyze quiz performance</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}