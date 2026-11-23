
import { useState } from 'react'
import { supabase } from './services/supabase'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        setMessage('Login successful!')
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) throw error

        setMessage(
          data.session
            ? 'Account created successfully!'
            : 'Account created! Check your email to confirm it.'
        )
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090f] text-white flex items-center justify-center p-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#15151f] border border-white/10 rounded-2xl p-8 space-y-5"
      >
        <h1 className="text-3xl font-bold text-center">
          Ani<span className="text-purple-500">Chan</span>
        </h1>

        <h2 className="text-xl font-semibold text-center">
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </h2>

        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-[#222230] border border-white/10 outline-none"
        />

        <input
          type="password"
          required
          minLength={6}
          placeholder="Password (minimum 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-[#222230] border border-white/10 outline-none"
        />

        <button
          disabled={loading}
          className="w-full p-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 font-semibold"
        >
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
        </button>

        {message && (
          <p className="text-sm text-center text-purple-300">
            {message}
          </p>
        )}

        <p className="text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setMessage('')
            }}
            className="text-purple-400 font-semibold"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </form>
    </div>
  )
}
