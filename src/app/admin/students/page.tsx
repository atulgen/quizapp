// app/admin/students/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Download,
  Filter,
  FileText,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
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

type FilterType = "all" | "passed" | "failed" | "no-attempts";
type DocType = "pdf" | "word";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [showDocPanel, setShowDocPanel] = useState(false);
  const [generatingDocs, setGeneratingDocs] = useState(false);
  const [docType, setDocType] = useState<DocType>("pdf");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/admin/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate best score for each student
  const getStudentBestScore = (student: Student) => {
    if (student.attempts.length === 0) return null;
    return Math.max(...student.attempts.map((attempt) => attempt.score));
  };

  // Check if student has passed any quiz
  const hasStudentPassed = (student: Student) => {
    return student.attempts.some((attempt) => attempt.passed);
  };

  // Get student status
  const getStudentStatus = (student: Student) => {
    if (student.attempts.length === 0) return "No Attempts";
    return hasStudentPassed(student) ? "Pass" : "Fail";
  };

  // Filter and search students
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterType !== "all") {
      filtered = filtered.filter((student) => {
        switch (filterType) {
          case "passed":
            return hasStudentPassed(student);
          case "failed":
            return student.attempts.length > 0 && !hasStudentPassed(student);
          case "no-attempts":
            return student.attempts.length === 0;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [students, searchTerm, filterType]);

  // CSV Export function
  const exportToCSV = () => {
    const headers = ["S.No", "Name", "Email", "Phone", "Best Score", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredStudents.map((student, index) => {
        const bestScore = getStudentBestScore(student);
        const status = getStudentStatus(student);

        return [
          index + 1,
          `"${student.name}"`,
          `"${student.email}"`,
          `"${student.phone || "N/A"}"`,
          bestScore !== null ? `${bestScore}%` : "N/A",
          status,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `students_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Email selection functions
  const toggleEmailSelection = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const selectAllEmails = () => {
    const allEmails = filteredStudents.map((student) => student.email);
    setSelectedEmails(allEmails);
  };

  const clearEmailSelection = () => {
    setSelectedEmails([]);
  };

  // Format date helper
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  // Generate offer letter content
  const generateOfferLetterContent = (
    student: Student,
    issueDate: string,
    startDate: string,
    endDate: string
  ) => {
    return `
      <div style="font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 8.5in; margin: 0 auto;  color: #000;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://rxo5hd130p.ufs.sh/f/q5swrPKmNsM9oTaM85w42eRf7hMqdyWPJ1QctavKoT8OLpVY" alt="Company Logo" style="width: 100px; height: auto; margin-bottom: 10px;" />
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
            Gennext IT Management And Consulting Pvt Ltd
          </div>
          <div style="font-size: 12px; margin-bottom: 20px;">
            33B Pocket A, Mayur Vihar, Phase 2<br>
            Delhi 110091
          </div>
        </div>

        <div style="text-align: right; margin-bottom: 20px; font-weight: bold;">
          ${issueDate}
        </div>

        <div style="margin-bottom: 20px;">
          ${student.name}<br>
          
          email: ${student.email}
        </div>

        <div>Dear ${student.name},</div>

        <div style="font-weight: bold; margin: 20px 0;">
          Subject: Internship offer letter
        </div>

        <div style="margin: 15px 0; text-align: justify;">
          We are pleased to extend to you an offer to join Gennext IT Management
          And Consulting Pvt Ltd as an Intern. We are excited about the prospect
          of you joining our team and contributing to our projects.
        </div>

        <ol style="padding-left: 20px;">
          <li style="margin-bottom: 5px;">Position: FullStack Intern</li>
          <li style="margin-bottom: 5px;">Monthly Stipend: Rs. 2000</li>
          <li style="margin-bottom: 5px;">Internship Duration: Initial period of 2 months</li>
          <li style="margin-bottom: 5px;">Extension: The internship may be extended based on your performance.</li>
          <li style="margin-bottom: 5px;">Base Location: Noida</li>
        </ol>

        <div style="margin: 20px 0;">
          <div style="font-weight: bold; margin-bottom: 10px;">Terms and Conditions of Employment:</div>
          
          <p><strong>Reporting:</strong> You will report to Atul Raj, Software Engineer</p>
          
          <p><strong>Work Hours:</strong> our regular working hours will be 9:00 AM to 6:00 PM, Monday to 
        Saturday.</p>
          <p><strong>Benefits:</strong> As part of this internship you will be provided an
          opportunity to improve your basics in full stack development and then
          work on live projects and get exposure to work on industry related
          software challenges and mitigate these through software development.</p>
        </div>
        <div style="page-break-before: always; margin: 15px 0; text-align: justify; padding-top: 20px;">
          We look forward to welcoming you to Gennext IT Management And
          Consulting Pvt Ltd.
        </div>

        <div style="margin: 15px 0; text-align: justify;">
          Your internship starts from <strong>${startDate}</strong> and will
          continue through to <strong>${endDate}</strong>, post which we will
          evaluate your performance and may offer you either extended paid
          internship or an offer letter based on your performance.
        </div>

        <div style="margin: 15px 0; text-align: justify;">
          The managing committee welcomes you and looks forward to a pleasant
          and long term association with you.
        </div>

        <div style="margin: 15px 0;">Thanking You,</div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between;">
          <div style="text-align: center;">
            <div>
              <img src="https://rxo5hd130p.ufs.sh/f/q5swrPKmNsM9uAfht31kJCvqgXFyDsoUNcIdQBThGV8WZY0r" alt="Signature" style="width: 100px; height: auto;" />
            </div>
            <div>Ruchi Gupta (Director HR)</div>
            <div>Gennext IT Management And Consulting Pvt Ltd.</div>
          </div>
          <div style="text-align: center;">
            <div style="margin-bottom: 50px;"></div>
            <div>(${student.name})</div>
            <div>Candidate</div>
          </div>
        </div>
      </div>
    `;
  };

  // Generate PDF using browser's print functionality
  const generatePDF = async (
    student: Student,
    issueDate: string,
    startDate: string,
    endDate: string
  ) => {
    const content = generateOfferLetterContent(
      student,
      issueDate,
      startDate,
      endDate
    );

    // Create a new window for PDF generation
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    // Write content to the new window
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Internship Offer Letter - ${student.name}</title>
      <style>
        @media print {
          body { 
            margin: 0;
            padding-top: 10mm; /* Add space at the top */
          }
          @page { 
            margin: 10mm 10mm 10mm 10mm; /* Top margin is larger */
            size: A4;
          }
        }
        @media screen {
          body {
            background-color: #f5f5f5;
            padding: 20px;
          }
          .print-container {
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            margin: 0 auto;
            max-width: 800px;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        ${content}
      </div>
      <script>
        // Automatically trigger print when content loads
        window.onload = function() {
          setTimeout(function() {
            window.print();
            // Close the window after printing
            setTimeout(function() {
              window.close();
            }, 100);
          }, 200);
        };
      </script>
    </body>
    </html>
  `);
    printWindow.document.close();
  };
  // Generate proper Word document
  const generateWordDoc = (
    student: Student,
    issueDate: string,
    startDate: string,
    endDate: string
  ) => {
    const content = generateOfferLetterContent(
      student,
      issueDate,
      startDate,
      endDate
    );

    // Create proper Word document structure
    const wordDocument = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Internship Offer Letter</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotPromptForConvert/>
            <w:DoNotShowInsertionsAndDeletions/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: A4;
            margin: 1in;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;

    const blob = new Blob([wordDocument], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Internship_Offer_Letter_${student.name.replace(
      /\s+/g,
      "_"
    )}_${issueDate.replace(/\s+/g, "_")}.doc`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate documents for selected students
  const generateOfferLetterDocs = async () => {
    setGeneratingDocs(true);

    try {
      const selectedStudents = students.filter((student) =>
        selectedEmails.includes(student.email)
      );

      const issueDate = formatDate(new Date());
      const startDate = formatDate(new Date("2025-07-22"));
      const endDate = formatDate(new Date("2025-09-21"));

      for (const student of selectedStudents) {
        if (docType === "pdf") {
          await generatePDF(student, issueDate, startDate, endDate);
          // Add delay between PDFs to avoid browser blocking
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          generateWordDoc(student, issueDate, startDate, endDate);
        }
      }

      alert(
        `Offer letter documents generated for ${selectedStudents.length} students!`
      );
      setSelectedEmails([]);
      setShowDocPanel(false);
    } catch (error) {
      console.error("Failed to generate documents:", error);
      alert("Failed to generate documents. Please try again.");
    } finally {
      setGeneratingDocs(false);
    }
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
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowDocPanel(true)}
            variant="outline"
            disabled={selectedEmails.length === 0}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Docs ({selectedEmails.length})
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Students</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="no-attempts">No Attempts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 p-4 font-medium">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={
                selectedEmails.length === filteredStudents.length &&
                filteredStudents.length > 0
              }
              onChange={
                selectedEmails.length === filteredStudents.length
                  ? clearEmailSelection
                  : selectAllEmails
              }
              className="w-4 h-4"
            />
          </div>
          <div className="col-span-1">S.No</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Phone</div>
          <div className="col-span-1">Score</div>
          <div className="col-span-1">Status</div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || filterType !== "all"
              ? "No students match your search criteria."
              : "No students found."}
          </div>
        ) : (
          filteredStudents.map((student, index) => {
            const bestScore = getStudentBestScore(student);
            const hasPassed = hasStudentPassed(student);
            const status = getStudentStatus(student);
            const isSelected = selectedEmails.includes(student.email);

            return (
              <div
                key={student.id}
                className="grid grid-cols-12 p-4 items-center hover:bg-gray-50 border-b border-gray-200"
              >
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleEmailSelection(student.email)}
                    className="w-4 h-4"
                  />
                </div>
                <div className="col-span-1 text-gray-600">{index + 1}</div>
                <div className="col-span-3 font-medium">{student.name}</div>
                <div className="col-span-3 text-gray-600">{student.email}</div>
                <div className="col-span-2 text-gray-600">
                  {student.phone || "N/A"}
                </div>
                <div className="col-span-1">
                  {bestScore !== null ? (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        hasPassed
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {hasPassed ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {bestScore}%
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                      No attempts
                    </span>
                  )}
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      status === "Pass"
                        ? "bg-green-100 text-green-800"
                        : status === "Fail"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {status === "Pass" ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : status === "Fail" ? (
                      <XCircle className="w-3 h-3 mr-1" />
                    ) : null}
                    {status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Document Generation Panel */}
      {showDocPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Generate Offer Letter Documents
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDocPanel(false)}
                disabled={generatingDocs}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Selected {selectedEmails.length} student(s):
              </p>
              <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded border">
                {selectedEmails.map((email, index) => (
                  <div key={index} className="text-sm py-1">
                    {email}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Document Type:</p>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pdf"
                    checked={docType === "pdf"}
                    onChange={(e) => setDocType(e.target.value as DocType)}
                    className="mr-2"
                  />
                  PDF
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="word"
                    checked={docType === "word"}
                    onChange={(e) => setDocType(e.target.value as DocType)}
                    className="mr-2"
                  />
                  Word Document
                </label>
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded border">
              <p className="text-sm text-blue-800">
                <strong>Internship Period:</strong>
                <br />
                Start Date: 22 Jul 2025
                <br />
                End Date: 21 Sept 2025
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDocPanel(false)}
                disabled={generatingDocs}
              >
                Cancel
              </Button>
              <Button
                onClick={generateOfferLetterDocs}
                disabled={generatingDocs}
              >
                {generatingDocs ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate {docType === "pdf" ? "PDFs" : "Word Docs"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}