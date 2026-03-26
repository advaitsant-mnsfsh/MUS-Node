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
      font-['DM_Sans'] relative flex w-full flex-col rounded-lg border-1 border-border-main bg-white px-4 py-4 transition-all
      max-md:h-auto max-md:min-h-[22.5rem] max-md:overflow-visible max-md:p-[1.35rem] sm:max-md:p-6
      md:h-full md:min-h-0 md:p-8 lg:p-9 shadow-sm
    `}
      style={isHighlighted ? { boxShadow: "2.572px 2.572px 0px 0px #f8d448" } : undefined}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 max-md:gap-2.5 md:h-full md:justify-start md:gap-6">
        <div className="flex shrink-0 flex-col gap-2.5 sm:gap-4 md:gap-5">
          <div className="flex flex-row items-start justify-between gap-2 sm:gap-3">
            <h3 className="min-w-0 shrink text-lg font-bold leading-tight tracking-tight text-black sm:text-xl md:text-[1.65rem]">
              {title}
            </h3>
            {badge ? (
              <span className="max-w-[55%] shrink-0 rounded-md border-1 border-border-main bg-[#F4D067] px-1.5 py-0.5 text-center text-[9px] font-bold uppercase leading-tight tracking-wide text-black sm:max-w-none sm:px-2.5 sm:py-0.5 sm:text-[10px] md:rounded-lg md:px-3 md:py-1 md:text-xs">
                {badge}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-baseline gap-1 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3rem]">
            {price === "Prices Tailored for you :)" ? (
              <div className="text-base font-normal leading-snug tracking-tight text-black sm:text-lg md:text-2xl">
                Prices{" "}
                <span className="font-bold whitespace-nowrap">Tailored</span>{" "}
                for you :)
              </div>
            ) : (
              <>
                <span className="text-3xl font-bold leading-none tracking-tighter text-black sm:text-4xl md:text-5xl">
                  {price}
                </span>
                {price.startsWith("$") && (
                  <span className="text-base font-normal leading-none tracking-tighter text-black/60 sm:text-lg md:text-2xl">
                    /month
                  </span>
                )}
              </>
            )}
          </div>
          <p className="text-[13px] font-normal leading-snug tracking-normal text-black sm:text-sm sm:leading-normal md:text-base min-h-[2rem] sm:min-h-[2.75rem] md:min-h-[3rem]">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={handleButtonClick}
          className={`
        flex h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border-1 border-border-main px-4 py-2 text-xs font-bold transition-all active:scale-[0.98]
        sm:h-11 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm md:h-12 md:px-6 md:py-3 md:text-base md:leading-normal
        ${
          isHighlighted
            ? "bg-[#F4D067] shadow-neo hover:shadow-neo-hover hover:-translate-x-px hover:-translate-y-px"
            : "bg-white shadow-sm hover:bg-gray-50 hover:shadow-neo"
        }
      `}
        >
          {buttonText}
        </button>

        <ul className="flex min-h-0 flex-1 flex-col gap-1 sm:gap-1.5 md:gap-1.5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
              <Check
                className="mt-0.5 h-3 w-3 shrink-0 text-green-600 sm:h-3.5 sm:w-3.5 md:mt-1.5 md:h-4 md:w-4"
                strokeWidth={3}
              />
              <span className="text-[13px] font-medium leading-snug tracking-normal text-[#1A1A1A]/70 sm:text-sm sm:leading-6 md:text-base md:leading-7">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PricingCard;
