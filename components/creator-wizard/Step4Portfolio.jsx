import React, { useState } from 'react';
import { uploadFile } from '../../lib/verification';

const FieldError = ({ message }) => message ? (
    <p className="text-red-400 text-[10px] mt-0.5 ml-1 font-medium flex items-center gap-1">
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {message}
    </p>
) : null;

const inputStyle = {
    backgroundColor: '#0B0E14',
    border: '1px solid rgba(255,255,255,0.07)',
};

const Step4Portfolio = ({ data, documents, updatePortfolio, updateDocuments, errors = {} }) => {
    const recordings = data.recordings || [{}, {}, {}];
    const [uploading, setUploading] = useState({}); // { 'rec0': true, 'id': true }

    const handleRecordingChange = (index, field, value) => {
        const newRecordings = [...recordings];
        newRecordings[index] = { ...newRecordings[index], [field]: value };
        updatePortfolio({ recordings: newRecordings });
    };

    const handleFileUpload = async (type, file, index = null) => {
        const key = index !== null ? `rec${index}` : type;
        setUploading(prev => ({ ...prev, [key]: true }));
        try {
            const { url } = await uploadFile(file, index !== null ? 'recording' : type);
            if (index !== null) {
                handleRecordingChange(index, 'file_url', url);
                handleRecordingChange(index, 'file_name', file.name);
            } else {
                updateDocuments({ [`${type}_url`]: url, [`${type}_name`]: file.name });
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.message}`);
        } finally {

            setUploading(prev => ({ ...prev, [key]: false }));
        }
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div>
                <h2 className="text-base font-black text-white text-center leading-tight">Show Us Your Voice. Tell Us Your Story</h2>
                <p className="text-white font-bold text-xs mt-1">You may submit sample recordings of your craft.</p>
                <p className="text-gray-500 text-[10px] italic font-medium tracking-tight">Optional: Your recordings help us understand your storytelling style, originality and impact.</p>
            </div>

            {/* Cards container */}
            <div className="rounded-xl p-3 space-y-3" style={{ backgroundColor: '#10141c', border: '1px solid rgba(255,255,255,0.06)' }}>
                {/* Three recording cards */}
                <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((index) => {
                        const rec = recordings[index] || {};
                        const isUploading = uploading[`rec${index}`];
                        return (
                            <div key={index} className="rounded-xl p-3 flex flex-col gap-2" style={{ backgroundColor: '#1a1f2b', border: '1px solid rgba(255,255,255,0.07)' }}>
                                {/* Card header */}
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-bold text-[10px]">Sample Recording {index + 1}</span>
                                    <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                </div>

                                {/* Upload file button */}
                                <div className="relative">
                                    <label className={`flex items-center justify-center gap-1.5 w-full py-1.5 rounded-full cursor-pointer text-[10px] font-bold text-white hover:opacity-80 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ backgroundColor: '#2a3040', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {isUploading ? (
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                        ) : (
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                        )}
                                        {rec.file_name ? rec.file_name.slice(0, 8) + '…' : (isUploading ? 'Uploading...' : 'Upload file')}
                                        <input
                                            type="file"
                                            disabled={isUploading}
                                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) handleFileUpload('recording', file, index);
                                            }}
                                        />
                                    </label>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="text-gray-500 text-[9px] font-bold">Title:</label>
                                    <input
                                        type="text"
                                        value={rec.title || ''}
                                        onChange={(e) => handleRecordingChange(index, 'title', e.target.value)}
                                        className="w-full bg-transparent text-white text-[10px] font-medium focus:outline-none pb-px"
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-gray-500 text-[9px] font-bold block mb-0.5">Description:</label>
                                    <textarea
                                        value={rec.description || ''}
                                        onChange={(e) => handleRecordingChange(index, 'description', e.target.value)}
                                        placeholder="Tell us the story behind this recording. What inspired it?"
                                        rows={2}
                                        className="w-full text-white text-[9px] font-medium placeholder-gray-600 focus:outline-none resize-none rounded-lg p-1.5"
                                        style={inputStyle}
                                    />
                                </div>

                                {/* Significance */}
                                <div>
                                    <label className="text-gray-500 text-[9px] font-bold block mb-0.5">Significance:</label>
                                    <textarea
                                        value={rec.significance || ''}
                                        onChange={(e) => handleRecordingChange(index, 'significance', e.target.value)}
                                        placeholder="Why is this piece important?"
                                        rows={2}
                                        className="w-full text-white text-[9px] font-medium placeholder-gray-600 focus:outline-none resize-none rounded-lg p-1.5"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer hint */}
                <p className="text-center text-gray-500 text-[10px] font-bold uppercase tracking-wider">Samples are optional</p>
                <FieldError message={errors.recordings} />
            </div>

            {/* Government ID – compact single row */}
            <div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Verification Documents</p>
                <div className="grid grid-cols-2 gap-2">
                    {/* Required: Gov ID */}
                    <div>
                        <div
                            className={`relative rounded-xl p-2.5 flex items-center gap-2 cursor-pointer overflow-hidden transition-all ${uploading.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{
                                backgroundColor: errors.id ? 'rgba(127,0,0,0.15)' : '#141820',
                                border: `1px solid ${errors.id ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.06)'}`,
                            }}
                        >
                            <input 
                                type="file" 
                                disabled={uploading.id}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) handleFileUpload('id', file);
                                }} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                            />
                            <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-red-500" style={{ backgroundColor: 'rgba(220,38,38,0.1)' }}>
                                {uploading.id ? (
                                    <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent animate-spin rounded-full" />
                                ) : (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="text-white font-bold text-[9px]">{documents.id_name ? documents.id_name.slice(0, 14) + '…' : (uploading.id ? 'Uploading...' : 'Government ID')}</p>
                                <p className="text-gray-600 text-[8px] font-bold uppercase tracking-wider">Required</p>
                            </div>
                        </div>
                        <FieldError message={errors.id} />
                    </div>

                    {/* Optional: Endorsements */}
                    <div className={`relative rounded-xl p-2.5 flex items-center gap-2 cursor-pointer overflow-hidden ${uploading.endorsements ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ backgroundColor: '#141820', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <input 
                            type="file" 
                            disabled={uploading.endorsements}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleFileUpload('endorsements', file);
                            }} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                        />
                        <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-500" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                            {uploading.endorsements ? (
                                <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent animate-spin rounded-full" />
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <p className="text-white font-bold text-[9px]">{documents.endorsements_name ? documents.endorsements_name.slice(0, 14) + '…' : (uploading.endorsements ? 'Uploading...' : 'Endorsements')}</p>
                            <p className="text-gray-600 text-[8px] font-bold uppercase tracking-wider">Optional</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step4Portfolio;

