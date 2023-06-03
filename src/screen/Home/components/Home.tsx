import { SafeAreaView } from 'react-native'
import React from 'react'
import { useAtomValue } from 'jotai'
import { MAIN_BG_COLOR } from '../../../styles'
import { HabitList, UserProfile, WeekCalendar } from '../../../components'
import { EditHabitModal } from '../../Modals'
import { selectedHabitAtom, showDeleteModalAtom } from '../../../state/state'

export const Home = ({ navigation }) => {
  const habitSelected = useAtomValue(selectedHabitAtom)
  const isDeleteHabitModalOpen = useAtomValue(showDeleteModalAtom)

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: MAIN_BG_COLOR
    }}
    >
      <UserProfile navigation={navigation} />
      <WeekCalendar />
      <HabitList />
      {habitSelected ? <EditHabitModal /> : null}
      {/* {isDeleteHabitModalOpen ? <DeleteHabitModal /> : null} */}
    </SafeAreaView>
  )
}

