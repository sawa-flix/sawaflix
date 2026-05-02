import React from 'react';
import Image from 'next/image';

const SawaflixLogo = ({ className = "" }) => {
    return (
        <div className={`flex items-center group transition-all ${className}`}>
            <Image
                src="/sawalogo.png"
                alt="SawaFlix Logo"
                width={500}
                height={150}
                className="w-auto h-10 sm:h-[56px] object-contain object-left group-hover:scale-105 transition-transform duration-300"
                priority
            />
        </div>
    );
};

export default SawaflixLogo;
