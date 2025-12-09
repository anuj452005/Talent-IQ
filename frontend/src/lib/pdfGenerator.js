import { jsPDF } from "jspdf";
import { format } from "date-fns";

/**
 * Generate a PDF interview report
 * @param {Object} session - Session data
 * @param {Object} problem - Problem data
 * @param {string} code - Final code written
 * @param {Object} output - Code execution output
 * @param {Object} interviewer - Interviewer/host info
 * @param {Object} candidate - Candidate/participant info
 */
export function generateInterviewReport({
  session,
  problem,
  code,
  output,
  interviewer,
  candidate,
  notes = "",
  rating = 0,
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Helper function to add text with word wrap
  const addText = (text, x, y, maxWidth = 180, fontSize = 12, color = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * (fontSize * 0.4);
  };

  // Title Section
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Interview Report", 15, 25);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${format(new Date(), "MMMM dd, yyyy")}`, 15, 35);

  yPos = 55;

  // Session Info Card
  doc.setFillColor(245, 245, 245);
  doc.rect(10, yPos - 5, pageWidth - 20, 40, "F");
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Session Details", 15, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Problem: ${session?.problem || "N/A"}`, 15, yPos);
  yPos += 7;
  doc.text(`Difficulty: ${session?.difficulty?.toUpperCase() || "N/A"}`, 15, yPos);
  yPos += 7;
  doc.text(`Date: ${session?.createdAt ? format(new Date(session.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}`, 15, yPos);
  yPos += 7;
  doc.text(`Status: ${session?.status?.toUpperCase() || "N/A"}`, 15, yPos);
  
  yPos += 20;

  // Participants Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Participants", 15, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Interviewer: ${interviewer?.name || session?.host?.name || "N/A"}`, 15, yPos);
  yPos += 7;
  doc.text(`Candidate: ${candidate?.name || session?.participant?.name || "N/A"}`, 15, yPos);
  yPos += 15;

  // Problem Description (if available)
  if (problem) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Problem Description", 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    yPos = addText(problem.description?.text || "No description available", 15, yPos, 180, 10, [80, 80, 80]);
    yPos += 10;
  }

  // Code Solution Section
  if (code) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Code Solution", 15, yPos);
    yPos += 8;

    // Code background
    doc.setFillColor(40, 44, 52); // Dark background
    const codeLines = code.split("\n").slice(0, 20); // Limit lines
    const codeHeight = Math.min(codeLines.length * 5 + 10, 100);
    doc.rect(10, yPos - 3, pageWidth - 20, codeHeight, "F");

    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    doc.setTextColor(200, 200, 200);
    
    codeLines.forEach((line, i) => {
      if (yPos + i * 5 < 280) { // Check page boundary
        doc.text(line.substring(0, 80), 15, yPos + i * 5);
      }
    });
    
    yPos += codeHeight + 10;
  }

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Output Section
  if (output) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Execution Result", 15, yPos);
    yPos += 8;

    // Status badge
    if (output.success) {
      doc.setFillColor(34, 197, 94); // Green
    } else {
      doc.setFillColor(239, 68, 68); // Red
    }
    doc.roundedRect(15, yPos - 4, 40, 10, 2, 2, "F");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(output.success ? "PASSED" : "FAILED", 22, yPos + 2);
    yPos += 15;

    // Output text
    if (output.output || output.error) {
      doc.setFillColor(245, 245, 245);
      doc.rect(10, yPos - 3, pageWidth - 20, 30, "F");
      doc.setFontSize(9);
      doc.setFont("courier", "normal");
      doc.setTextColor(80, 80, 80);
      const outputText = output.output || output.error || "";
      doc.text(outputText.substring(0, 200), 15, yPos + 5);
      yPos += 35;
    }
  }

  // Rating Section
  if (rating > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Rating", 15, yPos);
    yPos += 10;

    // Star rating
    doc.setFontSize(20);
    for (let i = 1; i <= 5; i++) {
      doc.text(i <= rating ? "★" : "☆", 15 + (i - 1) * 10, yPos);
    }
    doc.setFontSize(12);
    doc.text(`${rating}/5`, 70, yPos);
    yPos += 15;
  }

  // Notes Section
  if (notes) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Interviewer Notes", 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    yPos = addText(notes, 15, yPos, 180, 10, [60, 60, 60]);
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Talent-IQ Interview Platform | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      290,
      { align: "center" }
    );
  }

  return doc;
}

/**
 * Download the PDF report
 */
export function downloadReport(session, problem, code, output, notes = "", rating = 0) {
  const doc = generateInterviewReport({
    session,
    problem,
    code,
    output,
    notes,
    rating,
  });

  const fileName = `interview-report-${session?.problem?.replace(/\s+/g, "-") || "session"}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}
