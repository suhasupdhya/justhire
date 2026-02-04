import { Response } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth.middleware';

// Start Assessment (Create Attempt)
export const startAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { jobId } = req.body;
        const candidateId = req.user?.userId;

        // Find application
        const application = await prisma.application.findFirst({
            where: { jobId, candidateId }
        });

        if (!application) {
            res.status(400).json({ message: 'You must apply first' });
            return;
        }

        // Check if already attempted
        const existingAttempt = await prisma.assessmentAttempt.findFirst({
            where: { applicationId: application.id }
        });

        if (existingAttempt) {
            // Resume or return existing
            res.json(existingAttempt);
            return;
        }

        // Create new attempt
        const attempt = await prisma.assessmentAttempt.create({
            data: {
                applicationId: application.id,
                answers: {}, // Empty start
                startedAt: new Date(),
            }
        });

        res.json(attempt);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Submit Assessment
export const submitAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { attemptId, answers } = req.body;

        // In a real app, we validate ownership of attempt
        // Calculate Scores (Mock logic for now)
        // Technical: MCQ correct count + Code passed cases
        // Psychometric: Slider averages

        const technicalScore = Math.floor(Math.random() * 30) + 60; // Mock 60-90
        const psychometricScore = Math.floor(Math.random() * 40) + 50; // Mock 50-90
        const totalScore = Math.round((technicalScore * 0.7) + (psychometricScore * 0.3));

        // Rule-based "Explainable AI" generation
        let decision = "NO_HIRE";
        let explanation = "";

        if (totalScore > 80) {
            decision = "HIRE";
            explanation = `**Strong HIRE Recommendation**. The candidate demonstrated exceptional technical proficiency (${technicalScore}%) with clean, optimized code. Their psychometric profile (${psychometricScore}%) indicates high resilience and good problem-solving adaptability. \n\n**Key Strengths:**\n- Algorithmic efficiency\n- Error handling\n\n**Potential Risks:**\n- None detected.`;
        } else if (totalScore > 60) {
            decision = "CONSIDER";
            explanation = `**Potential Candidate**. Technical skills are solid (${technicalScore}%), but psychometric indicators suggestion interactions under stress could be improved (${psychometricScore}%). Recommended for a technical interview to probe cultural fit.\n\n**Areas to Probe:**\n- Team conflict resolution\n- Code maintainability`;
        } else {
            explanation = `**No Hire Recommended**. While the candidate attempted all sections, the technical foundation (${technicalScore}%) does not meet the senior bar properly. Coding solutions lacked edge-case handling.`;
        }

        const attempt = await prisma.assessmentAttempt.update({
            where: { id: attemptId },
            data: {
                answers,
                submittedAt: new Date(),
                technicalScore,
                psychometricScore,
                totalScore,
                aiDecision: explanation
            }
        });

        res.json(attempt);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Mock Code Execution
export const executeCode = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { code, language } = req.body;

        // MOCK EXECUTION logic for Hackathon safety/speed
        // If code contains "error", throw error.
        // If code contains "console.log", return that.

        if (code.includes('throw') || code.includes('Error')) {
            res.json({ output: 'Error: Runtime Exception', success: false });
            return;
        }

        // Simulate processing time
        // Simulate processing time
        setTimeout(() => {
            res.json({
                output: 'Test Case 1: Passed\nTest Case 2: Passed\nOutput: Hello World',
                success: true
            });
        }, 1000);

    } catch (error) {
        res.status(500).json({ message: 'Execution failed' });
    }
}

// Log Integrity Event
export const logIntegrity = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { attemptId, eventType, details } = req.body;

        // Update the attempt with new log entry
        // Ideally we append to a JSON array or separate table. 
        // For simplicity with Prisma JSON, we fetch and append.

        const attempt = await prisma.assessmentAttempt.findUnique({ where: { id: attemptId } });
        if (!attempt) {
            res.status(404).json({ message: 'Attempt not found' });
            return;
        }

        const currentLogs = (attempt.integrityLog as any[]) || [];
        const newLog = {
            timestamp: new Date(),
            eventType,
            details
        };

        await prisma.assessmentAttempt.update({
            where: { id: attemptId },
            data: {
                integrityLog: [...currentLogs, newLog]
            }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Logging failed' });
    }
};
