'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function CopyButton({ text, className }: { text: string, className?: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
            onClick={handleCopy}
            className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200",
                copied
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200",
                className
            )}
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Prompt</span>
                </>
            )}
        </button>
    )
}
