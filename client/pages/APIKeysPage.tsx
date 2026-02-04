import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Key, Copy, Eye, EyeOff, Code, BookOpen, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface APIKey {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsed?: string;
}

export const APIKeysPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});

    // Dummy API keys - only show when user is logged in
    const dummyApiKeys: APIKey[] = user ? [
        {
            id: '1',
            name: 'Production Widget Key',
            key: 'uxc_prod_1234567890abcdef',
            createdAt: '2024-01-15',
            lastUsed: '2024-01-27'
        }
    ] : [];

    const toggleKeyVisibility = (id: string) => {
        setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (key: string) => {
        navigator.clipboard.writeText(key);
        toast.success('API key copied to clipboard!');
    };

    const maskKey = (key: string) => {
        return key.substring(0, 12) + '•••••••••••••••';
    };

    const handleGenerateKey = () => {
        if (!user) {
            // Redirect to login if not authenticated
            navigate('/login?returnUrl=/api-keys');
        } else {
            // TODO: Your teammate will implement actual API key generation
            toast.success('API key generation will be implemented by backend team');
        }
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-page-bg font-['DM_Sans']">
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-text-primary mb-2">Widget API Keys</h1>
                    <p className="text-text-secondary">Embed UX audits directly on your website</p>
                </div>

                {/* Widget Info Section - Always visible */}
                <div className="bg-white rounded-lg border-border-main border-2 shadow-neo-hover p-8 mb-8">
                    <div className="flex items-start gap-3 mb-6">
                        <Code className="w-6 h-6 text-brand shrink-0 mt-1" />
                        <div>
                            <h2 className="text-2xl font-bold text-text-primary mb-2">How to Use the Widget</h2>
                            <p className="text-text-secondary mb-4">
                                Add our widget to your website and let your users run UX audits without leaving your platform.
                            </p>
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary mb-2">Generate your API Key</h3>
                                <p className="text-text-secondary text-sm">
                                    Click the "Generate API Key" button below to create your unique widget key.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold">
                                2
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary mb-2">Add the Widget Script</h3>
                                <p className="text-text-secondary text-sm mb-3">
                                    Copy this code snippet and paste it into your website's HTML, just before the closing &lt;/body&gt; tag:
                                </p>
                                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                                    <code>{`<script src="https://widget.myuxscore.com/widget.js"></script>
<script>
UXWidget.init({
apiKey: 'YOUR_API_KEY_HERE'
});
</script>`}</code>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold">
                                3
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary mb-2">Start Receiving Audits</h3>
                                <p className="text-text-secondary text-sm">
                                    The widget will appear on your site and users can trigger UX audits. All results will be available in your dashboard.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="mt-8 pt-8 border-t-2 border-slate-200">
                        <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-brand" />
                            Widget Features
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-secondary">
                            <li className="flex items-start gap-2">
                                <span className="text-brand mt-1">✓</span>
                                <span>Customizable button placement</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand mt-1">✓</span>
                                <span>Real-time audit results</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand mt-1">✓</span>
                                <span>Branded UI matching your site</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand mt-1">✓</span>
                                <span>Analytics and tracking</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Generate API Key Button */}
                <div className="mb-8 text-center">
                    <button
                        onClick={handleGenerateKey}
                        className="px-8 py-4 bg-brand text-white font-bold text-lg rounded-lg hover:bg-brand-hover transition-colors border-2 border-border-main shadow-[3px_3px_0px_0px_var(--color-border-main)] hover:shadow-[4px_4px_0px_0px_var(--color-border-main)] active:shadow-[2px_2px_0px_0px_var(--color-border-main)]"
                    >
                        {user ? '+ Generate New API Key' : '🔐 Login to Generate API Key'}
                    </button>
                    {!user && (
                        <p className="mt-3 text-sm text-text-secondary">
                            You need to be logged in to generate API keys
                        </p>
                    )}
                </div>

                {/* API Keys Section - Only visible when logged in */}
                {user && dummyApiKeys.length > 0 && (
                    <>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">Your API Keys</h2>

                        {/* Info Banner */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Key className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">Keep your API keys secure</h3>
                                    <p className="text-sm text-blue-800">
                                        Never share your API keys publicly. Store them securely and rotate them regularly.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Keys List */}
                        <div className="space-y-4">
                            {dummyApiKeys.map((apiKey) => (
                                <div
                                    key={apiKey.id}
                                    className="bg-white rounded-lg border-2 border-border-main shadow-neo-hover p-6"
                                >
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-text-primary mb-1">{apiKey.name}</h3>
                                        <p className="text-sm text-text-secondary">
                                            Created {new Date(apiKey.createdAt).toLocaleDateString()}
                                            {apiKey.lastUsed && ` • Last used ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-lg px-4 py-3 font-mono text-sm">
                                            {showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                                        </div>
                                        <button
                                            onClick={() => toggleKeyVisibility(apiKey.id)}
                                            className="p-3 bg-white border-2 border-border-main rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            {showKey[apiKey.id] ? (
                                                <EyeOff className="w-5 h-5 text-text-secondary" />
                                            ) : (
                                                <Eye className="w-5 h-5 text-text-secondary" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(apiKey.key)}
                                            className="p-3 bg-text-primary text-white border-2 border-border-main rounded-lg hover:opacity-90 transition-colors"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Documentation Link */}
                <div className="mt-8 p-6 bg-white rounded-lg border-2 border-border-main shadow-neo-hover">
                    <div className="flex items-start gap-3">
                        <BookOpen className="w-6 h-6 text-brand shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-text-primary mb-2">Need Help?</h3>
                            <p className="text-text-secondary mb-4">
                                Check out our comprehensive widget documentation for advanced configuration options and troubleshooting.
                            </p>
                            <a
                                href="/docs/widget"
                                className="inline-block px-6 py-2 bg-text-primary text-white font-semibold rounded-lg hover:opacity-90 transition-colors"
                            >
                                View Widget Docs
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default APIKeysPage;
