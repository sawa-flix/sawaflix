'use client'

import React, { useState } from 'react'
import { editProfile } from '@/app/actions/creator/actions'
import { updateCreatorMedia } from '@/app/actions/creator/creator-media'

export default function CreatorProfileForm() {
    const [isUploading, setIsUploading] = useState(false)
    const [message, setMessage] = useState('')

    const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setMessage(`Uploading ${type}...`)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const result = await updateCreatorMedia(formData, type)
            if (result.success) {
                setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`)
            }
        } catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : 'Upload failed'}`)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-xl rounded-xl border border-slate-200 my-10">
            <header className="mb-8 border-b border-slate-100 pb-4">
                <h2 className="text-3xl font-extrabold text-slate-900">Creator Settings</h2>
                <p className="text-slate-500 mt-1">Manage your public identity and branding.</p>
            </header>

            {/* Media Assets Section */}
            <section className="space-y-8 mb-10">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                    Branding Assets
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Profile Photo</label>
                        <p className="text-xs text-slate-500 mb-3">Recommended: 400x400px</p>
                        <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            onChange={(e) => handleMediaChange(e, 'avatar')}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer disabled:opacity-50"
                        />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Cover Banner</label>
                        <p className="text-xs text-slate-500 mb-3">Recommended: 1500x500px</p>
                        <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            onChange={(e) => handleMediaChange(e, 'banner')}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-900 cursor-pointer disabled:opacity-50"
                        />
                    </div>
                </div>
            </section>

            {/* Profile Info Section */}
            <section className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                    Profile Information
                </h3>

                <form action={async (formData) => {
                    setMessage('Saving changes...')
                    try {
                        await editProfile(formData)
                        setMessage('Profile updated successfully!')
                    } catch (err) {
                        setMessage('Error: Failed to save profile details.')
                    }
                }} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700">Stage Name / Handle</label>
                        <input
                            name="stage_name"
                            type="text"
                            placeholder="e.g. DJ Sawa"
                            required
                            className="w-full p-3 border border-slate-300 rounded-md mt-1 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700">Professional Bio</label>
                        <textarea
                            name="bio"
                            placeholder="Tell your fans about your journey..."
                            className="w-full p-3 border border-slate-300 rounded-md mt-1 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-md font-extrabold uppercase tracking-wider hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:bg-slate-400"
                    >
                        Update Creator Profile
                    </button>
                </form>
            </section>

            {/* Feedback Message */}
            {message && (
                <div className={`mt-6 p-4 rounded-md border text-center font-medium animate-in fade-in slide-in-from-bottom-2 ${message.includes('Error')
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                    {message}
                </div>
            )}
        </div>
    )
}