import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageSquare } from 'lucide-react'
import SaveButton from './save-button'

// Define the type here or in a types file.
// For velocity, keeping it closer.
export interface Prompt {
    id: string
    title: string
    image_url: string | null
    blur_hash?: string | null
    user_id: string
    is_saved?: boolean
    // Extend as we implement joins for ratings/avatars
}

interface PromptCardProps {
    prompt: Prompt
    userId?: string | null
}

export default function PromptCard({ prompt, userId = null }: PromptCardProps) {
    const imageUrl = prompt.image_url || 'https://via.placeholder.com/400x600?text=No+Image'

    return (
        <div className="break-inside-avoid mb-6 relative group">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm transition-all duration-300">
                <Link href={`/prompt/${prompt.id}`}>
                    <div className="relative cursor-zoom-in">
                        {/* Image */}
                        <Image
                            src={imageUrl}
                            alt={prompt.title}
                            width={500}
                            height={750}
                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                        {/* Overlay (Hover) */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                </Link>

                {/* Save Button */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <SaveButton
                        promptId={prompt.id}
                        initialSaved={!!prompt.is_saved}
                        userId={userId}
                    />
                </div>

                {/* Quick Action Button (Placeholder) */}
                <button className="absolute bottom-3 right-3 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700 shadow-lg z-10">
                    Open
                </button>
            </div>

            {/* Meta Info */}
            <h3 className="mt-2 text-sm font-semibold text-gray-900 truncate pr-2 px-1">
                {prompt.title}
            </h3>
        </div>
    )
}

