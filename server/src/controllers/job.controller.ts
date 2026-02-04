import { Request, Response } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth.middleware';

// Create a new job (Recruiter only)
export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'RECRUITER') {
            res.status(403).json({ message: 'Only recruiters can create jobs' });
            return;
        }

        const { title, description, requiredSkills } = req.body;

        const job = await prisma.job.create({
            data: {
                title,
                description,
                requiredSkills: requiredSkills || [], // Array of strings
                recruiterId: req.user.userId,
            },
        });

        res.status(201).json(job);
    } catch (error) {
        console.error('Create Job Error:', error);
        res.status(500).json({ message: 'Server error creating job' });
    }
};

// Get all jobs (Public/Candidate)
export const getJobs = async (req: Request, res: Response): Promise<void> => {
    try {
        const jobs = await prisma.job.findMany({
            include: { recruiter: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching jobs' });
    }
};

// Get single job by ID
export const getJobById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const job = await prisma.job.findUnique({
            where: { id },
            include: { recruiter: { select: { name: true } } }
        });
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}
