// app/admin/students/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, FileText, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  attempts: Attempt[];
}

interface Attempt {
  id: number;
  quizId: number;
  quizTitle: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentDetails = (studentId: number) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Student Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 p-4 font-medium">
          <div className="col-span-4">Student</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-2">Attempts</div>
          <div className="col-span-2">Actions</div>
        </div>

        {students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No students found.
          </div>
        ) : (
          students.map((student) => (
            <div key={student.id} className="border-b border-gray-200">
              <div className="grid grid-cols-12 p-4 items-center hover:bg-gray-50">
                <div className="col-span-4 font-medium">{student.name}</div>
                <div className="col-span-4 text-gray-600">{student.email}</div>
                <div className="col-span-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${student.attempts.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {student.attempts.length} attempt(s)
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStudentDetails(student.id)}
                  >
                    {expandedStudent === student.id ? (
                      <ChevronUp className="w-4 h-4 mr-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-1" />
                    )}
                    Details
                  </Button>
                </div>
              </div>

              {expandedStudent === student.id && (
                <div className="bg-gray-50 p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Quiz Attempts
                  </h3>
                  
                  {student.attempts.length === 0 ? (
                    <div className="text-gray-500 text-sm pl-6">No quiz attempts yet.</div>
                  ) : (
                    <div className="space-y-3 pl-6">
                      {student.attempts.map((attempt) => (
                        <div key={attempt.id} className="border-l-2 border-gray-300 pl-4 py-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{attempt.quizTitle}</h4>
                              <div className="text-sm text-gray-600">
                                Completed on: {new Date(attempt.completedAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {attempt.score}% - {attempt.passed ? 'Passed' : 'Failed'}
                              </span>
                              <Link href={`/admin/students/${student.id}/attempts/${attempt.id}`}>
                                <Button variant="outline" size="sm">
                                  View Responses <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}