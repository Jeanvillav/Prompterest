import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CategoryPills({ activeCategory }: { activeCategory?: string }) {
    const supabase = await createClient()

    // Traer categorías ordenadas
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name')

    if (!categories || categories.length === 0) return null

    return (
        <div className="w-full relative mb-8">
            <div className="flex overflow-x-auto gap-6 pb-2 no-scrollbar items-center">
                {/* Tab Principal */}
                <Link
                    href="/"
                    className={`
                        px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap
                        ${!activeCategory
                            ? 'bg-[#e60023] text-white rounded-full shadow-md'
                            : 'bg-transparent text-white hover:text-gray-300'
                        }
                    `}
                >
                    Para ti
                </Link>

                {/* Lista de Categorías */}
                {categories.map((cat) => {
                    const isActive = activeCategory === cat.slug
                    return (
                        <Link
                            key={cat.id}
                            href={`/?category=${cat.slug}`}
                            className={`
                                px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap
                                ${isActive
                                    ? 'bg-[#e60023] text-white rounded-full shadow-md'
                                    : 'bg-transparent text-white hover:text-gray-300'
                                }
                            `}
                        >
                            {cat.name}
                        </Link>
                    )
                })}
            </div>
            {/* Difuminado derecho retirado por diseño minimalista, o mantenido como negro: */}
            <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-[#0d0d0d] to-transparent pointer-events-none"></div>
        </div>
    )
}
