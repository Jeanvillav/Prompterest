import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PromptCard from '@/components/prompt-card'
import { getUserSavedPrompts } from '@/lib/queries/prompts'
import ProfileAvatar from '@/components/profile-avatar'

interface ProfilePageProps {
    params: Promise<{ username: string }>
    searchParams: Promise<{ tab?: string }>
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
    const { username } = await params
    const { tab } = await searchParams
    const isSavedTab = tab === 'saved'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Fetch Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

    if (profileError || !profile) {
        notFound()
    }

    const isOwner = user?.id === profile.id

    // 2. Fetch Data according to tab
    let prompts = []
    if (isSavedTab) {
        prompts = await getUserSavedPrompts(supabase, username)
    } else {
        const { data } = await supabase
            .from('prompts')
            .select('*, saved_prompts(user_id)')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })

        prompts = (data || []).map(p => ({
            ...p,
            is_saved: user?.id ? p.saved_prompts?.length > 0 : false
        }))
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Profile Header */}
            <div className="flex flex-col items-center mb-12 text-center">
                <ProfileAvatar
                    profileId={profile.id}
                    username={profile.username}
                    avatarUrl={profile.avatar_url}
                    isOwner={isOwner}
                />

                <h1 className="text-3xl font-extrabold text-gray-900">
                    @{profile.username}
                </h1>
                {profile.full_name && (
                    <p className="text-gray-600 font-medium mt-1">{profile.full_name}</p>
                )}
                {profile.bio && (
                    <p className="max-w-md text-gray-500 mt-4 leading-relaxed">
                        {profile.bio}
                    </p>
                )}

                <div className="flex items-center gap-6 mt-6">
                    <div className="text-center">
                        <span className="block text-xl font-bold text-gray-900">{prompts?.length || 0}</span>
                        <span className="text-sm text-gray-500">{isSavedTab ? 'Guardados' : 'Prompts'}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center border-b border-gray-100 mb-8">
                <Link
                    href={`/profile/${username}`}
                    className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${!isSavedTab
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Mis Prompts
                </Link>
                <Link
                    href={`/profile/${username}?tab=saved`}
                    className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${isSavedTab
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Guardados
                </Link>
            </div>

            {/* User Prompts Grid */}
            <div className="pt-4">
                {prompts && prompts.length > 0 ? (
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                        {prompts.map((prompt: any) => (
                            <PromptCard key={prompt.id} prompt={prompt} userId={user?.id} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="text-5xl mb-4 text-gray-300">
                            {isSavedTab ? '🔖' : '🎨'}
                        </div>
                        <h3 className="text-lg font-bold text-gray-600">
                            {isSavedTab ? 'Aún no has guardado ningún prompt.' : 'Este perfil aún no tiene prompts.'}
                        </h3>
                        {!isSavedTab && <p className="text-gray-400 mt-1">¡Vuelve pronto para ver sus creaciones!</p>}
                    </div>
                )}
            </div>
        </div>
    )
}
