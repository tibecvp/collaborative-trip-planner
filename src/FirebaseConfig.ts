// src/FirebaseConfig.ts
import { initializeApp } from 'firebase/app'
import {getAuth, signInAnonymously} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const APP_ID = '1:1073513882122:web:f8a41819708a6537dab5f3'

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAetvlzo6gJuozUPN534Fx5l03DZN8I3t4",
    authDomain: "trip-planner-45576.firebaseapp.com",
    projectId: "trip-planner-45576",
    storageBucket: "trip-planner-45576.firebasestorage.app",
    messagingSenderId: "1073513882122",
    appId: APP_ID,
    measurementId: "G-5GLPMZY7CG"
}

// Initialize Firebase App
const app = initializeApp(FIREBASE_CONFIG)

// Get Auth and Firestore services
const auth = getAuth(app)
const db = getFirestore(app)

// Define the core collection path using the convention
const SHARED_PLACES_PATH = `/artifacts/${APP_ID}/public/data/shared_places`

/**
 * Handles Anonymous Sign-in and returns the User ID.
 * The session is persistent across refreshness.
 */
export async function initializeUser(){
    try {
        const userCredential = await signInAnonymously(auth)
        const userId = userCredential.user.uid
        console.log('Firebase initialized and user signed in:', userId)
        return userId
    } catch (error) {
        console.error("Firebase Initialization or Sign-in Failed:", error)
        throw new Error("Authentication failed.")
    }
}

export { db, auth, SHARED_PLACES_PATH }