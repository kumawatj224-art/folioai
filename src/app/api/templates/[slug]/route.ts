import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { templateRepository } from "@/infrastructure/repositories/template-repository";
import { renderTemplate } from "@/infrastructure/services/template-service";
import type { StudentData } from "@/domain/entities/template";

type Params = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/templates/[slug]
 * Returns a specific template by slug
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const template = await templateRepository.findBySlug(slug);

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error("Template fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates/[slug]
 * Render a template with provided user data
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const template = await templateRepository.findBySlug(slug);

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const body = await request.json() as { data: StudentData };
    
    if (!body.data) {
      return NextResponse.json(
        { error: "Student data required in request body" },
        { status: 400 }
      );
    }

    const renderedHtml = renderTemplate(
      template.htmlTemplate,
      template.slug,
      body.data
    );

    return NextResponse.json({ 
      html: renderedHtml,
      template: {
        id: template.id,
        name: template.name,
        slug: template.slug,
      }
    });
  } catch (error) {
    console.error("Template render error:", error);
    return NextResponse.json(
      { error: "Failed to render template" },
      { status: 500 }
    );
  }
}
