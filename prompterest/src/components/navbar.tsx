'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
// import { Button } from '@/components/ui/button' // Removed placeholder
import { User } from '@supabase/supabase-js'

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<any>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchProfile = async (userId: string) => {
            const { data } = await supabase.from('profiles').select('username, avatar_url').eq('id', userId).single()
            setProfile(data)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session) {
                    setUser(session.user)
                    fetchProfile(session.user.id)
                } else {
                    setUser(null)
                    setProfile(null)
                }
            }
        )

        // Escuchar cambios de avatar desde otros componentes
        const handleAvatarUpdate = () => {
            supabase.auth.getUser().then(({ data }) => {
                if (data.user) {
                    fetchProfile(data.user.id)
                }
            })
        }
        window.addEventListener('avatar-updated', handleAvatarUpdate)

        return () => {
            subscription.unsubscribe()
            window.removeEventListener('avatar-updated', handleAvatarUpdate)
        }
    }, [supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }


    // Add helper function inside component or use generic logic
    const handleSearch = (term: string) => {
        if (term.trim()) router.push(`/?q=${encodeURIComponent(term.trim())}`)
        else router.push('/')
    }

    return (
        <nav className="border-b border-[#1f1f1f] bg-[#0d0d0d] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#e60023] rounded-full flex items-center justify-center text-white text-base font-bold font-serif shadow-sm">P</div>
                            Prompterest
                        </Link>
                    </div>

                    <div className="flex-1 max-w-lg mx-8 hidden md:block">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search prompts..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(e.currentTarget.value)
                                    }
                                }}
                                className="w-full bg-[#1a1a1a] hover:bg-[#222222] focus:bg-[#222222] rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:ring-0 transition-all text-gray-200 placeholder:text-gray-500 font-medium border-none"
                            />
                            <button
                                onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                    handleSearch(input.value)
                                }}
                                className="absolute inset-y-0 right-0 flex items-center pr-4 group-focus-within:text-[#e60023] text-gray-500 hover:text-white transition-colors"
                            >
                                🔍
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link href="/submit" className="text-white font-bold bg-[#e60023] hover:bg-[#ad081b] px-4 py-2 rounded-full transition-colors flex items-center gap-1">
                                    <span className="text-lg leading-none">+</span> Create
                                </Link>
                                <Link
                                    href={`/profile/${profile?.username || user.user_metadata?.username || user.email?.split('@')[0]}`}
                                    className="h-9 w-9 bg-gray-800 rounded-full overflow-hidden border border-gray-700 hover:ring-2 hover:ring-[#e60023] transition-all flexitems-center justify-center shrink-0"
                                >
                                    {/* Avatar Source of Truth */}
                                    <img
                                        src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="text-sm font-semibold text-gray-400 hover:text-white"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="px-5 py-2.5 text-white bg-[#e60023] hover:bg-[#ad081b] rounded-full font-bold transition-all text-sm">
                                    Log in
                                </Link>
                                <Link href="/register" className="px-5 py-2.5 bg-[#efefef] hover:bg-[#e2e2e2] text-gray-900 rounded-full font-bold transition-all text-sm">
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
