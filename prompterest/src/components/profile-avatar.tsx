'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Pencil } from 'lucide-react'
import EditAvatarModal from './edit-avatar-modal'

interface ProfileAvatarProps {
    profileId: string
    username: string
    avatarUrl: string | null
    isOwner: boolean
}

export default function ProfileAvatar({ profileId, username, avatarUrl, isOwner }: ProfileAvatarProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    const displayAvatar = avatarUrl || defaultAvatar

    return (
        <>
            <div className="relative w-32 h-32 rounded-full mb-4">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg relative bg-gray-100">
                    <Image
                        src={displayAvatar}
                        alt={username}
                        fill
                        priority={true}
                        className="object-cover"
                    />
                </div>

                {isOwner && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow-lg transition-transform hover:scale-105 z-10"
                        title="Editar Avatar"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
            </div>

            <EditAvatarModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
