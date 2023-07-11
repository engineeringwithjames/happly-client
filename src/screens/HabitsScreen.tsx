import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { APP_BLACK } from '~styles'
import { habitsAtom, userAtom } from '~state'
import { useAtom, useAtomValue } from 'jotai'
import { ActionGetHabitsByUserId } from '~actions'
import { onSnapshot } from 'firebase/firestore'
import { Habit } from '~types'
import { CalendarWeekView } from '~components'


export const HabitsScreen = () => {
  const [allHabits, setHabits] = useAtom(habitsAtom)
  const user = useAtomValue(userAtom)


  useEffect(() => {
    // TODO: Add loading state
    let isMounted = true

    if (isMounted) {
      getHabits()
    }

    return () => {
      isMounted = false
    }

  }, [])

  const getHabits = async () => {
    const habitsQuery = ActionGetHabitsByUserId(user.id)

    const unsubscribe = onSnapshot(habitsQuery, (querySnapshot) => {
        const habits: Habit[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data() as unknown as Habit
            habits.push(data)
          }
        )
        setHabits(habits)
      }
    )

    return () => unsubscribe()
  }


  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Habits</Text>
        <View>
          {allHabits.map((habit) => (
            <CalendarWeekView key={habit.id} habit={habit} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#F4F3F3',
    flex: 1
  },
  container: {
    padding: 20
  },
  headerText: {
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 30,
    lineHeight: 36,
    color: APP_BLACK,
    display: 'flex',
    marginBottom: 20
  }
})