import React from 'react';
import Image from 'next/image';

const SawaflixLogo = ({ className = "" }) => {
    return (
        <div className={`flex items-center group transition-all ${className}`}>
            {/* Dark Mode Logo (White typography) */}
            <Image
                src="/logos_and_pwas/headerLogo..png"
                alt="SawaFlix Logo"
                width={980}
                height={228}
                className="w-auto h-6 sm:h-7 md:h-7.5 rounded-md object-contain object-left group-hover:scale-105 transition-transform duration-300 block [[data-theme=light]_&]:hidden"
                priority
            />
            {/* Light Mode Logo (Dark typography from sawa.svg) */}
            <Image
                src="/logos_and_pwas/sawa.svg"
                alt="SawaFlix Logo"
                width={245}
                height={57}
                className="w-auto h-6 sm:h-7 md:h-7.5 rounded-md object-contain object-left group-hover:scale-105 transition-transform duration-300 hidden [[data-theme=light]_&]:block"
                priority
            />
        </div>
    );
};

export default SawaflixLogo;
