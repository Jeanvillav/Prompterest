'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingProps {
    promptId: string
    initialRating: number | null
    initialCount: number
}

export default function RatingStars({ promptId, initialRating, initialCount }: RatingProps) {
    const [rating, setRating] = useState<number | null>(initialRating)
    const [hoverRating, setHoverRating] = useState<number | null>(null)
    const [count, setCount] = useState(initialCount)
    const [userRating, setUserRating] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)

    const supabase = createClient()

    // Fetch user's existing rating on mount
    useEffect(() => {
        async function fetchUserRating() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('ratings')
                .select('value')
                .eq('prompt_id', promptId)
                .eq('user_id', user.id)
                .single()

            if (data) {
                setUserRating(data.value)
            }
        }
        fetchUserRating()
    }, [promptId, supabase])

    const handleRate = async (value: number) => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert("Please login to rate!")
                return
            }

            // Optimistic UI update could be complex with count averages, 
            // so we just upsert and maybe refetch stats or just rely on simple logic.

            const { error } = await supabase
                .from('ratings')
                .upsert({
                    prompt_id: promptId,
                    user_id: user.id,
                    value: value
                }, { onConflict: 'prompt_id, user_id' })

            if (error) throw error

            setUserRating(value)
            // Ideally we would invalidate queries or fetch new average here.
            // For MVP, we just show the user's rating is set.

        } catch (error) {
            console.error(error)
            alert('Failed to rate')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        disabled={loading}
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="focus:outline-none transition-transform hover:scale-110"
                    >
                        <Star
                            className={cn(
                                "w-6 h-6",
                                (hoverRating !== null ? star <= hoverRating : (userRating !== null ? star <= userRating : false))
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                            )}
                        />
                    </button>
                ))}
            </div>
            <div className="text-xs text-gray-500 font-medium">
                {rating ? `Avg: ${rating.toFixed(1)}` : 'No ratings'} ({count})
            </div>
        </div>
    )
}
