import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import moment from 'moment/moment'
import { useEffect, useState } from 'react'
import { WeeklyCalendarDateType } from '../../../../../shared'
import { APP_GRAY, APP_WHITE, HABIT_OPTION, MAIN_ACCENT_COLOR } from '../../../../../styles'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { FIREBASE_DB } from '@db/firebaseConfig'

interface IDayOfTheWeek {
  day: WeeklyCalendarDateType
}

export const StreakWeek = (props: IDayOfTheWeek) => {
  const { day } = props
  const [isHighlighted, setIsHighlighted] = useState(false)

  useEffect(() => {
    // TODO: Add loading state
    let isMounted = true

    if (isMounted) {
      getProgress()
    }

    return () => {
      isMounted = false
    }

  }, [])

  const getProgress = async () => {
    const docs = await getDocs(
      query(
        collection(FIREBASE_DB, 'stats'),
        where('completedAt', '==', day.date.toDateString())
      )
    )

    if (docs.size > 0) {
      setIsHighlighted(true)
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
