import React from 'react';
import { motion } from 'framer-motion';

/**
 * STATIC SCROLL SECTIONS — Pixel-Perfect Stacked Layout
 *
 * 5 sections stacked vertically. No scroll animation yet.
 * Each section gets pixel-perfect layout first, then animation is added later.
 */

const AboutScrollAnimation: React.FC = () => {
    return (
        <div id="about-scroll-narrative" className="w-full">

            {/* ======================================================
                SECTION 1: Subjectivity — Clean text, NO dashed line
            ====================================================== */}
            <section className="relative w-full h-[30vh] bg-[#FFFEF9] flex flex-col items-center justify-end text-center px-6">
                <h2 className="text-[1.8rem] md:text-[2.5rem] font-bold text-[#1A1A1A] leading-snug mb-3">
                    Since the beginning of time,
                </h2>
                <p className="text-[1rem] md:text-[1.2rem] text-[#555555] max-w-[520px] leading-relaxed">
                    Good User Experience has been subjective...
                </p>
            </section>

            {/* ======================================================
                SECTION 2: The Questions Scene
                
                CURVE: True S-shape in 1440×900 viewBox.
                  - Starts BELOW the viewport at center ~(540, 980)
                  - Moves UP and hooks slightly LEFT ~(300, 440) at mid-height
                  - Sweeps back RIGHT and UP to ~(1120, 0) top-right corner
                
                CHARACTERS:
                  - Woman: far-left, partially off-screen, vertically centered ~44%
                  - Man thinking: top-right (right: 6%, top: 8%), label above him
                  - Man with papers: bottom (left: 28%, bottom: 8%), label to his left
                
                CENTER TEXT: "Will it work for your users or not?" — slightly left of center
            ====================================================== */}
            <section className="relative w-full min-h-screen bg-[#FFFEF9] overflow-hidden">

                {/* S-CURVE DASHED PATH — centered absolutely in section */}


                {/* CHARACTER 1: Woman — far left, vertically centered. Scale and slide up */}
                <motion.div
                    className="absolute"
                    style={{ left: '4%', top: '20%', transform: 'translateY(-50%)' }}
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <img
                        src="/About Page/s2-women.svg"
                        alt="Tired woman character"
                        style={{ width: '12.41644rem', height: '12.41644rem' }}
                        className="object-contain"
                    />
                </motion.div>

                {/* CHARACTER 2: Man thinking — top right, label above. Scale and slide up */}
                <motion.div
                    className="absolute flex items-center gap-8"
                    style={{ right: '5%', top: '0%' }}
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <p
                        className="text-[0.88rem] md:text-[1.5rem] font-semibold text-[#1A1A1A] mb-2"
                    >
                        Is the design good or bad?
                    </p>
                    <img
                        src="/About Page/s2-right-thinking-mein.svg"
                        alt="Man thinking character"
                        style={{ width: '12.41644rem', height: '12.41644rem' }}
                        className="object-contain"
                    />
                </motion.div>

                {/* CENTER TEXT: Main bold question — scale up and slide up */}
                <motion.div
                    className="absolute text-center"
                    style={{ left: '19%', top: '30%', transform: 'translate(-46%, -50%)' }}
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h3 className="text-[2rem] md:text-[2.3rem] font-bold text-[#1A1A1A] max-w-[49.31rem] leading-tight">
                        Will it work for your users or not?
                    </h3>
                </motion.div>

                {/* CHARACTER 3: Man with papers — bottom center-right. Scale and slight slide */}
                <motion.div
                    className="absolute"
                    style={{ left: '32%', bottom: '12%' }}
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="flex flex-row items-center gap-4">
                        <p
                            className="text-[0.88rem] md:text-[1.5rem] font-semibold text-[#1A1A1A] whitespace-nowrap"
                        >
                            Will it hit success metrics?
                        </p>
                        <img
                            src="/About Page/s2-reading-men-center.svg"
                            alt="Man reading papers character"
                            style={{ width: '12.41644rem', height: '12.41644rem' }}
                            className="object-contain"
                        />
                    </div>
                </motion.div>
            </section>

            {/* ======================================================
                SECTION 3: Metrics Falling
                Items stagger diagonally: Guessing (top-left), Falling (center), Dropping (bottom-right).
            ====================================================== */}
            <section className="relative w-full min-h-screen bg-[#FFFEF9]">

                {/* S-CURVE continuation — design SVG (same curve, y-shifted to continue from Section 2) */}
                <div className="absolute -top-64 inset-0 flex items-center justify-center pointer-events-none">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 789 584"
                        fill="none"
                        className="w-[70%] max-w-[680px] "
                        style={{ overflow: 'visible' }}
                    >
                        <path
                            d="M373.906 -868.228C465.158 -841.765 633.974 -757.083 579.223 -630.061C510.784 -471.282 -222.71 -447.122 67.4713 -91.2398C119.252 -27.7355 805.612 382.624 789.048 583.234"
                            stroke="#1A1A1A"
                            strokeWidth="2"
                            strokeDasharray="16 16"
                        />
                    </svg>
                </div>

                {/* Item 1: Teams guessing — top left */}
                <motion.div
                    className="absolute flex flex-col items-center gap-3"
                    style={{ left: '17%', top: '5%' }}
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <p className="text-[0.95rem] md:text-[1.5rem] font-semibold text-[#2A2A2A]">Teams keep guessing,</p>
                    <div className="w-24 h-24 md:w-[5rem] md:h-[5rem]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" className="w-full h-full">
                            <path d="M21.668 71.6673V58.2315C18.5013 55.3426 16.043 52.0318 14.293 48.299C12.543 44.5657 11.668 40.6806 11.668 36.644C11.668 28.7801 14.4227 22.0959 19.9321 16.5915C25.441 11.0865 32.1307 8.33398 40.0013 8.33398C46.4757 8.33398 52.2652 10.269 57.3696 14.139C62.4746 18.0084 65.7899 23.0287 67.3155 29.1998L71.3338 45.1115C71.5466 45.9337 71.3966 46.6762 70.8838 47.339C70.371 48.0023 69.6766 48.334 68.8005 48.334H61.668V59.7865C61.668 61.2093 61.1546 62.434 60.128 63.4607C59.1013 64.4873 57.8766 65.0007 56.4538 65.0007H48.3346V71.6673H44.1463V60.8123H56.4538C56.7532 60.8123 56.9991 60.7162 57.1913 60.524C57.3835 60.3318 57.4796 60.0859 57.4796 59.7865V44.1457H66.728L63.2788 30.204C61.9782 24.9618 59.1513 20.7043 54.798 17.4315C50.4452 14.1587 45.513 12.5223 40.0013 12.5223C33.3063 12.5223 27.6082 14.8482 22.9071 19.4998C18.2066 24.1515 15.8563 29.8207 15.8563 36.5073C15.8563 39.9701 16.5635 43.2512 17.978 46.3507C19.3924 49.4507 21.3902 52.2012 23.9713 54.6023L25.8563 56.3723V71.6673H21.668ZM39.6796 53.0132C40.5107 53.0132 41.1996 52.737 41.7463 52.1848C42.2924 51.632 42.5655 50.947 42.5655 50.1298C42.5655 49.3132 42.2891 48.6282 41.7363 48.0748C41.1835 47.5209 40.4988 47.244 39.6821 47.244C38.8649 47.244 38.1796 47.5204 37.6263 48.0732C37.073 48.6259 36.7963 49.3109 36.7963 50.1282C36.7963 50.9448 37.0691 51.6298 37.6146 52.1832C38.1602 52.7365 38.8485 53.0132 39.6796 53.0132ZM37.7255 43.1165H41.7513C41.7513 41.9198 41.948 40.8801 42.3413 39.9973C42.7341 39.1151 43.486 38.0734 44.5971 36.8723C45.576 35.7829 46.5163 34.6793 47.418 33.5615C48.3196 32.4443 48.7705 31.0437 48.7705 29.3598C48.7705 27.152 47.9319 25.2859 46.2546 23.7615C44.5774 22.237 42.4694 21.4748 39.9305 21.4748C37.901 21.4748 36.053 22.039 34.3863 23.1673C32.7196 24.2957 31.5144 25.7807 30.7705 27.6223L34.3921 29.1865C34.8666 28.007 35.6113 27.0584 36.6263 26.3407C37.6413 25.6223 38.7427 25.2632 39.9305 25.2632C41.281 25.2632 42.4124 25.6443 43.3246 26.4065C44.2374 27.1687 44.6938 28.1532 44.6938 29.3598C44.6938 30.5693 44.3305 31.627 43.6038 32.5332C42.8771 33.4387 42.0524 34.3637 41.1296 35.3082C40.0185 36.4537 39.1735 37.6098 38.5946 38.7765C38.0152 39.9432 37.7255 41.3898 37.7255 43.1165Z" fill="#666666" />
                        </svg>
                    </div>
                </motion.div>

                {/* Item 2: metrics falling — center */}
                <motion.div
                    className="absolute flex flex-col items-center gap-3"
                    style={{ left: '37%', top: '30%', transform: 'translateX(-50%)' }}
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                >
                    <p className="text-[0.95rem] md:text-[1.5rem] font-semibold text-[#2A2A2A]">metrics keep falling,</p>
                    <div className="w-24 h-24 md:w-[5rem] md:h-[5rem]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" className="w-full h-full">
                            <path d="M40.0011 71.6658L17.7578 49.4224L20.6745 46.4566L37.907 63.7108V39.1124H42.0953V63.7424L59.3278 46.5058L62.2445 49.4224L40.0011 71.6658ZM37.907 33.2574V22.4458H42.0953V33.2574H37.907ZM37.907 16.5908V8.30078H42.0953V16.5908H37.907Z" fill="#666666" />
                        </svg>
                    </div>
                </motion.div>

                {/* Item 3: users dropping — bottom right */}
                <motion.div
                    className="absolute flex flex-col items-center gap-3"
                    style={{ right: '31%', bottom: '21%' }}
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.0 }}
                >
                    <p className="text-[0.95rem] md:text-[1.5rem] font-semibold text-[#2A2A2A]">users keep dropping...</p>
                    <div className="w-24 h-24 md:w-[5rem] md:h-[5rem]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" className="w-full h-full">
                            <path d="M51.6004 35.4965C52.7531 35.4965 53.7254 35.0982 54.517 34.3015C55.3081 33.5054 55.7037 32.5307 55.7037 31.3773C55.7037 30.2245 55.3056 29.2526 54.5095 28.4615C53.7129 27.6698 52.7381 27.274 51.5854 27.274C50.432 27.274 49.4598 27.6723 48.6687 28.469C47.8776 29.2651 47.482 30.2398 47.482 31.3932C47.482 32.5459 47.8801 33.5179 48.6762 34.309C49.4723 35.1007 50.447 35.4965 51.6004 35.4965ZM28.412 35.4965C29.5654 35.4965 30.5376 35.0982 31.3287 34.3015C32.1198 33.5054 32.5154 32.5307 32.5154 31.3773C32.5154 30.2245 32.1173 29.2526 31.3212 28.4615C30.5251 27.6698 29.5504 27.274 28.397 27.274C27.2443 27.274 26.272 27.6723 25.4804 28.469C24.6893 29.2651 24.2937 30.2398 24.2937 31.3932C24.2937 32.5459 24.6918 33.5179 25.4879 34.309C26.2845 35.1007 27.2593 35.4965 28.412 35.4965ZM30.5395 47.9998C27.689 49.9165 25.5684 52.4637 24.1779 55.6415H28.0587C29.2809 53.4576 30.9529 51.7479 33.0745 50.5123C35.1962 49.2768 37.5156 48.659 40.0329 48.659C42.5273 48.659 44.8295 49.2826 46.9395 50.5298C49.0501 51.7765 50.7351 53.4804 51.9945 55.6415H55.8195C54.4518 52.4409 52.337 49.8879 49.4754 47.9823C46.6131 46.0773 43.4543 45.1248 39.9987 45.1248C36.5431 45.1248 33.3901 46.0832 30.5395 47.9998ZM27.6537 69.174C23.7998 67.5118 20.4476 65.2559 17.597 62.4065C14.7465 59.557 12.4895 56.2062 10.8262 52.354C9.16342 48.5018 8.33203 44.3859 8.33203 40.0065C8.33203 35.6265 9.16314 31.5095 10.8254 27.6557C12.4876 23.8018 14.7434 20.4495 17.5929 17.599C20.4423 14.7484 23.7931 12.4915 27.6454 10.8282C31.4976 9.16537 35.6134 8.33398 39.9929 8.33398C44.3729 8.33398 48.4898 9.16509 52.3437 10.8273C56.1976 12.4895 59.5498 14.7454 62.4004 17.5948C65.2509 20.4443 67.5079 23.7951 69.1712 27.6473C70.834 31.4995 71.6654 35.6154 71.6654 39.9948C71.6654 44.3748 70.8343 48.4918 69.172 52.3457C67.5098 56.1995 65.254 59.5518 62.4045 62.4023C59.5551 65.2529 56.2043 67.5098 52.352 69.1732C48.4998 70.8359 44.384 71.6673 40.0045 71.6673C35.6245 71.6673 31.5076 70.8362 27.6537 69.174ZM59.4795 59.4815C64.8112 54.1493 67.477 47.6557 67.477 40.0007C67.477 32.3457 64.8112 25.852 59.4795 20.5198C54.1473 15.1881 47.6537 12.5223 39.9987 12.5223C32.3437 12.5223 25.8501 15.1881 20.5179 20.5198C15.1862 25.852 12.5204 32.3457 12.5204 40.0007C12.5204 47.6557 15.1862 54.1493 20.5179 59.4815C25.8501 64.8132 32.3437 67.479 39.9987 67.479C47.6537 67.479 54.1473 64.8132 59.4795 59.4815Z" fill="#666666" />
                        </svg>
                    </div>
                </motion.div>
            </section>

            {/* ======================================================
                SECTION 4: Uncertainty — thought bubbles + yellow question marks
            ====================================================== */}
            <section className="relative w-full min-h-screen bg-[#FFFEF9] overflow-hidden">

                {/* Top area: 3 text labels + center character */}
                <div className="relative w-full" style={{ height: '45vh' }}>

                    {/* Bubbles Wrapper (All animate together) */}
                    <motion.div
                        className="absolute inset-0 w-full h-full"
                        initial={{ opacity: 0, scale: 0.8, y: 30 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Bubble 1: left — sharp border, no radius */}
                        <div className="absolute" style={{ left: '15%', top: '20%' }}>
                            <div className="bg-white border-2 border-[#1A1A1A] px-4 py-2.5 text-[1.5rem] font-semibold text-[#1A1A1A] whitespace-nowrap shadow-[3px_3px_0px_#1A1A1A]">
                                Info grouping's not clear?
                            </div>
                        </div>

                        {/* Bubble 2: top center — sharp border, no radius */}
                        <div className="absolute" style={{ left: '50%', top: '0%', transform: 'translateX(-50%)' }}>
                            <div className="bg-white border-2 border-[#1A1A1A] px-4 py-2.5 text-[1.5rem] font-semibold text-[#1A1A1A] whitespace-nowrap shadow-[3px_3px_0px_#1A1A1A]">
                                Is it the copy?
                            </div>
                        </div>

                        {/* Bubble 3: right — sharp border, no radius */}
                        <div className="absolute" style={{ right: '15%', top: '32%' }}>
                            <div className="bg-white border-2 border-[#1A1A1A] px-4 py-2.5 text-[1.5rem] font-semibold text-[#1A1A1A] whitespace-nowrap shadow-[3px_3px_0px_#1A1A1A]">
                                Does the visual "feel off"?
                            </div>
                        </div>
                    </motion.div>

                    {/* CENTER: Actual design character SVG (No animation requested) */}
                    <div className="absolute" style={{ left: '50%', top: '30%', transform: 'translateX(-50%)' }}>
                        <img
                            src="/About Page/s4-women-center.svg"
                            alt="Confused woman character"
                            style={{ width: '14rem', height: 'auto' }}
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Bottom: large scattered yellow ? marks across full width */}
                <div className="relative w-full" style={{ height: '45vh' }}>
                    {[
                        // Design-matched: 11 ? marks, left to right
                        { left: '1%', top: '40%', size: '3.2rem', rotate: -15 }, // far left, small, mid
                        { left: '6%', top: '62%', size: '3.8rem', rotate: 8 }, // left, small, low
                        { left: '13%', top: '18%', size: '7.5rem', rotate: -10 }, // left-center, large, high
                        { left: '20%', top: '55%', size: '4rem', rotate: 12 }, // left-center, small, low
                        { left: '32%', top: '22%', size: '11rem', rotate: -4 }, // center-left, BIGGEST
                        { left: '44%', top: '52%', size: '5.5rem', rotate: 6 }, // center, medium, low
                        { left: '52%', top: '12%', size: '4rem', rotate: -12 }, // center-right, small, high
                        { left: '60%', top: '35%', size: '9rem', rotate: 5 }, // center-right, large
                        { left: '70%', top: '58%', size: '3.5rem', rotate: -8 }, // right, small, low
                        { left: '77%', top: '15%', size: '3.8rem', rotate: 10 }, // right, small, high
                        { left: '88%', top: '28%', size: '7rem', rotate: -6 }, // far right, large
                    ].map((q, i) => (
                        <motion.span
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            key={i}
                            className="absolute text-[#FBD24E] font-extrabold leading-none select-none"
                            style={{
                                left: q.left,
                                top: q.top,
                                fontSize: q.size,
                                transform: `rotate(${q.rotate}deg)`,
                                lineHeight: 1,
                            }}
                        >
                            ?
                        </motion.span>
                    ))}
                </div>
            </section>

            {/* ======================================================
                SECTION 5: Yellow Reveal — Solution
            ====================================================== */}
            <motion.section
                className="relative w-full min-h-screen bg-[#FBD24E] flex flex-col items-center justify-center text-center px-8 overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                <h2 className="text-[2.8rem] md:text-[3rem] font-extrabold text-[#1A1A1A] leading-tight max-w-[700px] z-10">
                    MyUXScore bypasses<br />the guesswork.
                </h2>

                {/* ===== SPEEDOMETER: circle + needle as separate siblings ===== */}

                {/* Circle — at section bottom-center, 370×160px */}
                <div
                    className="absolute"
                    style={{ bottom: '-30px', left: '50%', transform: 'translateX(-50%)', width: '370px', height: '160px' }}
                >
                    <img
                        src="/About Page/s5-meter-center.svg"
                        alt="Meter Base"
                        style={{ width: '350px', height: '150px', display: 'block', objectFit: 'fill' }}
                    />
                </div>

                {/*
                    Needle — independent of circle, positioned in SECTION coordinates.
                    Fat base center in SVG viewBox: x=52–122 → midpoint=87 → at 450px wide: 87/567*450=69px
                    Fat base y-center: ≈95px at 169px height
                    Pivot: originX=69px, originY=95px
                    left: calc(50% - 69px) → pivot at section horizontal center (= circle arc center)
                    bottom: -74px → (169-95)=74px below section bottom, pivot at section bottom = arc center
                */}
                <motion.img
                    src="/About Page/s5-meter-line.svg"
                    alt="Meter Needle"
                    style={{
                        position: 'absolute',
                        width: '560px',
                        height: '158px',
                        left: 'calc(50% - 95px)',
                        bottom: '-74px',
                        originX: '70px',
                        originY: '95px',
                    }}
                    variants={{
                        hidden: { rotate: -151 },
                        visible: {
                            rotate: -30,
                            transition: { duration: 2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.4 }
                        }
                    }}
                />
            </motion.section>

            {/* ======================================================
                SECTIONS 6 + 7 — Shared wrapper for the yellow SVG line
                The SVG spans both sections and ends at the Recommendation card.
            ====================================================== */}
            <div className="relative w-full">

                {/* Yellow dashed SVG — original path, overflow:visible flows into Section 7 */}
                <div
                    className="absolute -top-14 right-14 pointer-events-none z-10"
                    style={{ width: '36%', maxWidth: '480px' }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 399 650"
                        fill="none"
                        overflow="visible"
                        style={{ width: '100%', overflow: 'visible', display: 'block', rotate: '10deg' }}
                    >
                        <path
                            d="M399.188 -131.497C215.052 -46.5551 -114.569 167.453 40.0371 343.951C233.294 564.573 471.019 530.368 260.658 930.566"
                            stroke="#F8D448"
                            strokeWidth="6"
                            strokeDasharray="16 16"
                        />
                    </svg>
                </div>

                {/* ===== SECTION 6 ===== */}
                <section className="relative w-full min-h-screen bg-[#FFFEF9]">

                    {/* 
                        Observation Cards matched to Figma properties 
                        Relative to the text "We analyze the interface..." which should be placed centrally.
                    */}

                    {/* heading text — slides in from LEFT */}
                    <motion.div
                        className="absolute top-[28%] left-[40%] -translate-x-1/2 text-center w-full z-10"
                        initial={{ opacity: 0, x: -80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <p className="text-[1.35rem] md:text-[1.6rem] font-bold text-[#1A1A1A] leading-snug">
                            We analyze the interface against<br />
                            110+ proven interaction standards.
                        </p>
                    </motion.div>

                    {/* Card 1: Score 40 — scale in */}
                    <motion.div
                        className="absolute z-20" style={{ left: '15%', top: '44%', width: '18.69144rem' }}
                        initial={{ opacity: 0, scale: 0.7 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
                    >
                        <div className="relative border border-[#A6A6A6] bg-white p-[0.70313rem] flex flex-col items-start gap-[0.35156rem] shadow-[2px_2px_0px_rgba(26,26,26,0.15)]">
                            <div className="absolute -top-[13px] right-[-8px] border border-[#A6A6A6] bg-[#FCF8F8] px-2 py-0.5 whitespace-nowrap z-30">
                                <span className="font-bold text-[0.85rem] text-[#D86E6E]">40<span className="font-normal text-[0.6rem] text-[#A6A6A6]"> /100</span></span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[0.65rem] font-bold text-[#7B7B7B] tracking-wide uppercase flex items-center gap-1.5 opacity-80">
                                    <div className="w-[8px] h-[8px] rounded-full bg-[#7B7B7B]" />
                                    Observation
                                </span>
                            </div>
                            <div className="w-full h-[3px] bg-[#E3E3E3]" />
                            <div className="w-full flex gap-1">
                                <div className="h-[3px] bg-[#E3E3E3] w-[40%]" />
                                <div className="h-[3px] bg-[#E3E3E3] w-[60%]" />
                            </div>
                            <div className="w-[85%] h-[3px] bg-[#E3E3E3]" />
                            <div className="w-full flex gap-1 mt-0.5">
                                <div className="h-[3px] bg-[#E3E3E3] w-[30%]" />
                                <div className="h-[3px] bg-[#d4c7c7] w-[70%]" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Score 70 — slides in from RIGHT */}
                    <motion.div
                        className="absolute z-30" style={{ left: '35%', top: '50%', width: '29.90625rem' }}
                        initial={{ opacity: 0, x: 120 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
                    >
                        <div className="relative border-[1.5px] border-[#444] bg-white p-[1.125rem] flex flex-col items-start gap-[0.5625rem] shadow-[2px_2px_0px_rgba(26,26,26,0.15)]">
                            <div className="absolute -top-[16px] right-[-10px] border-[1.5px] border-[#444] bg-[#FEFBF2] px-3 py-0.5 whitespace-nowrap z-30 shadow-sm">
                                <span className="font-bold text-[1.1rem] text-[#CAB34B]">70<span className="font-normal text-[0.7rem] text-[#888]"> /100</span></span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[0.75rem] font-bold text-[#444] tracking-wide uppercase flex items-center gap-2">
                                    <div className="w-[10px] h-[10px] border-2 border-[#444] rounded-full flex items-center justify-center">
                                        <div className="w-[4px] h-[4px] bg-[#444] rounded-full" />
                                    </div>
                                    Observation
                                </span>
                            </div>
                            <div className="w-full flex gap-1.5 mt-1">
                                <div className="h-[4px] bg-[#A6A6A6] w-[30%]" />
                                <div className="h-[4px] bg-[#A6A6A6] w-[40%]" />
                                <div className="h-[4px] bg-[#A6A6A6] w-[30%]" />
                            </div>
                            <div className="w-full flex gap-1.5 mt-1">
                                <div className="h-[4px] bg-[#A6A6A6] w-[25%]" />
                                <div className="h-[4px] bg-[#A6A6A6] w-[35%]" />
                                <div className="h-[4px] bg-[#A6A6A6] w-[20%]" />
                                <div className="h-[4px] bg-[#A6A6A6] w-[20%]" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Score 90 — scale in */}
                    <motion.div
                        className="absolute z-10" style={{ left: '30%', top: '72%', width: '14.95313rem' }}
                        initial={{ opacity: 0, scale: 0.6 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                    >
                        <div className="relative border border-[#D5D5D5] bg-white p-[0.5625rem] flex flex-col items-start gap-[0.28125rem] opacity-70 scale-95 origin-top-left shadow-[2px_2px_0px_rgba(26,26,26,0.15)]">
                            <div className="absolute -top-[11px] right-[-6px] border border-[#D5D5D5] bg-[#F5FCF5] px-1.5 py-0 whitespace-nowrap z-30">
                                <span className="font-bold text-[0.75rem] text-[#7EC27E]">90<span className="font-normal text-[0.55rem] text-[#A6A6A6]"> /100</span></span>
                            </div>
                            <div className="flex items-center gap-1 mb-0.5">
                                <span className="text-[0.55rem] font-bold text-[#A6A6A6] tracking-wide uppercase flex items-center gap-1">
                                    <div className="w-[6px] h-[6px] rounded-full bg-[#A6A6A6]" />
                                    Observation
                                </span>
                            </div>
                            <div className="w-[90%] h-[2px] bg-[#E3E3E3]" />
                            <div className="w-full h-[2px] bg-[#E3E3E3]" />
                            <div className="w-[75%] h-[2px] bg-[#E3E3E3]" />
                        </div>
                    </motion.div>

                    {/* Card 4: Score 50 — scale in */}
                    <motion.div
                        className="absolute z-10" style={{ right: '10%', top: '56%', width: '14.95313rem' }}
                        initial={{ opacity: 0, scale: 0.6 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.25 }}
                    >
                        <div className="relative border border-[#D5D5D5] bg-white p-[0.5625rem] flex flex-col items-start gap-[0.28125rem] opacity-60 shadow-[2px_2px_0px_rgba(26,26,26,0.15)]">
                            <div className="absolute -top-[11px] right-[-6px] border border-[#D5D5D5] bg-[#FCF5F5] px-1.5 py-0 whitespace-nowrap z-30">
                                <span className="font-bold text-[0.75rem] text-[#D88A8A]">50<span className="font-normal text-[0.55rem] text-[#A6A6A6]"> /100</span></span>
                            </div>
                            <div className="flex items-center gap-1 mb-0.5">
                                <span className="text-[0.55rem] font-bold text-[#A6A6A6] tracking-wide uppercase flex items-center gap-1">
                                    <div className="w-[6px] h-[6px] rounded-full bg-[#A6A6A6]" />
                                    Observation
                                </span>
                            </div>
                            <div className="w-full flex gap-1">
                                <div className="h-[2px] bg-[#E3E3E3] w-[45%]" />
                                <div className="h-[2px] bg-[#E3E3E3] w-[55%]" />
                            </div>
                            <div className="w-[85%] h-[2px] bg-[#E3E3E3]" />
                        </div>
                    </motion.div>

                    {/* Card 5: Score 60 — scale in, faint */}
                    <motion.div
                        className="absolute z-0" style={{ left: '55%', top: '75%', width: '12rem' }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.4 }}
                    >
                        <div className="relative border border-[#E5E5E5] bg-white/50 p-[0.5rem] flex flex-col items-start gap-[0.25rem] opacity-40 shadow-[1px_1px_0px_rgba(26,26,26,0.15)]">
                            <div className="absolute -top-[10px] right-[-6px] border border-[#E5E5E5] bg-[#FCFAF5] px-1.5 py-0 whitespace-nowrap z-30">
                                <span className="font-bold text-[0.65rem] text-[#D8C78A]">60<span className="font-normal text-[0.5rem] text-[#A6A6A6]"> /100</span></span>
                            </div>
                            <div className="w-full h-[2px] bg-[#E5E5E5] mt-3" />
                            <div className="w-[80%] h-[2px] bg-[#E5E5E5]" />
                        </div>
                    </motion.div>
                </section>

                {/* ======================================================
                SECTION 7: Recommendations card + Back to top
            ====================================================== */}
                <section className="relative w-full pb-20 bg-[#FFFEF9] flex flex-col gap-[3rem] items-center">


                    {/* Headline — slides up from y */}
                    <motion.div
                        className="pt-20 px-3 text-center max-w-[630px]"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <p className="text-[1.35rem] md:text-[1.65rem] font-bold text-[#1A1A1A] leading-snug">
                            Get Recommendations that are relevant to your
                            organisation, your context, no generic bs!
                        </p>
                    </motion.div>

                    {/* Recommendation card — scale + y animation */}
                    <motion.div
                        className="mt-12 w-full flex justify-center px-4 relative z-10"
                        initial={{ opacity: 0, scale: 0.85, y: 60 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
                    >
                        <div
                            className="relative bg-white border-2 border-[#1A1A1A] flex flex-col items-start"
                            style={{
                                width: '46.7285rem',
                                maxWidth: '100%',
                                padding: '1.75781rem',
                                gap: '0.87894rem',
                                boxShadow: '8px 8px 0px #F8D448',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 bg-[#F8D448] flex items-center justify-center text-[1.1rem] rounded-sm">
                                    💡
                                </div>
                                <span className="text-[#1A1A1A]" style={{ fontSize: '1.17188rem', fontWeight: 700 }}>
                                    Recommendation
                                </span>
                            </div>
                            <p className="text-[#3D3D3D] leading-relaxed m-0" style={{ fontSize: '1.17188rem', fontWeight: 400 }}>
                                Receive targeted, actionable UX strategies tailored specifically to your unique
                                product and audience.
                            </p>
                        </div>
                    </motion.div>

                    {/* Back to top */}
                    <div className="mt-14 py-3  text-center">
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="text-[0.9rem] font-semibold text-[#1A1A1A] underline underline-offset-4 hover:opacity-60 transition-opacity"
                        >
                            Back to top
                        </button>
                    </div>
                </section>

            </div>{/* end shared wrapper Sections 6+7 */}

        </div >
    );
};

export default AboutScrollAnimation;
