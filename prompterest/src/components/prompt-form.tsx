'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, Video, FileText, Loader2 } from 'lucide-react'
import { COMMUNITY_MAP } from '@/lib/constants/communities'

const AI_MODELS = [
    'ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'Stable Diffusion',
    'Taskade', 'Feedough AI', 'PromptGen', 'HIX AI', 'FlowGPT',
    'PromptLayer', 'LangChain', 'Perplexity'
];

export default function PromptForm() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [promptText, setPromptText] = useState('')
    const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('image')
    const [mediaFile, setMediaFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
    const [categoryId, setCategoryId] = useState('')
    const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)
    const [aiModels, setAiModels] = useState<string[]>(['ChatGPT'])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('id, name').order('name')
            if (data) setCategories(data)
        }
        fetchCategories()
    }, [supabase])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null)
        const file = e.target.files?.[0]
        if (!file) return

        if (mediaType === 'image') {
            if (file.size > 5 * 1024 * 1024) {
                setError('Error: La imagen supera los 5MB permitidos.')
                return
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                setError('Error: Formato de imagen no válido. Usa JPG, PNG o WebP.')
                return
            }
            setMediaFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        } else if (mediaType === 'video') {
            if (file.size > 15 * 1024 * 1024) {
                setError('Error: El video supera los 15MB permitidos.')
                return
            }
            if (!['video/mp4', 'video/webm'].includes(file.type)) {
                setError('Error: Formato de video no válido. Usa MP4 o WebM.')
                return
            }

            // Validar duración
            const videoElement = document.createElement('video')
            videoElement.preload = 'metadata'
            videoElement.onloadedmetadata = function () {
                window.URL.revokeObjectURL(videoElement.src)
                if (videoElement.duration > 30) {
                    setError(`Error: El video dura ${Math.round(videoElement.duration)} segundos. El límite es 30 segundos.`)
                    setMediaFile(null)
                    setPreviewUrl(null)
                } else {
                    setMediaFile(file)
                    setPreviewUrl(URL.createObjectURL(file))
                }
            }
            videoElement.src = URL.createObjectURL(file)
        }
    }

    const toggleAiModel = (model: string) => {
        setAiModels(prev => {
            if (prev.includes(model)) {
                return prev.filter(m => m !== model)
            }
            if (prev.length >= 5) {
                setError('Error: Puedes seleccionar un máximo de 5 modelos de IA.')
                return prev
            }
            setError(null)
            return [...prev, model]
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (mediaType !== 'none' && !mediaFile) {
            setError(`Por favor sube un archivo de tipo ${mediaType === 'image' ? 'imagen' : 'video'}.`)
            setLoading(false)
            return
        }
        if (!categoryId) {
            setError('Por favor selecciona una categoría.')
            setLoading(false)
            return
        }
        if (aiModels.length === 0) {
            setError('Por favor selecciona al menos un modelo de IA.')
            setLoading(false)
            return
        }

        const finalDescription = selectedCommunity
            ? `${description}\n\n#${selectedCommunity}`
            : description;

        try {
            // 1. Check User
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('You must be logged in.')

            let publicUrl = null

            // 2 & 3. Upload File if needed
            if (mediaType !== 'none' && mediaFile) {
                const fileExt = mediaFile.name.split('.').pop()
                const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('prompt-images')
                    .upload(filePath, mediaFile)

                if (uploadError) throw uploadError

                const { data } = supabase.storage
                    .from('prompt-images')
                    .getPublicUrl(filePath)

                publicUrl = data.publicUrl
            }

            // 4. Insert Data
            const { error: insertError } = await supabase
                .from('prompts')
                .insert({
                    title,
                    description: finalDescription,
                    prompt_text: promptText,
                    media_url: publicUrl,
                    media_type: mediaType,
                    user_id: user.id,
                    category_id: categoryId,
                    ai_models: aiModels
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

            {/* Tipo de Medio */}
            <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-900">Tipo de Contenido</label>
                <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => { setMediaType('image'); setMediaFile(null); setPreviewUrl(null); }} className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-medium transition-all ${mediaType === 'image' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <ImageIcon className="w-5 h-5" /> Imagen
                    </button>
                    <button type="button" onClick={() => { setMediaType('video'); setMediaFile(null); setPreviewUrl(null); }} className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-medium transition-all ${mediaType === 'video' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <Video className="w-5 h-5" /> Video
                    </button>
                    <button type="button" onClick={() => { setMediaType('none'); setMediaFile(null); setPreviewUrl(null); }} className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-medium transition-all ${mediaType === 'none' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <FileText className="w-5 h-5" /> Solo Texto
                    </button>
                </div>
            </div>

            {/* Upload Area */}
            {mediaType !== 'none' && (
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-900">Archivo Adjunto</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center w-full h-80 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${previewUrl ? 'border-transparent bg-gray-50' : 'border-gray-300 hover:bg-gray-50 bg-white'}`}
                    >
                        {previewUrl ? (
                            mediaType === 'image' ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                            ) : (
                                <video src={previewUrl} className="w-full h-full object-contain rounded-xl" controls />
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                                {mediaType === 'image' ? <ImageIcon className="w-12 h-12 mb-3" /> : <Video className="w-12 h-12 mb-3" />}
                                <p className="text-sm font-medium mb-1">Haz clic para subir {mediaType === 'image' ? 'una imagen' : 'un video'}</p>
                                <p className="text-xs text-gray-500 text-center px-4">
                                    {mediaType === 'image' ? 'JPG, PNG, WebP. Máximo 5MB.' : 'MP4, WebM. Máximo 15MB y duración menor a 30s.'}
                                </p>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept={mediaType === 'image' ? 'image/jpeg, image/png, image/webp' : 'video/mp4, video/webm'}
                            className="hidden"
                        />
                    </div>
                </div>
            )}

            {/* Inputs */}
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-900">Modelos de IA (hasta 5)</label>
                    <div className="flex flex-wrap gap-2">
                        {AI_MODELS.map(model => {
                            const isSelected = aiModels.includes(model)
                            return (
                                <button
                                    key={model}
                                    type="button"
                                    onClick={() => toggleAiModel(model)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isSelected
                                        ? 'bg-gray-900 text-white border border-gray-900 shadow-sm'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                        }`}
                                >
                                    {model}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-gray-900">Title</label>
                        <input
                            type="text"
                            id="title"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-base border px-3 py-2 text-gray-900 placeholder:text-gray-500"
                            placeholder="e.g., Cyberpunk Cityscape"
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-bold text-gray-900">Category</label>
                        <select
                            id="category"
                            required
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value)
                                setSelectedCommunity(null)
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-base border px-3 py-2 text-gray-900 bg-white"
                        >
                            <option value="" disabled>Select a category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {categoryId && (() => {
                    const selectedCatName = categories.find(c => c.id === categoryId)?.name;
                    const availableCommunities = selectedCatName ? COMMUNITY_MAP[selectedCatName] : null;

                    if (availableCommunities && availableCommunities.length > 0) {
                        return (
                            <div className="space-y-3 bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-inner">
                                <label className="block text-sm font-bold text-gray-900">Selecciona una Comunidad (Opcional)</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableCommunities.map(c => {
                                        const isSelected = selectedCommunity === c.slug;
                                        return (
                                            <button
                                                key={c.slug}
                                                type="button"
                                                onClick={() => setSelectedCommunity(isSelected ? null : c.slug)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium object-transparent transition-all ${isSelected
                                                    ? 'bg-gray-900 text-white shadow-md scale-105 transform border border-transparent'
                                                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400'
                                                    }`}
                                            >
                                                {c.name}
                                            </button>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-gray-500 mt-2 font-medium">
                                    Añadirá automáticamente {selectedCommunity ? <span className="font-bold text-indigo-600">#{selectedCommunity}</span> : 'el hashtag'} a tu descripción para dar visibilidad a tu prompt en la página de inicio.
                                </p>
                            </div>
                        )
                    }
                    return null;
                })()}

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
