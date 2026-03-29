import Link from 'next/link'
import { COMMUNITY_MAP } from '@/lib/constants/communities'

export default function Sidebar({ activeQuery }: { activeQuery?: string }) {
    return (
        <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 pt-4 bg-[#0d0d0d] min-h-[calc(100vh-4rem)] border-r border-[#1f1f1f]">
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6 px-3">
                {/* Main Navigation */}
                <div className="mb-8">
                    <ul className="space-y-1">
                        <li>
                            <Link href="/" className={`block px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${!activeQuery ? 'bg-[#e60023] text-white' : 'text-gray-200 hover:bg-[#1f1f1f]'}`}>
                                Feed Principal
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="block px-4 py-2.5 text-sm font-semibold rounded-xl transition-all text-gray-300 hover:bg-[#1f1f1f] hover:text-white">
                                Tus Colecciones
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="block px-4 py-2.5 text-sm font-semibold rounded-xl transition-all text-gray-300 hover:bg-[#1f1f1f] hover:text-white">
                                Trending
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Communities */}
                <div>
                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-4">
                        Comunidades
                    </h3>

                    <div className="space-y-6">
                        {Object.entries(COMMUNITY_MAP).map(([categoryName, communities]) => (
                            <div key={categoryName} className="space-y-1">
                                <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider px-4 mb-1">
                                    {categoryName}
                                </h4>
                                <ul className="space-y-0.5">
                                    {communities.map(c => {
                                        const queryStr = `#${c.slug}`;
                                        const isActive = activeQuery === queryStr;
                                        return (
                                            <li key={c.slug}>
                                                <Link
                                                    href={`/?q=${encodeURIComponent(queryStr)}`}
                                                    className={`block px-4 py-1.5 text-sm transition-colors ${isActive ? 'text-white font-bold' : 'text-[#a3a3a3] hover:text-white font-medium'}`}
                                                >
                                                    {c.name}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer / Collapse */}
            <div className="p-4 border-t border-[#1f1f1f] mt-auto">
                <button className="flex items-center text-sm font-semibold text-gray-500 hover:text-white transition-colors px-2 w-full">
                    <span>Colapsar</span>
                    <span className="ml-auto opacity-70">{"<"}</span>
                </button>
            </div>
        </aside>
    )
}
