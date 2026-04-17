'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation' // 1. Import the router

interface ContentItem {
    id: string
    title: string
    type: 'food' | 'story' | 'music'
    created_at: string
    description?: string
}

export default function ContentTestPage() {
    const [items, setItems] = useState<ContentItem[]>([])
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState('')
    const router = useRouter() // 2. Initialize router

    const fetchAllContent = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/creator/content')
            const data = await res.json()
            if (res.ok) setItems(data)
            else setStatus('Error fetching content')
        } catch (err) {
            setStatus('Failed to connect to API')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAllContent() }, [])

    // 3. Navigation handler for the Single Manage Page
    const handleManageNavigation = (id: string, type: string) => {
        const category = type === 'story' ? 'stories' : type
        // This assumes your manage page is at /creator/manage
        router.push(`/backendTestForms/creatorManagestnt?id=${id}&category=${category}`)
    }

    const handleDelete = async (id: string, category: string) => {
        if (!confirm('Are you sure?')) return
        try {
            const res = await fetch(`/api/content/${id}?category=${category}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                setStatus('Item deleted!')
                setItems(items.filter(item => item.id !== id))
            }
        } catch (err) {
            setStatus('Delete failed')
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-8 text-slate-900">
            <header className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Content Manager</h1>
                    <p className="text-slate-500">Select an item to manage details</p>
                </div>
                <button
                    onClick={fetchAllContent}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-bold hover:bg-blue-700 transition"
                >
                    Refresh List
                </button>
            </header>

            {status && (
                <div className="mb-6 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md text-center font-medium">
                    {status}
                </div>
            )}

            {loading ? (
                <div className="text-center py-20 text-slate-400 font-medium animate-pulse">Loading your content...</div>
            ) : (
                <div className="grid gap-4">
                    {items.length === 0 && (
                        <div className="text-center py-10 bg-slate-50 border-2 border-dashed rounded-xl text-slate-400">
                            No content found.
                        </div>
                    )}

                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-blue-300 transition-all flex items-center justify-between group"
                        >
                            {/* 4. Clickable area for the whole item body */}
                            <div
                                className="cursor-pointer flex-1"
                                onClick={() => handleManageNavigation(item.id, item.type)}
                            >
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${item.type === 'food' ? 'bg-orange-100 text-orange-700' :
                                            item.type === 'music' ? 'bg-purple-100 text-purple-700' :
                                                'bg-emerald-100 text-emerald-700'
                                        }`}>
                                        {item.type}
                                    </span>
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                                        {item.title || "Untitled Item"}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-400 font-mono">ID: {item.id}</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleManageNavigation(item.id, item.type)}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-bold hover:bg-slate-700 transition"
                                >
                                    Manage
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevents navigation when clicking delete
                                        handleDelete(item.id, item.type === 'story' ? 'stories' : item.type)
                                    }}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-md text-sm font-bold hover:bg-red-100 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}