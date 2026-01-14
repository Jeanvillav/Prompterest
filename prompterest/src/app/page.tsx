import { createClient } from '@/lib/supabase/server'
import PromptCard from '@/components/prompt-card'

export const revalidate = 60 // Update feed every 60s

export default async function Home({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = await createClient()
  const query = searchParams.q

  let dbQuery = supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
  }

  const { data: prompts, error } = await dbQuery

  if (error) {
    console.error("Error fetching prompts:", error)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500">Failed to load prompts.</p>
      </div>
    )
  }

  if (!prompts || prompts.length === 0) {
    if (query) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h2 className="text-2xl font-bold text-gray-800">Lo siento! 😔</h2>
          <p className="text-gray-600 mt-2">Aún no tenemos un prompt para eso.</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-gray-400">No prompts yet.</h2>
        <p className="text-gray-500 mt-2">Be the first to create one!</p>
      </div>
    )
  }

  return (
    <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* CSS Masonry Grid using Tailwind Columns */}
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </div>
  )
}
