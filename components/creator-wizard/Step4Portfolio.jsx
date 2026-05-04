import React, { useState } from 'react';
import { uploadFile } from '../../lib/verification';

const PLATFORMS = [
    {
        id: 'youtube',
        name: 'YouTube',
        placeholder: 'https://youtube.com/@...',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
        )
    },
    {
        id: 'spotify',
        name: 'Spotify',
        placeholder: 'https://open.spotify.com/artist/...',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.45 17.34c-.21.344-.664.455-1.008.243-2.76-1.684-6.234-2.062-10.33-.113-.393.187-.86-.022-1.048-.415-.187-.393.022-.86.415-1.048 4.45-2.122 8.282-1.688 11.385.204.344.208.455.662.243 1.006zm1.428-3.187c-.266.43-3.568-1.298-3.535-7.905-1.782-13.06-1.096-.48.224-1.066-.255-.588-.478-.224-1.065 4.35-1.008 9.948-.246 14.07 1.888.428.267.562.756.295 1.185zm1.536-3.327c-4.14-2.456-10.96-2.68-14.88-1.488-.616.186-1.258-.16-1.444-.776-.187-.616.16-1.258.775-1.444 4.54-1.38 12.08-1.12 16.89 1.734.555.328.74 1.046.412 1.602-.33.556-1.047.74-1.603.412z"/>
            </svg>
        )
    },
    {
        id: 'instagram',
        name: 'Instagram',
        placeholder: 'https://instagram.com/...',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
        )
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        placeholder: 'https://tiktok.com/@...',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.11 4.46-2.9 5.81-1.66 1.25-3.8 1.63-5.83 1.2-2.03-.43-3.8-1.65-4.83-3.41-1.1-1.85-1.24-4.2-.33-6.14 1.02-2.2 3.12-3.72 5.49-4.05v4.11c-1.07.15-2.09.7-2.67 1.59-.57.88-.71 2.05-.31 3.04.4.98 1.34 1.68 2.37 1.83 1.05.15 2.16-.14 2.88-.88.75-.77 1.08-1.89 1.06-2.98.02-3.95.01-7.9 0-11.85h-2.98V.02z"/>
            </svg>
        )
    },
    {
        id: 'other',
        name: 'Other',
        placeholder: 'https://...',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
        )
    }
];

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
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 disabled:cursor-not-allowed" 
                    />
                    
                    {fileUrl && !isUploading && (
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
                    )}
                    
                    {isUploading && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-sm">
                            <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 animate-spin rounded-full mb-3" />
                            <p className="text-white font-bold text-sm">Uploading...</p>
                        </div>
                    )}
                    
                    {!fileUrl && !isUploading && (
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
                    <p className="text-zinc-500 text-sm">Add links to your profiles on Spotify, YouTube, Instagram, TikTok, etc.</p>
                </div>
                
                <div className="space-y-3">
                    {PLATFORMS.map((platform, index) => {
                        const linkStr = (data.links && data.links[index]) || '';
                        return (
                            <div key={platform.id} className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
                                    {platform.icon}
                                </div>
                                <input
                                    type="url"
                                    value={linkStr}
                                    onChange={(e) => {
                                        const newLinks = [...(data.links || ['', '', '', '', ''])];
                                        newLinks[index] = e.target.value;
                                        updatePortfolio({ links: newLinks });
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-500/50 transition-all hover:bg-white/10"
                                    placeholder={platform.placeholder}
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


