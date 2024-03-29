import { doc, setDoc } from 'firebase/firestore'
import { FIREBASE_DB } from '~data'

export const ActionCreateUser = async (user, uid) => {
  return await setDoc(doc(FIREBASE_DB, 'users', uid), user)
}
