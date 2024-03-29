import { doc, getDoc } from 'firebase/firestore'
import { FIREBASE_DB } from '~data'

export const ActionGetStreakById = async (id) => {
  return await getDoc(doc(FIREBASE_DB, 'streak', id))
}
