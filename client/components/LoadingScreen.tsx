import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { ProgressBar } from './ui/ProgressBar';
import { LottieAnimation } from './ui/LottieAnimation';

const loadingMicrocopy = [
    "Analyzing UX with 250+ parameters…",
    "Pixel checks in progress...",
    "Reading your interface…",
    "Decoding design decisions…",
];

const qrCodeAnimationData = { "v": "5.12.1", "fr": 29.9700012207031, "ip": 0, "op": 97.000003950891, "w": 128, "h": 128, "nm": "Qr_code_lottie", "ddd": 0, "assets": [], "layers": [{ "ddd": 0, "ind": 1, "ty": 4, "nm": "Layer 2 Outlines", "parent": 2, "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 0, "k": 0, "ix": 10 }, "p": { "a": 0, "k": [49, 49, 0], "ix": 2, "l": 2 }, "a": { "a": 0, "k": [44.5, 3.5, 0], "ix": 1, "l": 2 }, "s": { "a": 0, "k": [100, 100, 100], "ix": 6, "l": 2 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ind": 0, "ty": "sh", "ix": 1, "ks": { "a": 1, "k": [{ "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 10, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[3.5, 3.5], [85.5, 3.5]], "c": false }] }, { "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 25, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[14.75, 3.5], [74.25, 3.5]], "c": false }] }, { "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 42, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[14.75, -26.25], [74.25, -26.25]], "c": false }] }, { "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 62, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[14.75, 32.25], [74.25, 32.25]], "c": false }] }, { "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 82, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[14.75, 3.5], [74.25, 3.5]], "c": false }] }, { "t": 92.0000037472368, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[3.5, 3.5], [85.5, 3.5]], "c": false }] }], "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ty": "st", "c": { "a": 0, "k": [0, 0, 0, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 7, "ix": 5 }, "lc": 2, "lj": 1, "ml": 4, "bm": 0, "nm": "Stroke 1", "mn": "ADBE Vector Graphic - Stroke", "hd": false }, { "ty": "tr", "p": { "a": 0, "k": [0, 0], "ix": 2 }, "a": { "a": 0, "k": [0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100], "ix": 3 }, "r": { "a": 0, "k": 0, "ix": 6 }, "o": { "a": 0, "k": 100, "ix": 7 }, "sk": { "a": 0, "k": 0, "ix": 4 }, "sa": { "a": 0, "k": 0, "ix": 5 }, "nm": "Transform" }], "nm": "Group 1", "np": 2, "cix": 2, "bm": 0, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 0, "op": 300.00001221925, "st": 0, "ct": 1, "bm": 0 }, { "ddd": 0, "ind": 2, "ty": 4, "nm": "Layer 1 Outlines", "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 0, "k": 0, "ix": 10 }, "p": { "a": 0, "k": [63.5, 64.5, 0], "ix": 2, "l": 2 }, "a": { "a": 0, "k": [48.5, 48.5, 0], "ix": 1, "l": 2 }, "s": { "a": 1, "k": [{ "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 10, "s": [100, 100, 100] }, { "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 25, "s": [116, 116, 100] }, { "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 42, "s": [110, 110, 100] }, { "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 62, "s": [131, 131, 100] }, { "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 82, "s": [110, 110, 100] }, { "t": 92.0000037472368, "s": [100, 100, 100] }], "ix": 6, "l": 2 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ind": 0, "ty": "sh", "ix": 1, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [-2.636, 2.636], [-8.485, 0], [0, 0]], "o": [[0, 0], [0, -8.485], [2.636, -2.636], [0, 0], [0, 0]], "v": [[-41.5, -20.75], [-41.5, -23.5], [-38.864, -38.864], [-23.5, -41.5], [-20.75, -41.5]], "c": false }, "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 1, "ty": "sh", "ix": 2, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [2.636, 2.636], [0, 8.485], [0, 0]], "o": [[0, 0], [-8.485, 0], [-2.636, -2.636], [0, 0], [0, 0]], "v": [[-20.75, 41.5], [-23.5, 41.5], [-38.864, 38.864], [-41.5, 23.5], [-41.5, 20.75]], "c": false }, "ix": 2 }, "nm": "Path 2", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 2, "ty": "sh", "ix": 3, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [2.636, 2.636], [8.485, 0], [0, 0]], "o": [[0, 0], [0, -8.485], [-2.636, -2.636], [0, 0], [0, 0]], "v": [[41.5, -20.75], [41.5, -23.5], [38.864, -38.864], [23.5, -41.5], [20.75, -41.5]], "c": false }, "ix": 2 }, "nm": "Path 3", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 3, "ty": "sh", "ix": 4, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [2.636, -2.636], [8.485, 0], [0, 0]], "o": [[0, 0], [0, 8.485], [-2.636, 2.636], [0, 0], [0, 0]], "v": [[41.5, 20.75], [41.5, 23.5], [38.864, 38.864], [23.5, 41.5], [20.75, 41.5]], "c": false }, "ix": 2 }, "nm": "Path 4", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ty": "mm", "mm": 1, "nm": "Merge Paths 1", "mn": "ADBE Vector Filter - Merge", "hd": false }, { "ty": "st", "c": { "a": 0, "k": [0, 0, 0, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 7, "ix": 5 }, "lc": 2, "lj": 2, "bm": 0, "nm": "Stroke 1", "mn": "ADBE Vector Graphic - Stroke", "hd": false }, { "ty": "tr", "p": { "a": 0, "k": [48.5, 48.5], "ix": 2 }, "a": { "a": 0, "k": [0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100], "ix": 3 }, "r": { "a": 0, "k": 0, "ix": 6 }, "o": { "a": 0, "k": 100, "ix": 7 }, "sk": { "a": 0, "k": 0, "ix": 4 }, "sa": { "a": 0, "k": 0, "ix": 5 }, "nm": "Transform" }], "nm": "Group 1", "np": 6, "cix": 2, "bm": 0, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 0, "op": 300.00001221925, "st": 0, "ct": 1, "bm": 0 }], "markers": [], "props": {} };

interface LoadingScreenProps {
    progress: number;
    message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, message }) => {
    const [currentMicrocopy, setCurrentMicrocopy] = useState(loadingMicrocopy[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMicrocopy(prev => {
                const currentIndex = loadingMicrocopy.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMicrocopy.length;
                return loadingMicrocopy[nextIndex];
            });
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col items-center justify-start pt-16 sm:pt-24">


            <div className="my-8 sm:my-12">
                <LottieAnimation animationData={qrCodeAnimationData} className="w-32 h-32 mx-auto" />
            </div>

            <div className="w-full px-4 text-center">
                <div className="mb-6">
                    <ProgressBar progress={progress} />
                </div>
                <p className="mt-4 text-base sm:text-lg text-slate-600 animate-pulse">
                    {message || currentMicrocopy}
                </p>
                <p className="mt-2 text-base sm:text-lg text-slate-600">
                    Hang tight. Good things take a little time
                </p>
            </div>
        </div>
    );
};
