import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ currentStep, steps = [] }) => {
    return (
        <div className="w-full max-w-lg mx-auto mb-10 px-4">
            <div className="flex items-center justify-between relative">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-800 -translate-y-1/2 z-0" />

                {/* Progress Line */}
                <motion.div
                    className="absolute top-1/2 left-0 h-[2px] bg-red-600 -translate-y-1/2 z-0"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                />

                {steps.map((step) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;

                    return (
                        <div key={step.id} className="relative z-10">
                            <motion.div
                                initial={false}
                                animate={{
                                    backgroundColor: isActive ? '#DC2626' : '#334155',
                                    color: isActive ? '#FFFFFF' : '#94A3B8'
                                }}
                                className={`w-14 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-lg`}
                            >
                                {step.id}
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressBar;
