'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
}

export default function CommentSection({ promptId }: { promptId: string }) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
        fetchComments()
    }, [])

    const fetchComments = async () => {
        const { data } = await supabase
            .from('comments')
            .select('*')
            .eq('prompt_id', promptId)
            .order('created_at', { ascending: false })

        if (data) setComments(data)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || !user) return

        setLoading(true)
        const { error } = await supabase
            .from('comments')
            .insert({
                prompt_id: promptId,
                user_id: user.id,
                content: newComment
            })

        if (!error) {
            setNewComment('')
            fetchComments()
        }
        setLoading(false)
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold mb-6">Comments</h3>

            <div className="space-y-6 mb-8">
                {comments.length === 0 ? (
                    <p className="text-gray-500 italic">No comments yet. Be the first!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 text-xs overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`} alt="Av" />
                            </div>
                            <div className="bg-gray-50 p-4 rounded-r-2xl rounded-bl-2xl">
                                <p className="text-sm font-bold text-gray-900 mb-1">
                                    User {comment.user_id.slice(0, 6)}...
                                </p>
                                <p className="text-gray-900 text-sm font-medium">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {user ? (
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="My Avatar" />
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full border-gray-300 rounded-xl shadow-sm focus:border-red-500 focus:ring-red-500 p-3 text-sm min-h-[80px] text-gray-900 placeholder:text-gray-500 font-medium"
                            placeholder="Share your thoughts..."
                            required
                        />
                        <div className="mt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-red-50 p-4 rounded-xl text-center">
                    <p className="text-red-800 text-sm">Please <a href="/login" className="font-bold underline">log in</a> to comment.</p>
                </div>
            )}
        </div>
    )
}
