'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react'

const INTEREST_OPTIONS = [
    'Ingeniería y Datos',
    'Arte y Diseño Visual',
    'Marketing y Social Media',
    'SEO y Copywriting',
    'Finanzas y Operaciones',
    'Claude Skill',
]

export default function OnboardingPage() {
    const supabase = createClient()
    const router = useRouter()

    const [step, setStep] = useState(1) // 1: username, 2: age, 3: interests
    const [username, setUsername] = useState('')
    const [age, setAge] = useState('')
    const [selectedInterests, setSelectedInterests] = useState<string[]>([])
    const [usernameStatus, setUsernameStatus] = useState<{ available: boolean; message: string } | null>(null)
    const [checkingUsername, setCheckingUsername] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)

    // Check auth on mount
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) {
                router.push('/login')
            } else {
                setCurrentUser(data.user)
                // Pre-fill username from trigger-generated value
                supabase
                    .from('profiles')
                    .select('username, onboarding_completed')
                    .eq('id', data.user.id)
                    .single()
                    .then(({ data: profile }) => {
                        if (profile?.onboarding_completed) {
                            router.push('/')
                        } else if (profile?.username) {
                            setUsername(profile.username)
                        }
                    })
            }
        })
    }, [supabase, router])

    // Debounced username check
    const checkUsername = useCallback(async (value: string) => {
        if (value.length < 3) {
            setUsernameStatus(null)
            return
        }
        setCheckingUsername(true)
        try {
            const res = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`)
            const data = await res.json()
            setUsernameStatus(data)
        } catch {
            setUsernameStatus({ available: false, message: 'Error al verificar.' })
        }
        setCheckingUsername(false)
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (username.trim().length >= 3) {
                checkUsername(username.trim().toLowerCase())
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [username, checkUsername])

    const toggleInterest = (interest: string) => {
        setSelectedInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : prev.length < 5
                    ? [...prev, interest]
                    : prev
        )
    }

    const handleFinish = async () => {
        console.log("🚀 [ONBOARDING] Iniciando guardado de perfil...");
        setSaving(true)
        setError(null)

        if (!currentUser) {
            console.error("❌ [ONBOARDING] ERROR: currentUser es nulo. Cancelando operación.");
            setError("Error de sesión. Por favor recarga la página.");
            setSaving(false)
            return
        }

        const updates: any = {
            username: username.trim().toLowerCase(),
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
        }

        if (age.trim()) {
            const parsedAge = parseInt(age)
            if (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 120) {
                setError('La edad debe ser un número entre 13 y 120.')
                setSaving(false)
                return
            }
            updates.age = parsedAge
        }

        if (selectedInterests.length > 0) {
            updates.interests = selectedInterests
        }

        console.log("📦 [ONBOARDING] Payload a enviar a Supabase:", updates);

        try {
            const { data, error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', currentUser.id)
                .select() // Forzamos a que devuelva la fila actualizada

            console.log("🚨 [ONBOARDING] Respuesta cruda de BD:", { data, updateError });

            if (updateError) {
                console.error("❌ [ONBOARDING] Error de Supabase:", updateError);
                if (updateError.message.includes('unique') || updateError.message.includes('duplicate')) {
                    setError('Este nombre de usuario ya está en uso.')
                } else {
                    setError(`Error BD: ${updateError.message}`)
                }
                setSaving(false)
                return
            }

            if (!data || data.length === 0) {
                console.error("❌ [ONBOARDING] ALERTA RLS: La actualización devolvió 0 filas. Esto suele significar que las políticas RLS bloquean el UPDATE.");
                setError("Error de permisos (RLS) al guardar tu perfil.");
                setSaving(false)
                return
            }

            console.log("✅ [ONBOARDING] Perfil guardado con éxito. Redirigiendo a /");
            router.push('/')

        } catch (err) {
            console.error("❌ [ONBOARDING] Excepción capturada:", err);
            setError("Ocurrió un error inesperado de red.");
            setSaving(false)
        }
    }

    const canAdvanceStep1 = username.trim().length >= 3 && usernameStatus?.available === true
    const canAdvanceStep2 = true // age is optional
    const canFinish = selectedInterests.length >= 0 // interests are optional

    return (
        <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg">
                {/* Progress bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-indigo-500' : 'bg-[#2a2a2a]'
                                }`}
                        />
                    ))}
                </div>

                <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-[#2a2a2a] shadow-2xl">
                    {/* Step 1: Username */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                                    <User className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Elige tu nombre de usuario</h2>
                                    <p className="text-sm text-gray-500">Así te conocerán en Prompterest.</p>
                                </div>
                            </div>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    placeholder="tu_nombre"
                                    maxLength={20}
                                    className="w-full bg-[#0d0d0d] rounded-xl border border-[#333] py-3.5 pl-10 pr-12 text-white placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors outline-none"
                                />
                                {checkingUsername && (
                                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 animate-spin" />
                                )}
                                {!checkingUsername && usernameStatus && (
                                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center ${usernameStatus.available ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {usernameStatus.available ? (
                                            <Check className="w-3 h-3 text-white" />
                                        ) : (
                                            <span className="text-white text-xs font-bold">✕</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            {usernameStatus && (
                                <p className={`text-xs mt-2 ${usernameStatus.available ? 'text-green-400' : 'text-red-400'}`}>
                                    {usernameStatus.message}
                                </p>
                            )}

                            <button
                                onClick={() => setStep(2)}
                                disabled={!canAdvanceStep1}
                                className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all"
                            >
                                Continuar <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Age */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                                    <span className="text-2xl">🎂</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">¿Cuál es tu edad?</h2>
                                    <p className="text-sm text-gray-500">Opcional. Solo para personalizar tu experiencia.</p>
                                </div>
                            </div>

                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Ej: 25"
                                min={13}
                                max={120}
                                className="w-full bg-[#0d0d0d] rounded-xl border border-[#333] py-3.5 px-4 text-white placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors outline-none"
                            />

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 font-bold rounded-full transition-all"
                                >
                                    Atrás
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!canAdvanceStep2}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-bold rounded-full transition-all"
                                >
                                    Continuar <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Interests */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                                    <Sparkles className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">¿Qué temas te interesan?</h2>
                                    <p className="text-sm text-gray-500">Opcional. Selecciona hasta 5.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {INTEREST_OPTIONS.map((interest) => {
                                    const isSelected = selectedInterests.includes(interest)
                                    return (
                                        <button
                                            key={interest}
                                            onClick={() => toggleInterest(interest)}
                                            className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${isSelected
                                                ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300'
                                                : 'bg-[#0d0d0d] border-[#333] text-gray-400 hover:border-[#555] hover:text-gray-200'
                                                }`}
                                        >
                                            {isSelected && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                                            {interest}
                                        </button>
                                    )
                                })}
                            </div>

                            {error && (
                                <div className="mt-4 bg-red-500/10 text-red-400 border border-red-500/30 p-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 font-bold rounded-full transition-all"
                                >
                                    Atrás
                                </button>
                                <button
                                    onClick={handleFinish}
                                    disabled={saving || !canFinish}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-full transition-all"
                                >
                                    {saving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>Comenzar <Sparkles className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
