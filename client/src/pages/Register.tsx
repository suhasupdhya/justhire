import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Briefcase } from 'lucide-react';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'CANDIDATE' | 'RECRUITER'>('CANDIDATE');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/register', { name, email, password, role });
            register(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
                <h2 className="text-3xl font-bold text-center text-blue-400">CYGNUSA Elite-Hire</h2>
                <h3 className="text-xl text-center text-slate-400">Create Account</h3>
                {error && <div className="p-3 text-red-400 bg-red-900/20 border border-red-900 rounded">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-600 text-slate-100"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-600 text-slate-100"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-600 text-slate-100"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">I am a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('CANDIDATE')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${role === 'CANDIDATE'
                                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                                    }`}
                            >
                                <User className="h-6 w-6 mb-1" />
                                <span className="text-sm">Candidate</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('RECRUITER')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${role === 'RECRUITER'
                                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                                    }`}
                            >
                                <Briefcase className="h-6 w-6 mb-1" />
                                <span className="text-sm">Recruiter</span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                    >
                        Create Account
                    </button>
                </form>
                <p className="text-center text-slate-400 text-sm">
                    Already have an account? <a href="/login" className="text-blue-400 hover:underline">Sign In</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
