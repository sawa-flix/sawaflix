import React from 'react';
import Image from 'next/image';

const SawaflixLogo = ({ className = "" }) => {
    return (
        <div className={`flex items-center group transition-all ${className}`}>
            <Image
                src="/sawalogo.png"
                alt="SawaFlix Logo"
                width={400}
                height={120}
                className="w-auto h-8 sm:h-10 object-contain group-hover:scale-105 transition-transform duration-300"
                priority
            />
        </div>
    );
};

export default SawaflixLogo;
