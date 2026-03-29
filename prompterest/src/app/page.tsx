import { createClient } from '@/lib/supabase/server'
import PromptFeed from '@/components/prompt-feed'
import PinterestLanding from '@/components/landing'
import CategoryPills from '@/components/category-pills'
import Sidebar from '@/components/sidebar'
import { getPrompts } from '@/lib/queries/prompts'

export const revalidate = 60 // Update feed every 60s

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string, category?: string }> }) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams.q
  const categorySlug = resolvedSearchParams.category

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <PinterestLanding />
  }

  let prompts = []
  try {
    prompts = await getPrompts(supabase, {
      query,
      categorySlug,
      page: 0,
      pageSize: 10,
      userId: user?.id
    })
  } catch (error) {
    console.error("Error fetching prompts:", error)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500">Failed to load prompts.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen text-gray-100">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        <Sidebar activeQuery={query} />

        <main className="flex-1 min-w-0">
          <CategoryPills activeCategory={categorySlug} />

          {prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center bg-gray-900 rounded-3xl border border-gray-800">
              <h2 className="text-2xl font-bold text-gray-400">No hay resultados</h2>
              <p className="text-gray-500 mt-2">Prueba quitando filtros o buscando otra idea.</p>
            </div>
          ) : (
            <PromptFeed initialPrompts={prompts} searchQuery={query} categorySlug={categorySlug} userId={user?.id} />
          )}
        </main>
      </div>
    </div>
  )
}
