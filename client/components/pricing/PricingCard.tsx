import React from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  buttonText: string;
  features: string[];
  isHighlighted?: boolean;
  badge?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  description,
  buttonText,
  features,
  isHighlighted = false,
  badge = "",
}) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (title === "Scale") {
      navigate("/feedback");
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className={`
      font-['DM_Sans'] relative flex h-full w-full min-h-[24rem] flex-col gap-5 rounded-sm border-2 border-black bg-white p-6 transition-all
      sm:min-h-[26rem] sm:gap-5 sm:p-7 md:h-full md:min-h-0 md:gap-6 md:border-[3.28px] md:p-8 lg:p-9
      ${
        isHighlighted
          ? "shadow-[4px_4px_0px_0px_#F4D067] sm:shadow-[6px_6px_0px_0px_#F4D067] md:shadow-[8px_8px_0px_0px_#F4D067]"
          : "shadow-none"
      }
    `}
    >
      {badge && (
        <div className="absolute right-3 top-3 z-[1] border-2 border-black bg-[#F4D067] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black sm:right-4 sm:top-4 sm:px-3 sm:py-1 sm:text-xs">
          {badge}
        </div>
      )}

      <div className="flex shrink-0 flex-col gap-4 sm:gap-4 md:gap-5">
        <h3 className="text-xl font-bold leading-tight tracking-tight text-black sm:text-2xl md:text-[1.65rem]">
          {title}
        </h3>
        <div className="flex flex-wrap items-baseline gap-1">
          {price === "Prices Tailored for you :)" ? (
            <div className="text-lg font-normal leading-snug tracking-tight text-black sm:text-xl md:text-2xl">
              Prices <span className="font-bold whitespace-nowrap">Tailored</span>
              <br />
              for you :)
            </div>
          ) : (
            <>
              <span className="text-4xl font-bold leading-none tracking-tighter text-black sm:text-5xl">
                {price}
              </span>
              {price.startsWith("$") && (
                <span className="text-lg font-normal leading-none tracking-tighter text-black/60 sm:text-xl md:text-2xl">
                  /month
                </span>
              )}
            </>
          )}
        </div>
        <p className="mt-0.5 text-sm font-normal leading-snug tracking-normal text-black sm:text-base sm:leading-normal">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={handleButtonClick}
        className={`
        flex h-12 w-full shrink-0 items-center justify-center gap-2 border-2 border-black px-5 py-3 text-sm font-bold transition-transform active:scale-[0.98]
        sm:text-base sm:px-6 md:py-4
        ${
          isHighlighted
            ? "bg-[#F4D067] shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000]"
            : "bg-white hover:bg-gray-50"
        }
      `}
      >
        {buttonText}
      </button>

      <ul className="flex min-h-0 flex-1 flex-col gap-1 sm:gap-1.5">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2.5 sm:gap-3">
            <Check
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600 sm:mt-1.5 sm:h-4 sm:w-4"
              strokeWidth={3}
            />
            <span className="text-sm font-medium leading-6 tracking-normal text-[#1A1A1A]/70 sm:text-base sm:leading-7">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricingCard;
