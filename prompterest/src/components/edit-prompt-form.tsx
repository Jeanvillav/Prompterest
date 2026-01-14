'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Define prompt interface here to avoid import circles or extensive type files for MVP
interface Prompt {
    id: string
    title: string
    description: string | null
    prompt_text: string
}

export default function EditPromptForm({ prompt }: { prompt: Prompt }) {
    const [title, setTitle] = useState(prompt.title)
    const [description, setDescription] = useState(prompt.description || '')
    const [promptText, setPromptText] = useState(prompt.prompt_text)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: updateError } = await supabase
                .from('prompts')
                .update({
                    title,
                    description,
                    prompt_text: promptText,
                })
                .eq('id', prompt.id)

            if (updateError) throw updateError

            // Success
            router.refresh()
            router.push(`/prompt/${prompt.id}`)

        } catch (err: any) {
            console.error('Error updating prompt:', err)
            setError(err.message || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {/* Inputs */}
            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-bold text-gray-900">Title</label>
                    <input
                        type="text"
                        id="title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-lg border px-3 py-2 text-gray-900 placeholder:text-gray-500"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-bold text-gray-900">Description</label>
                    <textarea
                        id="description"
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border px-3 py-2 text-gray-900 placeholder:text-gray-500"
                    />
                </div>

                <div>
                    <label htmlFor="prompt" className="block text-sm font-bold text-gray-900">Prompt</label>
                    <textarea
                        id="prompt"
                        required
                        rows={4}
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 font-mono text-sm bg-gray-50 border px-3 py-2 text-gray-900 placeholder:text-gray-500"
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-md bg-red-50 text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all shadow-md"
                >
                    {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                    Save Changes
                </button>
            </div>
        </form>
    )
}
