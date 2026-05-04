import React, { useState } from 'react';
import { uploadFile } from '../../lib/verification';

const FieldError = ({ message }) => message ? (
    <p className="text-red-400 text-xs mt-2 ml-2 font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {message}
    </p>
) : null;

const Step4Portfolio = ({ data, documents, updatePortfolio, updateDocuments, errors = {}, showModal }) => {
    const [uploading, setUploading] = useState({});

    const handleFileUpload = async (type, file) => {
        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const { url } = await uploadFile(file, type);
            updateDocuments({ [`${type}_url`]: url, [`${type}_name`]: file.name });
        } catch (error) {
            console.error("Upload failed", error);
            showModal('error', 'Upload Failed', error.message || 'We could not upload your file at this time.');
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const renderUploadCanvas = (type, title, isRequired, accept, description) => {
        const fileUrl = documents[`${type}_url`];
        const isUploading = uploading[type];
        const hasError = errors[type];

        return (
            <div className="flex flex-col gap-2">
                <label className="text-zinc-400 text-sm font-semibold flex items-center justify-between">
                    <span>{title} {isRequired && <span className="text-red-500">*</span>}</span>
                    {isRequired && <span className="text-red-500 text-[10px] uppercase tracking-widest font-bold bg-red-500/10 px-2 py-0.5 rounded">Required</span>}
                </label>
                <div 
                    className={`relative w-full aspect-video sm:aspect-[21/9] rounded-2xl overflow-hidden group transition-all duration-300 border-2 ${
                        hasError ? 'border-red-500/50 bg-red-950/20' : 
                        fileUrl ? 'border-emerald-500/30 bg-black' : 
                        'border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    } flex flex-col items-center justify-center cursor-pointer`}
                >
                    <input 
                        type="file" 
                        disabled={isUploading}
                        accept={accept}
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleFileUpload(type, file);
                        }} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed" 
                    />
                    
                    {fileUrl ? (
                        <>
                            {type !== 'endorsement_letter' ? (
                                <img src={fileUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity z-0" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-0">
                                    <svg className="w-16 h-16 text-emerald-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3 backdrop-blur-md">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-lg backdrop-blur-md">{documents[`${type}_name`] || 'File Uploaded'}</p>
                                <p className="text-zinc-300 text-xs mt-2 bg-black/50 px-2 py-0.5 rounded backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">Click or drag to replace</p>
                            </div>
                        </>
                    ) : isUploading ? (
                        <div className="flex flex-col items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 border-2 border-red-500 border-t-transparent animate-spin rounded-full mb-3" />
                            <p className="text-white font-medium text-sm">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center pointer-events-none text-center p-6">
                            <div className="w-14 h-14 rounded-full bg-white/5 text-zinc-400 flex items-center justify-center mb-4 group-hover:bg-red-500/20 group-hover:text-red-400 transition-colors">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <p className="text-white font-bold mb-1">Click to upload <span className="text-red-400 group-hover:text-red-300">{title}</span></p>
                            <p className="text-zinc-500 text-xs max-w-xs">{description}</p>
                        </div>
                    )}
                </div>
                <FieldError message={hasError} />
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Portfolio & Documents</h2>
                <p className="text-zinc-400 text-sm">Provide your verification documents and links to your creative work.</p>
            </div>

            {/* Verification Documents Canvas */}
            <div className="space-y-8">
                {renderUploadCanvas(
                    'selfie', 
                    'Clear Selfie', 
                    true, 
                    'image/*', 
                    'Upload a clear, front-facing photo of yourself. Make sure your face is well-lit.'
                )}
                
                {renderUploadCanvas(
                    'national_id', 
                    'Government ID', 
                    true, 
                    'image/*,.pdf', 
                    'Upload a clear photo or scan of your passport, driver\'s license, or national identity card.'
                )}

                {renderUploadCanvas(
                    'endorsement_letter', 
                    'Endorsement Letter', 
                    false, 
                    'image/*,.pdf', 
                    'Optional: Provide an endorsement letter from an agency, label, or verified creator.'
                )}
            </div>
            
            <div className="h-px w-full bg-white/10 my-8" />

            {/* Streaming & Social Links */}
            <div className="space-y-4">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-1">Platform Links</h3>
                    <p className="text-zinc-500 text-sm">Add links to your profiles on Spotify, YouTube, Instagram, etc.</p>
                </div>
                
                <div className="space-y-3">
                    {[0, 1, 2].map((index) => {
                        const linkStr = (data.links && data.links[index]) || '';
                        return (
                            <div key={`link-${index}`} className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-zinc-500 group-focus-within:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <input
                                    type="url"
                                    value={linkStr}
                                    onChange={(e) => {
                                        const newLinks = [...(data.links || ['', '', ''])];
                                        newLinks[index] = e.target.value;
                                        updatePortfolio({ links: newLinks });
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-500/50 transition-all hover:bg-white/10"
                                    placeholder={`https://... (Platform Link ${index + 1})`}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Step4Portfolio;


