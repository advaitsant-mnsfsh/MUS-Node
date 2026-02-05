import { useState } from 'react';

interface SiteLogoProps {
    domain: string;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

/**
 * SiteLogo component - displays site logo/favicon with fallbacks
 * 1. Uses Google Favicon Service (fast and reliable)
 * 2. Falls back to letter circle with domain-based color
 */
export default function SiteLogo({ domain, size = 'medium', className = '' }: SiteLogoProps) {
    const [logoSource, setLogoSource] = useState<'google' | 'fallback'>('google'); // Skip Clearbit to avoid DNS issues
    const [imageError, setImageError] = useState(false);

    // Extract clean domain (remove www, protocols, paths)
    const cleanDomain = domain
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0]
        .toLowerCase();

    // Size mapping
    const sizeClasses = {
        small: 'w-12 h-12',
        medium: 'w-20 h-20',
        large: 'w-32 h-32'
    };

    const iconSize = {
        small: '48px',
        medium: '80px',
        large: '128px'
    };

    const fontSize = {
        small: 'text-xl',
        medium: 'text-3xl',
        large: 'text-5xl'
    };

    // Generate consistent color from domain
    const getColorFromDomain = (domain: string): string => {
        const colors = [
            '#3B82F6', // Blue
            '#8B5CF6', // Purple
            '#EC4899', // Pink
            '#F59E0B', // Amber
            '#10B981', // Green
            '#EF4444', // Red
            '#6366F1', // Indigo
            '#14B8A6', // Teal
        ];
        const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const domainColor = getColorFromDomain(cleanDomain);
    const firstLetter = cleanDomain[0]?.toUpperCase() || '?';

    // Logo URLs - Use larger size for better quality
    const clearbitUrl = `https://logo.clearbit.com/${cleanDomain}`;
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256`;

    const handleImageError = () => {
        // Fall back to letter circle if Google Favicon fails
        setLogoSource('fallback');
        setImageError(true);
    };

    // Render letter circle fallback
    if (logoSource === 'fallback' || imageError) {
        return (
            <div
                className={`${sizeClasses[size]} ${className} rounded-lg flex items-center justify-center font-bold text-white shadow-md`}
                style={{ backgroundColor: domainColor }}
            >
                <span className={fontSize[size]}>{firstLetter}</span>
            </div>
        );
    }

    // Render logo image with crisp rendering
    return (
        <div className={`${sizeClasses[size]} ${className} rounded-lg overflow-hidden bg-white shadow-md flex items-center justify-center`}>
            <img
                src={googleFaviconUrl}
                alt={`${cleanDomain} logo`}
                className="w-full h-full object-contain p-2"
                onError={handleImageError}
                loading="lazy"
            />
        </div>
    );
}
