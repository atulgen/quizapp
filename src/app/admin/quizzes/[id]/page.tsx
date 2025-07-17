// app/admin/quizzes/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Copy,
  BarChart3,
  Clock,
  Target,
  Calendar,
  Users,
  TrendingUp,
  Award,
  Eye,
  EyeOff
} from 'lucide-react';

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
  type?: 'multiple-choice' | 'true-false' | 'short-answer';
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
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuizData();
    }
  }, [id]);

  const loadQuizData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/quizzes/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/admin/quizzes?error=Quiz+not+found');
          return;
        }
        throw new Error('Failed to fetch quiz data');
      }

      const quizData: QuizResponse = await response.json();
      setData(quizData);
    } catch (error) {
      console.error('Error loading quiz:', error);
      alert('Failed to load quiz data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuizStatus = async () => {
    if (!data) return;
    
    try {
      setIsToggling(true);
      const response = await fetch(`/api/admin/quizzes/${id}/toggle-status`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle quiz status');
      }

      const result = await response.json();
      setData({
        ...data,
        quiz: {
          ...data.quiz,
          isActive: result.quiz.isActive
        }
      });
    } catch (error) {
      console.error('Error toggling quiz status:', error);
      alert('Failed to update quiz status. Please try again.');
    } finally {
      setIsToggling(false);
    }
  };

  const deleteQuiz = async () => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      router.push('/admin/quizzes?success=Quiz+deleted+successfully');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const duplicateQuiz = async () => {
    try {
      setIsDuplicating(true);
      const response = await fetch(`/api/admin/quizzes/${id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate quiz');
      }

      const result = await response.json();
      router.push(`/admin/quizzes/${result.quiz.id}/edit?success=Quiz+duplicated+successfully`);
    } catch (error) {
      console.error('Error duplicating quiz:', error);
      alert('Failed to duplicate quiz. Please try again.');
    } finally {
      setIsDuplicating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <Eye size={16} /> : <EyeOff size={16} />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Quiz not found</p>
          <Link href="/admin/quizzes">
            <Button className="mt-4">Back to Quizzes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { quiz, questions, stats } = data;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/quizzes">
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} />
            Back to Quizzes
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex-1">{quiz.title}</h1>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(quiz.isActive)}`}>
          {getStatusIcon(quiz.isActive)}
          {quiz.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <Link href={`/admin/quizzes/${quiz.id}/edit`}>
          <Button variant="default" size="sm">
            <Edit size={16} />
            Edit Quiz
          </Button>
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleQuizStatus}
          disabled={isToggling}
        >
          {getStatusIcon(!quiz.isActive)}
          {isToggling ? 'Updating...' : (quiz.isActive ? 'Deactivate' : 'Activate')}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={duplicateQuiz}
          disabled={isDuplicating}
        >
          <Copy size={16} />
          {isDuplicating ? 'Duplicating...' : 'Duplicate'}
        </Button>
        <Link href={`/admin/quizzes/${quiz.id}/analytics`}>
          <Button variant="outline" size="sm">
            <BarChart3 size={16} />
            Analytics
          </Button>
        </Link>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={deleteQuiz}
          disabled={isDeleting}
        >
          <Trash2 size={16} />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      {/* Quiz Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Quiz Details */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText size={20} />
            Quiz Details
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-600 font-medium">Description:</span>
              <p className="text-sm mt-1">{quiz.description || 'No description provided'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600 font-medium">Category:</span>
              <p className="text-sm mt-1">{quiz.category || 'Uncategorized'}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Time Limit:</span>
              <p className="text-sm font-medium">{quiz.timeLimit} minutes</p>
            </div>
            <div className="flex items-center gap-2">
              <Target size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Passing Score:</span>
              <p className="text-sm font-medium">{quiz.passingScore}%</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Created:</span>
              <p className="text-sm">{formatDate(quiz.createdAt)}</p>
            </div>
            {quiz.updatedAt && (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">Updated:</span>
                <p className="text-sm">{formatDate(quiz.updatedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Statistics */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Statistics
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-500" />
              <span className="text-sm text-gray-600">Total Attempts:</span>
              <p className="text-sm font-medium">{stats.totalAttempts}</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-sm text-gray-600">Average Score:</span>
              <p className="text-sm font-medium">{(stats.averageScore ?? 0).toFixed(1)}%</p>
            </div>
            <div className="flex items-center gap-2">
              <Award size={16} className="text-yellow-500" />
              <span className="text-sm text-gray-600">Pass Rate:</span>
              <p className="text-sm font-medium">{(stats.passRate ?? 0).toFixed(1)}%</p>
            </div>
            <div className="flex items-center gap-2">
              <Target size={16} className="text-purple-500" />
              <span className="text-sm text-gray-600">Completion Rate:</span>
              <p className="text-sm font-medium">{(stats.completionRate ?? 0).toFixed(1)}%</p>
            </div>
            {stats.lastAttempt && (
              <div>
                <span className="text-sm text-gray-600">Last Attempt:</span>
                <p className="text-sm">{formatDate(stats.lastAttempt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href={`/admin/quizzes/${quiz.id}/preview`} className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye size={16} />
                Preview Quiz
              </Button>
            </Link>
            <Link href={`/admin/quizzes/${quiz.id}/results`} className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 size={16} />
                View Results
              </Button>
            </Link>
            <Link href={`/admin/quizzes/${quiz.id}/export`} className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText size={16} />
                Export Data
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
          <Link href={`/admin/quizzes/${quiz.id}/questions`}>
            <Button variant="outline" size="sm">
              <Edit size={16} />
              Manage Questions
            </Button>
          </Link>
        </div>
        
        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No questions added yet.</p>
            <Link href={`/admin/quizzes/${quiz.id}/questions/new`} className="inline-block mt-2">
              <Button size="sm">Add First Question</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">Question {index + 1}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {question.type || 'Multiple Choice'}
                    </span>
                    {question.points && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {question.points} pts
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{question.text}</p>
                
                {question.options && question.options.length > 0 && (
                  <div className="space-y-1">
                    {question.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex} 
                        className={`text-xs px-2 py-1 rounded ${
                          option === question.correctAnswer 
                            ? 'bg-green-100 text-green-800 font-medium' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {String.fromCharCode(65 + optionIndex)}. {option}
                        {option === question.correctAnswer && ' ✓'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}