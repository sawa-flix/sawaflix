import React from 'react';
import { motion } from 'framer-motion';

const categories = [
    { id: 'music', label: 'Music', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg> },
    { id: 'film', label: 'Film', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 9H3V5h9v7z" /></svg> },
    { id: 'comedy', label: 'Comedy', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5-1.17 0-2.39.15-3.5.5V19c1.11-.35 2.33-.5 3.5-.5 1.95 0 4.05.4 5.5 1.5 1.45-1.1 3.55-1.5 5.5-1.5 1.17 0 2.39.15 3.5.5V5z" /></svg> },
    { id: 'storyteller', label: 'Traditional Storyteller', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z" /></svg> },
    { id: 'lifestyle', label: 'Food & Lifestyle', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5-1.17 0-2.39.15-3.5.5V19c1.11-.35 2.33-.5 3.5-.5 1.95 0 4.05.4 5.5 1.5 1.45-1.1 3.55-1.5 5.5-1.5 1.17 0 2.39.15 3.5.5V5z" /></svg> },
];

const Step1Category = ({ data, updateData }) => {
    const selectedCategory = data.category;

    const handleSelect = (id) => {
        updateData({ category: id });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold mb-2">Choose Your Category</h2>
                <p className="text-gray-400">Help us understand your creative identity and passion</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <label className="text-sm font-medium text-gray-400 ml-1">Creator Type *</label>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleSelect(cat.id)}
                        className={`flex items-center gap-4 px-6 py-5 rounded-2xl border transition-all duration-300 transform active:scale-[0.98] ${selectedCategory === cat.id
                                ? 'bg-red-900/20 border-red-600/50 shadow-lg shadow-red-900/10'
                                : 'bg-[#0B0E14] border-gray-800 hover:border-gray-700'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedCategory === cat.id ? 'bg-red-600 text-white' : 'bg-gray-900 text-red-500'
                            }`}>
                            {cat.icon}
                        </div>
                        <span className={`text-lg font-bold ${selectedCategory === cat.id ? 'text-white' : 'text-gray-400'}`}>
                            {cat.label}
                        </span>
                        {selectedCategory === cat.id && (
                            <div className="ml-auto w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-4 flex gap-4 mt-8">
                <div className="w-10 h-10 flex-shrink-0 bg-red-600 rounded-lg flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h4 className="font-bold">Verified Creator Benefits</h4>
                    <p className="text-sm text-gray-400">Get verified badge, priority support, and enhanced discovery for your authentic content.</p>
                </div>
            </div>
        </div>
    );
};

export default Step1Category;
