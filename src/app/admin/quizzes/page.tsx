// app/admin/quizzes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSearchParams } from 'next/navigation';

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
  questionsCount: number;
}

interface QuizzesResponse {
  quizzes: Quiz[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export default function QuizzesPage() {
  const searchParams = useSearchParams();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check for success message in URL params
    const success = searchParams.get('success');
    if (success) {
      setSuccessMessage(decodeURIComponent(success));
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    loadQuizzes();
  }, [currentPage, searchTerm, statusFilter]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/quizzes?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }

      const data: QuizzesResponse = await response.json();
      setQuizzes(data.quizzes);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      alert('Failed to load quizzes. Please try again.');
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

  const toggleQuizStatus = async (quizId: number) => {
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}/toggle-status`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle quiz status');
      }

      const data = await response.json();
      setQuizzes(quizzes.map(q => 
        q.id === quizId ? { ...q, isActive: data.quiz.isActive } : q
      ));
    } catch (error) {
      console.error('Error toggling quiz status:', error);
      alert('Failed to update quiz status. Please try again.');
    }
  };

  const deleteQuiz = async (quizId: number) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      // Reload quizzes after deletion
      loadQuizzes();
      setSuccessMessage('Quiz deleted successfully');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz. Please try again.');
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (value: 'all' | 'active' | 'inactive') => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quiz Management</h1>
        <Link href="/admin/quizzes/create">
          <Button className="flex items-center gap-2">
            <Plus size={20} />
            Create Quiz
          </Button>
        </Link>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quizzes</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quizzes Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Time Limit</TableHead>
              <TableHead>Passing Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell className="max-w-xs truncate">{quiz.description}</TableCell>
                <TableCell>{quiz.questionsCount}</TableCell>
                <TableCell>{quiz.timeLimit} min</TableCell>
                <TableCell>{quiz.passingScore}%</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      quiz.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {quiz.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>{formatDate(quiz.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/quizzes/${quiz.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye size={16} />
                      </Button>
                    </Link>
                    <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit size={16} />
                      </Button>
                    </Link>
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleQuizStatus(quiz.id)}
                    >
                      <FileText size={16} />
                    </Button> */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteQuiz(quiz.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
          {pagination.totalCount} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(1)}
            disabled={pagination.currentPage === 1}
          >
            <ChevronsLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            <ChevronsRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}