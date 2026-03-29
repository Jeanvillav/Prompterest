'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Camera, UploadCloud, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface EditAvatarModalProps {
    isOpen: boolean
    onClose: () => void
}

const PREDEFINED_AVATARS = [
    '/avatars/1.svg',
    '/avatars/2.svg',
    '/avatars/3.svg',
    '/avatars/4.svg',
    '/avatars/5.svg',
    '/avatars/6.svg'
]

export default function EditAvatarModal({ isOpen, onClose }: EditAvatarModalProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Upload refs
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Camera state
    const [isCameraOpen, setIsCameraOpen] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)

    // Detener cámara de forma segura
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
    }

    // Efecto para encender/apagar cámara
    useEffect(() => {
        if (isCameraOpen) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(mediaStream => {
                    setStream(mediaStream)
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream
                    }
                })
                .catch(err => {
                    console.error("Camera error:", err)
                    setError('No se pudo acceder a la cámara. Verifica los permisos.')
                    setIsCameraOpen(false)
                })
        } else {
            stopCamera()
        }

        return () => stopCamera()
    }, [isCameraOpen])

    // Cleanup al cerrar
    useEffect(() => {
        if (!isOpen) {
            setIsCameraOpen(false)
            setError(null)
            setIsSubmitting(false)
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleUpdateProfile = async (avatarUrl: string) => {
        setIsSubmitting(true)
        setError(null)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No estás autenticado.")

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: avatarUrl })
                .eq('id', user.id)

            if (updateError) throw updateError

            router.refresh()
            onClose()
        } catch (err: any) {
            setError(err.message || 'Error al actualizar perfil')
            setIsSubmitting(false)
        }
    }

    // TAREA 1: Prediseñados
    const handlePredefinedClick = async (url: string) => {
        // Fallback dinámico usando Dicebear (en base al index para simular el recurso predefinido)
        const seedIndex = url.replace('/avatars/', '').replace('.svg', '')
        const safeDicebearUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${seedIndex}`
        await handleUpdateProfile(safeDicebearUrl)
    }

    // TAREA 2: Subir Foto
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            setError('El archivo supera los 2MB permitidos.')
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No estás autenticado.")

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            await handleUpdateProfile(publicUrl)
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Error al subir la imagen al Storage')
            setIsSubmitting(false)
        }
    }

    // TAREA 3: Captura de Cámara
    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current) return

        setIsSubmitting(true)
        setError(null)

        const video = videoRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const context = canvas.getContext('2d')
        if (!context) return

        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(async (blob) => {
            if (!blob) {
                setError("Error al procesar la captura de la cámara.")
                setIsSubmitting(false)
                return
            }

            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error("No estás autenticado.")

                const fileName = `${user.id}/webcam-${Date.now()}.jpg`
                const file = new File([blob], fileName, { type: 'image/jpeg' })

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName)

                await handleUpdateProfile(publicUrl)
            } catch (err: any) {
                setError(err.message || 'Error al guardar la captura en el servidor.')
                setIsSubmitting(false)
            }
        }, 'image/jpeg', 0.9)
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 w-full max-w-xl rounded-2xl p-6 relative overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Actualiza tu Avatar</h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-white transition-colors p-1 disabled:opacity-50"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded-lg text-red-300 text-sm font-medium">
                        {error}
                    </div>
                )}

                {isSubmitting && (
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                        <p className="text-white font-medium">Actualizando perfil...</p>
                    </div>
                )}

                {!isCameraOpen ? (
                    <div className="space-y-6 relative">
                        {/* Bloque A: Prediseñados */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Elige un estilo</h3>
                            <div className="grid grid-cols-6 gap-4">
                                {PREDEFINED_AVATARS.map((url, i) => (
                                    <button
                                        key={url}
                                        onClick={() => handlePredefinedClick(url)}
                                        className="bg-gray-800 rounded-full aspect-square w-full cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all border border-gray-700 overflow-hidden relative"
                                    >
                                        <img
                                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${i + 1}`}
                                            alt={`Avatar ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bloque B: Subir Foto */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Sube tu propia foto</h3>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 hover:bg-gray-800/50 transition-colors group"
                            >
                                <UploadCloud className="w-8 h-8 text-gray-500 group-hover:text-indigo-400 mb-2 transition-colors" />
                                <p className="text-sm text-gray-300 font-medium">Sube desde tu dispositivo (Max 2MB)</p>
                                <p className="text-xs text-gray-500 mt-1">Soporta JPG, PNG o WebP</p>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/jpeg, image/png, image/webp"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </div>

                        {/* Bloque C: Cámara */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Usa tu cámara</h3>
                            <button
                                onClick={() => setIsCameraOpen(true)}
                                className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl py-4 transition-colors font-medium cursor-pointer"
                            >
                                <Camera className="w-5 h-5 text-indigo-400" />
                                Tomar una foto ahora
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-gray-800 shadow-inner">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                        </div>
                        <canvas ref={canvasRef} className="hidden" />

                        <div className="flex gap-4 w-full">
                            <button
                                onClick={() => setIsCameraOpen(false)}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCapture}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-colors disabled:opacity-50"
                            >
                                Capturar Foto
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
