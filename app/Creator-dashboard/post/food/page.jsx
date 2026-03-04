'use client';

import React, { useState } from 'react';
import { Upload, ChefHat, FileVideo, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FoodUploadPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/content/food/upload', {
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
            Upload <span className="text-red-500">Food Experience</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Share your culinary heritage with the world.</p>
        </div>
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
          <ChefHat className="text-red-500" size={32} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left Column: Details */}
          <div className="space-y-6">
            <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Dish Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dish Name</label>
                  <input
                    type="text"
                    name="dish_name"
                    required
                    placeholder="e.g. Traditional Jollof Rice"
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Creator Display Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Chef Name"
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    name="description"
                    placeholder="Tell the story behind this dish..."
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-white font-medium h-32 resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Metadata
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration (Sec)</label>
                  <input
                    type="number"
                    name="duration"
                    placeholder="60"
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-500/50 outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                  <div className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-400 font-bold uppercase tracking-widest">
                    Food
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Files */}
          <div className="space-y-6">
            <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Media Files
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileVideo size={14} className="text-red-500" />
                    Video Content (Required)
                  </label>
                  <div className="relative group min-h-[160px]">
                    <input
                      type="file"
                      name="video"
                      required
                      accept="video/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-gray-800 group-hover:border-red-500/50 rounded-2xl p-10 transition-all h-full flex flex-col items-center justify-center bg-[#0B0E14]/50">
                      <Upload className="text-gray-600 group-hover:text-red-500 transition-colors mb-4" size={32} />
                      <p className="text-sm font-bold text-gray-400">Click or drag video</p>
                      <p className="text-[10px] text-gray-600 uppercase mt-2">MP4 or MOV preferred</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ImageIcon size={14} className="text-red-500" />
                    Thumbnail / Cover (Required)
                  </label>
                  <div className="relative group min-h-[160px]">
                    <input
                      type="file"
                      name="cover"
                      required
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-gray-800 group-hover:border-red-500/50 rounded-2xl p-10 transition-all h-full flex flex-col items-center justify-center bg-[#0B0E14]/50">
                      <Upload className="text-gray-600 group-hover:text-red-500 transition-colors mb-4" size={32} />
                      <p className="text-sm font-bold text-gray-400">Select cover image</p>
                      <p className="text-[10px] text-gray-600 uppercase mt-2">PNG or JPG</p>
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
                  Uploading Masterpiece...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Publish Cultural Food Video
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
