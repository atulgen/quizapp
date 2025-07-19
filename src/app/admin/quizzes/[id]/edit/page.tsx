"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react";

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
}

interface Question {
  id?: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

export default function EditQuizPage() {
  const router = useRouter();
  const { id } = useParams();
  const [quizData, setQuizData] = useState<Quiz>({
    id: 0,
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 70,
    isActive: true,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          router.push("/admin/quizzes?error=Quiz+not+found");
          return;
        }
        throw new Error("Failed to fetch quiz data");
      }

      const data = await response.json();

      setQuizData({
        id: data.quiz.id,
        title: data.quiz.title,
        description: data.quiz.description,
        timeLimit: data.quiz.timeLimit,
        passingScore: data.quiz.passingScore,
        isActive: data.quiz.isActive,
      });

      setQuestions(
        data.questions.map((q: any) => ({
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
        }))
      );
    } catch (error) {
      console.error("Error loading quiz:", error);
      alert("Failed to load quiz data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz: quizData,
          questions,
        }),
      });

      if (!response.ok) throw new Error("Failed to update quiz");

      router.push(`/admin/quizzes/${id}?success=Quiz+updated+successfully`);
    } catch (error) {
      console.error("Error updating quiz:", error);
      alert("Failed to update quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/quizzes/${id}`}>
          <Button variant="outline" size="icon" className="border-gray-300">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Quiz</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Quiz Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                value={quizData.title}
                onChange={handleQuizChange}
                placeholder="Enter quiz title"
                className="w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (minutes)
              </label>
              <Input
                type="number"
                id="timeLimit"
                name="timeLimit"
                value={quizData.timeLimit}
                onChange={handleQuizChange}
                min="1"
                className="w-full"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={quizData.description}
              onChange={handleQuizChange}
              placeholder="Enter quiz description"
              className="w-full min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-1">
                Passing Score (%)
              </label>
              <Input
                type="number"
                id="passingScore"
                name="passingScore"
                value={quizData.passingScore}
                onChange={handleQuizChange}
                min="1"
                max="100"
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="isActive"
                checked={quizData.isActive}
                onCheckedChange={(checked) =>
                  setQuizData((prev) => ({
                    ...prev,
                    isActive: Boolean(checked),
                  }))
                }
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Quiz
              </label>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
            <Button
              type="button"
              onClick={addQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Options
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correct Answer
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((question, qIndex) => (
                  <tr key={qIndex}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Input
                        value={question.text}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, "text", e.target.value)
                        }
                        placeholder="Enter question text"
                        className="w-full"
                        required
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, oIndex) => (
                          <Input
                            key={oIndex}
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(
                                qIndex,
                                oIndex,
                                e.target.value
                              )
                            }
                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                            className="w-full"
                            required
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        {question.options.map((_, oIndex) => (
                          <div key={oIndex} className="flex items-center">
                            <input
                              type="radio"
                              id={`correct-${qIndex}-${oIndex}`}
                              name={`correctAnswer-${qIndex}`}
                              value={String.fromCharCode(65 + oIndex)}
                              checked={
                                question.correctAnswer ===
                                String.fromCharCode(65 + oIndex)
                              }
                              onChange={() =>
                                handleQuestionChange(
                                  qIndex,
                                  "correctAnswer",
                                  String.fromCharCode(65 + oIndex)
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor={`correct-${qIndex}-${oIndex}`} className="ml-2 block text-sm text-gray-700">
                              {String.fromCharCode(65 + oIndex)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moveQuestionUp(qIndex)}
                          disabled={qIndex === 0}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moveQuestionDown(qIndex)}
                          disabled={qIndex === questions.length - 1}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(qIndex)}
                          disabled={questions.length <= 1}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Link href={`/admin/quizzes/${id}`}>
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}