import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout/Layout'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import { useAuth } from '../../contexts/AuthContext'

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required')
      return
    }

    setLoading(true)
    const { error: signError } = await signUp(email, password, firstName, lastName)
    setLoading(false)

    if (signError) {
      setError(signError.message)
    } else {
      navigate('/')
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
        <h2 className="text-2xl font-bold mb-4">Create an account</h2>
        {error && <div className="mb-4 p-2 bg-red-100 text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="First Name"
            fullWidth
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
          <Input
            label="Last Name"
            fullWidth
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            type="password"
            fullWidth
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" fullWidth isLoading={loading}>
            Create account
          </Button>
        </form>
        <p className="mt-4 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Layout>
  )
}

export default RegisterPage
