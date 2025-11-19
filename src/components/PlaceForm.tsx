// PlaceForm.tsx
import { collection, addDoc, serverTimestamp, FieldValue } from "firebase/firestore"
import { useState, type FormEvent, type ChangeEvent } from "react"
import { db, SHARED_PLACES_PATH } from "../FirebaseConfig"

// 1. Interface for Component Props
interface PlaceFormProps {
    currentUserId: string // The user ID is guaranteed to be a string by App.tsx
}

// 2. Interface for Firestore Document
interface PlaceDocument {
    name: string
    userId: string
    voteCount: number
    timestamp: FieldValue // Use FieldValue for serverTimestamp
}

function PlaceForm({ currentUserId }: PlaceFormProps) {
    // 3. Type state variables. error can be null or string.
    const [placeName, setPlaceName] = useState<string>('')
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // 4. Correctly type the form submission event
    const handleSubmit = async (e: FormEvent) => {
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
            const newPlace: PlaceDocument = {
                name: trimmedName,
                userId: currentUserId,
                voteCount: 0,
                timestamp: serverTimestamp(),
            }

            // 2. Add the document to the 'shared_places' collection
            const collectionRef = collection(db, SHARED_PLACES_PATH)
            await addDoc(collectionRef, newPlace)

            // 3. Reset form on success
            setPlaceName('')
            console.log(`New place added by ${currentUserId}: ${trimmedName}`)
        } catch (err) {
            console.error('Error adding document:', err)
            // FIX: Ensure error message is extracted if it's an object
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
                    // 5. Correctly type the change event
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPlaceName(e.target.value)}
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