import { createClient } from '@/lib/supabase/server'
import PromptFeed from '@/components/prompt-feed'
import { getPrompts } from '@/lib/queries/prompts'

export const revalidate = 60 // Update feed every 60s

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient()
  const { q: query } = await searchParams

  const { data: { user } } = await supabase.auth.getUser()

  let prompts = []
  try {
    prompts = await getPrompts(supabase, {
      query,
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

  if (prompts.length === 0) {
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
    <PromptFeed initialPrompts={prompts} searchQuery={query} userId={user?.id} />
  )
}
