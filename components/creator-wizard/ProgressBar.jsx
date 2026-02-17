import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ currentStep, steps = [] }) => {
    return (
        <div className="w-full max-w-2xl mx-auto mb-16 px-4">
            <div className="flex items-center justify-between relative">
                {/* Background Line */}
                <div className="absolute top-[1.25rem] left-0 w-full h-1 bg-gray-800 rounded-full z-0" />

                {/* Progress Line */}
                <motion.div
                    className="absolute top-[1.25rem] left-0 h-1 bg-red-600 rounded-full z-0 shadow-[0_0_10px_rgba(229,9,20,0.5)]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                />

                {steps.map((step) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <motion.div
                                initial={false}
                                animate={{
                                    backgroundColor: isActive || isCompleted ? '#E50914' : '#1E293B',
                                    scale: isActive ? 1.25 : 1,
                                    borderColor: isActive ? '#f87171' : isCompleted ? '#E50914' : '#334155'
                                }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black border-2 transition-all duration-300 shadow-xl shadow-black/20`}
                            >
                                {isCompleted ? (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="text-sm">{step.id}</span>
                                )}

                                {isActive && (
                                    <motion.div
                                        layoutId="active-glow"
                                        className="absolute inset-0 rounded-xl bg-red-600 blur-md opacity-30 z-[-1]"
                                    />
                                )}
                            </motion.div>
                            <span className={`absolute -bottom-9 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-red-500' : isCompleted ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                {step.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressBar;
