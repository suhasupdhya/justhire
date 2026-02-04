import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import JobCard from '../components/JobCard';

interface Job {
    id: string;
    title: string;
    description: string;
    recruiter: { name: string };
    createdAt: string;
    requiredSkills: string[];
}

const CandidateDashboard: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs');
            setJobs(res.data);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        }
    };

    const handleApply = async (jobId: string) => {
        // Ideally open a modal to upload resume
        // For MVP/Speed, let's just trigger a hidden file input
        document.getElementById(`file-input-${jobId}`)?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, jobId: string) => {
        if (!e.target.files?.[0]) return;

        setUploading(jobId);
        const formData = new FormData();
        formData.append('resume', e.target.files[0]);
        formData.append('jobId', jobId);

        try {
            await api.post('/applications/apply', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Application Submitted Successfully!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Application failed');
        } finally {
            setUploading(null);
        }
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Explore Opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map(job => (
                    <div key={job.id}>
                        <input
                            type="file"
                            id={`file-input-${job.id}`}
                            className="hidden"
                            accept=".pdf"
                            onChange={(e) => handleFileChange(e, job.id)}
                        />
                        <JobCard
                            job={job}
                            onApply={handleApply}
                        />
                        {/* Hacky: Show Start Assessment if "Applied". In real app we check application status. */}
                        {job.title.includes("Developer") && (
                            <button
                                onClick={() => window.location.href = `/assessment?jobId=${job.id}`}
                                className="mt-2 w-full py-2 border border-blue-500 text-blue-400 rounded hover:bg-blue-900/20"
                            >
                                Start Assessment (Demo)
                            </button>
                        )}
                        {uploading === job.id && <p className="text-blue-400 text-sm mt-2">Uploading & Parsing Resume...</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CandidateDashboard;
