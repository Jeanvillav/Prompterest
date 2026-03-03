'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SaveButtonProps {
    promptId: string
    initialSaved: boolean
    userId: string | null
}

export default function SaveButton({ promptId, initialSaved, userId }: SaveButtonProps) {
    const [isSaved, setIsSaved] = useState(initialSaved)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const supabase = createClient()

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!userId) {
            router.push('/login')
            return
        }

        // Optimistic UI Update
        const nextState = !isSaved
        setIsSaved(nextState)

        startTransition(async () => {
            if (nextState) {
                // Insert bookmark
                const { error } = await supabase
                    .from('saved_prompts')
                    .insert({ user_id: userId, prompt_id: promptId })

                if (error) {
                    console.error('Error saving prompt:', error)
                    setIsSaved(isSaved) // Revert
                }
            } else {
                // Delete bookmark
                const { error } = await supabase
                    .from('saved_prompts')
                    .delete()
                    .match({ user_id: userId, prompt_id: promptId })

                if (error) {
                    console.error('Error unsaving prompt:', error)
                    setIsSaved(isSaved) // Revert
                }
            }
            router.refresh()
        })
    }

    return (
        <button
            onClick={handleSave}
            disabled={isPending}
            className={`p-2 rounded-full transition-all duration-200 shadow-md ${isSaved
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-white/90 text-gray-900 hover:bg-white'
                }`}
            title={isSaved ? 'Quitar de guardados' : 'Guardar prompt'}
        >
            <Bookmark
                size={20}
                className={`${isSaved ? 'fill-current' : ''} ${isPending ? 'opacity-50' : ''}`}
            />
        </button>
    )
}
