import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

/** Main site footer (yellow band + links + watermark). */
export const Footer: React.FC = () => {
  return (
    <footer className="relative flex h-[520px] w-full flex-col gap-[84px] overflow-hidden bg-[#F4D067] pt-[70px] font-['DM_Sans']">
      {/* Same horizontal padding as GlobalNavbar (px-4 sm:px-6 lg:px-8); full width so edges align with nav */}
      <div className="relative z-10 mx-auto grid w-full grid-cols-1 gap-12 px-4 sm:px-6 lg:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-x-16 lg:gap-x-20">
        <div className="min-w-0 max-w-lg">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-black">
              Made with love by Team MyUXScore
            </h3>
            <p className="text-base font-medium text-[#666666]">
              © 2026 MyUXScore. All rights reserved.
            </p>
          </div>
        </div>

        <nav
          className="flex min-h-[111px] w-full flex-col gap-10 sm:flex-row sm:flex-wrap sm:gap-x-20 sm:gap-y-8 md:w-auto md:max-w-none md:flex-nowrap md:-translate-x-2 md:gap-x-28 lg:-translate-x-4 lg:gap-x-32"
          aria-label="Footer"
        >
          <div className="flex shrink-0 flex-col gap-6">
            <h4 className="text-[16px] font-semibold text-black">Product</h4>
            <ul className="space-y-4 text-[14px] font-normal text-[#666666]">
              <li>
                <Link to="/" className="hover:text-black transition-colors">
                  Assess Now
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-black transition-colors"
                >
                  My Reports
                </Link>
              </li>
              <li>
                <Link
                  to="/feedback"
                  className="hover:text-black transition-colors border-black/30 pb-0.5"
                >
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex shrink-0 flex-col gap-6">
            <h4 className="text-[16px] font-semibold text-black">Resources</h4>
            <ul className="space-y-4 text-[14px] font-normal text-[#666666]">
              <li>
                <Link
                  to="/about"
                  className="hover:text-black transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/api-keys"
                  className="hover:text-black transition-colors"
                >
                  API Keys
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-black transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex shrink-0 flex-col gap-6">
            <h4 className="text-[16px] font-semibold text-black">Reach</h4>
            <ul className="space-y-4 text-[14px] font-normal text-[#666666]">
              <li className="flex items-center gap-1.5 group">
                <a
                  href="https://www.linkedin.com/company/my-ux-score/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors flex items-center gap-1"
                >
                  <ArrowUpRight
                    size={14}
                    className="text-[#666] group-hover:text-black"
                  />
                  LinkedIn
                </a>
              </li>
              <li className="flex items-center gap-1.5 group">
                <a
                  href="https://www.youtube.com/@MyUXScore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors flex items-center gap-1"
                >
                  <ArrowUpRight
                    size={14}
                    className="text-[#666] group-hover:text-black"
                  />
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="z-2 mt-auto flex w-full select-none items-end justify-center pointer-events-none opacity-[0.07]">
        <div className="flex items-baseline leading-[0.75] text-[15vw] lg:text-[21vw] whitespace-nowrap">
          <span className="font-light text-[#1A1A1A]">my</span>
          <span className="font-black">ux</span>
          <span className="font-light">score</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
