import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PricingCardProps {
    title: string;
    price: string;
    description: string;
    buttonText: string;
    features: string[];
    isHighlighted?: boolean;
    badge?: string;
}

/**
 * PricingCard Component
 */
const PricingCard: React.FC<PricingCardProps> = ({
    title,
    price,
    description,
    buttonText,
    features,
    isHighlighted = false,
    badge = ""
}) => {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        if (title === "Scale") {
            navigate('/feedback');
        } else {
            navigate('/');
        }
    };

    return (
        <div className={`
      relative flex flex-col p-9 gap-6 bg-white border-[3.28px] border-black transition-all h-full
      ${isHighlighted ? 'shadow-[8px_8px_0px_0px_#F4D067]' : 'shadow-none'}
    `}>
            {badge && (
                <div className="absolute top-4 right-4 bg-[#F4D067] text-black text-xs font-bold px-3 py-1 border-2 border-black uppercase tracking-wider">
                    {badge}
                </div>
            )}

            <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-bold leading-none tracking-normal text-black">{title}</h3>
                <div className="flex items-baseline gap-1">
                    {price === "Prices Tailored for you :)" ? (
                        <div className="text-2xl font-normal text-black leading-tight tracking-tight">
                            Prices <span className="font-bold whitespace-nowrap">Tailored</span><br />
                            for you :)
                        </div>
                    ) : (
                        <>
                            <span className="text-5xl font-bold leading-none tracking-tighter text-black">{price}</span>
                            {price.startsWith('$') && <span className="text-2xl font-normal leading-none tracking-tighter text-black/60">/month</span>}
                        </>
                    )}
                </div>
                <p className="text-base font-normal leading-none tracking-normal text-black min-h-[42px] mt-1">
                    {description}
                </p>
            </div>

            <button
                onClick={handleButtonClick}
                className={`
        w-full h-12 flex items-center justify-center gap-2.5 py-4 px-5 text-base font-bold border-2 border-black transition-transform active:scale-95
        ${isHighlighted
                        ? 'bg-[#F4D067] shadow-[4px_4px_0px_0px_#000]'
                        : 'bg-white hover:bg-gray-50'}
      `}>
                {buttonText}
            </button>

            <ul className="flex flex-col gap-1.5 grow">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-1.5" strokeWidth={3} />
                        <span className="text-base font-medium leading-7 tracking-normal text-black/70">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>

    );
};

export default PricingCard;
