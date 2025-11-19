import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useState } from "react"
import { db, SHARED_PLACES_PATH } from "../FirebaseConfig"

function PlaceForm({ currentUserId }) {
    const [placeName, setPlaceName] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        const trimmedName = placeName.trim()

        if (!trimmedName) {
            setError('Place name cannot be empty')
            return
        }

        setIsSaving(true)

        try {
            // 1. Prepare the new document data
            const newPlace = {
                name: trimmedName,
                userId: currentUserId,
                voteCount: 0,
                timestamp: serverTimestamp()
            }

            // 2. Add the document to the 'shared_places' collection
            const collectionRef = collection(db, SHARED_PLACES_PATH)
            await addDoc(collectionRef, newPlace)

            // 3. Reset form on success
            setPlaceName('')
            console.log(`New place added by ${currentUserId}: ${trimmedName}`)
        } catch (err) {
            console.error('Error adding document:', err)
            setError('Failed to save place. Check console.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <section className="mb-8 p-6 bg-zinc-800 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Add a New Place</h2>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    placeholder="E.g., Gran Canyon, Sunset Point"
                    className="flex-grow p-3 border border-amber-50 rounded-lg focus:ring-amber-500 focus:border-amber-500 shadow-sm"
                    maxLength={100}
                    disabled={isSaving}
                />
                <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-300 text-zinc-800 font-bold py-3 px-6 rounded-lg transition duration-200 cursor-pointer shadow-md disabled:bg-zinc-700 flex items-center justify-center"
                    disabled={isSaving || !placeName.trim()}
                >
                    {isSaving ? 'Saving...' : 'Save Place'}
                </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </section>
    )
}

export default PlaceForm