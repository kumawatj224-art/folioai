import { NextRequest, NextResponse } from "next/server";
import { extractInfoFromResume } from "@/infrastructure/services/ai-service";

/**
 * POST /api/resume
 * Parses an uploaded resume PDF and extracts structured information
 * 
 * Uses pdf-parse to extract text, then GPT-4o-mini to structure the data.
 * This is more effective than LinkedIn scraping (which violates ToS).
 * 
 * Expected: multipart/form-data with "resume" file field
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".txt")) {
      return NextResponse.json(
        { error: "Please upload a PDF, Word, or text file" },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    // Extract text based on file type
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      // Plain text file
      text = buffer.toString("utf-8");
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // PDF file - requires pdf-parse package
      // Install: npm install pdf-parse @types/pdf-parse
      try {
        // Dynamic import to handle cases where pdf-parse isn't installed
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
        const data = await pdfParse(buffer);
        text = data.text;
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        return NextResponse.json(
          { 
            error: "PDF parsing not available. Please install pdf-parse: npm install pdf-parse @types/pdf-parse",
            hint: "Alternatively, copy-paste your resume text in the chat instead."
          },
          { status: 503 }
        );
      }
    } else {
      // Word documents would need additional handling
      return NextResponse.json(
        { 
          error: "Word document parsing not yet supported. Please upload a PDF or paste your resume text.",
        },
        { status: 415 }
      );
    }

    // Clean up the extracted text
    text = text
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/[^\x20-\x7E\n]/g, "") // Remove non-printable characters
      .trim();

    if (text.length < 100) {
      return NextResponse.json(
        { error: "Could not extract enough text from the resume. Please try a different file or paste the text directly." },
        { status: 400 }
      );
    }

    // Extract structured info using AI
    const studentInfo = await extractInfoFromResume(text);

    // Return both raw text and structured info
    return NextResponse.json({
      success: true,
      extractedText: text.substring(0, 500) + "...", // Preview of extracted text
      studentInfo,
      // Hint for frontend
      message: `Successfully extracted info: ${studentInfo.name || "Unknown"}, ${studentInfo.internships?.length || 0} work experiences, ${studentInfo.projects?.length || 0} projects, ${studentInfo.skills?.length || 0} skills.`,
    });
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse resume" },
      { status: 500 }
    );
  }
}
