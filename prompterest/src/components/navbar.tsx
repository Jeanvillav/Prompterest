'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
// import { Button } from '@/components/ui/button' // Removed placeholder
import { User } from '@supabase/supabase-js'

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session) {
                    setUser(session.user)
                } else {
                    setUser(null)
                }
            }
        )

        return () => {
            subscription.unsubscribe()
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
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link href="/" className="text-xl font-bold text-red-600 tracking-tight flex items-center gap-1">
                            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-serif">P</div>
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
                                className="w-full bg-gray-100 group-focus-within:bg-white rounded-full py-2 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900 placeholder:text-gray-500 font-medium"
                            />
                            <button
                                onClick={(e) => {
                                    // Simple way to get sibling input value if we don't want to control state fully for perf
                                    // or just bind to a ref. Let's use a simpler controlled approach or ref if needed.
                                    // For MVP, simplest is let input filter, but here we want the button to trigger.
                                    // We will just grab value from previous sibling or use query selector.
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                    handleSearch(input.value)
                                }}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 group-focus-within:text-red-500 text-gray-500 hover:text-red-600 transition-colors"
                            >
                                🔍
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link href="/submit" className="text-gray-700 font-medium hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
                                    Create
                                </Link>
                                <div className="h-8 w-8 bg-gray-200 rounded-full overflow-hidden border">
                                    {/* Placeholder Avatar */}
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" />
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="text-sm text-gray-500 hover:text-gray-900"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-full font-bold transition-all text-sm">
                                    Log in
                                </Link>
                                <Link href="/register" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-all text-sm">
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
