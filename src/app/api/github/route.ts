import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

type GitHubUser = {
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  avatar_url: string;
  html_url: string;
};

type GitHubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  fork: boolean;
};

/**
 * GET /api/github?username=<username>
 * Fetches GitHub profile data for populating portfolio
 * 
 * Uses GitHub's public API (no OAuth needed for public data)
 * Rate limit: 60 req/hour without token, 5000 req/hour with token
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "GitHub username is required" },
      { status: 400 }
    );
  }

  // Clean up username (handle URLs like github.com/username)
  const cleanUsername = username
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/$/, "")
    .trim();

  try {
    const headers: HeadersInit = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "FolioAI-Portfolio-Builder",
    };

    // Add auth token if available (increases rate limit from 60 to 5000 req/hour)
    if (GITHUB_TOKEN && GITHUB_TOKEN !== "replace-me") {
      headers["Authorization"] = `token ${GITHUB_TOKEN}`;
    }

    // Fetch user profile and repos in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${cleanUsername}`, { headers }),
      fetch(`https://api.github.com/users/${cleanUsername}/repos?sort=stars&per_page=10`, { headers }),
    ]);

    if (!userRes.ok) {
      if (userRes.status === 404) {
        return NextResponse.json(
          { error: "GitHub user not found" },
          { status: 404 }
        );
      }
      throw new Error(`GitHub API error: ${userRes.status}`);
    }

    const user = (await userRes.json()) as GitHubUser;
    const allRepos = (await reposRes.json()) as GitHubRepo[];

    // Filter out forks and get top 6 original repos
    const repos = allRepos
      .filter((r) => !r.fork)
      .slice(0, 6);

    // Extract unique languages from repos
    const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))] as string[];

    // Format projects for AI context
    const projects = repos.map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      url: r.html_url,
    }));

    // Calculate approximate contribution count from recent activity
    let contributionCount = 0;
    try {
      // This is a rough estimate based on repo count and activity
      contributionCount = Math.min(500, user.public_repos * 15 + user.followers * 3);
    } catch {
      // Ignore contribution count errors
    }

    return NextResponse.json({
      user: {
        name: user.name,
        bio: user.bio,
        publicRepos: user.public_repos,
        followers: user.followers,
        avatarUrl: user.avatar_url,
        profileUrl: user.html_url,
      },
      projects,
      languages,
      contributionCount,
      // Hint for AI context
      aiContext: `GitHub profile for ${user.name || cleanUsername}: ${user.bio || "No bio"}. 
Has ${user.public_repos} public repos. Top languages: ${languages.join(", ") || "Not available"}. 
Notable projects: ${projects.map((p) => `${p.name} (${p.language}, ${p.stars} stars)`).join(", ")}.`,
    });
  } catch (error) {
    console.error("GitHub API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data. Check the username and try again." },
      { status: 500 }
    );
  }
}
