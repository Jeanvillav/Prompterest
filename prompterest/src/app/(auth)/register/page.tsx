'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            console.log("🚀 INICIANDO SIGNUP...");
            console.log("📦 PAYLOAD ENVIADO A SUPABASE:", { email: email, passwordLength: password?.length });

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: 'https://prompterest-six.vercel.app/auth/callback?next=/welcome',
                }
            })

            console.log("🚨 RESPUESTA CRUDA DE SUPABASE:", { data, error });

            // 🔍 DETECTOR DE AUTO-LOGIN: Si Supabase devuelve sesión, Confirm Email está APAGADO
            if (data?.session) {
                console.error("❌ ERROR ARQUITECTÓNICO: Supabase devolvió una sesión activa. Esto significa que 'Confirm Email' está APAGADO en el dashboard de la nube. El usuario fue auto-logueado.");
                setError("Error de configuración del servidor. Contacta al administrador.");
                setLoading(false);
                return;
            }

            // 1. Validar errores de red o servidor
            if (error) {
                if (error.message.includes("already registered")) {
                    setError("Este correo ya está registrado. Por favor, inicia sesión.");
                } else if (error.message.includes("password")) {
                    setError("La contraseña es demasiado débil (mínimo 6 caracteres).");
                } else {
                    setError(error.message); // O un mensaje por defecto
                }
                setLoading(false);
                return; // 🚨 ESTE RETURN ES CRÍTICO PARA DETENER LA EJECUCIÓN
            }

            // 2. Validar el hack de Supabase para correos existentes
            if (data?.user && data.user.identities && data.user.identities.length === 0) {
                setError("Este correo ya está registrado. Por favor, inicia sesión.");
                setLoading(false);
                return; // 🚨 ESTE RETURN ES CRÍTICO
            }

            // 3. Solo si pasa todas las barreras de arriba, es un éxito real:
            setError(null);
            setIsSuccess(true);
            console.log("✅ SIGNUP FINALIZADO. isSuccess debería cambiar.");
            setLoading(false);
        } catch (err) {
            console.error("💥 ERROR DE CÓDIGO/RED:", err);
            setError("Error inesperado de comunicación.");
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0d0d0d] font-sans">
            <div className="w-full max-w-md space-y-8 bg-[#1a1a1a] p-10 rounded-3xl shadow-2xl border border-[#2a2a2a] relative overflow-hidden">

                {/* Background ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-[#e60023]/20 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                        <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#e60023] rounded-full flex items-center justify-center text-white text-lg font-bold font-serif shadow-sm">P</div>
                        </Link>
                    </div>
                </div>

                {isSuccess ? (
                    <div className="relative z-10 text-center animate-in zoom-in-95 duration-500">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-40 animate-pulse" />
                                <div className="relative bg-[#0d0d0d] p-5 rounded-full border border-indigo-500/30">
                                    <Mail className="w-12 h-12 text-indigo-400" strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Revisa tu correo</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            Te hemos enviado un enlace mágico a <span className="text-white font-medium">{email}</span>. Haz clic en él para verificar tu cuenta y entrar a Prompterest.
                        </p>
                    </div>
                ) : (
                    <div className="relative z-10 animate-in fade-in duration-500">
                        <div className="mb-8">
                            <h2 className="text-center text-3xl font-extrabold tracking-tight text-white mb-2">
                                Únete a Prompterest
                            </h2>
                            <p className="text-center text-sm text-gray-400">
                                Tu espacio premium para descubrir prompts de IA.
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleRegister}>
                            {error && (
                                <div className="bg-red-500/10 text-red-500 border border-red-500/50 p-3 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full rounded-xl border border-[#333] bg-[#222] py-3 text-white placeholder-gray-500 focus:border-[#e60023] focus:bg-[#1a1a1a] focus:ring-1 focus:ring-[#e60023] sm:text-sm transition-colors px-4 outline-none"
                                        placeholder="tu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        className="block w-full rounded-xl border border-[#333] bg-[#222] py-3 text-white placeholder-gray-500 focus:border-[#e60023] focus:bg-[#1a1a1a] focus:ring-1 focus:ring-[#e60023] sm:text-sm transition-colors px-4 outline-none"
                                        placeholder="Min. 6 caracteres"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-[#e60023] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:ring-offset-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
                            >
                                {loading ? 'Creando cuenta...' : 'Continuar'}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            <p className="text-gray-400">
                                ¿Ya tienes una cuenta?{' '}
                                <Link href="/login" className="font-bold text-[#e60023] hover:text-red-400 transition-colors">
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
