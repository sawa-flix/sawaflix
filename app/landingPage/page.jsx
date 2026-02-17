'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPassword } from '../(auth)/actions';

const LandingPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinAsCreator = () => {
    router.push('/creator/verify');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const result = await signInWithPassword(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        router.push(result.redirectTo || '/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0E14] flex flex-col lg:flex-row relative overflow-hidden font-inter">
      {/* Background Orbs */}
      <div className="absolute top-24 left-12 w-96 h-96 bg-yellow-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-[32rem] h-[32rem] bg-red-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Left Content - Value Prop */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-12 relative z-10 lg:border-r border-gray-800/50">
        <header className="absolute top-8 left-8 lg:left-24 flex items-center gap-2">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">SawaFlix</span>
        </header>

        <div className="max-w-2xl mt-12">
          <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight">
            Preserving <span className="text-gray-400">Culture</span><br />
            <span className="text-red-600">Sharing Stories.</span><br />
            Connecting <span className="text-gray-400">Generations</span>
          </h1>

          <p className="text-gray-400 text-lg lg:text-xl leading-relaxed mb-16 max-w-xl">
            Discover the world's rich heritage through an immersive digital experience that celebrates traditions, preserves stories, and connects communities across time.
          </p>

          <div className="flex flex-wrap gap-12">
            {[
              { icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>, label: 'Music' },
              { icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 9H3V5h9v7z" /></svg>, label: 'Film' },
              { icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5-1.17 0-2.39.15-3.5.5V19c1.11-.35 2.33-.5 3.5-.5 1.95 0 4.05.4 5.5 1.5 1.45-1.1 3.55-1.5 5.5-1.5 1.17 0 2.39.15 3.5.5V5z" /></svg>, label: 'Stories' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-red-900/10 rounded-2xl border border-red-900/20 flex items-center justify-center text-red-500 shadow-inner">
                  {item.icon}
                </div>
                <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="lg:w-[480px] flex flex-col justify-center px-8 lg:px-12 py-12 relative z-20">
        <div className="bg-[#151C25]/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-800/50 p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-white mb-2">Join Sawaflix</h2>
            <p className="text-gray-500 font-medium">Choose your path to begin</p>
          </div>

          <div className="space-y-4 mb-10">
            {/* Join as User */}
            <button className="w-full group bg-red-600 hover:bg-red-700 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-xl shadow-red-900/20 transform hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-bold text-lg leading-tight">Join as User</h3>
                  <p className="text-red-100/60 text-sm">Share your cultural content</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {/* Join as Creator */}
            <button
              onClick={handleJoinAsCreator}
              className="w-full group bg-gray-900 hover:bg-gray-800 border border-gray-800 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-red-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-bold text-lg leading-tight">Join as Creator</h3>
                  <p className="text-gray-500 text-sm">Explore cultural content</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          <div className="relative mb-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-gray-600">
              <span className="px-4 bg-[#151C25]">or sign in</span>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-900/30 text-red-500 text-sm p-4 rounded-xl mb-4">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 bg-gray-900 border-gray-800 rounded checked:bg-red-600 transition-all cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button type="button" className="text-red-700 hover:text-red-600 font-bold">Forgot password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-red-900/20 transition-all transform active:scale-95 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="mt-8 flex justify-center gap-6">
          <button onClick={() => router.push('/login')} className="text-gray-400 hover:text-white font-bold transition-colors">Login</button>
          <button className="bg-red-600 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider shadow-lg shadow-red-900/20">Get Started</button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;