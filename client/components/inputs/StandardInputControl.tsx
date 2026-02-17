import React, { useRef } from 'react';
import {
    ImagePlus,
    Globe,
    FileImage,
    Plus,
    X,
    Pencil,
    Check
} from 'lucide-react';

// --- HELPER: VALIDATORS ---
const isValidUrl = (string: string) => {
    try {
        const url = new URL(string.startsWith('http') ? string : `https://${string}`);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
};

const getDomain = (urlString: string) => {
    try {
        return new URL(urlString).hostname.replace('www.', '');
    } catch (e) {
        return null;
    }
};

interface StandardInputControlProps {
    queue: any[];
    setQueue: React.Dispatch<React.SetStateAction<any[]>>;
    currentUrl: string;
    setCurrentUrl: (url: string) => void;
    errorMsg: string | null;
    setErrorMsg: (msg: string | null) => void;
    placeholder?: string;
}

export const StandardInputControl: React.FC<StandardInputControlProps> = ({
    queue,
    setQueue,
    currentUrl,
    setCurrentUrl,
    errorMsg,
    setErrorMsg,
    placeholder
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [tempName, setTempName] = React.useState('');
    const MAX_INPUTS = 5;
    const remainingSlots = MAX_INPUTS - queue.length;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentUrl.trim()) addItem();
        }
    };

    const addItem = () => {
        setErrorMsg(null);
        const trimmedUrl = currentUrl.trim();
        if (!trimmedUrl) return;

        if (!isValidUrl(trimmedUrl)) {
            setErrorMsg("Invalid URL.");
            return;
        }
        if (remainingSlots <= 0) {
            setErrorMsg("Limit reached!");
            return;
        }
        const isDuplicate = queue.some((item: any) => item.url?.toLowerCase() === trimmedUrl.toLowerCase());
        if (isDuplicate) {
            setErrorMsg("Duplicate URL.");
            return;
        }

        setQueue((prev: any) => [...prev, {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            type: 'url',
            url: trimmedUrl
        }]);
        setCurrentUrl('');
    };

    const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setErrorMsg(null);

        if (remainingSlots <= 0) {
            setErrorMsg("Limit reached!");
            return;
        }
        // Check duplicate file
        if (queue.some((item: any) => item.files?.some((f: File) => f.name === file.name && f.size === file.size))) {
            setErrorMsg("File already added.");
            return;
        }

        setQueue((prev: any) => [...prev, {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            type: 'upload',
            files: [file],
            file: file
        }]);
        e.target.value = '';
    };

    const remove = (index: number) => {
        setQueue((prev: any) => prev.filter((_: any, i: number) => i !== index));
        setErrorMsg(null);
    };

    const startRenaming = (item: any) => {
        setEditingId(item.id);
        setTempName(item.customName || (item.url ? (getDomain(item.url) || item.url) : item.files?.[0]?.name));
    };

    const saveName = (id: string) => {
        setQueue((prev: any) => prev.map((item: any) =>
            item.id === id ? { ...item, customName: tempName.trim() || undefined } : item
        ));
        setEditingId(null);
    };

    return (
        <div className="space-y-2">
            <div className={`group relative flex items-center bg-white border-2 rounded-lg shadow-sm transition-all duration-200 focus-within:shadow-neo-hover hover:shadow-neo-hover focus-within:border-accent-cyan ${remainingSlots === 0 ? 'border-[#DDDDDD] bg-slate-50 opacity-70 cursor-not-allowed' : 'border-border-main hover:border-accent-cyan hover:bg-accent-cyan/5'}`}>
                <input
                    type="url"
                    value={currentUrl}
                    onChange={(e) => { setCurrentUrl(e.target.value); setErrorMsg(null); }}
                    onKeyDown={handleKeyDown}
                    disabled={remainingSlots === 0}
                    placeholder={remainingSlots === 0 ? "Limit reached" : (placeholder || "yourwebsite.com")}
                    className="flex-1 py-3 pl-4 pr-24 bg-transparent border-none outline-none text-text-primary placeholder:text-[#94A3B8] text-sm disabled:cursor-not-allowed font-medium"
                />
                <div className="absolute right-2 flex items-center gap-1 h-full py-1.5">
                    <div className="w-px h-5 bg-[#DDDDDD] mx-1"></div>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={addFile} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={remainingSlots === 0} className="p-1.5 text-text-secondary hover:text-brand hover:bg-[#F5F5F5] rounded transition-colors" title="Upload Screenshot">
                        <ImagePlus className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={addItem} disabled={remainingSlots === 0 || !currentUrl.trim()} className="p-1.5 bg-[#F5F5F5] border border-[#DDDDDD] text-text-primary rounded hover:bg-brand hover:text-white hover:border-brand transition-colors shadow-sm disabled:opacity-50">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Validation Error Message (Specific) */}
            {errorMsg && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1 px-1">
                    <X className="w-3 h-3" />
                    {errorMsg}
                </div>
            )}

            {/* QUEUE PILLS */}
            {queue.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {queue.map((item: any, index: number) => (
                        <div key={item.id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border-2 border-border-main rounded-md text-sm font-bold text-text-primary shadow-neo group/pill">
                            {item.type === 'url' ? <Globe className="w-3 h-3 text-brand" /> : <FileImage className="w-3 h-3 text-[#10B981]" />}

                            {editingId === item.id ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveName(item.id);
                                            if (e.key === 'Escape') setEditingId(null);
                                        }}
                                        className="w-[120px] bg-slate-50 border-b border-brand outline-none px-1 py-0"
                                    />
                                    <p className="text-sm text-slate-400 mt-4 font-mono bg-slate-100 px-2 py-1 rounded">PNG, JPG (MAX. 5MB)</p>
                                    <button type="button" onClick={() => saveName(item.id)} className="text-brand hover:text-brand-hover">
                                        <Check className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="max-w-[120px] truncate cursor-pointer hover:text-brand transition-colors"
                                        onClick={() => startRenaming(item)}
                                        title="Click to rename"
                                    >
                                        {item.customName || (item.url ? getDomain(item.url) || item.url : item.files?.[0]?.name)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => startRenaming(item)}
                                        className="opacity-0 group-hover/pill:opacity-100 transition-opacity text-[#94A3B8] hover:text-brand"
                                    >
                                        <Pencil className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            )}

                            <button type="button" onClick={() => remove(index)} className="ml-1 text-[#94A3B8] hover:text-[#EF4444] transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
