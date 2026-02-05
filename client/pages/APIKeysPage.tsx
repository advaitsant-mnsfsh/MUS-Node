import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Key, Copy, Eye, EyeOff, Code, BookOpen, Zap, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateAPIKey, getUserAPIKeys, deactivateAPIKey, APIKey } from '../services/apiKeysService';

export const APIKeysPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');

    // Fetch API keys when user logs in
    useEffect(() => {
        if (user) {
            fetchAPIKeys();
        }
    }, [user]);

    const fetchAPIKeys = async () => {
        setIsLoading(true);
        const { success, apiKeys: keys, error } = await getUserAPIKeys();
        setIsLoading(false);

        if (success && keys) {
            setApiKeys(keys);
        } else {
            console.error('Failed to fetch API keys:', error);
            toast.error(error || 'Failed to load API keys');
        }
    };

    const handleGenerateKey = () => {
        if (!user) {
            navigate('/login?returnUrl=/api-keys');
        } else {
            setShowNameModal(true);
            setNewKeyName('');
        }
    };

    const handleConfirmGenerate = async () => {
        if (!newKeyName.trim()) {
            toast.error('Please enter a name for your API key');
            return;
        }

        setIsGenerating(true);
        const { success, apiKey, error } = await generateAPIKey(newKeyName.trim());
        setIsGenerating(false);

        if (success && apiKey) {
            toast.success('API key generated successfully!');
            setApiKeys([apiKey, ...apiKeys]);
            setShowNameModal(false);
            setNewKeyName('');
            // Auto-show the new key
            setShowKey({ [apiKey.id]: true });
        } else {
            toast.error(error || 'Failed to generate API key');
        }
    };

    const handleDeactivateKey = async (keyId: string, keyName: string) => {
        if (!confirm(`Are you sure you want to deactivate "${keyName}"? This action cannot be undone.`)) {
            return;
        }

        const { success, error } = await deactivateAPIKey(keyId);

        if (success) {
            toast.success('API key deactivated');
            // Update local state
            setApiKeys(apiKeys.map(k => k.id === keyId ? { ...k, isActive: false } : k));
        } else {
            toast.error(error || 'Failed to deactivate API key');
        }
    };

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

    return (
        <>
            <div className="min-h-[calc(100vh-5rem)] bg-[#FFF9F0] font-['DM_Sans']">
                <div className="max-w-5xl mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-[#1E293B] mb-2">Widget API Keys</h1>
                        <p className="text-[#64748B]">Embed UX audits directly on your website</p>
                    </div>

                    {/* Widget Info Section - Always visible */}
                    <div className="bg-white rounded-lg border-2 border-[#000000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
                        <div className="flex items-start gap-3 mb-6">
                            <Code className="w-6 h-6 text-[#6366F1] flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-bold text-[#1E293B] mb-2">How to Use the Widget</h2>
                                <p className="text-[#64748B] mb-4">
                                    Add our widget to your website and let your users run UX audits without leaving your platform.
                                </p>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#6366F1] text-white rounded-full flex items-center justify-center font-bold">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1E293B] mb-2">Generate your API Key</h3>
                                    <p className="text-[#64748B] text-sm">
                                        Click the "Generate API Key" button below to create your unique widget key.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#6366F1] text-white rounded-full flex items-center justify-center font-bold">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1E293B] mb-2">Add the Widget Script</h3>
                                    <p className="text-[#64748B] text-sm mb-3">
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
                                <div className="flex-shrink-0 w-8 h-8 bg-[#6366F1] text-white rounded-full flex items-center justify-center font-bold">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1E293B] mb-2">Start Receiving Audits</h3>
                                    <p className="text-[#64748B] text-sm">
                                        The widget will appear on your site and users can trigger UX audits. All results will be available in your dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="mt-8 pt-8 border-t-2 border-slate-200">
                            <h3 className="font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-[#6366F1]" />
                                Widget Features
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-[#64748B]">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#6366F1] mt-1">✓</span>
                                    <span>Customizable button placement</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#6366F1] mt-1">✓</span>
                                    <span>Real-time audit results</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#6366F1] mt-1">✓</span>
                                    <span>Branded UI matching your site</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#6366F1] mt-1">✓</span>
                                    <span>Analytics and tracking</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Generate API Key Button */}
                    <div className="mb-8 text-center">
                        <button
                            onClick={handleGenerateKey}
                            className="px-8 py-4 bg-[#6366F1] text-white font-bold text-lg rounded-lg hover:bg-[#4F46E5] transition-colors border-2 border-[#000000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                            {user ? '+ Generate New API Key' : '🔐 Login to Generate API Key'}
                        </button>
                        {!user && (
                            <p className="mt-3 text-sm text-[#64748B]">
                                You need to be logged in to generate API keys
                            </p>
                        )}
                    </div>

                    {/* API Keys Section - Only visible when logged in */}
                    {user && (
                        <>
                            <h2 className="text-2xl font-bold text-[#1E293B] mb-4">Your API Keys</h2>

                            {/* Info Banner */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <Key className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900 mb-1">Keep your API keys secure</h3>
                                        <p className="text-sm text-blue-800">
                                            Never share your API keys publicly. Store them securely and rotate them regularly.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Loading State */}
                            {isLoading && (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
                                    <p className="mt-4 text-[#64748B]">Loading API keys...</p>
                                </div>
                            )}

                            {/* Empty State */}
                            {!isLoading && apiKeys.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-lg border-2 border-[#000000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Key className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-[#1E293B] mb-2">No API Keys Yet</h3>
                                    <p className="text-[#64748B] mb-4">Generate your first API key to get started with the widget.</p>
                                </div>
                            )}

                            {/* Keys List */}
                            {!isLoading && apiKeys.length > 0 && (
                                <div className="space-y-4">
                                    {apiKeys.map((apiKey) => (
                                        <div
                                            key={apiKey.id}
                                            className={`bg-white rounded-lg border-2 border-[#000000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-6 ${!apiKey.isActive ? 'opacity-60' : ''}`}
                                        >
                                            <div className="mb-4 flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-bold text-[#1E293B] mb-1">
                                                        {apiKey.name}
                                                        {!apiKey.isActive && (
                                                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Inactive</span>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-[#64748B]">
                                                        Created {new Date(apiKey.createdAt).toLocaleDateString()}
                                                        {apiKey.lastUsedAt && ` • Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}`}
                                                        {apiKey.usageCount > 0 && ` • ${apiKey.usageCount} uses`}
                                                    </p>
                                                </div>
                                                {apiKey.isActive && (
                                                    <button
                                                        onClick={() => handleDeactivateKey(apiKey.id, apiKey.name)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Deactivate key"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-lg px-4 py-3 font-mono text-sm">
                                                    {showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                                                </div>
                                                <button
                                                    onClick={() => toggleKeyVisibility(apiKey.id)}
                                                    className="p-3 bg-white border-2 border-[#000000] rounded-lg hover:bg-slate-50 transition-colors"
                                                >
                                                    {showKey[apiKey.id] ? (
                                                        <EyeOff className="w-5 h-5 text-[#64748B]" />
                                                    ) : (
                                                        <Eye className="w-5 h-5 text-[#64748B]" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(apiKey.key)}
                                                    className="p-3 bg-[#1E293B] text-white border-2 border-[#000000] rounded-lg hover:bg-[#374151] transition-colors"
                                                >
                                                    <Copy className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Documentation Link */}
                    <div className="mt-8 p-6 bg-white rounded-lg border-2 border-[#000000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-start gap-3">
                            <BookOpen className="w-6 h-6 text-[#6366F1] flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-[#1E293B] mb-2">Need Help?</h3>
                                <p className="text-[#64748B] mb-4">
                                    Check out our comprehensive widget documentation for advanced configuration options and troubleshooting.
                                </p>
                                <a
                                    href="/docs/widget"
                                    className="inline-block px-6 py-2 bg-[#1E293B] text-white font-semibold rounded-lg hover:bg-[#374151] transition-colors"
                                >
                                    View Widget Docs
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Name Modal */}
            {showNameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-lg border-2 border-[#000000] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-[#1E293B] mb-4">Name Your API Key</h3>
                        <p className="text-sm text-[#64748B] mb-4">
                            Give your API key a descriptive name to help you identify it later.
                        </p>
                        <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="e.g., Production Widget Key"
                            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] outline-none mb-4"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && handleConfirmGenerate()}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowNameModal(false)}
                                className="flex-1 px-4 py-2 bg-white text-[#1E293B] border-2 border-[#000000] font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmGenerate}
                                disabled={isGenerating || !newKeyName.trim()}
                                className="flex-1 px-4 py-2 bg-[#6366F1] text-white font-semibold rounded-lg hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default APIKeysPage;