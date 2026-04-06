/**
 * Template Rendering Service
 * 
 * Fills template placeholders with actual user data.
 */

import type { StudentData, TEMPLATE_PLACEHOLDERS } from "@/domain/entities/template";

/**
 * Generate HTML for skills section based on template style
 */
function renderSkills(skills: string[], templateSlug: string): string {
  if (!skills || skills.length === 0) return "<p>No skills listed</p>";

  switch (templateSlug) {
    case "minimal-dark":
      return skills.map(s => `<span class="skill-tag">${s}</span>`).join("\n        ");
    
    case "professional-light":
      return skills.map(s => `<span>${s}</span>`).join("\n        ");
    
    case "gradient-modern":
      return skills.map(s => `<span class="skill-pill">${s}</span>`).join("\n          ");
    
    case "neon-cyber":
      return skills.map(s => `<span class="skill-tag">${s}</span>`).join("\n        ");
    
    case "classic-elegant":
      return skills.map(s => `<div class="skill-item">${s}</div>`).join("\n        ");
    
    default:
      return skills.map(s => `<span>${s}</span>`).join(", ");
  }
}

/**
 * Generate HTML for projects section
 */
function renderProjects(
  projects: StudentData["projects"],
  templateSlug: string
): string {
  if (!projects || projects.length === 0) {
    return "<p>No projects listed yet</p>";
  }

  switch (templateSlug) {
    case "minimal-dark":
      return projects.map(p => `
        <div class="project">
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          ${p.techStack?.length ? `<div class="project-tech">${p.techStack.map(t => `<span>${t}</span>`).join("")}</div>` : ""}
          <div class="project-links">
            ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank">Live Demo →</a>` : ""}
            ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank">GitHub →</a>` : ""}
          </div>
        </div>
      `).join("\n");

    case "professional-light":
      return projects.map(p => `
        <div class="project">
          <div>
            <h3>${p.title}</h3>
            <div class="project-meta">${p.techStack?.join(" · ") ?? ""}</div>
          </div>
          <div>
            <p>${p.description}</p>
            <div class="project-links">
              ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank">View Project</a>` : ""}
              ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank">Source Code</a>` : ""}
            </div>
          </div>
        </div>
      `).join("\n");

    case "gradient-modern":
      return projects.map(p => `
        <div class="project-card">
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          ${p.techStack?.length ? `<div class="project-tech">${p.techStack.map(t => `<span>${t}</span>`).join("")}</div>` : ""}
          ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank">Live →</a>` : ""}
          ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank">Code →</a>` : ""}
        </div>
      `).join("\n");

    case "neon-cyber":
      return projects.map(p => `
        <div class="project">
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          ${p.techStack?.length ? `<div class="project-tech">${p.techStack.map(t => `<span>[${t}]</span>`).join("")}</div>` : ""}
          ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank">&gt; DEMO</a>` : ""}
          ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank">&gt; SRC</a>` : ""}
        </div>
      `).join("\n");

    case "classic-elegant":
      return projects.map(p => `
        <div class="project">
          <h3>${p.title}</h3>
          <div>
            <p>${p.description}</p>
            <p class="project-tech">${p.techStack?.join(" / ")}</p>
            ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank">View Project</a>` : ""}
            ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank">Source</a>` : ""}
          </div>
        </div>
      `).join("\n");

    default:
      return projects.map(p => `<div><h3>${p.title}</h3><p>${p.description}</p></div>`).join("\n");
  }
}

/**
 * Generate HTML for experience section
 */
function renderExperience(
  experience: StudentData["experience"],
  templateSlug: string
): string {
  if (!experience || experience.length === 0) {
    return "<p>No experience listed yet</p>";
  }

  switch (templateSlug) {
    case "minimal-dark":
      return experience.map(e => `
        <div class="experience-item">
          <h3>${e.role} <span class="company">@ ${e.company}</span></h3>
          <p class="duration">${e.duration}</p>
          ${e.description ? `<p>${e.description}</p>` : ""}
        </div>
      `).join("\n");

    case "professional-light":
      return experience.map(e => `
        <div class="experience-item">
          <h3>${e.role}</h3>
          <p class="role">${e.company}</p>
          <p class="duration">${e.duration}</p>
        </div>
      `).join("\n");

    case "gradient-modern":
      return experience.map(e => `
        <div class="exp-item">
          <h3>${e.role}</h3>
          <p class="company">${e.company}</p>
          <p class="duration">${e.duration}</p>
        </div>
      `).join("\n");

    case "neon-cyber":
      return experience.map(e => `
        <div class="exp-item">
          <h3>${e.role}</h3>
          <p class="company">${e.company}</p>
          <p class="duration">${e.duration}</p>
        </div>
      `).join("\n");

    case "classic-elegant":
      return experience.map(e => `
        <div class="exp-item">
          <div class="exp-date">${e.duration}</div>
          <div>
            <h3>${e.role}</h3>
            <p class="exp-company">${e.company}</p>
          </div>
        </div>
      `).join("\n");

    default:
      return experience.map(e => `<div><h3>${e.role} - ${e.company}</h3><p>${e.duration}</p></div>`).join("\n");
  }
}

/**
 * Generate HTML for social links
 */
function renderSocialLinks(
  links: StudentData["socialLinks"],
  email: string | undefined,
  templateSlug: string
): string {
  const allLinks: Array<{ label: string; url: string }> = [];
  
  if (email) allLinks.push({ label: "Email", url: `mailto:${email}` });
  if (links?.github) allLinks.push({ label: "GitHub", url: links.github });
  if (links?.linkedin) allLinks.push({ label: "LinkedIn", url: links.linkedin });
  if (links?.twitter) allLinks.push({ label: "Twitter", url: links.twitter });
  if (links?.website) allLinks.push({ label: "Website", url: links.website });

  if (allLinks.length === 0) {
    return "<p>No contact links provided</p>";
  }

  switch (templateSlug) {
    case "minimal-dark":
    case "neon-cyber":
      return allLinks.map(l => `<a href="${l.url}" target="_blank">${l.label}</a>`).join("\n        ");
    
    case "professional-light":
    case "classic-elegant":
      return allLinks.map(l => `<a href="${l.url}" target="_blank">${l.label}</a>`).join("\n        ");
    
    case "gradient-modern":
      return allLinks.map(l => `<a href="${l.url}" target="_blank">${l.label}</a>`).join("\n          ");
    
    default:
      return allLinks.map(l => `<a href="${l.url}" target="_blank">${l.label}</a>`).join(" | ");
  }
}

/**
 * Render a template with user data
 */
export function renderTemplate(
  htmlTemplate: string,
  templateSlug: string,
  data: StudentData
): string {
  let html = htmlTemplate;

  // Basic info replacements
  html = html.replace(/\{\{NAME\}\}/g, data.name || "Your Name");
  html = html.replace(/\{\{TAGLINE\}\}/g, data.tagline || "Software Developer");
  html = html.replace(/\{\{EMAIL\}\}/g, data.email || "");
  html = html.replace(/\{\{PHONE\}\}/g, data.phone || "");
  html = html.replace(/\{\{LOCATION\}\}/g, data.location || "");
  html = html.replace(/\{\{ABOUT\}\}/g, data.about || "Passionate developer eager to build impactful solutions.");
  html = html.replace(/\{\{COLLEGE\}\}/g, data.college || "Your College");
  html = html.replace(/\{\{BRANCH\}\}/g, data.branch || "Computer Science");
  html = html.replace(/\{\{GRADUATION_YEAR\}\}/g, data.graduationYear || "2026");

  // Social links individual
  html = html.replace(/\{\{GITHUB_URL\}\}/g, data.socialLinks?.github || "#");
  html = html.replace(/\{\{LINKEDIN_URL\}\}/g, data.socialLinks?.linkedin || "#");
  html = html.replace(/\{\{TWITTER_URL\}\}/g, data.socialLinks?.twitter || "#");
  html = html.replace(/\{\{WEBSITE_URL\}\}/g, data.socialLinks?.website || "#");

  // Complex section replacements
  html = html.replace(
    /\{\{SKILLS_HTML\}\}/g,
    renderSkills(data.skills ?? [], templateSlug)
  );

  html = html.replace(
    /\{\{PROJECTS_HTML\}\}/g,
    renderProjects(data.projects, templateSlug)
  );

  html = html.replace(
    /\{\{EXPERIENCE_HTML\}\}/g,
    renderExperience(data.experience, templateSlug)
  );

  html = html.replace(
    /\{\{SOCIAL_LINKS_HTML\}\}/g,
    renderSocialLinks(data.socialLinks, data.email, templateSlug)
  );

  // Achievements (if template supports it)
  html = html.replace(
    /\{\{ACHIEVEMENTS_HTML\}\}/g,
    data.achievements?.map(a => `<li>${a}</li>`).join("\n") || ""
  );

  return html;
}
