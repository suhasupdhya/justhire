import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ApplicationReview: React.FC = () => {
    const { id } = useParams(); // Application ID
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/applications/${id}`);
                setData(res.data);
            } catch (e) {
                console.error("Failed to fetch application");
            }
        }
        fetchDetails();
    }, [id]);

    if (!data) return <div className="p-8 text-white">Loading Candidate Profile...</div>;

    const { candidate, assessmentAttempt, status, resumeScore } = data;
    const decisionColor = assessmentAttempt?.totalScore > 80 ? 'text-green-400' : (assessmentAttempt?.totalScore > 60 ? 'text-yellow-400' : 'text-red-400');

    const chartData = {
        labels: ['Resume Match', 'Technical', 'Psychometric', 'Overall'],
        datasets: [
            {
                label: 'Score (%)',
                data: [
                    resumeScore || 0,
                    assessmentAttempt?.technicalScore || 0,
                    assessmentAttempt?.psychometricScore || 0,
                    assessmentAttempt?.totalScore || 0
                ],
                backgroundColor: ['rgba(59, 130, 246, 0.5)', 'rgba(16, 185, 129, 0.5)', 'rgba(249, 115, 22, 0.5)', 'rgba(139, 92, 246, 0.5)'],
                borderColor: ['#3b82f6', '#10b981', '#f97316', '#8b5cf6'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="p-8 bg-slate-900 min-h-screen text-slate-100">
            <button onClick={() => navigate(-1)} className="mb-6 text-slate-400 hover:text-white">&larr; Back to Applications</button>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{candidate?.name}</h1>
                    <p className="text-slate-400">{candidate?.email} • Applied on {new Date(data.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-4xl font-bold ${decisionColor}`}>{assessmentAttempt?.totalScore || 0}%</span>
                    <span className="text-sm text-slate-500 uppercase tracking-widest">Match Score</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Integrity */}
                <div className="space-y-6">
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold mb-4">Performance Breakdown</h3>
                        <Bar options={{ responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }} data={chartData} />
                    </div>

                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ShieldAlert size={20} className="text-red-400" /> Integrity Shield
                        </h3>
                        {assessmentAttempt?.integrityLog && assessmentAttempt.integrityLog.length > 0 ? (
                            <div className="space-y-3">
                                {assessmentAttempt.integrityLog.map((log: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-900/30 rounded">
                                        <AlertTriangle size={16} className="text-red-400 mt-1" />
                                        <div>
                                            <p className="text-sm font-bold text-red-300">{log.eventType}</p>
                                            <p className="text-xs text-red-400">{log.details}</p>
                                            <p className="text-xs text-slate-500 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-green-400 bg-green-900/20 p-4 rounded border border-green-900/30">
                                <CheckCircle size={20} />
                                <span>No integrity violations detected.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: AI Decision Engine */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-800 p-8 rounded-lg border border-blue-900/50 shadow-lg shadow-blue-900/10">
                        <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                            🤖 Explainable AI Decision
                        </h2>

                        {assessmentAttempt?.aiDecision ? (
                            <div className="prose prose-invert max-w-none">
                                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed text-lg">
                                    {assessmentAttempt.aiDecision}
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">Analysis pending (Assessment not yet completed)...</p>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 font-medium">Download Full Report</button>
                        <button className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded text-white font-bold shadow-lg shadow-green-900/20">Proceed to Interview &rarr;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationReview;
