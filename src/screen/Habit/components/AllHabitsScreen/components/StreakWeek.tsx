import { StyleSheet, Text, View } from 'react-native'
import moment from 'moment/moment'
import { useEffect, useState } from 'react'
import { WeeklyCalendarDateType } from '@shared/types'
import { APP_GRAY, APP_WHITE, HABIT_OPTION, MAIN_ACCENT_COLOR } from '@styles/colors'
import { Habit } from '@data/types'
import { ActionGetCompletedStatForHabitIdUserIdAndDate } from '@actions/actionGetCompletedStatForHabitIdUserIdAndDate'
import { useAtomValue } from 'jotai/index'
import { userAtom } from '@state/state'

interface IDayOfTheWeek {
  day: WeeklyCalendarDateType,
  habitId: Habit['id']
}

export const StreakWeek = (props: IDayOfTheWeek) => {
  const { day, habitId } = props
  const [isHighlighted, setIsHighlighted] = useState(false)

  const user = useAtomValue(userAtom)

  useEffect(() => {
    // TODO: Add loading state
    let isMounted = true
    if (isMounted) {
      getStat()
    }

    return () => {
      isMounted = false
    }
  }, [])

  const getStat = async () => {
    const docs = await ActionGetCompletedStatForHabitIdUserIdAndDate(habitId, day.date, user.id)

    if (docs.size > 0) {
      docs.forEach((doc) => {
        if (doc.data().habitId === habitId) setIsHighlighted(true)
      })
    }
  }


  return (
    <View
      key={day.date.toString()}
      style={{
        ...styles.day,
        backgroundColor: isHighlighted ? MAIN_ACCENT_COLOR : APP_WHITE,
        borderColor: isHighlighted ? MAIN_ACCENT_COLOR : APP_GRAY
      }}
    >
      <Text style={{
        ...styles.dayText, color: isHighlighted ? APP_WHITE : HABIT_OPTION
      }}>
        {day.day}
      </Text>
      <Text style={{
        ...styles.dayNumber,
        color: isHighlighted ? APP_WHITE : HABIT_OPTION
      }}>{moment(day.date).format('DD')}</Text>
    </View>

  )
}


const styles = StyleSheet.create({
  day: {
    width: 50,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_GRAY,
    padding: 13
  },
  dayText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: HABIT_OPTION
  },
  dayNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: HABIT_OPTION
  }
})

