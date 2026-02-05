import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import JobCard from '../components/JobCard';
import { Plus } from 'lucide-react';
import CreateJobModal from '../components/CreateJobModal';
import JobApplicationsModal from '../components/JobApplicationsModal';

interface Job {
    id: string;
    title: string;
    description: string;
    recruiter: { name: string };
    createdAt: string;
    requiredSkills: string[];
}

const RecruiterDashboard: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewAppsJobId, setViewAppsJobId] = useState<string | null>(null);

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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Your Posted Jobs</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    Post New Job
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map(job => (
                    <JobCard
                        key={job.id}
                        job={job}
                        isRecruiter={true}
                        onViewApplications={(id) => setViewAppsJobId(id)}
                    />
                ))}
            </div>

            {isModalOpen && (
                <CreateJobModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onJobCreated={fetchJobs}
                />
            )}

            <JobApplicationsModal
                isOpen={!!viewAppsJobId}
                onClose={() => setViewAppsJobId(null)}
                jobId={viewAppsJobId}
                jobTitle={jobs.find(j => j.id === viewAppsJobId)?.title || ''}
            />
        </div>
    );
};

export default RecruiterDashboard;
