import 'react-native-get-random-values'
import { nanoid } from 'nanoid'

export type UniqueId<Id extends string> = `${Id}-${string}`

export const generateId = <Id extends string>(id: Id): UniqueId<Id> => {
  console.log('generateId', id)
  return `${id}-${nanoid(16)}`
}

export const generateUserId = () => generateId('user')
export const generateHabitId = () => generateId('habit')