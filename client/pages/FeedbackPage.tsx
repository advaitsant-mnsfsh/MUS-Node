import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export const FeedbackPage: React.FC = () => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        teamNumber: '',
        jobId: '',
        websiteUrl: '',
        errorDetails: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        const payload = {
            ...formData,
            email: user.email
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || ''}/api/v1/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.id}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSubmitted(true);
                toast.success('Feedback submitted successfully!');
            } else {
                throw new Error('Failed to submit feedback');
            }
        } catch (error) {
            console.error('Feedback error:', error);
            toast.error('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 border-4 border-black shadow-neo mb-8">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-4xl font-black text-black mb-4 uppercase tracking-tighter">Thank You!</h1>
                <p className="text-xl text-slate-600 mb-8 font-medium">Your feedback has been received. We'll look into the error details right away.</p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-4 bg-white border-4 border-black text-black font-black uppercase tracking-widest shadow-neo hover:shadow-neo-hover hover:-translate-x-1 hover:-translate-y-1 transition-all active:shadow-none active:translate-x-0 active:translate-y-0"
                >
                    Submit Another
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
            <div className="mb-12">
                <h1 className="text-5xl font-black text-black mb-4 uppercase tracking-tighter">Feedback & Support</h1>
                <p className="text-xl text-slate-600 font-medium">Experienced an error? Let us know the details and we'll fix it.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white border-4 border-black p-8 shadow-neo-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* User Email (Info Only) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-black uppercase tracking-widest text-slate-500">Your Email</label>
                        <div className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 text-slate-500 font-bold">
                            {user?.email || 'Loading...'}
                        </div>
                    </div>

                    {/* Team Number */}
                    <div className="space-y-2">
                        <label htmlFor="teamNumber" className="block text-sm font-black uppercase tracking-widest text-black">Team Number</label>
                        <input
                            id="teamNumber"
                            type="text"
                            required
                            value={formData.teamNumber}
                            onChange={(e) => setFormData({ ...formData, teamNumber: e.target.value })}
                            className="w-full px-4 py-4 bg-white border-4 border-black text-black font-bold focus:outline-none focus:ring-4 focus:ring-brand/20"
                            placeholder="Team 1"
                        />
                    </div>

                    {/* Job ID */}
                    <div className="space-y-2">
                        <label htmlFor="jobId" className="block text-sm font-black uppercase tracking-widest text-black">Audit / Job ID (Optional)</label>
                        <input
                            id="jobId"
                            type="text"
                            value={formData.jobId}
                            onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                            className="w-full px-4 py-4 bg-white border-4 border-black text-black font-bold focus:outline-none focus:ring-4 focus:ring-brand/20"
                            placeholder="uuid-from-url"
                        />
                    </div>

                    {/* Website URL */}
                    <div className="space-y-2">
                        <label htmlFor="websiteUrl" className="block text-sm font-black uppercase tracking-widest text-black">Website URL (Optional)</label>
                        <input
                            id="websiteUrl"
                            type="text"
                            value={formData.websiteUrl}
                            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                            className="w-full px-4 py-4 bg-white border-4 border-black text-black font-bold focus:outline-none focus:ring-4 focus:ring-brand/20"
                            placeholder="https://example.com"
                        />
                    </div>
                </div>

                {/* Error Details */}
                <div className="space-y-2">
                    <label htmlFor="errorDetails" className="block text-sm font-black uppercase tracking-widest text-black">Error Details / Comments</label>
                    <textarea
                        id="errorDetails"
                        required
                        rows={5}
                        value={formData.errorDetails}
                        onChange={(e) => setFormData({ ...formData, errorDetails: e.target.value })}
                        className="w-full px-4 py-4 bg-white border-4 border-black text-black font-bold focus:outline-none focus:ring-4 focus:ring-brand/20 resize-none"
                        placeholder="Please describe what happened..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-10 py-5 bg-black text-white font-black uppercase tracking-widest shadow-neo hover:shadow-neo-hover hover:-translate-x-1 hover:-translate-y-1 transition-all active:shadow-none active:translate-x-0 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {isSubmitting ? 'Sending...' : (
                        <>
                            <span>Send Feedback</span>
                            <Send className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 flex items-start gap-3 p-4 bg-brand/10 border-2 border-brand/20">
                <AlertCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-brand-dark font-medium leading-relaxed">
                    Note: This goes directly to our engineering team. We typically respond within 24 hours for major errors.
                </p>
            </div>
        </div>
    );
};

export default FeedbackPage;
