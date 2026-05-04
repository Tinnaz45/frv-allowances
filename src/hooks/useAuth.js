'use client'
import { useEffect, useState } from 'react'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        if (typeof window === 'undefined') return

        const { createClient } = await import('@supabase/supabase-js')

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )

        const { data } = await supabase.auth.getSession()

        if (!mounted) return

        setSession(data?.session ?? null)
        setUser(data?.session?.user ?? null)
      } catch (e) {
        console.error('Auth load failed:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user
  }
}
