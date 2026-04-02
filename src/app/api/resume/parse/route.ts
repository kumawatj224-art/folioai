import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import mammoth from "mammoth";
import PDFParser from "pdf2json";

import { getCurrentSession } from "@/lib/auth/session";
import { isAIConfigured } from "@/infrastructure/services/ai-service";
import { extractInfoFromResume } from "@/infrastructure/services/ai-service";

// Force Node.js runtime
export const runtime = "nodejs";

/**
 * Extract text from PDF using pdf2json
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true); // true = raw text mode
    
    pdfParser.on("pdfParser_dataReady", () => {
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });
    
    pdfParser.on("pdfParser_dataError", (errData) => {
      const error = errData instanceof Error ? errData : errData.parserError;
      reject(error);
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

/**
 * POST /api/resume/parse
 * Parses uploaded resume (PDF/DOCX) and extracts student information using AI
 */
export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configured = await isAIConfigured();
  if (!configured) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith(".pdf");
    const isDocx = fileName.endsWith(".docx");

    if (!isPdf && !isDocx) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or DOCX file." },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from file
    let resumeText = "";

    if (isPdf) {
      resumeText = await extractPdfText(buffer);
    } else if (isDocx) {
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value;
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from resume. Please ensure the file contains readable text." },
        { status: 400 }
      );
    }

    // Use AI to extract structured information
    const studentInfo = await extractInfoFromResume(resumeText);

    return NextResponse.json({
      success: true,
      studentInfo,
      resumeText: resumeText.substring(0, 500) + "...", // Preview for debugging
    });
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse resume" },
      { status: 500 }
    );
  }
}
