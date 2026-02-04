import React from 'react';
import { Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';

interface Job {
    id: string;
    title: string;
    description: string;
    recruiter: { name: string };
    createdAt: string;
    requiredSkills: string[];
}

interface JobCardProps {
    job: Job;
    onApply?: (jobId: string) => void;
    onViewApplications?: (jobId: string) => void;
    isRecruiter?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onViewApplications, isRecruiter }) => {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-md hover:border-slate-600 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{job.title}</h3>
                    <p className="text-slate-400 text-sm">Posted by {job.recruiter.name} • {new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                {isRecruiter ? (
                    <button
                        onClick={() => onViewApplications?.(job.id)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-blue-400 text-sm font-medium rounded transition-colors"
                    >
                        View Applications
                    </button>
                ) : (
                    <button
                        onClick={() => onApply?.(job.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                    >
                        Apply Now
                    </button>
                )}
            </div>

            <p className="text-slate-300 mb-4 line-clamp-2">{job.description}</p>

            <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded border border-slate-600">
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default JobCard;
