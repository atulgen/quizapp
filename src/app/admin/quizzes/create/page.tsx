// app/admin/quizzes/create/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function CreateQuizPage() {
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData>({
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 70,
    isActive: true,
  });
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", options: ["", "", "", ""], correctAnswer: "A" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (question.options.some(option => !option.trim())) {
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
      const response = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quiz: quizData,
          questions: questions
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create quiz');
      }

      const data = await response.json();
      router.push(`/admin/quizzes?success=Quiz+created+successfully`);
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert(error instanceof Error ? error.message : "Failed to create quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6  mx-auto">
      <div className="flex items-center gap-4 mb-6">
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
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Quiz Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Title *
              </label>
              <Input
                name="title"
                value={quizData.title}
                onChange={handleQuizChange}
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Time Limit (minutes)
              </label>
              <Input
                name="timeLimit"
                type="number"
                value={quizData.timeLimit}
                onChange={handleQuizChange}
                min="1"
                max="180"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                name="description"
                value={quizData.description}
                onChange={handleQuizChange}
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Passing Score (%)
              </label>
              <Input
                name="passingScore"
                type="number"
                value={quizData.passingScore}
                onChange={handleQuizChange}
                min="1"
                max="100"
              />
            </div>
            <div className="flex items-center space-x-2">
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

        {/* Questions */}
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Questions</h2>
            <Button type="button" onClick={addQuestion} variant="outline">
              <Plus size={16} className="mr-2" />
              Add Question
            </Button>
          </div>

          <div className="space-y-6">
            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Question {questionIndex + 1}</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveQuestionUp(questionIndex)}
                      disabled={questionIndex === 0}
                    >
                      <ChevronUp size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveQuestionDown(questionIndex)}
                      disabled={questionIndex === questions.length - 1}
                    >
                      <ChevronDown size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(questionIndex)}
                      disabled={questions.length === 1}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Question Text *
                    </label>
                    <Textarea
                      value={question.text}
                      onChange={(e) =>
                        handleQuestionChange(questionIndex, "text", e.target.value)
                      }
                      placeholder="Enter question text"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Options *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {String.fromCharCode(65 + optionIndex)}:
                          </span>
                          <Input
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(questionIndex, optionIndex, e.target.value)
                            }
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Correct Answer *
                    </label>
                    <select
                      value={question.correctAnswer}
                      onChange={(e) =>
                        handleQuestionChange(questionIndex, "correctAnswer", e.target.value)
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select correct answer</option>
                      {question.options.map((_, optionIndex) => (
                        <option key={optionIndex} value={String.fromCharCode(65 + optionIndex)}>
                          {String.fromCharCode(65 + optionIndex)}: {question.options[optionIndex]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
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
            {isSubmitting ? "Creating..." : "Create Quiz"}
          </Button>
        </div>
      </form>
    </div>
  );
}