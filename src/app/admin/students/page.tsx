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
  Calendar,
  DollarSign,
  Briefcase,
  GraduationCap,
  Percent,
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

interface Quiz {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
}

interface DocumentConfig {
  joiningDate: string;
  timePeriod: string;
  issueDate: string;
  endDate: string;
  stipend: string;
  designation: string;
}

type FilterType = "all" | "passed" | "failed" | "no-attempts";
type ScoreFilterType = "all" | "50" | "75" | "90";
type DocType = "pdf" | "word";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilterType>("all");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [showDocPanel, setShowDocPanel] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [generatingDocs, setGeneratingDocs] = useState(false);
  const [docType, setDocType] = useState<DocType>("pdf");
  const [documentConfig, setDocumentConfig] = useState<DocumentConfig>({
    joiningDate: "2025-07-22",
    timePeriod: "2 months",
    issueDate: new Date().toISOString().split("T")[0],
    endDate: "2025-09-21",
    stipend: "2000",
    designation: "FullStack Intern",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedQuizId === null) {
      setStudents(allStudents);
    } else {
      const filteredByQuiz = allStudents.filter((student) =>
        student.attempts.some((attempt) => attempt.quizId === selectedQuizId)
      );
      setStudents(filteredByQuiz);
    }
    setSelectedEmails([]);
  }, [selectedQuizId, allStudents]);

  const fetchInitialData = async () => {
    try {
      const [studentsResponse, quizzesResponse] = await Promise.all([
        fetch("/api/admin/students"),
        fetch("/api/admin/quizzes"),
      ]);

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setAllStudents(studentsData.students);
        setStudents(studentsData.students);
      }

      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        setQuizzes(quizzesData.quizzes || []);
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentBestScore = (student: Student) => {
    if (student.attempts.length === 0) return null;
    const relevantAttempts = selectedQuizId
      ? student.attempts.filter((attempt) => attempt.quizId === selectedQuizId)
      : student.attempts;

    if (relevantAttempts.length === 0) return null;
    return Math.max(...relevantAttempts.map((attempt) => attempt.score));
  };

  const hasStudentPassed = (student: Student) => {
    const relevantAttempts = selectedQuizId
      ? student.attempts.filter((attempt) => attempt.quizId === selectedQuizId)
      : student.attempts;

    return relevantAttempts.some((attempt) => attempt.passed);
  };

  const getStudentStatus = (student: Student) => {
    const relevantAttempts = selectedQuizId
      ? student.attempts.filter((attempt) => attempt.quizId === selectedQuizId)
      : student.attempts;

    if (relevantAttempts.length === 0) return "No Attempts";
    return relevantAttempts.some((attempt) => attempt.passed) ? "Pass" : "Fail";
  };

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
        const relevantAttempts = selectedQuizId
          ? student.attempts.filter(
              (attempt) => attempt.quizId === selectedQuizId
            )
          : student.attempts;

        switch (filterType) {
          case "passed":
            return relevantAttempts.some((attempt) => attempt.passed);
          case "failed":
            return (
              relevantAttempts.length > 0 &&
              !relevantAttempts.some((attempt) => attempt.passed)
            );
          case "no-attempts":
            return relevantAttempts.length === 0;
          default:
            return true;
        }
      });
    }

    // Apply score filter
    if (scoreFilter !== "all") {
      filtered = filtered.filter((student) => {
        const bestScore = getStudentBestScore(student);
        if (bestScore === null) return false;

        const threshold = parseInt(scoreFilter);
        return bestScore >= threshold;
      });
    }

    return filtered;
  }, [students, searchTerm, filterType, scoreFilter, selectedQuizId]);

  const exportToCSV = () => {
    const selectedQuizTitle = selectedQuizId
      ? quizzes.find((q) => q.id === selectedQuizId)?.title || "Unknown Quiz"
      : "All Quizzes";

    const headers = [
      "S.No",
      "Name",
      "Email",
      "Phone",
      "Best Score",
      "Status",
      "Quiz",
    ];
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
          `"${selectedQuizTitle}"`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `students_${selectedQuizTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  const generateOfferLetterContent = (
    student: Student,
    config: DocumentConfig
  ) => {
    const formattedIssueDate = formatDate(config.issueDate);
    const formattedJoiningDate = formatDate(config.joiningDate);
    const formattedEndDate = formatDate(config.endDate);

    return `
      <div style="font-family: 'Times New Roman', serif !important; line-height: 1.6; max-width: 8.5in; margin: 0 auto; color: #000000 !important; background-color: #ffffff !important; padding: 20px;">
        <div style="text-align: center; margin-bottom: 10px; color: #000000 !important;">
          <img src="https://rxo5hd130p.ufs.sh/f/q5swrPKmNsM9oTaM85w42eRf7hMqdyWPJ1QctavKoT8OLpVY" alt="Company Logo" style="width: 100px; height: auto;" />
          <div style="font-size: 16px; font-weight: bold; color: #000000 !important;">
            Gennext IT Management And Consulting Pvt Ltd
          </div>
          <div style="font-size: 12px;  color: #000000 !important;">
            33B Pocket A, Mayur Vihar, Phase 2<br>
            Delhi 110091
          </div>
        </div>

        <div style="text-align: right; margin-bottom: 5px; font-weight: bold; color: #000000 !important;">
          ${formattedIssueDate}
        </div>

        <div style="margin-bottom: 10px; color: #000000 !important;">
          ${student.name}<br>
          Email: ${student.email}
        </div>

        <div style="color: #000000 !important;">Dear ${student.name},</div>

        <div style="font-weight: bold; margin: 20px 0; color: #000000 !important;">
          Subject: Internship offer letter
        </div>

        <div style="margin: 15px 0; text-align: justify; color: #000000 !important;">
          We are pleased to extend to you an offer to join Gennext IT Management
          And Consulting Pvt Ltd as an Intern. We are excited about the prospect
          of you joining our team and contributing to our projects.
        </div>

        <ul style="padding-left: 10px; color: #000000 !important;">
          <li style="margin-bottom: 3px; color: #000000 !important;">Position: ${config.designation}</li>
          <li style="margin-bottom: 3px; color: #000000 !important;">Monthly Stipend: Rs. ${config.stipend}</li>
          <li style="margin-bottom: 3px; color: #000000 !important;">Internship Duration: Initial period of ${config.timePeriod}</li>
          <li style="margin-bottom: 3px; color: #000000 !important;">Extension: The internship may be extended based on your performance.</li>
          <li style="margin-bottom: 3px; color: #000000 !important;">Base Location: Noida</li>
        </ul>

        <div style="margin: 10px 0; color: #000000 !important;">
          <div style="font-weight: bold; margin-bottom: 10px; color: #000000 !important;">Terms and Conditions of Employment:</div>
          
          <p style="color: #000000 !important;"><strong>Reporting:</strong> You will report to Atul Raj, Software Engineer</p>
          
          <p style="color: #000000 !important;"><strong>Work Hours:</strong> Our regular working hours will be 9:00 AM to 6:00 PM, Monday to Saturday.</p>
          
          <p style="color: #000000 !important;"><strong>Benefits:</strong> As part of this internship you will be provided an
          opportunity to improve your basics in full stack development and then
          work on live projects and get exposure to work on industry related
          software challenges and mitigate these through software development.</p>
        </div>

        <div style="page-break-before: always; margin: 15px 0; text-align: justify; padding-top: 20px; color: #000000 !important;">
          We look forward to welcoming you to Gennext IT Management And
          Consulting Pvt Ltd.
        </div>

        <div style="margin: 15px 0; text-align: justify; color: #000000 !important;">
          Your internship starts from <strong>${formattedJoiningDate}</strong> and will
          continue through to <strong>${formattedEndDate}</strong>, post which we will
          evaluate your performance and may offer you either extended paid
          internship or an offer letter based on your performance.
        </div>

        <div style=" text-align: justify; color: #000000 !important;">
          The managing committee welcomes you and looks forward to a pleasant
          and long term association with you.
        </div>

        <div style="margin: 15px 0; color: #000000 !important;">Thanking You,</div>

        <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: end;">
          <div style="text-align: center;">
            <div style="">
              <img src="https://rxo5hd130p.ufs.sh/f/q5swrPKmNsM9uAfht31kJCvqgXFyDsoUNcIdQBThGV8WZY0r" alt="Signature" style="width: 100px; height: auto;" />
            </div>
            <div style="color: #000000 !important;">Ruchi Gupta (Director HR)</div>
            <div style="color: #000000 !important;">Gennext IT Management And Consulting Pvt Ltd.</div>
          </div>
          <div style="text-align: center;">
            <div style="margin-bottom: 50px;"></div>
            <div style="color: #000000 !important;">(${student.name})</div>
            <div style="color: #000000 !important;">Candidate</div>
          </div>
        </div>
      </div>
    `;
  };

  const loadLibraries = async () => {
    if (typeof window !== "undefined") {
      const promises = [];

      if (!(window as any).JSZip) {
        const jszipPromise = new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
          script.onload = () => resolve((window as any).JSZip);
          script.onerror = reject;
          document.head.appendChild(script);
        });
        promises.push(jszipPromise);
      }

      if (!(window as any).jsPDF) {
        const jspdfPromise = new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          script.onload = () => resolve((window as any).jspdf);
          script.onerror = reject;
          document.head.appendChild(script);
        });
        promises.push(jspdfPromise);
      }

      if (!(window as any).html2canvas) {
        const html2canvasPromise = new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          script.onload = () => resolve((window as any).html2canvas);
          script.onerror = reject;
          document.head.appendChild(script);
        });
        promises.push(html2canvasPromise);
      }

      await Promise.all(promises);
    }

    return {
      JSZip: (window as any).JSZip,
      jsPDF: (window as any).jspdf?.jsPDF,
      html2canvas: (window as any).html2canvas,
    };
  };

  const sanitizeHtmlForCanvas = (htmlString: string): string => {
    // Remove any CSS that might use lab() color functions or other unsupported features
    return (
      htmlString
        .replace(/color:\s*lab\([^)]*\)/gi, "color: #000000")
        .replace(
          /background-color:\s*lab\([^)]*\)/gi,
          "background-color: #ffffff"
        )
        .replace(/border-color:\s*lab\([^)]*\)/gi, "border-color: #000000")
        // Replace any other modern CSS color functions that might not be supported
        .replace(/color:\s*oklch\([^)]*\)/gi, "color: #000000")
        .replace(/color:\s*lch\([^)]*\)/gi, "color: #000000")
        .replace(/color:\s*oklab\([^)]*\)/gi, "color: #000000")
        // Replace CSS custom properties that might contain unsupported colors
        .replace(/var\(--[^)]*\)/gi, "#000000")
        // Ensure all text is black and backgrounds are white
        .replace(
          /<div([^>]*)>/gi,
          '<div$1 style="color: #000000; background-color: transparent;">'
        )
        .replace(/<p([^>]*)>/gi, '<p$1 style="color: #000000;">')
        .replace(/<span([^>]*)>/gi, '<span$1 style="color: #000000;">')
    );
  };

  const generatePDFBlob = async (
    student: Student,
    config: DocumentConfig
  ): Promise<Blob> => {
    const { jsPDF, html2canvas } = await loadLibraries();

    if (!jsPDF || !html2canvas) {
      throw new Error("Failed to load PDF generation libraries");
    }

    const content = generateOfferLetterContent(student, config);
    const sanitizedContent = sanitizeHtmlForCanvas(content);

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px";
    iframe.style.width = "794px"; // Approximate A4 width in px (at 96dpi)
    iframe.style.height = "auto";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      throw new Error("Failed to create iframe document");
    }

    iframeDoc.open();
    iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
            background-color: #ffffff;
            color: #000000;
            width: 794px;
          }
          * {
            box-sizing: border-box;
            color: #000000 !important;
            background-color: transparent !important;
            border-color: #000000 !important;
          }
        </style>
      </head>
      <body>
        ${sanitizedContent}
      </body>
    </html>
  `);
    iframeDoc.close();

    try {
      // Wait for images to load
      const images = iframeDoc.querySelectorAll("img");
      const loadPromises = Array.from(images).map(
        (img: HTMLImageElement) =>
          new Promise((resolve, reject) => {
            if (img.complete) {
              resolve(null);
            } else {
              img.onload = resolve;
              img.onerror = reject;
            }
          })
      );
      await Promise.all(loadPromises);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const scale = 2;
      const pageWidthPx = 794;
      const pageHeightPx = 1123;

      const canvas = await html2canvas(iframeDoc.body, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: pageWidthPx,
        windowWidth: pageWidthPx,
        logging: false,
      });

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [pageWidthPx, pageHeightPx],
      });

      const canvasPageHeight = pageHeightPx * scale;
      let sourceY = 0;
      let pageCount = 0;

      while (sourceY < canvasHeight) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvasWidth;
        const remainingHeight = canvasHeight - sourceY;
        tempCanvas.height = Math.min(canvasPageHeight, remainingHeight);

        // Skip adding a page if the remaining height is too small (e.g., less than 10px)
        if (tempCanvas.height < 10) {
          break;
        }

        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) throw new Error("Failed to get temp canvas context");

        tempCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvasWidth,
          tempCanvas.height,
          0,
          0,
          canvasWidth,
          tempCanvas.height
        );

        const tempImgData = tempCanvas.toDataURL("image/png");
        if (pageCount > 0) {
          pdf.addPage();
        }
        pdf.addImage(
          tempImgData,
          "PNG",
          0,
          0,
          pageWidthPx,
          tempCanvas.height / scale
        );

        sourceY += tempCanvas.height;
        pageCount++;
      }

      return new Blob([pdf.output("blob")], { type: "application/pdf" });
    } catch (error) {
      console.error("PDF generation error:", error);
      throw new Error("Failed to generate PDF. Please try again.");
    } finally {
      document.body.removeChild(iframe);
    }
  };
  const generateWordBlob = (student: Student, config: DocumentConfig): Blob => {
    const content = generateOfferLetterContent(student, config);

    const wordDocument = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Internship Offer Letter</title>
        <style>
          @page {
            size: A4;
            margin: 1in;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #000000;
            background-color: #ffffff;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;

    return new Blob([wordDocument], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  };

  const createZipWithDocuments = async (
    students: Student[],
    config: DocumentConfig
  ) => {
    try {
      const { JSZip } = await loadLibraries();
      if (!JSZip) throw new Error("JSZip library not loaded");

      const zip = new JSZip();

      for (const student of students) {
        try {
          let fileBlob: Blob;
          let fileName: string;

          if (docType === "pdf") {
            fileBlob = await generatePDFBlob(student, config);
            fileName = `Internship_Offer_Letter_${student.name.replace(
              /[^a-zA-Z0-9]/g,
              "_"
            )}.pdf`;
          } else {
            fileBlob = generateWordBlob(student, config);
            fileName = `Internship_Offer_Letter_${student.name.replace(
              /[^a-zA-Z0-9]/g,
              "_"
            )}.docx`; // Changed to .docx for compatibility
          }

          zip.file(fileName, fileBlob);
        } catch (error) {
          console.error(
            `Failed to generate document for ${student.name}:`,
            error
          );
          throw error;
        }
      }

      const readmeContent = `
INTERNSHIP OFFER LETTERS - ${config.issueDate}

Generated for ${students.length} student(s)

Configuration:
- Issue Date: ${formatDate(config.issueDate)}
- Joining Date: ${formatDate(config.joiningDate)}
- End Date: ${formatDate(config.endDate)}
- Duration: ${config.timePeriod}
- Stipend: Rs. ${config.stipend}
- Position: ${config.designation}

Generated on: ${new Date().toLocaleString()}
      `.trim();

      zip.file("README.txt", readmeContent);

      return await zip.generateAsync({ type: "blob" });
    } catch (error) {
      console.error("Failed to create ZIP file:", error);
      throw new Error("Failed to create ZIP file. Please try again.");
    }
  };

  const generateOfferLetterDocs = async () => {
    setGeneratingDocs(true);

    try {
      const selectedStudents = students.filter((student) =>
        selectedEmails.includes(student.email)
      );

      if (selectedStudents.length === 0) {
        alert("No students selected!");
        return;
      }

      if (selectedStudents.length === 1) {
        const student = selectedStudents[0];
        let fileBlob: Blob;
        let fileName: string;

        if (docType === "pdf") {
          fileBlob = await generatePDFBlob(student, documentConfig);
          fileName = `Internship_Offer_Letter_${student.name.replace(
            /[^a-zA-Z0-9]/g,
            "_"
          )}.pdf`;
        } else {
          fileBlob = generateWordBlob(student, documentConfig);
          fileName = `Internship_Offer_Letter_${student.name.replace(
            /[^a-zA-Z0-9]/g,
            "_"
          )}.docx`; // Changed to .docx
        }

        const url = URL.createObjectURL(fileBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const zipBlob = await createZipWithDocuments(
          selectedStudents,
          documentConfig
        );

        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Internship_Offer_Letters_${documentConfig.issueDate}.zip`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      alert(
        `Offer letter documents generated successfully for ${selectedStudents.length} student(s)!`
      );
      setSelectedEmails([]);
      setShowDocPanel(false);
      setShowConfigPanel(false);
    } catch (error) {
      console.error("Failed to generate documents:", error);
      alert("Failed to generate documents. Please try again.");
    } finally {
      setGeneratingDocs(false);
    }
  };

  const handleConfigSubmit = () => {
    setShowConfigPanel(false);
    setShowDocPanel(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Student Management</h1>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <Button
            onClick={() => setShowConfigPanel(true)}
            variant="outline"
            disabled={selectedEmails.length === 0}
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            <FileText className="w-4 h-4 mr-1 sm:mr-2" />
            Generate Docs ({selectedEmails.length})
          </Button>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 mr-1 sm:mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Quiz Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">
              Filter by Quiz:
            </label>
          </div>
          <select
            value={selectedQuizId || ""}
            onChange={(e) =>
              setSelectedQuizId(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1 sm:flex-none min-w-[200px]"
          >
            <option value="">All Students (All Quizzes)</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
          {selectedQuizId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedQuizId(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
              Clear Filter
            </Button>
          )}
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
              className="pl-10 text-sm sm:text-base"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Students</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="no-attempts">No Attempts</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Percent className="w-4 h-4 text-gray-400" />
            <select
              value={scoreFilter}
              onChange={(e) =>
                setScoreFilter(e.target.value as ScoreFilterType)
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Scores</option>
              <option value="50">50% or above</option>
              <option value="75">75% or above</option>
              <option value="90">90% or above</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display current filter info */}
      {selectedQuizId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Showing students for quiz:</strong>{" "}
            {quizzes.find((q) => q.id === selectedQuizId)?.title}
            <span className="ml-2 text-blue-600">
              ({filteredStudents.length} students)
            </span>
          </p>
        </div>
      )}

      {/* Students Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 p-4 font-medium text-sm">
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
            {selectedQuizId
              ? `No students found for the selected quiz ${
                  searchTerm || filterType !== "all" || scoreFilter !== "all"
                    ? "matching your criteria"
                    : ""
                }.`
              : searchTerm || filterType !== "all" || scoreFilter !== "all"
              ? "No students match your search criteria."
              : "No students found."}
          </div>
        ) : (
          filteredStudents.map((student, index) => {
            console.log("Rendering student:", student);
            const bestScore = getStudentBestScore(student);
            const status = getStudentStatus(student);
            const isSelected = selectedEmails.includes(student.email);

            return (
              <div
                key={student.id}
                className="grid grid-cols-12 p-4 items-center hover:bg-gray-50 border-b border-gray-200 text-sm"
              >
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleEmailSelection(student.email)}
                    className="w-4 h-4"
                  />
                </div>
                <div className="col-span-1">{index + 1}</div>
                <div className="col-span-3 font-medium">{student.name}</div>
                <div className="col-span-3 text-gray-600">{student.email}</div>
                <div className="col-span-2 text-gray-600">
                  {student.phone || "N/A"}
                </div>
                <div className="col-span-1 text-center">
                  {bestScore !== null ? (
                    <span
                      className={`font-medium ${
                        bestScore >= 70 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {bestScore}%
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
                <div className="col-span-1 text-center">
                  {status === "Pass" ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                  ) : status === "Fail" ? (
                    <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                  ) : (
                    <span className="text-gray-400 text-xs">No Attempts</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Students Table - Mobile */}
      <div className="lg:hidden space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            {selectedQuizId
              ? `No students found for the selected quiz ${
                  searchTerm || filterType !== "all" || scoreFilter !== "all"
                    ? "matching your criteria"
                    : ""
                }.`
              : searchTerm || filterType !== "all" || scoreFilter !== "all"
              ? "No students match your search criteria."
              : "No students found."}
          </div>
        ) : (
          filteredStudents.map((student, index) => {
            const bestScore = getStudentBestScore(student);
            const status = getStudentStatus(student);
            const isSelected = selectedEmails.includes(student.email);

            return (
              <div key={student.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleEmailSelection(student.email)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {status === "Pass" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : status === "Fail" ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <span className="text-gray-400 text-xs">No Attempts</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-base">{student.name}</div>
                  <div className="text-sm text-gray-600">{student.email}</div>
                  <div className="text-sm text-gray-600">
                    {student.phone || "N/A"}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Best Score:</span>
                    {bestScore !== null ? (
                      <span
                        className={`font-medium ${
                          bestScore >= 70 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {bestScore}%
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selection Summary */}
      {selectedEmails.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedEmails.length} student
              {selectedEmails.length !== 1 ? "s" : ""} selected
            </span>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearEmailSelection}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Clear
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowConfigPanel(true)}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Generate Docs
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Configuration Panel */}
      {showConfigPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Document Configuration
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfigPanel(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Issue Date
                  </label>
                  <Input
                    type="date"
                    value={documentConfig.issueDate}
                    onChange={(e) =>
                      setDocumentConfig((prev) => ({
                        ...prev,
                        issueDate: e.target.value,
                      }))
                    }
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Joining Date
                  </label>
                  <Input
                    type="date"
                    value={documentConfig.joiningDate}
                    onChange={(e) =>
                      setDocumentConfig((prev) => ({
                        ...prev,
                        joiningDate: e.target.value,
                      }))
                    }
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={documentConfig.endDate}
                    onChange={(e) =>
                      setDocumentConfig((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Time Period
                  </label>
                  <Input
                    type="text"
                    value={documentConfig.timePeriod}
                    onChange={(e) =>
                      setDocumentConfig((prev) => ({
                        ...prev,
                        timePeriod: e.target.value,
                      }))
                    }
                    placeholder="e.g., 2 months"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Monthly Stipend (Rs.)
                  </label>
                  <Input
                    type="text"
                    value={documentConfig.stipend}
                    onChange={(e) =>
                      setDocumentConfig((prev) => ({
                        ...prev,
                        stipend: e.target.value,
                      }))
                    }
                    placeholder="e.g., 2000"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Designation
                  </label>
                  <Input
                    type="text"
                    value={documentConfig.designation}
                    onChange={(e) =>
                      setDocumentConfig((prev) => ({
                        ...prev,
                        designation: e.target.value,
                      }))
                    }
                    placeholder="e.g., FullStack Intern"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Document Format
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="pdf">PDF Format</option>
                    <option value="word">Word Document</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfigPanel(false)}
                  className="flex-1 text-sm"
                >
                  Cancel
                </Button>
                <Button onClick={handleConfigSubmit} className="flex-1 text-sm">
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Generation Panel */}
      {showDocPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Generate Offer Letters
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDocPanel(false)}
                  disabled={generatingDocs}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">
                    Selected Students ({selectedEmails.length})
                  </h3>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {students
                      .filter((student) =>
                        selectedEmails.includes(student.email)
                      )
                      .map((student) => (
                        <div key={student.id} className="text-sm text-gray-600">
                          {student.name} ({student.email})
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 text-blue-800">
                    Document Configuration
                  </h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>
                      Issue Date: {formatDate(documentConfig.issueDate)}
                    </div>
                    <div>
                      Joining Date: {formatDate(documentConfig.joiningDate)}
                    </div>
                    <div>End Date: {formatDate(documentConfig.endDate)}</div>
                    <div>Duration: {documentConfig.timePeriod}</div>
                    <div>Stipend: Rs. {documentConfig.stipend}</div>
                    <div>Position: {documentConfig.designation}</div>
                    <div>Format: {docType.toUpperCase()}</div>
                  </div>
                </div>

                {generatingDocs && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">
                      Generating documents... This may take a moment.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfigPanel(true)}
                  disabled={generatingDocs}
                  className="flex-1 text-sm"
                >
                  Back to Config
                </Button>
                <Button
                  onClick={generateOfferLetterDocs}
                  disabled={generatingDocs}
                  className="flex-1 text-sm"
                >
                  {generatingDocs ? "Generating..." : "Generate Documents"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
