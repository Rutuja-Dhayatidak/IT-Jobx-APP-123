const mammoth = require("mammoth");

const extractData = async (text) => {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not found. Using local fallback.");
    return localFallback(text);
  }

  try {
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a smart resume parser. Extract data into this JSON format:
{
  "userType": "fresher | experienced",
  "full_name": "",
  "headline": "",
  "location": "",
  "about": "",
  "skills": [],
  "experience": [{"company": "", "role": "", "duration": "", "responsibilities": ""}],
  "education": [{"degree": "", "college": "", "year": ""}],
  "projects": [{
    "title": "",
    "description": "",
    "technologies_used": [],
    "project_link": ""
  }],
  "certifications": [],
  "email": "",
  "phone": "",
  "links": {"linkedin": "", "github": "", "portfolio": ""}
}
Rules for Projects:
- Identify projects even if written in paragraphs.
- Extract technologies from description into "technologies_used" array.
- Keep descriptions concise and professional.
- Extract project links if available.
General Rules:
- Understand context.
- Normalize skills.
- Detect userType: "experienced" if any work history exists, else "fresher".
- Return ONLY JSON.`
        },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return localFallback(text);
  }
};

const localFallback = (text) => {
  const lines = text.split("\n").map(line => line.trim()).filter(l => l.length > 0);
  const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || "";
  const phone = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] || "";
  
  return {
    userType: "fresher",
    full_name: lines[0] || "",
    headline: lines[1] || "",
    location: "",
    about: "",
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    email,
    phone,
    links: { linkedin: "", github: "", portfolio: "" }
  };
};

const parseResume = async (buffer, originalName) => {
  try {
    let text = "";
    if (originalName.toLowerCase().endsWith(".pdf")) {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const data = new Uint8Array(buffer);
      const loadingTask = pdfjs.getDocument({ data, disableWorker: true });
      const pdf = await loadingTask.promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(" ") + "\n";
      }
      text = fullText;
    } else if (originalName.toLowerCase().endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }

    if (!text || text.trim().length < 20) {
      return { error: "Could not extract text. Use a text-based file." };
    }

    const parsed = await extractData(text);
    
    return {
      userType: parsed.userType || "fresher",
      fullName: parsed.full_name || parsed.fullName || "",
      headline: parsed.headline || "",
      location: parsed.location || "",
      about: parsed.about || "",
      skills: parsed.skills || [],
      experience: parsed.experience || [],
      education: parsed.education || [],
      projects: parsed.projects || [],
      certifications: parsed.certifications || [],
      email: parsed.email || "",
      phone: parsed.phone || "",
      links: parsed.links || { linkedin: "", github: "", portfolio: "" }
    };
  } catch (error) {
    console.error("Parsing Error:", error);
    return { error: error.message };
  }
};

module.exports = { parseResume };
