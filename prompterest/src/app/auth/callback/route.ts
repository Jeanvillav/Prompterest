import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // Leer el parámetro next, usar /onboarding como fallback para nuevos usuarios
    const next = searchParams.get('next') ?? '/onboarding'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Si el código se intercambia por una sesión exitosamente, completar redirect a la pantalla objetivo
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // En caso de fallo en el handshake o URL maliciosa expirar
    return NextResponse.redirect(`${origin}/login?error=Could+not+authenticate`)
}
