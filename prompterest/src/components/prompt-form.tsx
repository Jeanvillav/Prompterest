'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, Loader2 } from 'lucide-react'

export default function PromptForm() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [promptText, setPromptText] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!imageFile) {
            setError('Please upload an image for your prompt.')
            setLoading(false)
            return
        }

        try {
            // 1. Check User
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('You must be logged in.')

            // 2. Upload Image
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('prompt-images')
                .upload(filePath, imageFile)

            if (uploadError) throw uploadError

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('prompt-images')
                .getPublicUrl(filePath)

            // 4. Insert Data
            const { error: insertError } = await supabase
                .from('prompts')
                .insert({
                    title,
                    description,
                    prompt_text: promptText,
                    image_url: publicUrl,
                    user_id: user.id
                })

            if (insertError) throw insertError

            // Success
            router.refresh()
            router.push('/')

        } catch (err: any) {
            console.error('Error submitting prompt:', err)
            setError(err.message || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {/* Image Upload */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative flex flex-col items-center justify-center w-full h-80 rounded-xl border-2 border-dashed cursor-pointer transition-colors
                        ${previewUrl ? 'border-transparent' : 'border-gray-300 hover:bg-gray-50'}
                    `}
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-xl"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                            <ImageIcon className="w-12 h-12 mb-2" />
                            <p className="text-sm">Click to upload image</p>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            </div>

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
                        placeholder="e.g., Cyberpunk Cityscape"
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
                        placeholder="Tell us about this prompt..."
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
                        placeholder="/imagine prompt: ..."
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-md bg-red-50 text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all shadow-md"
                >
                    {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />}
                    Publish Prompt
                </button>
            </div>
        </form>
    )
}
