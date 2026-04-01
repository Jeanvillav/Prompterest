import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username || username.trim().length < 3) {
        return NextResponse.json({ available: false, message: 'El username debe tener al menos 3 caracteres.' })
    }

    // Validar formato: solo letras minúsculas, números y guiones bajos
    const usernameRegex = /^[a-z0-9_]+$/
    if (!usernameRegex.test(username)) {
        return NextResponse.json({ available: false, message: 'Solo se permiten letras minúsculas, números y guiones bajos.' })
    }

    const supabase = await createClient()
    const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()

    if (data) {
        return NextResponse.json({ available: false, message: 'Este nombre de usuario ya está en uso.' })
    }

    return NextResponse.json({ available: true, message: 'Disponible.' })
}
