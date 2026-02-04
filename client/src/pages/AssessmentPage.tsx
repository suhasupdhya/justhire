import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AssessmentRunner from '../components/AssessmentRunner';
import api from '../api/axios';

const AssessmentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const query = new URLSearchParams(location.search);
    const jobId = query.get('jobId');

    useEffect(() => {
        if (!jobId) {
            navigate('/dashboard');
            return;
        }

        const start = async () => {
            try {
                const res = await api.post('/assessments/start', { jobId });
                setAttemptId(res.data.id);
            } catch (error) {
                alert('Could not start assessment. Ensure you have applied.');
                navigate('/dashboard');
            }
        };
        start();
    }, [jobId]);

    if (!attemptId || !jobId) return <div className="p-10 text-white">Initializing Assessment Environment...</div>;

    return <AssessmentRunner jobId={jobId} attemptId={attemptId} />;
};

export default AssessmentPage;
