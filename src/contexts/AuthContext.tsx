import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useLocation } from 'react-router-dom'

// Тип пользователя из таблицы public.users
export type User = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  is_admin: boolean
}

type AuthContextType = {
  user: User | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

// Получаем профиль из таблицы public.users
const fetchProfile = async (uid: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, is_admin')
    .eq('id', uid)
    .maybeSingle() // заменили single() на maybeSingle()

  // Ошибки кроме "нет данных" выбрасываем
  if (error && error.code !== 'PGRST116') throw error

  return data as User | null
}

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
    setLoading(true)
    if (session?.user) {
      fetchProfile(session.user.id)
        .then(profile => {
          if (profile) {
            setUser(profile)
            setIsAdmin(profile.is_admin)
          } else {
            // Профиль не найден в таблице users
            setUser(null)
            setIsAdmin(false)
          }
        })
        .catch(() => {
          setUser(null)
          setIsAdmin(false)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setUser(null)
      setIsAdmin(false)
      setLoading(false)
    }
  })

  return () => subscription.unsubscribe()
}, [])

  // Регистрация пользователя
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName } }
      })
      if (error) throw error
      return { error: null }
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Ошибка регистрации')
      setError(e.message)
      return { error: e }
    } finally {
      setLoading(false)
    }
  }

  // Вход пользователя
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { error: null }
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Ошибка входа')
      setError(e.message)
      return { error: e }
    } finally {
      setLoading(false)
    }
  }

  // Выход пользователя
  const signOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsAdmin(false)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider')
  return ctx
}