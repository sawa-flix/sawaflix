"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
            {/* Background with Overlay */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop')",
                    }}
                ></div>
                {/* Gradient Overlay for Fade Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E14]/80 via-[#0B0E14]/50 to-[#0B0E14]"></div>
                <div className="absolute inset-0 bg-[#0B0E14]/40"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-lg">
                        Preserving Culture <br />
                        <span className="text-red-500">Sharing Stories.</span> <br />
                        Connecting Generations
                    </h1>

                    <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-3xl mx-auto drop-shadow-md">
                        Discover the rich heritage of Africa through music, movies, and traditions.
                        A platform dedicated to keeping our stories alive.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/dashboard"
                            className="px-8 py-3.5 bg-red-600 text-white rounded-full font-semibold text-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
                        >
                            Get Started
                        </Link>

                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3.5 border-2 border-white/30 text-white rounded-full font-semibold text-lg backdrop-blur-sm flex items-center gap-2 hover:border-white transition-all"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Watch Demo
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Decorative Circles/Glows */}
            <div className="absolute top-1/4 left-10 w-64 h-64 bg-red-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        </section>
    );
}
