import React, { useState } from 'react';
import api from '../api/axios';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onJobCreated: () => void;
}

const CreateJobModal: React.FC<Props> = ({ isOpen, onClose, onJobCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [skills, setSkills] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/jobs', {
                title,
                description,
                requiredSkills: skills.split(',').map(s => s.trim())
            });
            onJobCreated();
            onClose();
        } catch (error) {
            alert('Failed to create job');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-lg w-full max-w-lg p-6 relative border border-slate-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-white mb-4">Post a New Job</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">Job Title</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">Description</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">Required Skills (comma separated)</label>
                        <input
                            type="text"
                            required
                            placeholder="React, Node.js, TypeScript"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                            value={skills}
                            onChange={e => setSkills(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Post Job</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJobModal;
