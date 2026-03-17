'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import PendingState from '@/components/Dashboard/PendingState';
import ApprovedDashboard from '@/components/Dashboard/ApprovedDashboard';
import RejectedState from '@/components/Dashboard/RejectedState';
import { StatsSkeleton, DashboardHeaderSkeleton } from '@/components/Dashboard/Skeletons';
import feedData from '@/app/data/feedData.json';

export default function DashboardPage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedReel, setSelectedReel] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReelIndex, setSelectedReelIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState({});
    const touchStartY = useRef(0);
    const touchEndY = useRef(0);
    const modalRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const visitorId = localStorage.getItem('sawaflix_visitor_id');
                const res = await fetch('/api/creator/profile', {
                    headers: visitorId ? { 'x-visitor-id': visitorId } : {}
                });
                if (!res.ok) throw new Error('Failed to fetch profile');
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Handle image loading errors with fallback
    const handleImageError = (reelId) => {
        setImageErrors(prev => ({
            ...prev,
            [reelId]: true
        }));
    };

    // Get image source - directly use the path from JSON
    const getImageSrc = (reel) => {
        if (!reel || !reel.image) {
            return '/movie.jpg';
        }
        return reel.image;
    };

    // Swipe gesture handlers
    const handleTouchStart = (e) => {
        touchStartY.current = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e) => {
        touchEndY.current = e.changedTouches[0].screenY;
        handleSwipe();
    };

    const handleSwipe = () => {
        const swipeThreshold = 50; // Minimum distance for swipe
        const difference = touchStartY.current - touchEndY.current;

        if (Math.abs(difference) > swipeThreshold) {
            if (difference > 0) {
                // Swiped up - show next reel
                navigateToNextReel();
            } else {
                // Swiped down - show previous reel
                navigateToPreviousReel();
            }
        }
    };

    const navigateToNextReel = () => {
        const filtered = activeTab === 'all' 
            ? feedData 
            : feedData.filter(reel => reel.contentType === activeTab);
        
        if (selectedReelIndex < filtered.length - 1) {
            const nextReel = filtered[selectedReelIndex + 1];
            setSelectedReel(nextReel);
            setSelectedReelIndex(selectedReelIndex + 1);
        }
    };

    const navigateToPreviousReel = () => {
        if (selectedReelIndex > 0) {
            const filtered = activeTab === 'all' 
                ? feedData 
                : feedData.filter(reel => reel.contentType === activeTab);
            
            const prevReel = filtered[selectedReelIndex - 1];
            setSelectedReel(prevReel);
            setSelectedReelIndex(selectedReelIndex - 1);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        if (!isModalOpen) return;

        const handleKeyPress = (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigateToNextReel();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigateToPreviousReel();
            } else if (e.key === 'Escape') {
                setIsModalOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isModalOpen, selectedReelIndex, activeTab]);

    if (loading) {
        return (
            <div className="space-y-8">
                <DashboardHeaderSkeleton />
                <StatsSkeleton />
                <div className="h-64 bg-[#141820] border border-gray-800 rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center max-w-md mx-auto my-12">
                <h3 className="text-red-500 font-black text-xl mb-2">Connection Issue</h3>
                <p className="text-gray-400 mb-6 font-medium">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-2.5 bg-red-600 text-white rounded-full font-bold text-sm hover:bg-red-700 transition-all"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    // Conditional Rendering based on verificationStatus (Creator only)
    if (profile?.verificationStatus === 'pending') {
        return <PendingState userProfile={profile} />;
    }

    if (profile?.verificationStatus === 'approved') {
        return <ApprovedDashboard creatorName={profile.displayName} userProfile={profile} />;
    }

    if (profile?.verificationStatus === 'rejected') {
        return <RejectedState feedback={profile.rejectionFeedback} />;
    }

    // User Dashboard - YouTube Shorts Style with feedData
    const reelsData = feedData;

    const CONTENT_CATEGORIES = [
        { id: 'all', label: 'All' },
        { id: 'video', label: '🎬 Videos' },
        { id: 'music', label: '🎵 Music' },
        { id: 'storytelling', label: '📖 Storytelling' },
    ];

    // Navigation handler functions
    const handleNavigateToCreatorPage = (username) => {
        router.push(`/creator/${username}`);
    };

    const handleNavigateToArtistPage = () => {
        router.push('/artistPage');
    };

    const handleNavigateToCreatorDashboard = () => {
        router.push('/creator-dashboard');
    };

    const handleNavigateToProfile = () => {
        router.push('/updateProfile');
    };

    const handleNavigateToSettings = () => {
        router.push('/creator-dashboard/settings');
    };

    const handleViewRecent = () => {
        router.push('/creator-dashboard/content');
    };

    const handleCardClick = (reel) => {
        setSelectedReel(reel);
        setSelectedReelIndex(reelsData.findIndex(r => r.id === reel.id));
        setIsModalOpen(true);
    };

    const filteredReels = activeTab === 'all' 
        ? reelsData 
        : reelsData.filter(reel => reel.contentType === activeTab);

    return (
        <div className="w-full min-h-screen px-4 py-8 animate-in fade-in duration-700 bg-gray-900">
            {/* Reels/Shorts - YouTube Style */}
            <div className="mb-16 max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-2 text-white">Shorts</h2>
                <p className="text-gray-400 mb-8 text-sm">Discover short-form content</p>
                
                {/* YouTube Shorts - Horizontal Scroll */}
                <div className="overflow-x-auto pb-4 -mx-4 px-4">
                    <div className="flex gap-3 w-max">
                        {reelsData.map(reel => (
                            <div 
                                key={reel.id} 
                                className="group relative cursor-pointer flex-shrink-0"
                                onClick={() => handleCardClick(reel)}
                            >
                                {/* Compact YouTube Shorts Card */}
                                <div className="relative flex-shrink-0 w-40 sm:w-48 h-64 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-500 transition-all duration-300 shadow-md hover:shadow-xl">
                                    {/* Thumbnail Image - Smaller */}
                                    <div className="relative w-full h-full overflow-hidden bg-gray-800">
                                        <img 
                                            src={getImageSrc(reel)} 
                                            alt={reel.title}
                                            loading="eager"
                                            decoding="async"
                                            onError={(e) => {
                                                handleImageError(reel.id);
                                                e.currentTarget.src = '/movie.jpg';
                                            }}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            style={{
                                                minHeight: '100%',
                                                minWidth: '100%'
                                            }}
                                        />
                                        
                                        {/* Overlay */}
                                        <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
                                        
                                        {/* Play Icon Center */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white bg-opacity-90 rounded-full p-2">
                                                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        
                                        {/* Duration Badge */}
                                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-[10px] px-1.5 py-0.5 rounded">
                                            {reel.duration_minutes}m
                                        </div>

                                        {/* Content Type Badge */}
                                        <div className={`absolute bottom-1 left-1 text-white text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                            reel.contentType === 'video' ? 'bg-red-600' :
                                            reel.contentType === 'music' ? 'bg-purple-600' :
                                            'bg-blue-600'
                                        }`}>
                                            {reel.contentType === 'video' ? '🎬' :
                                             reel.contentType === 'music' ? '🎵' :
                                             '📖'}
                                        </div>

                                        {/* New Badge */}
                                        {reel.isNew && (
                                            <div className="absolute top-1 right-8 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                                                NEW
                                            </div>
                                        )}
                                    </div>

                                    {/* Compact Info Section */}
                                    <div className="p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <h3 className="text-white text-xs font-semibold line-clamp-1 mb-1">
                                            {reel.title}
                                        </h3>
                                        <p className="text-gray-400 text-[10px] truncate">{reel.creator}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Tabs Section - YouTube Style Cards */}
            <div className="mb-16 max-w-full">
                <h2 className="text-2xl font-bold mb-2 text-white max-w-7xl mx-auto px-4">Explore by Category</h2>
                <p className="text-gray-400 mb-8 text-sm max-w-7xl mx-auto px-4">Browse content by your interests</p>
                
                {/* Tab Navigation */}
                <div className="flex gap-3 mb-8 pb-4 overflow-x-auto overflow-y-hidden scrollbar-hide max-w-7xl mx-auto px-4 border-b border-gray-800">
                    {CONTENT_CATEGORIES.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setActiveTab(category.id)}
                            className={`px-5 py-2 rounded-full font-medium transition-all text-sm whitespace-nowrap flex-shrink-0 ${
                                activeTab === category.id
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* Filtered Content Grid - YouTube Style Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
                    {filteredReels.map(reel => (
                        <div 
                            key={reel.id} 
                            className="group cursor-pointer"
                            onClick={() => handleCardClick(reel)}
                        >
                            {/* YouTube Style Card */}
                            <div className="space-y-3">
                                {/* Thumbnail */}
                                <div className="relative rounded-xl overflow-hidden aspect-video">
                                    <img 
                                        src={getImageSrc(reel)} 
                                        alt={reel.title}
                                        loading="eager"
                                        decoding="async"
                                        onError={(e) => {
                                            handleImageError(reel.id);
                                            e.currentTarget.src = '/movie.jpg';
                                        }}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                                        <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {/* Duration Badge */}
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                                        {reel.duration_minutes}m
                                    </div>
                                </div>

                                {/* Card Info */}
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-gray-300 transition-colors">
                                                {reel.title}
                                            </h3>
                                            <p className="text-gray-400 text-xs mt-1">{reel.creator}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${
                                            reel.contentType === 'video' ? 'bg-red-600/20 text-red-400' :
                                            reel.contentType === 'music' ? 'bg-purple-600/20 text-purple-400' :
                                            'bg-blue-600/20 text-blue-400'
                                        }`}>
                                            {reel.contentType === 'video' ? '🎬' :
                                             reel.contentType === 'music' ? '🎵' :
                                             '📖'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span>📊 {reel.views}</span>
                                        <span>⭐ {reel.rating}</span>
                                        <span>❤️ {(reel.likes / 1000).toFixed(1)}K</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Creator CTA - YouTube Style */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 md:p-12 text-center">
                    <div className="mb-6">
                        <div className="inline-block bg-red-600 rounded-full p-4 mb-4">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Ready to Create?</h2>
                    <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                        Share your talent, culture, and stories with millions of viewers around the world. Start creating and earning today.
                    </p>
                    <a 
                        href="/creator/verify"
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-all hover:scale-105"
                    >
                        Start Creating
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>

            {/* Modal Popup - Video/Audio Player */}
            {isModalOpen && selectedReel && (
                <div 
                    className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" 
                    onClick={() => setIsModalOpen(false)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    ref={modalRef}
                    style={{backgroundColor: 'rgba(0, 0, 0, 0.4)'}}
                >
                    <div 
                        className="bg-black border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl" 
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        style={{backgroundColor: 'rgba(0, 0, 0, 0.95)'}}
                    >
                        {/* Close Button */}
                        <div className="sticky top-0 bg-black bg-opacity-95 border-b border-gray-700 p-4 flex justify-between items-center">
                            <h2 className="text-white font-bold text-lg truncate">{selectedReel.title}</h2>
                            <div className="flex items-center gap-3">
                                {/* Navigation hint */}
                                <span className="text-xs text-gray-500">↑ ↓ to navigate</span>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 flex-1">
                            {/* Media Player */}
                            <div className="mb-6">
                                {selectedReel.contentType === 'music' ? (
                                    // Audio Player
                                    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-xl p-8 flex flex-col items-center justify-center min-h-64">
                                        <svg className="w-20 h-20 text-white mb-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 3v9.28c-.47-.46-1.12-.74-1.84-.74-1.49 0-2.7 1.21-2.7 2.7s1.21 2.7 2.7 2.7 2.7-1.21 2.7-2.7V7h4V3h-4z" />
                                        </svg>
                                        <h4 className="text-white text-lg font-bold text-center mb-4">{selectedReel.title}</h4>
                                        <audio 
                                            controls 
                                            className="w-full mb-4"
                                            src={selectedReel.image}
                                        />
                                        <p className="text-gray-300 text-center text-xs">🎵 Audio Content - Click to listen</p>
                                    </div>
                                ) : selectedReel.contentType === 'video' ? (
                                    // Video Player
                                    <div className="rounded-xl overflow-hidden">
                                        <div className="relative w-full aspect-video">
                                            <img 
                                                src={getImageSrc(selectedReel)}
                                                alt={selectedReel.title}
                                                loading="eager"
                                                decoding="async"
                                                onError={(e) => {
                                                    handleImageError(selectedReel.id);
                                                    e.currentTarget.src = '/movie.jpg';
                                                }}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                ) : selectedReel.contentType === 'storytelling' ? (
                                    // Storytelling/Story Display
                                    <div className="rounded-xl overflow-hidden border border-gray-700">
                                        <img 
                                            src={getImageSrc(selectedReel)}
                                            alt={selectedReel.title}
                                            loading="eager"
                                            decoding="async"
                                            onError={(e) => {
                                                handleImageError(selectedReel.id);
                                                e.currentTarget.src = '/movie.jpg';
                                            }}
                                            className="w-full h-auto object-cover"
                                        />
                                        <div className="p-4 bg-black">
                                            <p className="text-white text-sm font-semibold mb-2">📖 Story</p>
                                            <p className="text-gray-300 text-xs mb-2">{selectedReel.plot_summary}</p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {/* Info Section */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-white text-xl font-bold mb-1">{selectedReel.title}</h3>
                                            <p className="text-gray-400 flex items-center gap-2">
                                                <span className={`inline-block w-2 h-2 rounded-full ${
                                                    selectedReel.contentType === 'video' ? 'bg-red-500' :
                                                    selectedReel.contentType === 'music' ? 'bg-purple-500' :
                                                    'bg-blue-500'
                                                }`}></span>
                                                {selectedReel.creator}
                                            </p>
                                        </div>
                                        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                                            {selectedReel.contentType === 'video' ? '🎬 Video' :
                                             selectedReel.contentType === 'music' ? '🎵 Music' :
                                             '📖 Story'}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 text-sm text-gray-400">
                                        <span>📊 {selectedReel.views}</span>
                                        <span>⭐ {selectedReel.rating}</span>
                                        <span>⏱️ {selectedReel.duration_minutes}m</span>
                                    </div>
                                </div>

                                {/* Engagement Stats */}
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                                    <button className="flex flex-col items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        <span className="text-white font-semibold text-sm">{(selectedReel.likes / 1000).toFixed(1)}K</span>
                                    </button>

                                    <button className="flex flex-col items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        <span className="text-white font-semibold text-sm">{(selectedReel.comments / 100).toFixed(0)}K</span>
                                    </button>

                                    <button className="flex flex-col items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.589 12.17 10 11.25 10 10c0-1.657-.895-3-2-3s-2 1.343-2 3 .895 3 2 3c.464 0 .909-.089 1.316-.26m5.368 9.921h7m0 0a2 2 0 110-4h-8.5a1 1 0 110-2H20a2 2 0 110 4m-6.5-9h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-white font-semibold text-sm">Share</span>
                                    </button>
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-gray-700">
                                    <button 
                                        onClick={navigateToPreviousReel}
                                        disabled={selectedReelIndex === 0}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0L5 14m7-7v12" />
                                        </svg>
                                        Previous
                                    </button>
                                    <button 
                                        onClick={navigateToNextReel}
                                        disabled={selectedReelIndex === (activeTab === 'all' ? feedData.length - 1 : filteredReels.length - 1)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
                                    >
                                        Next
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7 7m0 0l7-7m-7 7V3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
