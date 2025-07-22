// app/admin/quizzes/create/page.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Check,
  Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface QuizData {
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
}

interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
}

interface ImportedQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [quizData, setQuizData] = useState<QuizData>({
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 70,
    isActive: true,
  });
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", options: ["", "", "", ""], correctAnswer: "A" },
  ]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleQuizChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuizData((prev) => ({
      ...prev,
      [name]:
        name === "timeLimit" || name === "passingScore"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleQuestionChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setQuestions((prev) => {
      const newQuestions = [...prev];
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value,
      };
      return newQuestions;
    });
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setQuestions((prev) => {
      const newQuestions = [...prev];
      newQuestions[questionIndex].options[optionIndex] = value;
      return newQuestions;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { text: "", options: ["", "", "", ""], correctAnswer: "A" },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
      setSelectedQuestions(selectedQuestions.filter((i) => i !== index));
    }
  };

  const removeSelectedQuestions = () => {
    if (selectedQuestions.length > 0) {
      setQuestions((prev) =>
        prev.filter((_, i) => !selectedQuestions.includes(i))
      );
      setSelectedQuestions([]);
    }
  };

  const moveQuestionUp = (index: number) => {
    if (index > 0) {
      setQuestions((prev) => {
        const newQuestions = [...prev];
        [newQuestions[index - 1], newQuestions[index]] = [
          newQuestions[index],
          newQuestions[index - 1],
        ];
        return newQuestions;
      });
      // Update selected indices
      setSelectedQuestions((prev) =>
        prev.map((i) => {
          if (i === index) return i - 1;
          if (i === index - 1) return i + 1;
          return i;
        })
      );
    }
  };

  const moveQuestionDown = (index: number) => {
    if (index < questions.length - 1) {
      setQuestions((prev) => {
        const newQuestions = [...prev];
        [newQuestions[index], newQuestions[index + 1]] = [
          newQuestions[index + 1],
          newQuestions[index],
        ];
        return newQuestions;
      });
      // Update selected indices
      setSelectedQuestions((prev) =>
        prev.map((i) => {
          if (i === index) return i + 1;
          if (i === index + 1) return i - 1;
          return i;
        })
      );
    }
  };

  const toggleSelectQuestion = (index: number) => {
    setSelectedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleSelectAllQuestions = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map((_, i) => i));
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedData: ImportedQuestion[] = JSON.parse(content);

        if (!Array.isArray(parsedData)) {
          throw new Error("Invalid format: Expected an array of questions");
        }

        const importedQuestions = parsedData.map((q) => {
          if (!q.question || !q.options || !q.correct_answer) {
            throw new Error(
              "Each question must have 'question', 'options', and 'correct_answer' fields"
            );
          }

          // Find the index of the correct answer in options
          const correctIndex = q.options.findIndex(
            (opt) => opt === q.correct_answer
          );
          if (correctIndex === -1) {
            throw new Error(
              `Correct answer "${q.correct_answer}" not found in options`
            );
          }

          return {
            text: q.question,
            options: q.options,
            correctAnswer: String.fromCharCode(65 + correctIndex),
          };
        });

        setQuestions(importedQuestions);
        setSelectedQuestions([]);
        setImportError(null);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        setImportError(
          error instanceof Error
            ? error.message
            : "Invalid JSON format. Please check the file structure."
        );
      }
    };
    reader.onerror = () => {
      setImportError("Error reading file");
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    if (!quizData.title.trim()) {
      alert("Quiz title is required");
      return false;
    }

    if (questions.length === 0) {
      alert("At least one question is required");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.text.trim()) {
        alert(`Question ${i + 1} text is required`);
        return false;
      }

      if (question.options.some((option) => !option.trim())) {
        alert(`All options for question ${i + 1} must be filled`);
        return false;
      }

      if (!question.correctAnswer) {
        alert(`Correct answer for question ${i + 1} must be selected`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz: quizData,
          questions: questions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create quiz");
      }

      const data = await response.json();
      router.push(`/admin/quizzes?success=Quiz+created+successfully`);
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create quiz. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="p-4 sm:p-6 w-full mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6">
          <Link href="/admin/quizzes">
            <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline ml-2">Back to Quizzes</span>
              <span className="sm:hidden ml-2">Back</span>
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-900">Create New Quiz</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Quiz Details */}
          <div className="border border-indigo-200 rounded-lg p-4 sm:p-6 bg-white shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-indigo-900">Quiz Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Title */}
              <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <Input
                  name="title"
                  value={quizData.title}
                  onChange={handleQuizChange}
                  placeholder="Quiz title"
                  required
                  className="h-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2 lg:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <Input
                  name="description"
                  value={quizData.description}
                  onChange={handleQuizChange}
                  placeholder="Short description"
                  className="h-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Time Limit */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Time (min)</label>
                <Input
                  name="timeLimit"
                  type="number"
                  value={quizData.timeLimit}
                  onChange={handleQuizChange}
                  min="1"
                  max="180"
                  className="h-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Passing Score */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Passing Score (%)
                </label>
                <Input
                  name="passingScore"
                  type="number"
                  value={quizData.passingScore}
                  onChange={handleQuizChange}
                  min="1"
                  max="100"
                  className="h-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Active checkbox */}
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="isActive"
                  checked={quizData.isActive}
                  onCheckedChange={(checked) =>
                    setQuizData((prev) => ({ ...prev, isActive: !!checked }))
                  }
                  className="border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (visible to students)
                </label>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="border border-indigo-200 rounded-lg p-4 sm:p-6 bg-white shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-indigo-900">Questions</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <Upload size={16} />
                  <span className="hidden sm:inline">Import</span>
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  accept=".json"
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={addQuestion}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Question</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>

            {importError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex justify-between items-start gap-3 text-sm">
                <span className="flex-1">{importError}</span>
                <button onClick={() => setImportError(null)} className="flex-shrink-0 hover:bg-red-100 p-1 rounded">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Bulk Actions */}
            {selectedQuestions.length > 0 && (
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-md flex justify-between items-center text-sm">
                <div className="text-indigo-700 font-medium">
                  {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeSelectedQuestions}
                  className="gap-2 h-8"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-12 gap-2 items-center py-2 px-3 bg-indigo-50 border-b border-indigo-200 font-medium text-sm text-indigo-900 rounded-t">
                  <div className="col-span-1">
                    <Checkbox
                      checked={
                        selectedQuestions.length === questions.length &&
                        questions.length > 0
                      }
                      onCheckedChange={toggleSelectAllQuestions}
                      disabled={questions.length === 0}
                      className="border-indigo-300 text-indigo-600"
                    />
                  </div>
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Question</div>
                  <div className="col-span-4">Options</div>
                  <div className="col-span-1">Correct</div>
                  <div className="col-span-1">Actions</div>
                </div>
                {questions.length > 0 ? (
                  questions.map((question, questionIndex) => (
                    <div
                      key={questionIndex}
                      className="grid grid-cols-12 gap-2 items-center py-3 px-3 border-b border-gray-100 hover:bg-indigo-25"
                    >
                      {/* Checkbox */}
                      <div className="col-span-1">
                        <Checkbox
                          checked={selectedQuestions.includes(questionIndex)}
                          onCheckedChange={() =>
                            toggleSelectQuestion(questionIndex)
                          }
                          className="border-indigo-300 text-indigo-600"
                        />
                      </div>

                      {/* Question Number */}
                      <div className="col-span-1 text-sm font-medium text-indigo-700">
                        {questionIndex + 1}
                      </div>

                      {/* Question Text */}
                      <div className="col-span-4">
                        <Input
                          value={question.text}
                          onChange={(e) =>
                            handleQuestionChange(
                              questionIndex,
                              "text",
                              e.target.value
                            )
                          }
                          placeholder="Question text"
                          required
                          className="w-full h-8 text-sm border-indigo-200 focus:border-indigo-500"
                        />
                      </div>

                      {/* Options */}
                      <div className="col-span-4">
                        <div className="grid grid-cols-2 gap-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center gap-1"
                            >
                              <span className="text-xs font-medium w-4 text-indigo-600">
                                {String.fromCharCode(65 + optionIndex)}:
                              </span>
                              <Input
                                value={option}
                                onChange={(e) =>
                                  handleOptionChange(
                                    questionIndex,
                                    optionIndex,
                                    e.target.value
                                  )
                                }
                                placeholder={`Option ${String.fromCharCode(
                                  65 + optionIndex
                                )}`}
                                required
                                className="h-8 text-sm border-indigo-200 focus:border-indigo-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Correct Answer */}
                      <div className="col-span-1">
                        <select
                          value={question.correctAnswer}
                          onChange={(e) =>
                            handleQuestionChange(
                              questionIndex,
                              "correctAnswer",
                              e.target.value
                            )
                          }
                          className="w-full p-1 border border-indigo-200 rounded text-xs h-8 focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        >
                          <option value="">Select</option>
                          {question.options.map((_, optionIndex) => (
                            <option
                              key={optionIndex}
                              value={String.fromCharCode(65 + optionIndex)}
                            >
                              {String.fromCharCode(65 + optionIndex)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moveQuestionUp(questionIndex)}
                          disabled={questionIndex === 0}
                          className="h-7 w-7 text-indigo-600 hover:bg-indigo-100"
                        >
                          <ChevronUp size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moveQuestionDown(questionIndex)}
                          disabled={questionIndex === questions.length - 1}
                          className="h-7 w-7 text-indigo-600 hover:bg-indigo-100"
                        >
                          <ChevronDown size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(questionIndex)}
                          disabled={questions.length === 1}
                          className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-12 py-8 text-center text-gray-500 text-sm">
                    No questions added yet
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {questions.length > 0 ? (
                questions.map((question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="border border-indigo-200 rounded-lg p-4 bg-indigo-25"
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedQuestions.includes(questionIndex)}
                          onCheckedChange={() =>
                            toggleSelectQuestion(questionIndex)
                          }
                          className="border-indigo-300 text-indigo-600"
                        />
                        <span className="font-semibold text-indigo-700">
                          Question {questionIndex + 1}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moveQuestionUp(questionIndex)}
                          disabled={questionIndex === 0}
                          className="h-8 w-8 text-indigo-600 hover:bg-indigo-100"
                        >
                          <ChevronUp size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moveQuestionDown(questionIndex)}
                          disabled={questionIndex === questions.length - 1}
                          className="h-8 w-8 text-indigo-600 hover:bg-indigo-100"
                        >
                          <ChevronDown size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(questionIndex)}
                          disabled={questions.length === 1}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text
                      </label>
                      <Input
                        value={question.text}
                        onChange={(e) =>
                          handleQuestionChange(
                            questionIndex,
                            "text",
                            e.target.value
                          )
                        }
                        placeholder="Enter question text"
                        required
                        className="w-full border-indigo-200 focus:border-indigo-500"
                      />
                    </div>

                    {/* Options */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <span className="text-sm font-medium w-6 text-indigo-600 bg-indigo-100 rounded px-2 py-1 text-center">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <Input
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(
                                  questionIndex,
                                  optionIndex,
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${String.fromCharCode(
                                65 + optionIndex
                              )}`}
                              required
                              className="flex-1 border-indigo-200 focus:border-indigo-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correct Answer
                      </label>
                      <select
                        value={question.correctAnswer}
                        onChange={(e) =>
                          handleQuestionChange(
                            questionIndex,
                            "correctAnswer",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-indigo-200 rounded focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select correct answer</option>
                        {question.options.map((_, optionIndex) => (
                          <option
                            key={optionIndex}
                            value={String.fromCharCode(65 + optionIndex)}
                          >
                            Option {String.fromCharCode(65 + optionIndex)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="text-gray-400 mb-2">
                    <Menu size={48} className="mx-auto" />
                  </div>
                  <p className="text-gray-500">No questions added yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click "Add Question" to get started
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
            <Link href="/admin/quizzes" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full sm:w-auto border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                  Creating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Check size={16} />
                  Create Quiz
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}