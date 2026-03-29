'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Bookmark } from 'lucide-react'

const TITLES = [
    "idea para automatizar código",
    "idea para arte conceptual",
    "idea para campañas de SEO",
    "idea para optimizar workflows",
]

const PLACEHOLDER_IMAGES = [
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80",
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500&q=80",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80",
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80",
    "https://images.unsplash.com/photo-1558655146-d09347e92766?w=500&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80",
]

export default function PinterestLanding() {
    const [titleIndex, setTitleIndex] = useState(0)
    const [fade, setFade] = useState(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false)
            setTimeout(() => {
                setTitleIndex((prev) => (prev + 1) % TITLES.length)
                setFade(true)
            }, 300) // Duration of fade out
        }, 3000) // Rotate every 3 seconds

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full">
            {/* HERO SECTION */}
            <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center pt-20">
                {/* Background Masonry */}
                <div className="absolute inset-0 -z-10 opacity-30 blur-sm overflow-hidden pointer-events-none">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 transform -translate-y-12">
                        {PLACEHOLDER_IMAGES.map((src, i) => (
                            <div key={i} className={`rounded-2xl overflow-hidden ${i % 3 === 0 ? 'h-64' : i % 2 === 0 ? 'h-48' : 'h-80'} bg-gray-200 mt-4`}>
                                <img src={src} alt="Placeholder" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Central Text */}
                <div className="text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight">
                        Encuentra la próxima
                    </h1>
                    <div className="h-24 md:h-32 mt-4 flex items-center justify-center">
                        <h2 className={`text-4xl md:text-6xl font-extrabold pb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                            {TITLES[titleIndex]}
                        </h2>
                    </div>
                </div>

                {/* CTA Flotante */}
                <div className="mt-12 md:mt-16 w-full flex flex-col items-center px-4 animate-bounce-slow relative z-10">
                    <p className="text-xl font-medium text-gray-900 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-sm mb-6">
                        Regístrate para ver ideas
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-8 py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold text-lg transition-colors text-center"
                        >
                            Iniciar sesión
                        </Link>
                        <Link
                            href="/register"
                            className="w-full sm:w-auto px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-lg shadow-lg transition-colors text-center"
                        >
                            Registrarse
                        </Link>
                    </div>
                </div>
            </section>

            {/* FLOW OF VALUE SECTIONS */}
            <section className="bg-white py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-32">

                    {/* Section 1: Search */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="flex-1 w-full max-w-md bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 shadow-xl border border-purple-100 flex flex-col items-center justify-center h-80 relative overflow-hidden">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
                            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>

                            {/* Main Search Bar Mockup */}
                            <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-5 relative z-10 transform transition-transform hover:scale-105 duration-300">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                                    <Search className="text-indigo-500 w-6 h-6 flex-shrink-0" />
                                    <div className="h-6 w-3/4 bg-gray-100 rounded-md"></div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">#marketing</span>
                                    <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-full">#midjourney</span>
                                    <span className="px-3 py-1 bg-pink-50 text-pink-600 text-xs font-semibold rounded-full">#seo</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-6">
                            <h3 className="text-4xl md:text-5xl font-bold text-gray-900">Busca una idea</h3>
                            <p className="text-xl text-gray-600">Encuentra los prompts exactos que necesitas explorando nuestro motor de búsqueda full-text optimizado.</p>
                        </div>
                    </div>

                    {/* Section 2: Save */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
                        <div className="flex-1 w-full max-w-md bg-red-50 rounded-3xl p-8 shadow-xl border border-red-100 flex flex-col items-center justify-center h-80">
                            <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer">
                                <Bookmark className="w-16 h-16 text-red-600 fill-red-600" />
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-6">
                            <h3 className="text-4xl md:text-5xl font-bold text-gray-900">Guarda las ideas que te gusten</h3>
                            <p className="text-xl text-gray-600">Colecciona tus prompts favoritos en tu perfil para tenerlos siempre a la mano cuando la inspiración llame.</p>
                        </div>
                    </div>

                    {/* Section 3: Try AI */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="flex-1 w-full max-w-md bg-gray-900 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center h-80 gap-6">
                            <div className="px-6 py-3 bg-white/10 text-white rounded-full border border-white/20 text-xl font-semibold backdrop-blur-sm animate-bounce-slow">
                                ChatGPT
                            </div>
                            <div className="flex gap-4">
                                <div className="px-5 py-2 bg-purple-500/20 text-purple-200 rounded-full border border-purple-500/30 text-lg">
                                    Midjourney
                                </div>
                                <div className="px-5 py-2 bg-orange-500/20 text-orange-200 rounded-full border border-orange-500/30 text-lg">
                                    Claude
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-6">
                            <h3 className="text-4xl md:text-5xl font-bold text-gray-900">Pruébalo en tu IA favorita</h3>
                            <p className="text-xl text-gray-600">Copia y pega con un solo clic. Prompterest está clasificado por los modelos de IA más avanzados del mercado.</p>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    )
}
