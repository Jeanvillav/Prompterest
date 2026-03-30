import Link from "next/link";
import { CheckCircle, Sparkles } from "lucide-react";

export default function WelcomePage() {
    return (
        <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0d0d0d]/80 to-[#0d0d0d] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Icon Container */}
                <div className="relative mb-8 group">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                    <div className="relative bg-[#1a1a1a] p-5 rounded-full border border-indigo-500/30">
                        <CheckCircle className="w-16 h-16 text-indigo-500 shrink-0" strokeWidth={1.5} />
                        <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
                    </div>
                </div>

                {/* Typography */}
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                    ¡Cuenta verificada exitosamente!
                </h1>

                <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed font-medium">
                    Bienvenido a <span className="text-white font-bold">Prompterest</span>. Tu espacio premium para descubrir, guardar y compartir los mejores prompts de Inteligencia Artificial del mundo.
                </p>

                {/* Call to Action */}
                <Link
                    href="/"
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-indigo-600 rounded-full hover:bg-indigo-500 hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:-translate-y-1"
                >
                    <span className="relative flex items-center gap-2">
                        Comenzar a explorar
                        <svg
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </span>
                </Link>
            </div>
        </div>
    );
}
