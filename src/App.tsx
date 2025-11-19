import { useEffect, useState } from 'react'
import { initializeUser } from './FirebaseConfig'
import './App.css'
import PlaceForm from './components/PlaceForm'
import PlacesList from './components/PLacesList'

function App() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 1. Initialize Authentication (Anonimous Sign-in)
    initializeUser()
      .then((userId) => {
        setCurrentUserId(userId)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <p className='text-xl font-semibold text-indigo-600'>Connecting to Database...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}.</p>
        <p>The Database connection cannot be established!</p>
      </div>
    )
  }

  if (!currentUserId) {
    // If loading is false, but userId is still null, display a quick fallback loading state
    // (This usually only flashes briefly or not at all).
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <p className='text-xl font-semibold text-indigo-600'>Authenticating User...</p>
      </div>
    )
  }

  return (
    <>
      <div className='max-w-max mx-auto bg-zinc-900 shadow-xl rounded-2xl p-10 lg:px-36'>

        <header className='mb-8 border-b pb-4'>
          <h1 className='text-3xl font-extrabold text-amber-400 tracking-tight'>🗺️ Shared Trip Places POC</h1>
          <p className='text-gray-100 mt-1'>Real-time collaborative planning with voting.</p>
        </header>

        {/* User ID Display */}
        <div className='bg-zinc-200 border-l-4 border-amber-500 text-amber-600 p-3 mb-6' role='alert'>
          <p className='font-bold text-sm'>Your Current User ID:</p>
          <p id='userIdDisplay' className='text-lg font-mono truncate'>{currentUserId?.slice(-6)}</p>
        </div>

        {/* Input Form and Places List will be rendered here */}
        <PlaceForm currentUserId={currentUserId} />
        <PlacesList currentUserId={currentUserId} />
      </div>
    </>
  )
}

export default App
