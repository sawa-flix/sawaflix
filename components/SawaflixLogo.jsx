import React from 'react';
import Image from 'next/image';

const SawaflixLogo = ({ className = "" }) => {
    return (
        <div className={`flex items-center group transition-all ${className}`}>
            <Image
                src="/sawalogo.png"
                alt="SawaFlix Logo"
                width={980}
                height={227}
                className="w-auto h-6 sm:h-7 object-contain object-left group-hover:scale-105 transition-transform duration-300"
                priority
            />
        </div>
    );
};

export default SawaflixLogo;
