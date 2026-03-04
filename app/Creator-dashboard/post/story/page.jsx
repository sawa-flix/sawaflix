'use client';

import React, { useState } from 'react';
import { Upload, BookOpen, FileVideo, Disc, AlignLeft, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StoryUploadPage() {
  const [contentType, setContentType] = useState('video');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/content/stories/upload', {
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
            Share a <span className="text-red-500">Traditional Story</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Preserve culture through folklore, narration, or written word.</p>
        </div>
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
          <BookOpen className="text-red-500" size={32} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left Column: Details */}
          <div className="space-y-6">
            <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Story Essentials
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Story Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Why the Turtle has a Cracked Shell"
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Community / Tribe</label>
                  <input
                    type="text"
                    name="community_group"
                    required
                    placeholder="e.g. Igbo, Northern Tribes, Zulu"
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 outline-none text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Languages</label>
                  <input
                    type="text"
                    name="languages"
                    required
                    placeholder="Native Language, English, etc."
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 outline-none text-white font-medium"
                  />
                </div>
              </div>
            </section>

            <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Medium Selection
              </h3>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">How are you sharing this story?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'video', icon: FileVideo, label: 'Video' },
                    { id: 'audio', icon: Disc, label: 'Audio' },
                    { id: 'text', icon: AlignLeft, label: 'Written' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setContentType(mode.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${contentType === mode.id ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-[#0B0E14] border-gray-800 text-gray-500 hover:border-gray-700'}`}
                    >
                      <mode.icon size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
                    </button>
                  ))}
                  <input type="hidden" name="content_type" value={contentType} />
                </div>
              </div>
            </section>

            {contentType === 'text' && (
              <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Written Story Content</h3>
                <textarea
                  name="content_text"
                  required={contentType === 'text'}
                  placeholder="Once upon a time..."
                  className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-white font-medium h-64 resize-none"
                />
              </section>
            )}
          </div>

          {/* Right Column: Files */}
          <div className="space-y-6">
            {(contentType === 'video' || contentType === 'audio') && (
              <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-right-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Media Upload
                </h3>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    {contentType === 'video' ? <FileVideo size={14} className="text-red-500" /> : <Disc size={14} className="text-red-500" />}
                    Master {contentType === 'video' ? 'Video' : 'Audio'} Recording
                  </label>
                  <div className="relative group min-h-[160px]">
                    <input
                      type="file"
                      name="media"
                      required={contentType !== 'text'}
                      accept={contentType === 'video' ? "video/*" : "audio/*"}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-gray-800 group-hover:border-red-500/50 rounded-2xl p-10 transition-all h-full flex flex-col items-center justify-center bg-[#0B0E14]/50">
                      <Upload className="text-gray-600 group-hover:text-red-500 transition-colors mb-4" size={32} />
                      <p className="text-sm font-bold text-gray-400">Select story file</p>
                      <p className="text-[10px] text-gray-600 uppercase mt-2">{contentType === 'video' ? 'MP4 / MOV' : 'MP3 / WAV'}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Story Cover
              </h3>

              <div className="relative group min-h-[160px]">
                <input
                  type="file"
                  name="cover"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-gray-800 group-hover:border-red-500/50 rounded-2xl p-10 transition-all h-full flex flex-col items-center justify-center bg-[#0B0E14]/50">
                  <Upload className="text-gray-600 group-hover:text-red-500 transition-colors mb-4" size={32} />
                  <p className="text-sm font-bold text-gray-400 font-medium tracking-tight">Thumbnail Artwork</p>
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
                  Recording History...
                </>
              ) : (
                <>
                  <BookOpen size={20} />
                  Publish Story
                </>
              )}
            </button>

            {result && (
              <div className={`p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 ${result.success ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
                {result.success ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> : <AlertCircle size={20} className="mt-0.5 shrink-0" />}
                <div>
                  <p className="font-bold text-sm">{result.success ? 'Story Live!' : 'Upload Failed'}</p>
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
