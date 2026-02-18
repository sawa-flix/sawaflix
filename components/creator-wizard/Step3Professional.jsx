import React from 'react';

const Step3Professional = ({ data, updateData }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        updateData({ [name]: value });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl lg:text-4xl font-black mb-2 tracking-tight">Tell us about yourself</h2>
                <p className="text-gray-500 font-medium">Help us understand your creative identity and passion</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">
                        Languages Used <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="languages"
                        value={data.languages || ''}
                        onChange={handleChange}
                        placeholder="languages"
                        className="w-full bg-[#0B0E14] border border-gray-800 rounded-2xl px-6 py-5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">
                        Experience Time <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="experienceTime"
                        value={data.experienceTime || ''}
                        onChange={handleChange}
                        placeholder="Your years of documenting"
                        className="w-full bg-[#0B0E14] border border-gray-800 rounded-2xl px-6 py-5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">
                        Bio <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="bio"
                        rows={6}
                        value={data.bio || ''}
                        onChange={handleChange}
                        placeholder="Explanation of your background and experiences"
                        className="w-full bg-[#0B0E14] border border-gray-800 rounded-2xl px-6 py-5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium resize-none"
                    />
                </div>
            </div>

            <div className="bg-red-900/10 border border-red-900/30 rounded-2xl p-6 flex gap-5 transition-all hover:bg-red-900/15">
                <div className="w-12 h-12 flex-shrink-0 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-1">Verified Creator Benefits</h4>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">Get verified badge, priority support, and enhanced discovery for your authentic content.</p>
                </div>
            </div>
        </div>
    );
};

export default Step3Professional;
