import { collection, getDocs, query, where } from 'firebase/firestore'
import { FIREBASE_DB } from '@db/firebaseConfig'

export const ActionGetStatsByUserId = async (userId) => {
  return await getDocs(
    query(
      collection(FIREBASE_DB, 'habits'),
      where('userId', '==', userId)
    )
  )
}
