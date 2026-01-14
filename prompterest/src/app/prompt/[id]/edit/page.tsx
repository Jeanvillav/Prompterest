import EditPromptForm from '@/components/edit-prompt-form'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export default async function EditPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Prompt
    const { data: prompt } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single()

    if (!prompt) notFound()

    // 2. Check Auth (Double check ownership server-side)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== prompt.user_id) {
        redirect(`/prompt/${id}`)
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Prompt</h1>
            </div>
            <EditPromptForm prompt={prompt} />
        </div>
    )
}
