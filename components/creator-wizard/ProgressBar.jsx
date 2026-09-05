import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ currentStep, steps = [] }) => {
    return (
        <div className="w-full relative py-4">
            <div className="flex items-center justify-between gap-2">
                {steps.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    const isPending = step.id > currentStep;

                    return (
                        <div key={step.id} className="flex-1 flex flex-col gap-2">
                            <div className="h-1.5 w-full rounded-full overflow-hidden bg-white/5 relative">
                                <motion.div
                                    className={`absolute top-0 left-0 h-full rounded-full ${isCompleted ? 'bg-zinc-300' : 'bg-red-600'}`}
                                    initial={{ width: isCompleted ? '100%' : '0%' }}
                                    animate={{ width: isActive ? '100%' : (isCompleted ? '100%' : '0%') }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white' : (isCompleted ? 'text-zinc-400' : 'text-zinc-600')}`}>
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
