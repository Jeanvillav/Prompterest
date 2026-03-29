import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageSquare } from 'lucide-react'
import SaveButton from './save-button'

// Extender el tipo Prompt dinámicamente para los fallbacks
export interface Prompt {
    id: string
    title: string
    media_url: string | null
    media_type?: 'image' | 'video' | 'none'
    blur_hash?: string | null
    user_id: string
    is_saved?: boolean
    ai_models?: string[]
    categories?: { name: string }
    category?: { name: string }
    prompt_text?: string
    description?: string
    rating?: number
    comments_count?: number
}

interface PromptCardProps {
    prompt: Prompt
    userId?: string | null
}

export default function PromptCard({ prompt, userId = null }: PromptCardProps) {
    const mediaUrl = prompt.media_url || 'https://via.placeholder.com/400x600?text=No+Media'
    const modelLabel = prompt.ai_models && prompt.ai_models.length > 0 ? prompt.ai_models[0] : 'Midjourney'
    const categoryLabel = prompt.categories?.name || prompt.category?.name || 'DESIGN'
    const textPreview = prompt.prompt_text || prompt.description || '/imagine prompt: Futuristic cyberpunk city with neon lights and flying cars, cinematic lighting, 8k, highly detailed'

    return (
        <div className="break-inside-avoid mb-6 relative group">
            <div className="flex flex-col bg-[#1a1a1a] rounded-[16px] overflow-hidden shadow-sm border border-[#2a2a2a] hover:border-[#404040] transition-colors duration-300">
                {/* Cabecera / Media Expandida */}
                <div className="relative">
                    <Link href={`/prompt/${prompt.id}`}>
                        <div className="relative cursor-zoom-in group-hover:opacity-90 transition-opacity">
                            {/* Media */}
                            {prompt.media_type === 'video' ? (
                                <video
                                    src={mediaUrl}
                                    className="w-full h-auto object-cover"
                                    autoPlay muted loop playsInline
                                />
                            ) : prompt.media_type === 'none' ? (
                                <div className="w-full h-32 bg-[#222222] flex items-center justify-center p-6 text-center border-b border-[#333333]">
                                    <MessageSquare className="w-8 h-8 text-gray-600" />
                                </div>
                            ) : (
                                <Image
                                    src={mediaUrl}
                                    alt={prompt.title}
                                    width={400}
                                    height={600}
                                    className="w-full h-auto object-cover"
                                    loading="lazy"
                                />
                            )}
                        </div>
                    </Link>

                    {/* Capa de Interacciones (Flotante Segura) */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 flex flex-col justify-between p-3">
                        <div className="flex justify-end pointer-events-auto">
                            <SaveButton
                                promptId={prompt.id}
                                initialSaved={!!prompt.is_saved}
                                userId={userId}
                            />
                        </div>
                        <div className="flex justify-end pointer-events-auto mt-auto">
                            <Link href={`/prompt/${prompt.id}`} className="bg-[#e60023] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#ad081b] shadow-lg transition-transform hover:scale-105">
                                Open
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Cuerpo y Metadatos de la Tarjeta */}
                <div className="p-4 flex flex-col gap-2.5">
                    {/* Header: Modelo y Categoría */}
                    <div className="flex justify-between items-center px-0.5">
                        <span className="text-[11px] font-semibold text-gray-300 bg-gray-800/60 px-2 py-0.5 rounded-md">
                            {modelLabel}
                        </span>
                        <span className="text-[10px] font-bold tracking-widest text-[#a3a3a3] uppercase">
                            {categoryLabel}
                        </span>
                    </div>

                    {/* Título Principal */}
                    <Link href={`/prompt/${prompt.id}`} className="hover:text-gray-300 transition-colors">
                        <h3 className="text-[15px] font-bold text-white leading-snug px-0.5 mt-0.5">
                            {prompt.title}
                        </h3>
                    </Link>

                    {/* Snippet / Monospace Preview */}
                    <p className="text-[11px] text-gray-400 font-mono line-clamp-2 md:line-clamp-3 leading-relaxed bg-[#111111] p-2 rounded-lg border border-[#222222]">
                        {textPreview}
                    </p>

                    {/* Footer / Insights */}
                    <div className="mt-2 pt-3 border-t border-[#2a2a2a] flex items-center justify-between text-gray-400 text-xs font-medium px-1">
                        <div className="flex items-center gap-4">
                            {prompt.rating !== undefined && prompt.rating > 0 && (
                                <div className="flex items-center gap-1 hover:text-yellow-500 transition-colors cursor-pointer group/rating">
                                    <span className="group-hover/rating:scale-110 transition-transform">⭐</span>
                                    <span>{prompt.rating.toFixed(1)}</span>
                                </div>
                            )}
                            {prompt.comments_count !== undefined && prompt.comments_count > 0 && (
                                <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{prompt.comments_count}</span>
                                </div>
                            )}
                        </div>
                        <button className="text-gray-500 hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-800">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
