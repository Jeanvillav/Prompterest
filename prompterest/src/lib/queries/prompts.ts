import { SupabaseClient } from '@supabase/supabase-js'

export interface PromptWithSave {
    id: string
    title: string
    description: string | null
    media_url: string | null
    media_type: 'image' | 'video' | 'none'
    ai_models?: string[]
    blur_hash: string | null
    user_id: string
    created_at: string
    is_saved?: boolean
    profiles?: {
        username: string
        avatar_url: string | null
    }
}

export async function getPrompts(
    supabase: SupabaseClient,
    params: {
        query?: string
        categorySlug?: string
        page?: number
        pageSize?: number
        userId?: string
    }
) {
    const { query, categorySlug, page = 0, pageSize = 10, userId } = params
    const from = page * pageSize
    const to = from + pageSize - 1

    let dbQuery = supabase
        .from('prompts')
        .select(`
            *,
            profiles(username, avatar_url),
            saved_prompts(user_id)
        `)
        .order('created_at', { ascending: false })
        .range(from, to)

    if (categorySlug) {
        const { data: cat } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single()

        if (cat) {
            dbQuery = dbQuery.eq('category_id', cat.id)
        }
    }

    if (query && query.trim()) {
        // Use Full-Text Search
        dbQuery = dbQuery.textSearch('search_vector', query.trim(), {
            config: 'spanish',
            type: 'websearch'
        })
    }

    const { data, error } = await dbQuery

    if (error) {
        console.error('Error fetching prompts:', error)
        throw error
    }

    // Transform to include is_saved
    const prompts = (data as any[]).map((p) => ({
        ...p,
        is_saved: userId ? p.saved_prompts?.length > 0 : false
    }))

    return prompts as PromptWithSave[]
}

export async function getUserSavedPrompts(
    supabase: SupabaseClient,
    username: string
) {
    // 1. Get profile ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()

    if (!profile) return []

    // 2. Get saved prompts
    const { data, error } = await supabase
        .from('saved_prompts')
        .select(`
            prompt_id,
            prompts(
                *,
                profiles(username, avatar_url),
                saved_prompts(user_id)
            )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching saved prompts:', error)
        return []
    }

    // Transform and flatten
    return data.map((item: any) => ({
        ...item.prompts,
        is_saved: true // Since it's from saved_prompts table, it's saved
    })) as PromptWithSave[]
}
