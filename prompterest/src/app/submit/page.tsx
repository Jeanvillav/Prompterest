import PromptForm from '@/components/prompt-form'

export default function SubmitPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create a Pin</h1>
                <p className="mt-2 text-gray-600">Share your best AI prompts with the world.</p>
            </div>
            <PromptForm />
        </div>
    )
}
