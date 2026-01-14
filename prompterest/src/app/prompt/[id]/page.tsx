import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CopyButton from '@/components/copy-button'
import { ArrowLeft } from 'lucide-react'
import RatingStars from '@/components/rating-stars'
import CommentSection from '@/components/comment-section'
import PromptActions from '@/components/prompt-actions'

export default async function PromptDetail({ params }: { params: { id: string } }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: prompt, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !prompt) {
        notFound()
    }

    const { data: stats } = await supabase
        .from('ratings')
        .select('value')
        .eq('prompt_id', id)

    const ratingCount = stats?.length || 0
    const ratingAvg = ratingCount > 0
        ? stats!.reduce((acc, curr) => acc + curr.value, 0) / ratingCount
        : 0

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to feed
            </Link>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative flex items-start justify-center p-6 md:p-12 bg-white">
                        <img
                            src={prompt.image_url || 'https://via.placeholder.com/600x600'}
                            alt={prompt.title}
                            className="rounded-2xl shadow-lg w-full h-auto object-contain max-h-[85vh] sticky top-8"
                        />
                    </div>

                    <div className="p-8 md:p-12 flex flex-col h-full">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">AI Prompt</span>
                                </div>
                                {/* Edit/Delete Actions */}
                                <PromptActions promptId={prompt.id} promptCreatorId={prompt.user_id} />
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{prompt.title}</h1>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {prompt.description || "No description provided."}
                            </p>

                            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">The Prompt</span>
                                    <CopyButton text={prompt.prompt_text} className="text-xs py-1 px-3 h-8" />
                                </div>
                                <p className="font-mono text-sm text-gray-700 whitespace-pre-wrap break-words">
                                    {prompt.prompt_text}
                                </p>
                            </div>

                            <div className="py-6 border-t border-gray-100 mb-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Rate this Prompt</h3>
                                <RatingStars promptId={prompt.id} initialRating={ratingAvg} initialCount={ratingCount} />
                            </div>

                            <CommentSection promptId={prompt.id} />

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
