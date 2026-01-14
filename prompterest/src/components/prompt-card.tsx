import Link from 'next/link'
import { Heart, MessageSquare } from 'lucide-react'

// Define the type here or in a types file.
// For velocity, keeping it closer.
export interface Prompt {
    id: string
    title: string
    image_url: string | null
    user_id: string
    // Extend as we implement joins for ratings/avatars
}

export default function PromptCard({ prompt }: { prompt: Prompt }) {
    return (
        <div className="break-inside-avoid mb-6 relative group">
            <Link href={`/prompt/${prompt.id}`}>
                <div className="relative rounded-2xl overflow-hidden cursor-zoom-in">
                    {/* Image */}
                    <img
                        src={prompt.image_url || 'https://via.placeholder.com/400x600?text=No+Image'}
                        alt={prompt.title}
                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                    {/* Overlay (Hover) */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                    {/* Save Button (Placeholder) */}
                    <button className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700">
                        Open
                    </button>
                </div>
            </Link>

            {/* Meta Info */}
            <h3 className="mt-2 text-sm font-semibold text-gray-900 truncate pr-2">
                {prompt.title}
            </h3>
            {/* 
      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
          <span>By User...</span>
      </div>
      */}
        </div>
    )
}
