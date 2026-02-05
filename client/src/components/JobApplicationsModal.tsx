import React, { useEffect, useState } from 'react';
import { X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Application {
    id: string;
    candidate: {
        name: string;
        email: string;
    };
    matchScore: number;
    status: string;
    assessmentAttempt: {
        totalScore: number;
        submittedAt: string;
    } | null;
}

interface JobApplicationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string | null;
    jobTitle: string;
}

const JobApplicationsModal: React.FC<JobApplicationsModalProps> = ({ isOpen, onClose, jobId, jobTitle }) => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && jobId) {
            fetchApplications();
        }
    }, [isOpen, jobId]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/applications/job/${jobId}`);
            setApplications(res.data);
        } catch (error) {
            console.error("Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700 shadow-2xl">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <h2 className="text-xl font-bold text-white">Applications for {jobTitle}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="text-center text-slate-400 py-8">Loading applications...</div>
                    ) : applications.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">No applications yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map(app => (
                                <div key={app.id} className="flex flex-col md:flex-row justify-between items-center p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white text-lg">{app.candidate.name}</h3>
                                        <p className="text-slate-400 text-sm">{app.candidate.email}</p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 uppercase">Match</p>
                                            <p className={`font-bold text-lg ${app.matchScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {app.matchScore}%
                                            </p>
                                        </div>

                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 uppercase">Assessment</p>
                                            <p className={`font-bold text-lg ${app.assessmentAttempt ? (app.assessmentAttempt.totalScore > 80 ? 'text-green-400' : 'text-blue-400') : 'text-slate-500'}`}>
                                                {app.assessmentAttempt ? `${app.assessmentAttempt.totalScore}%` : 'Pending'}
                                            </p>
                                        </div>

                                        <div className="text-center min-w-[100px]">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'SHORTLISTED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/applications/${app.id}`)}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-blue-600 text-white rounded-lg transition-all transform hover:scale-105"
                                        >
                                            <Eye size={18} />
                                            Review
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobApplicationsModal;
