"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Trash2, ChevronDown, ChevronUp } from "lucide-react";

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

      // Update quiz data
      setQuizData({
        id: data.quiz.id,
        title: data.quiz.title,
        description: data.quiz.description,
        timeLimit: data.quiz.timeLimit,
        passingScore: data.quiz.passingScore,
        isActive: data.quiz.isActive,
      });

      // Update questions data
      setQuestions(
        data.questions.map((q: any) => ({
          text: q.text,
          options: q.options, // This should already be parsed from the API
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would submit to your API endpoint
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

      // Redirect to quiz detail with success message
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/quizzes/${id}`}>
          <Button variant="outline" size="icon" className="border-black">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-black">Edit Quiz</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Quiz Details */}
          <div className="border-2 border-black p-6 rounded-lg space-y-6">
            <h2 className="text-xl font-semibold">Quiz Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block font-medium">
                  Quiz Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  name="title"
                  value={quizData.title}
                  onChange={handleQuizChange}
                  placeholder="Enter quiz title"
                  className="border-2 border-black"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="timeLimit" className="block font-medium">
                  Time Limit (minutes)
                </label>
                <Input
                  type="number"
                  id="timeLimit"
                  name="timeLimit"
                  value={quizData.timeLimit}
                  onChange={handleQuizChange}
                  min="1"
                  className="border-2 border-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={quizData.description}
                onChange={handleQuizChange}
                placeholder="Enter quiz description"
                className="border-2 border-black min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="passingScore" className="block font-medium">
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
                  className="border-2 border-black"
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
                  className="border-2 border-black data-[state=checked]:bg-black"
                />
                <label htmlFor="isActive" className="font-medium">
                  Active Quiz
                </label>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="border-2 border-black p-6 rounded-lg space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Questions</h2>
              <Button
                type="button"
                onClick={addQuestion}
                className="bg-black hover:bg-gray-800 text-white border-2 border-black"
              >
                Add Question
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="border-2 border-gray-200 p-4 rounded-lg space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor={`question-${qIndex}`}
                        className="block font-medium"
                      >
                        Question {qIndex + 1}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id={`question-${qIndex}`}
                        value={question.text}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, "text", e.target.value)
                        }
                        placeholder="Enter question text"
                        className="border-2 border-black"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="space-y-2">
                          <label
                            htmlFor={`option-${qIndex}-${oIndex}`}
                            className="block font-medium"
                          >
                            Option {String.fromCharCode(65 + oIndex)}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id={`option-${qIndex}-${oIndex}`}
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(
                                  qIndex,
                                  oIndex,
                                  e.target.value
                                )
                              }
                              placeholder={`Enter option ${String.fromCharCode(
                                65 + oIndex
                              )}`}
                              className="border-2 border-black"
                              required
                            />
                            <div className="flex items-center space-x-1">
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
                                className="h-4 w-4 border-2 border-black"
                              />
                              <label
                                htmlFor={`correct-${qIndex}-${oIndex}`}
                                className="text-sm"
                              >
                                Correct
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-center ml-4 space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="border-black"
                      onClick={() => moveQuestionUp(qIndex)}
                      disabled={qIndex === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="border-black"
                      onClick={() => moveQuestionDown(qIndex)}
                      disabled={qIndex === questions.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => removeQuestion(qIndex)}
                      disabled={questions.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href={`/admin/quizzes/${id}`}>
            <Button
              type="button"
              variant="outline"
              className="border-black hover:bg-gray-100"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white border-2 border-black"
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
