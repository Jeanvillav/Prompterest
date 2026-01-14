'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'

// Props: promptId and promptCreatorId to check ownership
export default function PromptActions({ promptId, promptCreatorId }: { promptId: string, promptCreatorId: string }) {
    const [isOwner, setIsOwner] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user && user.id === promptCreatorId) {
                setIsOwner(true)
            }
        }
        checkUser()
    }, [promptCreatorId, supabase])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this prompt? This cannot be undone.")) return

        setDeleting(true)
        const { error } = await supabase
            .from('prompts')
            .delete()
            .eq('id', promptId)

        if (error) {
            alert("Error deleting prompt: " + error.message)
            setDeleting(false)
        } else {
            router.refresh()
            router.push('/')
        }
    }

    const handleEdit = () => {
        // Navigate to edit page (we need to implement this page next)
        router.push(`/prompt/${promptId}/edit`)
    }

    if (!isOwner) return null

    return (
        <div className="flex items-center gap-2 mt-4 md:mt-0">
            <button
                onClick={handleEdit}
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition-colors"
            >
                <Pencil className="w-4 h-4" />
                Edit
            </button>
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-full transition-colors disabled:opacity-50"
            >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete'}
            </button>
        </div>
    )
}
