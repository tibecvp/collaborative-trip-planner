import { useEffect, useState, useCallback } from "react"
import { db, SHARED_PLACES_PATH } from "../FirebaseConfig"
import { collection, onSnapshot, orderBy, query, doc, runTransaction, serverTimestamp } from "firebase/firestore"

function PlacesList({ currentUserId }) {
    const [places, setPlaces] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [votingStatus, setVotingStatus] = useState({})

    // Real-Time Read Logic
    useEffect(() => {
        // 1. Create a query ordered by vote count (highest first)
        const placesQuery = query(
            collection(db, SHARED_PLACES_PATH),
            orderBy('voteCount', 'desc'),
            orderBy('timestamp', 'desc')
        )

        // 2. Set up the real-time listener (onSnapshot)
        const unsubscribe = onSnapshot(placesQuery, (snapshot) => {
            const placesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }))
            setPlaces(placesData)
            console.log('Real-time places update received:', placesData)
            setLoading(false)
        }, (err) => {
            console.error('Frestore real-time error:', err)
            setError('Failed to fetch places in real-time.')
            setLoading(false)
        })

        // 3. Clean up the listener when the component unmounts
        return () => unsubscribe()
    }, [])

    // Write/Update Logic (Voting)
    const handleVote = useCallback(async (placeId) => {
        setVotingStatus(prev => ({ ...prev, [placeId]: true }))

        const placeRef = doc(db, SHARED_PLACES_PATH, placeId)
        const voteRef = doc(db, SHARED_PLACES_PATH, placeId, 'votes', currentUserId)

        try {
            await runTransaction(db, async (transaction) => {
                // 1. Check for existing vote (Read inside the transaction)
                const voteDoc = await transaction.get(voteRef)
                if (voteDoc.exists()) {
                    throw new Error('You have already voted for this place.')
                }

                // 2. Get the current place data (REad inside the transaction)
                const placeDoc = await transaction.get(placeRef)
                if (!placeDoc.exists()) {
                    throw new Error('Place document does not exist.')
                }

                // 3. Atomically write the new vote document (to enforce one-vote-per-user)
                transaction.set(voteRef, {
                    userId: currentUserId,
                    timestamp: serverTimestamp()
                })

                // 4. Atomically update the place's coteCount (Increment)
                const newVoteCount = placeDoc.data().voteCount + 1

                transaction.update(placeRef, { voteCount: newVoteCount })

                return newVoteCount
            })

            console.log(`Vote cast successfully by ${currentUserId} for place ${placeId}`)
            // Success message is handled by real-time update
        } catch (err) {
            // Re-throw if it's a known error (e.g., 'already voted)
            if (err.message.includes('You have already voted')) {
                alert(err.message)
            } else {
                console.error('Transaction failed:', err)
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
                    places.map((place) => (
                        <div
                            key={place.id}
                            className="place-item flex justify-between items-center p-4 bg-zinc-800 rounded-lg shadow-sm hover:shadow-md transition duration-150"
                        >
                            <div className="text-left">
                                <p className="text-lg font-medium text-amber-200">{place.name}</p>
                                <p className="text-sm text-gray-200 truncate mt-1">
                                    Saved by:
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