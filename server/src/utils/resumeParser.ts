const pdf = require('pdf-parse');
import fs from 'fs';

interface ParsedResume {
    text: string;
    skills: string[];
    education: string[]; // Simple extraction
}

// Simple rule-based extraction
export const parseResume = async (filePath: string): Promise<ParsedResume> => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        const text = data.text as string;

        // Simple keyword extraction based on common tech skills
        const commonSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'PostgreSQL', 'Docker', 'AWS', 'HTML', 'CSS', 'Tailwind'];
        const foundSkills = commonSkills.filter(skill =>
            new RegExp(`\\b${skill}\\b`, 'i').test(text)
        );

        // Naive education extraction (looking for keywords like "Bachelor", "Master", "University", "College")
        const educationKeywords = ['Bachelor', 'Master', 'PhD', 'B.Sc', 'M.Sc', 'University', 'College', 'Institute'];
        const lines = text.split('\n');
        const educationalLines = lines.filter(line =>
            educationKeywords.some(keyword => line.includes(keyword))
        ).map(l => l.trim()).filter(l => l.length > 5);

        return {
            text,
            skills: foundSkills,
            education: educationalLines
        };
    } catch (error) {
        console.error("Resume Parsing Error:", error);
        throw new Error("Failed to parse resume");
    }
};

export const calculateMatchScore = (jobSkills: string[], resumeSkills: string[]): number => {
    if (!jobSkills.length) return 100; // No skills required? High match.

    // Normalize to lowercase for comparison
    const jobSkillsLx = jobSkills.map(s => s.toLowerCase());
    const resumeSkillsLx = resumeSkills.map(s => s.toLowerCase());

    const matches = jobSkillsLx.filter(skill => resumeSkillsLx.includes(skill));
    return Math.round((matches.length / jobSkills.length) * 100);
};
