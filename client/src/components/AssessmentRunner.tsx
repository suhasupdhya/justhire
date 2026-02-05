import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle, AlertCircle, ChevronRight, Save } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

interface Props {
    jobId: string;
    attemptId: string;
}

const AssessmentRunner: React.FC<Props> = ({ jobId, attemptId }) => {
    const [step, setStep] = useState(1);
    const [code, setCode] = useState('// Write your solution here\nfunction solve() {\n  return "Hello World";\n}');
    const [output, setOutput] = useState('');
    const [executing, setExecuting] = useState(false);
    const [warnings, setWarnings] = useState(0);
    const [faceCount, setFaceCount] = useState(0);
    const [multipleWarning, setMultipleWarning] = useState(false);
    const lastFaceLogRef = useRef<number>(0);
    const navigate = useNavigate();

    // Proctoring Logic
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                triggerViolation('TAB_SWITCH', 'Candidate switched tabs');
            }
        };

        const handleBlur = () => {
            triggerViolation('WINDOW_BLUR', 'Candidate left the window');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        // Initialize Webcam
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                const video = document.getElementById('webcam-feed') as HTMLVideoElement;
                if (video) video.srcObject = stream;
            })
            .catch(err => console.error("Webcam access denied", err));

        // Start lightweight face detection (dynamic import to keep bundle small)
        let intervalId: any = null;
        let model: any = null;
        (async () => {
            try {
                const tf = await import('@tensorflow/tfjs');
                await import('@tensorflow/tfjs-backend-webgl');
                await tf.setBackend('webgl');
                const blazeface = await import('@tensorflow-models/blazeface');
                const video = document.getElementById('webcam-feed') as HTMLVideoElement;
                model = await blazeface.load();

                intervalId = setInterval(async () => {
                    try {
                        if (video && model && video.readyState >= 2) {
                            const predictions = await model.estimateFaces(video, false);
                            const count = Array.isArray(predictions) ? predictions.length : 0;
                            setFaceCount(count);
                            if (count > 1) {
                                setMultipleWarning(true);
                                // throttle logging to once every 10s
                                const now = Date.now();
                                if (now - (lastFaceLogRef.current || 0) > 10000) {
                                    lastFaceLogRef.current = now;
                                    triggerViolation('MULTIPLE_FACES', `Detected ${count} faces on camera`);
                                }
                            } else {
                                setMultipleWarning(false);
                            }
                        }
                    } catch (e) { /* detection errors should not break session */ }
                }, 3000);
            } catch (e) {
                console.warn('Face model load failed', e);
            }
        })();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            try { if (intervalId) clearInterval(intervalId); } catch (e) {}
        };
    }, []);

    const triggerViolation = async (type: string, details: string) => {
        setWarnings(w => w + 1);
        try {
            await api.post('/assessments/log-integrity', { attemptId, eventType: type, details });
        } catch (e) { console.error("Log failed"); }
    };

    const handleRunCode = async () => {
        setExecuting(true);
        try {
            const res = await api.post('/assessments/execute', { code, language: 'javascript' });
            setOutput(res.data.output);
        } catch (e) {
            setOutput('Execution Error');
        } finally {
            setExecuting(false);
        }
    };

    const calculateProgress = () => (step / 4) * 100;

    const handleSubmit = async () => {
        try {
            const res = await api.post('/assessments/submit', { attemptId, answers: { code } });
            const attempt = res.data;
            // If AI decision text exists, show it as feedback; otherwise navigate
            if (attempt && attempt.aiDecision) {
                // Show modal with explanation (simple alert for now)
                alert(`Assessment Submitted!\n\nExplanation:\n${attempt.aiDecision}`);
            } else {
                alert('Assessment Submitted!');
            }
            navigate('/dashboard');
        } catch (error) {
            alert('Submit failed');
        }
    }

    return (
        <div className="h-screen flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
            {multipleWarning && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-red-700/95 text-white p-6 rounded-lg max-w-lg text-center">
                        <h3 className="text-lg font-bold mb-2">Multiple People Detected</h3>
                        <p className="mb-4">Our camera detected more than one face in view. This violates the integrity policy. Please ensure you are the only person in front of the camera.</p>
                        <p className="text-sm opacity-80">This incident has been logged. Continued violations may result in disqualification.</p>
                    </div>
                </div>
            )}
            {/* Header / Progress */}
            <div className="h-16 border-b border-slate-700 bg-slate-800 flex items-center justify-between px-6">
                <h2 className="font-bold text-lg">Assessment Run &bull; Step {step}/4</h2>
                <div className="w-1/3 bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${calculateProgress()}%` }} />
                </div>
                <div className="text-sm text-slate-400">Time Remaining: 45:00</div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar / Instructions */}
                <div className="w-1/3 border-r border-slate-700 p-6 overflow-y-auto bg-slate-900">
                    {step === 2 && (
                        <>
                            <h3 className="text-xl font-bold mb-4 text-white">Coding Challenge: Array Manipulation</h3>
                            <p className="text-slate-300 mb-4 leading-relaxed">
                                Write a function that takes an array of integers and returns the sum of all positive numbers.
                                <br /><br />
                                <strong>Example:</strong><br />
                                Input: [1, -4, 7, 12]<br />
                                Output: 20
                            </p>
                            <div className="bg-slate-800 p-4 rounded border border-slate-700">
                                <h4 className="font-semibold mb-2 text-sm text-slate-400">Constraints</h4>
                                <ul className="list-disc list-inside text-sm text-slate-400">
                                    <li>Array length: 0 to 1000</li>
                                    <li>-1000 &le; values &le; 1000</li>
                                </ul>
                            </div>
                        </>
                    )}
                    {step !== 2 && (
                        <div className="text-center py-20 text-slate-500">
                            Instruction View for Step {step}
                        </div>
                    )}
                </div>

                {/* Main Workspace */}
                <div className="flex-1 flex flex-col bg-slate-950">
                    {step === 2 ? (
                        // Coding Step
                        <>
                            <div className="flex-1 relative">
                                <Editor
                                    height="100%"
                                    defaultLanguage="javascript"
                                    theme="vs-dark"
                                    value={code}
                                    onChange={(val) => setCode(val || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        padding: { top: 20 }
                                    }}
                                />
                            </div>
                            <div className="h-48 border-t border-slate-700 bg-slate-900 p-4 flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-slate-400">Console / Output</span>
                                    <button
                                        onClick={handleRunCode}
                                        disabled={executing}
                                        className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                    >
                                        {executing ? 'Running...' : <><Play size={12} /> Run Code</>}
                                    </button>
                                </div>
                                <pre className="flex-1 bg-black/50 p-2 rounded font-mono text-sm text-green-400 overflow-auto">
                                    {output || 'Ready to execute...'}
                                </pre>
                            </div>
                        </>
                    ) : (
                        // Other Steps Placeholders
                        <div className="flex items-center justify-center h-full text-slate-500">
                            Component for Step {step} goes here
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Navigation */}
            <div className="h-16 border-t border-slate-700 bg-slate-800 flex items-center justify-between px-6 relative z-10">
                <div className="absolute bottom-full right-4 mb-4 w-48 bg-black rounded border border-red-900/50 shadow-lg overflow-hidden">
                    <video id="webcam-feed" autoPlay muted className="w-full h-32 object-cover opacity-80" />
                    <div className="p-2 bg-slate-900/80 text-xs text-center flex justify-between items-center">
                        <span className="flex items-center gap-1 text-green-400"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> LIVE</span>
                        <span className={warnings > 0 ? "text-red-400 font-bold" : "text-slate-500"}>{warnings} Warnings</span>
                    </div>
                </div>

                <button
                    disabled={step === 1}
                    onClick={() => setStep(s => s - 1)}
                    className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-50"
                >
                    Previous
                </button>
                {step < 4 ? (
                    <button
                        onClick={() => setStep(s => s + 1)}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                    >
                        Next Section <ChevronRight size={16} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
                    >
                        <Save size={16} /> Submit Assessment
                    </button>
                )}
            </div>
        </div>
    );
};

export default AssessmentRunner;
