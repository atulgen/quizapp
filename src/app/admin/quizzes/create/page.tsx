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
    <div className="p-6 w-full mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/quizzes">
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} />
            Back to Quizzes
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Create New Quiz</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Details */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Quiz Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Title */}
            <div className="space-y-1">
              <label className="block text-sm font-medium">Title *</label>
              <Input
                name="title"
                value={quizData.title}
                onChange={handleQuizChange}
                placeholder="Quiz title"
                required
                className="h-9"
              />
            </div>

            {/* Time Limit */}

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-sm font-medium">Description</label>
              <Input
                name="description"
                value={quizData.description}
                onChange={handleQuizChange}
                placeholder="Short description"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Time (min)</label>
              <Input
                name="timeLimit"
                type="number"
                value={quizData.timeLimit}
                onChange={handleQuizChange}
                min="1"
                max="180"
                className="h-9"
              />
            </div>

            {/* Second row with remaining fields */}
            <div className="md:col-span-1 space-y-1">
              <label className="block text-sm font-medium">
                Passing Score (%)
              </label>
              <Input
                name="passingScore"
                type="number"
                value={quizData.passingScore}
                onChange={handleQuizChange}
                min="1"
                max="100"
                className="h-9"
              />
            </div>

            {/* Active checkbox aligned properly */}
            <div className="flex items-end space-x-2 md:col-span-2">
              <Checkbox
                id="isActive"
                checked={quizData.isActive}
                onCheckedChange={(checked) =>
                  setQuizData((prev) => ({ ...prev, isActive: !!checked }))
                }
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active (visible to students)
              </label>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Questions</h2>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Upload size={16} />
                Import
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
                className="gap-2"
              >
                <Plus size={16} />
                Add
              </Button>
            </div>
          </div>

          {importError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md flex justify-between items-center text-sm">
              <span>{importError}</span>
              <button onClick={() => setImportError(null)}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedQuestions.length > 0 && (
            <div className="mb-4 p-2 bg-blue-50 rounded-md flex justify-between items-center text-sm">
              <div className="text-blue-700">
                {selectedQuestions.length} selected
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

          {/* Horizontal Scrollable Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {" "}
              {/* Minimum width to ensure all columns are visible */}
              <div className="grid grid-cols-12 gap-2 items-center py-2 px-3 bg-gray-50 border-b font-medium text-sm">
                <div className="col-span-1">
                  <Checkbox
                    checked={
                      selectedQuestions.length === questions.length &&
                      questions.length > 0
                    }
                    onCheckedChange={toggleSelectAllQuestions}
                    disabled={questions.length === 0}
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
                    className="grid grid-cols-12 gap-2 items-center py-3 px-3 border-b hover:bg-gray-50"
                  >
                    {/* Checkbox */}
                    <div className="col-span-1">
                      <Checkbox
                        checked={selectedQuestions.includes(questionIndex)}
                        onCheckedChange={() =>
                          toggleSelectQuestion(questionIndex)
                        }
                      />
                    </div>

                    {/* Question Number */}
                    <div className="col-span-1 text-sm">
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
                        className="w-full h-8 text-sm"
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
                            <span className="text-xs font-medium w-4">
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
                              className="h-8 text-sm"
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
                        className="w-full p-1 border rounded text-xs h-8"
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
                        className="h-7 w-7"
                      >
                        <ChevronUp size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveQuestionDown(questionIndex)}
                        disabled={questionIndex === questions.length - 1}
                        className="h-7 w-7"
                      >
                        <ChevronDown size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(questionIndex)}
                        disabled={questions.length === 1}
                        className="h-7 w-7 text-red-600 hover:text-red-700"
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
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/quizzes">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
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
              <span className="flex items-center gap-2">
                <Check size={16} />
                Create Quiz
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
