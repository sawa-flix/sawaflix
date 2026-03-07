import React from 'react';
import { motion } from 'framer-motion';

const Step5Summary = ({ formData, onSubmit }) => {
    const { category, identity, professional, portfolio, documents } = formData;

    const SummarySection = ({ title, children, icon }) => (
        <div className="bg-[#1A1F2B] border border-white/5 rounded-xl p-4 mb-4 relative overflow-hidden group hover:border-red-600/30 transition-all shadow-xl shadow-black/20">
            <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                <div className="w-8 h-8 bg-red-600/10 rounded-lg flex items-center justify-center text-red-600">
                    {React.cloneElement(icon, { className: "w-4 h-4" })}
                </div>
                <h3 className="text-sm font-black tracking-tight text-white">{title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                {children}
            </div>
        </div>
    );

    const SummaryItem = ({ label, value }) => (
        <div className="space-y-0.5">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
            <p className="text-gray-300 font-bold text-xs truncate">{value || 'Not provided'}</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Review & <span className="text-red-600">Submit</span></h2>
                <p className="text-gray-500 text-[10px] font-medium">Please review all your details before final submission.</p>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 hide-scrollbar">
                <SummarySection
                    title="Creator Profile"
                    icon={<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>}
                >
                    <SummaryItem label="Category" value={category} />
                    <SummaryItem label="Legal Name" value={identity.legalName} />
                    <SummaryItem label="Creator Name" value={identity.creatorName} />
                    <SummaryItem label="Ethnic Group" value={identity.ethnicGroup} />
                    <SummaryItem label="Phone" value={identity.phone} />
                    <SummaryItem label="Email" value={identity.email} />
                </SummarySection>

                <SummarySection
                    title="Expertise"
                    icon={<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" /></svg>}
                >
                    <SummaryItem label="Languages" value={professional.languages} />
                    <SummaryItem label="Experience" value={professional.experienceTime} />
                    <div className="col-span-2">
                        <SummaryItem label="Professional Bio" value={professional.bio} />
                    </div>
                </SummarySection>

                <div className="bg-[#1A1F2B] border border-white/5 rounded-xl p-4 shadow-xl shadow-black/20">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Portfolio & Documents</p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {(portfolio.recordings || []).map((rec, i) => (
                            <div key={i} className="bg-black/20 p-2 rounded-lg border border-white/5">
                                <p className="text-[8px] font-black text-red-600 mb-0.5 uppercase">Entry {i + 1}</p>
                                <p className="font-bold text-gray-300 text-[9px] truncate">{rec.title || 'Untitled'}</p>
                                {rec.file_name && <p className="text-gray-500 text-[8px] truncate">{rec.file_name}</p>}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                            <div className="w-5 h-5 bg-green-900/20 text-green-500 rounded flex items-center justify-center border border-green-800/20">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="text-gray-300 font-bold text-[9px] truncate">{documents.id_name || 'ID Uploaded'}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                            <div className="w-5 h-5 bg-blue-900/20 text-blue-500 rounded flex items-center justify-center border border-blue-800/20">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <span className="text-gray-300 font-bold text-[9px] truncate">{documents.endorsements_name || 'No Endorsements'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center pt-2 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group max-w-sm text-center">
                    <input type="checkbox" required className="w-4 h-4 bg-black border-white/10 rounded checked:bg-red-600 transition-all cursor-pointer" />
                    <span className="text-gray-500 text-[10px] font-medium leading-tight">I confirm information accuracy and agree to Terms of Service.</span>
                </label>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSubmit}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-xl shadow-red-950/20 transition-all uppercase tracking-widest"
                >
                    Submit Application
                </motion.button>
            </div>
        </div>
    );
};

export default Step5Summary;
