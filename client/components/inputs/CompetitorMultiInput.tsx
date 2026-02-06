import React from 'react';
import { StandardInputControl } from './StandardInputControl';

interface CompetitorMultiInputProps {
    queue: any[];
    setQueue: React.Dispatch<React.SetStateAction<any[]>>;
    currentUrl: string;
    setCurrentUrl: (url: string) => void;
    errorMsg: string | null;
    setErrorMsg: (msg: string | null) => void;
    placeholder?: string;
    colorClass?: string;
}

export const CompetitorMultiInput: React.FC<CompetitorMultiInputProps> = ({
    queue,
    setQueue,
    currentUrl,
    setCurrentUrl,
    errorMsg,
    setErrorMsg,
    placeholder,
    colorClass
}) => {
    return (
        <StandardInputControl
            queue={queue}
            setQueue={setQueue}
            currentUrl={currentUrl}
            setCurrentUrl={setCurrentUrl}
            errorMsg={errorMsg}
            setErrorMsg={setErrorMsg}
            placeholder={placeholder}
        />
    );
};
