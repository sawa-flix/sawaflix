import React from 'react';
import { motion } from 'framer-motion';

const Step5Summary = ({ formData, onSubmit }) => {
    const { category, identity, professional, portfolio, documents } = formData;

    const SummarySection = ({ title, children, icon }) => (
        <div className="bg-[#0B0E14] border border-gray-800 rounded-[2rem] p-8 mb-8 relative overflow-hidden group hover:border-red-900/30 transition-all">
            <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-6">
                <div className="w-12 h-12 bg-red-900/10 rounded-xl flex items-center justify-center text-red-600">
                    {icon}
                </div>
                <h3 className="text-2xl font-black tracking-tight">{title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {children}
            </div>
        </div>
    );

    const SummaryItem = ({ label, value }) => (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
            <p className="text-white font-bold text-lg">{value || 'Not provided'}</p>
        </div>
    );

    return (
        <div className="space-y-10">
            <div className="text-center mb-12">
                <h2 className="text-4xl lg:text-5xl font-black mb-3 tracking-tight">Review & <span className="text-red-600">Submit</span></h2>
                <p className="text-gray-500 font-medium">Please review all your details before final submission.</p>
            </div>

            <SummarySection
                title="Creator Profile"
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>}
            >
                <SummaryItem label="Selected Category" value={category} />
                <SummaryItem label="Legal Name" value={identity.legalName} />
                <SummaryItem label="Creator Name" value={identity.creatorName} />
                <SummaryItem label="Ethnic Group" value={identity.ethnicGroup} />
                <SummaryItem label="Contact Phone" value={identity.phone} />
                <SummaryItem label="Contact Email" value={identity.email} />
            </SummarySection>

            <SummarySection
                title="Professional standing"
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" /></svg>}
            >
                <SummaryItem label="Languages" value={professional.languages} />
                <SummaryItem label="Years of Experience" value={professional.experienceTime} />
                <div className="md:col-span-2">
                    <SummaryItem label="Professional Bio" value={professional.bio} />
                </div>
            </SummarySection>

            <SummarySection
                title="Portfolio & Documents"
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 5v16a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2zm16 16H5V5h14v16z" /></svg>}
            >
                <div className="md:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(portfolio.recordings || []).map((rec, i) => (
                            <div key={i} className="bg-[#151C25] p-5 rounded-2xl border border-gray-800 shadow-lg">
                                <p className="text-[10px] font-black text-red-600 mb-2 uppercase tracking-widest">Entry 0{i + 1}</p>
                                <p className="font-black text-white truncate mb-1">{rec.title || 'Untitled'}</p>
                                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{rec.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Identification</p>
                            <div className="flex items-center gap-4 bg-[#151C25] p-4 rounded-xl border border-gray-800">
                                <div className="bg-green-900/20 text-green-500 p-2 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-white font-bold truncate max-w-[200px]">{documents.id?.name || 'ID Document Attached'}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Endorsements</p>
                            <div className="flex items-center gap-4 bg-[#151C25] p-4 rounded-xl border border-gray-800">
                                <div className="bg-blue-900/20 text-blue-500 p-2 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <span className="text-white font-bold truncate max-w-[200px]">{documents.endorsements?.name || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </SummarySection>

            <div className="flex flex-col items-center pt-16 space-y-8">
                <label className="flex items-center gap-4 cursor-pointer group max-w-lg text-center">
                    <input type="checkbox" required className="w-6 h-6 bg-gray-900 border-gray-800 rounded checked:bg-red-600 transition-all cursor-pointer shadow-lg" />
                    <span className="text-gray-500 text-sm font-medium group-hover:text-gray-300 transition-colors">By submitting, I confirm that all provided information is accurate and I agree to SawaFlix Creator Terms of Service.</span>
                </label>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSubmit}
                    className="w-full max-w-md py-6 bg-red-600 hover:bg-red-700 text-white font-black text-2xl rounded-[2rem] shadow-2xl shadow-red-900/40 transition-all uppercase tracking-[0.2em]"
                >
                    Submit Application
                </motion.button>
            </div>
        </div>
    );
};

export default Step5Summary;
