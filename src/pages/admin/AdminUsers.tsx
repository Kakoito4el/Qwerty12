// src/pages/AdminUsers.tsx
import React, { useEffect, useState } from 'react'
import { User as UserIcon, Shield, ShieldOff, Search } from 'lucide-react'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

type AdminUser = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  is_admin: boolean
  created_at: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const { user: currentUser } = useAuth()
  
  // 1) GET /admin/users
  async function fetchUsers() {
    setLoading(true)
    try {
      const token = await supabase.auth.getSession()
        .then(session => session.data.session?.access_token)
      const res = await fetch('http://localhost:3001/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      console.error(e)
      alert('Не удалось загрузить пользователей')
    } finally {
      setLoading(false)
    }
  }

  // Поиск и фильтрация
  const filtered = search
    ? users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(search.toLowerCase())
      )
    : users

  // 2) toggle admin
  async function toggleAdmin(u: AdminUser) {
    if (u.id === currentUser?.id && u.is_admin) {
      alert("Нельзя снять свои собственные админ-права")
      return
    }
    try {
      const token = await supabase.auth.getSession()
        .then(session => session.data.session?.access_token)
      const res = await fetch(
        `http://localhost:3001/admin/users/${u.id}/toggle-admin`,
        { 
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      if (!res.ok) throw new Error(await res.text())
      fetchUsers()
    } catch (e) {
      console.error(e)
      alert('Не удалось переключить статус администратора')
    }
  }

  // Загрузка всех пользователей при монтировании
  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">User Management</h2>

      <form
        onSubmit={e => { e.preventDefault(); fetchUsers() }}
        className="flex gap-2 mb-4"
      >
        <Input
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
        />
        <Button type="submit" variant="outline">
          <Search className="h-5 w-5" />
        </Button>
      </form>

      {loading
        ? <div>Loading...</div>
        : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Joined</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(filtered).map(u => (
                <tr key={u.id} className={u.id === currentUser?.id ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    <span>{u.first_name} {u.last_name}</span>
                  </td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {u.is_admin
                      ? <span className="text-purple-800">Admin</span>
                      : <span className="text-gray-800">User</span>}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => toggleAdmin(u)}>
                      {u.is_admin
                        ? <ShieldOff className="h-5 w-5 text-red-600" />
                        : <Shield className="h-5 w-5 text-green-600" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </div>
  )
}
