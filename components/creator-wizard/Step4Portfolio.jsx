import React from 'react';

const Step4Portfolio = ({ data, documents, updatePortfolio, updateDocuments }) => {
    const recordings = data.recordings || [{}, {}, {}];
    const links = data.links || [''];

    const handleRecordingChange = (index, field, value) => {
        const newRecordings = [...recordings];
        newRecordings[index] = { ...newRecordings[index], [field]: value };
        updatePortfolio({ recordings: newRecordings });
    };

    const handleLinkChange = (index, value) => {
        const newLinks = [...links];
        newLinks[index] = value;
        updatePortfolio({ links: newLinks });
    };

    const handleFileChange = (field, e) => {
        const file = e.target.files[0];
        if (file) {
            updateDocuments({ [field]: file });
        }
    };

    return (
        <div className="space-y-12">
            <div className="text-center">
                <h2 className="text-3xl lg:text-4xl font-black mb-2 tracking-tight">Show Us Your Voice. Tell Us Your Story</h2>
                <p className="text-gray-500 font-medium">Submit at least 3 sample recordings. Your recordings help us understand your storytelling style, originality and impact.</p>
            </div>

            {/* Recordings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recordings.map((rec, index) => (
                    <div key={index} className="bg-[#0B0E14] border border-gray-800 rounded-[2rem] p-6 lg:p-8 relative group hover:border-red-900/50 transition-all shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-bold text-gray-400 text-sm uppercase tracking-widest">Sample Recording {index + 1}</h4>
                            <div className="text-yellow-600">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                        </div>

                        <button className="w-full py-6 mb-8 border-2 border-dashed border-gray-800 rounded-2xl text-gray-600 hover:text-red-500 hover:border-red-600/30 transition-all flex flex-col items-center gap-3 bg-gray-900/20 group">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Upload file</span>
                        </button>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Title:</label>
                                <input
                                    type="text"
                                    value={rec.title || ''}
                                    onChange={(e) => handleRecordingChange(index, 'title', e.target.value)}
                                    className="w-full bg-transparent border-b border-gray-800 py-2 focus:border-red-600 outline-none transition-all font-bold text-white placeholder-gray-800"
                                    placeholder="_______________________"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Description:</label>
                                <textarea
                                    value={rec.description || ''}
                                    onChange={(e) => handleRecordingChange(index, 'description', e.target.value)}
                                    className="w-full bg-[#151C25] border border-gray-800 rounded-xl p-4 text-sm h-24 resize-none focus:border-red-600 outline-none font-medium text-gray-300 placeholder-gray-700"
                                    placeholder="Tell us the story behind this recording. What inspired it?"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Significance:</label>
                                <textarea
                                    value={rec.significance || ''}
                                    onChange={(e) => handleRecordingChange(index, 'significance', e.target.value)}
                                    className="w-full bg-[#151C25] border border-gray-800 rounded-xl p-4 text-sm h-24 resize-none focus:border-red-600 outline-none font-medium text-gray-300 placeholder-gray-700"
                                    placeholder="Why is this piece important?"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-center text-gray-600 font-bold text-sm tracking-wide">minimum 3 recordings required</p>

            {/* Documents Section */}
            <div className="pt-12 border-t border-gray-800/50">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-900/10 rounded-xl flex items-center justify-center text-red-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    Documents Verification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Government ID <span className="text-red-500">*</span></label>
                        <div className="relative group bg-[#0B0E14] border-2 border-dashed border-gray-800 rounded-2xl p-8 transition-all hover:border-red-600/30 text-center cursor-pointer overflow-hidden">
                            <input type="file" onChange={(e) => handleFileChange('id', e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-gray-500 group-hover:text-red-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-white font-bold">{documents.id ? documents.id.name : 'Upload ID Document'}</p>
                                    <p className="text-gray-500 text-xs mt-1">PDF, JPG, PNG up to 5MB</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Endorsements (Optional)</label>
                        <div className="relative group bg-[#0B0E14] border-2 border-dashed border-gray-800 rounded-2xl p-8 transition-all hover:border-red-600/30 text-center cursor-pointer overflow-hidden">
                            <input type="file" onChange={(e) => handleFileChange('endorsements', e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-gray-500 group-hover:text-red-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div>
                                    <p className="text-white font-bold">{documents.endorsements ? documents.endorsements.name : 'Upload Letters'}</p>
                                    <p className="text-gray-500 text-xs mt-1">Proof of community standing</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step4Portfolio;
