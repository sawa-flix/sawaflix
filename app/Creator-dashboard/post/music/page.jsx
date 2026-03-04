'use client';

import React, { useState } from 'react';
import { Upload, Music, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Disc } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MusicUploadPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/content/music/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);
      if (data.success) {
        setTimeout(() => router.push('/Creator-dashboard/content'), 2000);
      }
    } catch (err) {
      setResult({
        error: 'Upload Failed',
        details: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link
            href="/Creator-dashboard/post"
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4"
          >
            <ArrowLeft size={14} />
            Back to Selector
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Publish <span className="text-red-500">Cultural Melody</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Upload your tracks and share your sound with the community.</p>
        </div>
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
          <Music className="text-red-500" size={32} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left Column: Details */}
          <div className="space-y-6">
            <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Track Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Track Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Echoes of the Savannah"
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Genre(s)</label>
                  <input
                    type="text"
                    name="genre"
                    placeholder="Traditional, Folk, Afro-fusion"
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-white font-medium"
                  />
                  <p className="text-[10px] text-gray-600 mt-1 uppercase font-bold tracking-widest">Separate with commas</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description / Credit</label>
                  <textarea
                    name="description"
                    placeholder="Describe the track or list featured artists..."
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-white font-medium h-32 resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Featured Track</label>
                  <select
                    name="is_featured"
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 transition-all outline-none text-white"
                  >
                    <option value="false">No (Standard Release)</option>
                    <option value="true">Yes (Feature on Profile)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Tags</label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="cultural, drums, energetic"
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 outline-none text-white"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Files */}
          <div className="space-y-6">
            <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Master Files
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Disc size={14} className="text-red-500" />
                    Audio File (Required)
                  </label>
                  <div className="relative group min-h-[140px]">
                    <input
                      type="file"
                      name="audio"
                      required
                      accept="audio/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-gray-800 group-hover:border-red-500/50 rounded-2xl p-8 transition-all h-full flex flex-col items-center justify-center bg-[#0B0E14]/50">
                      <Upload className="text-gray-600 group-hover:text-red-500 transition-colors mb-4" size={24} />
                      <p className="text-xs font-bold text-gray-400">Upload high-quality audio</p>
                      <p className="text-[10px] text-gray-600 uppercase mt-2">MP3 or WAV preferred</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ImageIcon size={14} className="text-red-500" />
                    Cover Art (Optional)
                  </label>
                  <div className="relative group min-h-[140px]">
                    <input
                      type="file"
                      name="cover"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-gray-800 group-hover:border-red-500/50 rounded-2xl p-8 transition-all h-full flex flex-col items-center justify-center bg-[#0B0E14]/50">
                      <Upload className="text-gray-600 group-hover:text-red-500 transition-colors mb-4" size={24} />
                      <p className="text-xs font-bold text-gray-400">Select cover artwork</p>
                      <p className="text-[10px] text-gray-600 uppercase mt-2">1:1 Square recommended</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl py-5 font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sythesizing Audio...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Release Track
                </>
              )}
            </button>

            {result && (
              <div className={`p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 ${result.success ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
                {result.success ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> : <AlertCircle size={20} className="mt-0.5 shrink-0" />}
                <div>
                  <p className="font-bold text-sm">{result.success ? 'Success!' : 'Upload Failed'}</p>
                  <p className="text-xs opacity-80 mt-1 font-medium">{result.message || result.error || 'Please try again.'}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </form>
    </div>
  );
}
