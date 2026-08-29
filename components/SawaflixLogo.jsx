import React from 'react';
import Image from 'next/image';

const SawaflixLogo = ({ className = "" }) => {
    return (
        <div className={`flex items-center group transition-all ${className}`}>
            <Image
                src="/logos_and_pwas/headerLogo..png"
                alt="SawaFlix Logo"
                width={980}
                height={228}
                className="w-auto h-8 sm:h-10 rounded-md object-contain object-left group-hover:scale-105 transition-transform duration-300"
                priority
            />
        </div>
    );
};

export default SawaflixLogo;
