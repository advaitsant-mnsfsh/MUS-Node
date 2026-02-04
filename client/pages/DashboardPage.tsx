import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Calendar, ExternalLink, Loader2 } from 'lucide-react';

// Mock data structure - will be replaced with actual API
interface Audit {
    id: string;
    url: string;
    createdAt: string;
    status: 'completed' | 'processing' | 'failed';
    score?: number;
}

const DashboardPage: React.FC = () => {
    // const { user, signOut } = useAuth(); // User is handled by Layout/AuthContext
    const [audits, setAudits] = useState<Audit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch user's audits from backend
        // For now, using mock data
        const mockAudits: Audit[] = [
            {
                id: '1',
                url: 'https://example.com',
                createdAt: '2024-01-27',
                status: 'completed',
                score: 85
            },
            {
                id: '2',
                url: 'https://mywebsite.com',
                createdAt: '2024-01-26',
                status: 'completed',
                score: 72
            },
            {
                id: '3',
                url: 'https://newproject.com',
                createdAt: '2024-01-25',
                status: 'processing'
            }
        ];

        // Simulate API call
        setTimeout(() => {
            setAudits(mockAudits);
            setLoading(false);
        }, 500);
    }, []);

    const getStatusBadge = (status: string) => {
        const styles = {
            completed: 'bg-green-100 text-green-800 border-green-200',
            processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            failed: 'bg-red-100 text-red-800 border-red-200'
        };
        const labels = {
            completed: 'Completed',
            processing: 'Processing',
            failed: 'Failed'
        };
        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-page-bg font-['DM_Sans']">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-text-primary mb-2">My Assessments</h1>
                        <p className="text-text-secondary">View and manage your UX audits</p>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-brand" />
                        <span className="ml-3 text-text-secondary font-semibold">Loading your assessments...</span>
                    </div>
                )}

                {/* Empty State */}
                {!loading && audits.length === 0 && (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-[#CBD5E1] mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-text-primary mb-2">No assessments yet</h3>
                        <p className="text-text-secondary mb-6">Get started by creating your first UX audit</p>
                        <Link
                            to="/"
                            className="inline-block px-6 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover transition-colors"
                        >
                            Create First Assessment
                        </Link>
                    </div>
                )}

                {/* Assessments Grid (Figma-style) */}
                {!loading && audits.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {audits.map((audit) => (
                            <div
                                key={audit.id}
                                className="bg-white rounded-lg border-2 border-border-main shadow-neo hover:shadow-neo-hover transition-all cursor-pointer group"
                            >
                                <div className="h-48 bg-linear-to-br from-[#F1F5F9] to-[#E2E8F0] rounded-t-lg border-b-2 border-border-main flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-linear-to-br from-brand/10 to-[#8B5CF6]/10"></div>
                                    <FileText className="w-16 h-16 text-text-secondary relative z-10" />
                                    {audit.score && (
                                        <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-full border-2 border-border-main shadow-sm">
                                            <span className="text-sm font-bold text-text-primary">{audit.score}%</span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Content */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-bold text-text-primary truncate flex-1 group-hover:text-brand transition-colors">
                                            {new URL(audit.url).hostname}
                                        </h3>
                                        <ExternalLink className="w-4 h-4 text-text-secondary shrink-0 ml-2" />
                                    </div>

                                    <p className="text-sm text-text-secondary mb-3 truncate">{audit.url}</p>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center text-xs text-text-secondary">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(audit.createdAt).toLocaleDateString()}
                                        </div>
                                        {getStatusBadge(audit.status)}
                                    </div>

                                    {/* Action on hover/click */}
                                    {audit.status === 'completed' && (
                                        <Link
                                            to={`/report/${audit.id}`}
                                            className="block w-full px-4 py-2 bg-text-primary text-white text-sm font-semibold text-center rounded-lg hover:bg-[#374151] transition-colors"
                                        >
                                            View Report
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default DashboardPage;
