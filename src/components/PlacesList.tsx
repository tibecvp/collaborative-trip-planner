// PlacesList.tsx

import { useEffect, useState, useCallback } from "react"
import { db, SHARED_PLACES_PATH } from "../FirebaseConfig"
// Import specific types from Firebase
import {
    collection, onSnapshot, orderBy, query, doc, runTransaction, serverTimestamp,
    // Add all necessary types here
    FirestoreError, type DocumentData, QuerySnapshot, DocumentReference, DocumentSnapshot, FieldValue
} from "firebase/firestore"

// 1. Interface for a Place document retrieved from Firestore
interface Place {
    id: string
    name: string
    userId: string
    voteCount: number
    timestamp: FieldValue // Can be a Timestamp object after server write, or FieldValue (serverTimestamp)
}

// 2. Interface for component props
interface PlaceListProps {
    currentUserId: string
}

// 3. Interface for voting status state
interface VotingStatus {
    [placeId: string]: boolean
}

function PlacesList({ currentUserId }: PlaceListProps) {
    // 4. Type state variables explicitly
    const [places, setPlaces] = useState<Place[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [votingStatus, setVotingStatus] = useState<VotingStatus>({})

    // Real-Time Read Logic
    useEffect(() => {
        // We use 'db' here, which is of type Firestore (exported from FirebaseConfig.ts)
        const placesQuery = query(
            collection(db, SHARED_PLACES_PATH),
            orderBy('voteCount', 'desc'),
            orderBy('timestamp', 'desc')
        )

        // 5. Type the onSnapshot handler arguments
        const unsubscribe = onSnapshot(placesQuery, (snapshot: QuerySnapshot<DocumentData>) => {
            const placesData: Place[] = snapshot.docs.map(doc => ({
                // Cast the document data to Place interface for type safety
                ...doc.data() as Place,
                id: doc.id,
            }))
            setPlaces(placesData)
            console.log('Real-time places update received:', placesData)
            setLoading(false)
        }, (err: FirestoreError) => { // Type the error handler
            console.error('Firestore real-time error:', err)
            setError('Failed to fetch places in real-time.')
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Write/Update Logic (Voting)
    const handleVote = useCallback(async (placeId: string) => { // Type placeId as string
        setVotingStatus(prev => ({ ...prev, [placeId]: true }))

        // Type the Document References
        const placeRef: DocumentReference<DocumentData> = doc(db, SHARED_PLACES_PATH, placeId)
        const voteRef: DocumentReference<DocumentData> = doc(db, SHARED_PLACES_PATH, placeId, 'votes', currentUserId)

        try {
            await runTransaction(db, async (transaction) => {

                // 1. Check for existing vote (Read inside the transaction)
                const voteDoc: DocumentSnapshot<DocumentData> = await transaction.get(voteRef)
                if (voteDoc.exists()) {
                    throw new Error('You have already voted for this place.')
                }

                // 2. Get the current place data (Read inside the transaction)
                const placeDoc: DocumentSnapshot<DocumentData> = await transaction.get(placeRef)
                if (!placeDoc.exists()) {
                    throw new Error('Place document does not exist.')
                }

                // 3. Atomically write the new vote document
                transaction.set(voteRef, {
                    userId: currentUserId,
                    timestamp: serverTimestamp()
                })

                // 4. Atomically update the place's voteCount (Increment)
                // Use optional chaining just in case data() returns undefined (though checked above)
                const currentVoteCount = placeDoc.data()?.voteCount ?? 0
                const newVoteCount = currentVoteCount + 1

                transaction.update(placeRef, { voteCount: newVoteCount })

                return newVoteCount
            })

            console.log(`Vote cast successfully by ${currentUserId} for place ${placeId}`)
        } catch (err) {
            // Type the error object (assuming it's an Error instance)
            const error = err as Error

            if (error.message.includes('You have already voted')) {
                alert(error.message)
            } else {
                console.error('Transaction failed:', error)
                alert('Failed to cast vote. See console for details.')
            }
        } finally {
            setVotingStatus(prev => ({ ...prev, [placeId]: false }))
        }
    }, [currentUserId])

    if (loading) {
        return <p className="text-center text-gray-500 mt-10">Loading shared places...</p>
    }

    if (error) {
        return <p className="text-red-500 text-center mt-10">Error: {error}</p>
    }

    return (
        <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-4 border-t pt-4">Shared Places List (Ordered by Votes)</h2>
            <div id="placesList" className="space-y-3">
                {places.length === 0 ? (
                    <p className="text-center text-gray-400 italic p-4 border rounded-lg">No places saved yet. Be the first!</p>
                ) : (
                    places.map((place: Place) => ( // Ensure map iteration is typed
                        <div
                            key={place.id}
                            className="place-item flex justify-between items-center p-4 bg-zinc-800 rounded-lg shadow-sm hover:shadow-md transition duration-150"
                        >
                            <div className="text-left">
                                <p className="text-lg font-medium text-amber-200">{place.name}</p>
                                <p className="text-sm text-gray-200 truncate mt-1">
                                    Added by:
                                    <span className={`font-mono ml-1 text-amber-400 ${place.userId === currentUserId ? 'font-semibold' : ''}`}>
                                        @{place.userId.slice(-6)}
                                    </span>
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center font-bold text-xl">
                                    {place.voteCount}
                                    <span className="text-lg text-amber-400 ml-1">★</span>
                                </div>
                                <button
                                    onClick={() => handleVote(place.id)}
                                    className={`py-2 px-4 rounded-full text-sm font-semibold transition duration-150 shadow-md cursor-pointer ${votingStatus[place.id] ? 'bg-zinc-700 cursor-not-allowed' : 'bg-amber-400 hover:bg-amber-300 text-zinc-800'
                                        }`}
                                    disabled={votingStatus[place.id]}
                                >
                                    {votingStatus[place.id] ? 'Voting...' : 'Vote'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}

export default PlacesList