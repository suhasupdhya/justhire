import { Response } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth.middleware';
import { parseResume, calculateMatchScore } from '../utils/resumeParser';
import fs from 'fs';

// Apply for a job (Candidate)
export const applyForJob = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'Resume file is required (PDF)' });
            return;
        }

        const { jobId } = req.body;
        const candidateId = req.user?.userId;

        if (!candidateId || !jobId) {
            res.status(400).json({ message: 'Invalid request data' });
            return;
        }

        // Check if already applied
        const existingApp = await prisma.application.findFirst({
            where: { jobId, candidateId }
        });

        if (existingApp) {
            res.status(400).json({ message: 'You have already applied for this job' });
            fs.unlinkSync(req.file.path); // Clean up uploaded file
            return;
        }

        // Parse Resume
        const parsedData = await parseResume(req.file.path);

        // Fetch Job to get required Skills
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            fs.unlinkSync(req.file.path);
            return;
        }

        // Match Logic
        const matchScore = calculateMatchScore(job.requiredSkills, parsedData.skills);

        let status: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' = 'APPLIED';
        // Rule: > 80% = Shortlisted, > 50% = Potential (Applied), < 50% = Rejected
        // For now, let's say automatically shortlist high matches.
        if (matchScore >= 80) status = 'SHORTLISTED';
        else if (matchScore < 40) status = 'REJECTED';

        const application = await prisma.application.create({
            data: {
                jobId,
                candidateId,
                resumeUrl: req.file.path, // In real app, upload to S3. Local path for now.
                parsedData: JSON.parse(JSON.stringify(parsedData)), // Ensure simple JSON
                matchScore,
                status
            }
        });

        res.status(201).json({ message: 'Application submitted successfully', application });

    } catch (error) {
        console.error("Application Error:", error);
        res.status(500).json({ message: 'Server error processing application' });
    }
};

// Get My Applications (Candidate)
export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const applications = await prisma.application.findMany({
            where: { candidateId: req.user?.userId },
            include: { job: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Job Applications (Recruiter)
export const getJobApplications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const jobId = req.params.jobId as string;
        // Verify ownership
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job || job.recruiterId !== req.user?.userId) {
            res.status(403).json({ message: 'Unauthorized access to this job' });
            return;
        }

        const applicationsRaw = await prisma.application.findMany({
            where: { jobId },
            include: {
                candidate: { select: { name: true, email: true } },
                attempts: { select: { totalScore: true, submittedAt: true } }
            },
            orderBy: { matchScore: 'desc' } // Best matches first
        });

        const applications = applicationsRaw.map(app => ({
            ...app,
            assessmentAttempt: app.attempts[0] || null
        }));

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

export const getApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                candidate: { select: { name: true, email: true } },
                attempts: true,
                job: true
            }
        });

        if (!application) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }

        res.json({
            ...application,
            assessmentAttempt: application.attempts[0] || null
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
