'use client'

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import PromptCard, { Prompt } from './prompt-card'
import { createClient } from '@/lib/supabase/client'
import { getPrompts } from '@/lib/queries/prompts'

interface PromptFeedProps {
    initialPrompts: Prompt[]
    searchQuery?: string
    categorySlug?: string
    userId?: string | null
}

export default function PromptFeed({ initialPrompts, searchQuery, categorySlug, userId = null }: PromptFeedProps) {
    const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const { ref, inView } = useInView()
    const supabase = createClient()

    const loadMorePrompts = async () => {
        if (loading || !hasMore) return
        setLoading(true)

        try {
            const data = await getPrompts(supabase, {
                query: searchQuery,
                categorySlug,
                page,
                pageSize: 10,
                userId: userId || undefined
            })

            if (data && data.length > 0) {
                setPrompts((prev) => [...prev, ...data])
                setPage((prev) => prev + 1)
                if (data.length < 10) {
                    setHasMore(false)
                }
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error('Error fetching more prompts:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (inView && hasMore) {
            loadMorePrompts()
        }
    }, [inView, hasMore])

    // Reset when searchQuery or categorySlug changes
    useEffect(() => {
        setPrompts(initialPrompts)
        setPage(1)
        setHasMore(true)
    }, [searchQuery, categorySlug, initialPrompts])

    return (
        <div className="w-full">
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
                {prompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} userId={userId} />
                ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={ref} className="flex justify-center mt-12 mb-8">
                {loading && (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                )}
                {!hasMore && prompts.length > 0 && (
                    <p className="text-gray-500 font-medium italic">Has llegado al final 🎉</p>
                )}
            </div>
        </div>
    )
}
