'use client'

import React, { useState, useEffect, useCallback } from 'react'

// 1. Define the interface for our content types
interface ContentItem {
    id: string
    title: string
    type: 'food' | 'story' | 'music'
    description?: string
    dish_name?: string    // Specific to food
    languages?: string    // Specific to story
    tags?: string         // Specific to music
    submission_date?: string
    updated_at?: string
}

export default function ManageContentPage() {
    const [items, setItems] = useState<ContentItem[]>([])
    const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [status, setStatus] = useState({ message: '', isError: false })
    const [loading, setLoading] = useState(false)

    // Helper to map UI types to Database table names
    const getCategory = (type: string) => (type === 'story' ? 'stories' : type)

    // 2. Fetch all content (Aggregator)
    const loadItems = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/creator/content')
            if (!res.ok) throw new Error('Failed to load content list')
            const data = (await res.json()) as ContentItem[]
            setItems(data)
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error loading list'
            setStatus({ message: msg, isError: true })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadItems()
    }, [loadItems])

    // 3. Fetch Single Content Detail
    const handleFetchSingle = async (id: string, type: 'food' | 'story' | 'music') => {
        setStatus({ message: 'Fetching details...', isError: false })
        const category = getCategory(type)

        try {
            const res = await fetch(`/api/content/${id}?category=${category}`)
            if (!res.ok) throw new Error('Could not retrieve item details')

            const data = (await res.json()) as ContentItem
            setSelectedItem({ ...data, type }) // Inject type back in for the UI logic
            setIsEditing(true)
            setStatus({ message: 'Loaded.', isError: false })
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Fetch failed'
            setStatus({ message: msg, isError: true })
        }
    }

    // 4. Update Content
    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedItem) return

        setStatus({ message: 'Saving changes...', isError: false })
        const formData = new FormData(e.currentTarget)
        const category = getCategory(selectedItem.type)

        // Convert FormData to object without 'any'
        const formValues = Object.fromEntries(formData.entries())
        const updateBody = {
            ...formValues,
            category
        }

        try {
            const res = await fetch(`/api/content/${selectedItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateBody)
            })

            if (!res.ok) throw new Error('Update failed')

            setStatus({ message: 'Update successful!', isError: false })
            setIsEditing(false)
            await loadItems()
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Update failed'
            setStatus({ message: msg, isError: true })
        }
    }

    // 5. Delete Content
    const handleDelete = async (id: string, type: 'food' | 'story' | 'music') => {
        if (!confirm('Are you sure you want to delete this forever?')) return

        const category = getCategory(type)
        try {
            const res = await fetch(`/api/content/${id}?category=${category}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error('Delete failed')

            setStatus({ message: 'Item deleted.', isError: false })
            setItems(prev => prev.filter(item => item.id !== id))
            if (selectedItem?.id === id) setIsEditing(false)
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Delete failed'
            setStatus({ message: msg, isError: true })
        }
    }

    return (
        <main className="max-w-6xl mx-auto p-6 md:p-12 text-slate-900">
            <header className="mb-10 border-b border-slate-200 pb-6">
                <h1 className="text-4xl font-black tracking-tight text-slate-900">Content Workshop</h1>
                <p className="text-slate-600 mt-2 text-lg">Manage your food recipes, stories, and music tracks.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

                {/* LIST COLUMN */}
                <section className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest text-sm">Your Library</h2>
                        <button onClick={loadItems} className="text-blue-600 font-bold text-sm hover:underline">Refresh</button>
                    </div>

                    {loading ? (
                        <p className="text-slate-400 animate-pulse">Scanning database...</p>
                    ) : (
                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter ${item.type === 'food' ? 'bg-orange-100 text-orange-700' :
                                                item.type === 'music' ? 'bg-indigo-100 text-indigo-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {item.type}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(item.id, item.type)}
                                            className="text-slate-300 hover:text-red-600 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-4">{item.title}</h3>
                                    <button
                                        onClick={() => handleFetchSingle(item.id, item.type)}
                                        className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded uppercase hover:bg-slate-700 transition-all"
                                    >
                                        Edit Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* EDITING COLUMN */}
                <section className="lg:col-span-3">
                    <div className="sticky top-10 p-8 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner min-h-[400px]">
                        {isEditing && selectedItem ? (
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-black text-slate-900">Editing {selectedItem.type}</h2>
                                    <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-900">
                                        ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-slate-500 mb-1">Title</label>
                                        <input
                                            name="title"
                                            defaultValue={selectedItem.title}
                                            className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    {/* Category Specific Fields */}
                                    {selectedItem.type === 'food' && (
                                        <div>
                                            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Dish Name</label>
                                            <input name="dish_name" defaultValue={selectedItem.dish_name} className="w-full p-3 bg-white border border-slate-300 rounded-lg" />
                                        </div>
                                    )}

                                    {selectedItem.type === 'story' && (
                                        <div>
                                            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Available Languages</label>
                                            <input name="languages" defaultValue={selectedItem.languages} className="w-full p-3 bg-white border border-slate-300 rounded-lg" />
                                        </div>
                                    )}

                                    {selectedItem.type === 'music' && (
                                        <div>
                                            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Genre Tags</label>
                                            <input name="tags" defaultValue={selectedItem.tags} className="w-full p-3 bg-white border border-slate-300 rounded-lg" />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-black uppercase text-slate-500 mb-1">Description</label>
                                        <textarea
                                            name="description"
                                            defaultValue={selectedItem.description}
                                            className="w-full p-3 bg-white border border-slate-300 rounded-lg h-32 resize-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                                >
                                    Save Changes
                                </button>
                            </form>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                                <div className="p-4 bg-white rounded-full shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                                <h3 className="text-slate-400 font-bold">Select an item to edit details</h3>
                            </div>
                        )}

                        {status.message && (
                            <div className={`mt-6 p-4 rounded-lg border text-sm font-bold text-center ${status.isError ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 border-blue-200 text-blue-600'
                                }`}>
                                {status.message}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}