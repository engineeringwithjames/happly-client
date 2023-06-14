import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native'
import { useToast } from 'react-native-toast-notifications'
import Modal from 'react-native-modal'
import { useAtom, useSetAtom } from 'jotai'
import {
  dailyHabitsAtom,
  editHabitAtom, habitsAtom, progressAtom,
  selectedHabitAtom, showDeleteModalAtom
} from '@state/state'
import {
  APP_BLACK,
  APP_WHITE, GRAY_TEXT,
  MAIN_ACCENT_COLOR
} from '../../styles'
import Icon from 'react-native-vector-icons/Ionicons'
import { generateStatId } from '../../generators/generateId'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { FIREBASE_DB } from '@data/firebaseConfig'
import React from 'react'
import { ROUTES } from '../../constants'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ActionCreateStat } from '@actions/actionCreateStat'
import { ActionGetUserHabitById } from '@actions/actionGetUserHabitById'
import { ActionDeleteHabitById } from '@actions/actionDeleteHabitById'
import { ActionDeleteStatsById } from '@actions/actionDeleteStatsById'
import { ActionDeleteStreakByHabitId } from '@actions/actionDeleteStreakByHabitId'


export const EditHabitModal = () => {
  const { navigate } = useNavigation<NativeStackNavigationProp<ParamListBase>>()
  const toast = useToast()

  const [habitSelected, setSelectedHabit] = useAtom(selectedHabitAtom)
  const [progress, setProgress] = useAtom(progressAtom)
  const setDailyHabits = useSetAtom(dailyHabitsAtom)
  const setHabits = useSetAtom(habitsAtom)
  const setEditHabit = useSetAtom(editHabitAtom)
  const setDeleteModal = useSetAtom(showDeleteModalAtom)

  const deleteHabit = async () => {
    const dataDocumentSnapshot = await ActionGetUserHabitById(habitSelected.id)

    if (dataDocumentSnapshot.exists()) {
      try {
        await ActionDeleteHabitById(habitSelected.id)

        const habitStat = progress.find((stat) => stat.habitId === habitSelected.id)

        if (habitStat) {
          await ActionDeleteStatsById(habitStat.id)
          setProgress((prev) => prev.filter((stat) => stat.id !== habitStat.id))

          await ActionDeleteStreakByHabitId(habitSelected.id)
        }

        // TODO: Improve this logic
        setDailyHabits((prev) => prev.filter((habit) => habit.id !== habitSelected.id))
        setHabits(((prev) => prev.filter((habit) => habit.id !== habitSelected.id)))

        setSelectedHabit(null)
        setDeleteModal(false)

        toast.show('Habit Deleted', {
          type: 'danger',
          duration: 4000,
          placement: 'bottom',
          icon: <Icon name='trash' size={20} color={APP_WHITE} />
        })
      } catch (e) {
        toast.show('An error happened when deleting your habit. Please try again!', {
          type: 'danger',
          duration: 4000,
          placement: 'bottom',
          icon: <Icon name='alert-circle' size={20} color={APP_WHITE} />
        })
      }
    }

    setSelectedHabit(null)
  }

  const handleOnPressCloseIcon = () => {
    setSelectedHabit(null)
  }

  const handleOnPressDelete = () => {
    Alert.alert('', 'Are you sure you want to delete this habit?', [
        {
          text: 'Yes',
          onPress: () => deleteHabit(),
          style: 'destructive'
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        }
      ], { cancelable: false }
    )
  }

  const handleOnPressEdit = () => {
    setEditHabit(habitSelected)
    setSelectedHabit(null)
    navigate(ROUTES.CREATE_HABIT)
  }

  const handleOnPressMarkAsDone = async () => {
    const docs = await getDocs(
      query(
        collection(FIREBASE_DB, 'stats'),
        where('habitId', '==', habitSelected.id)
      )
    )

    if (docs.empty) {
      const stat = {
        id: generateStatId(),
        userId: habitSelected.userId,
        habitId: habitSelected.id,
        completedAt: new Date().toDateString(),
        progress: 100
      }

      try {
        await ActionCreateStat(stat)
        toast.show('Congratulations', {
          type: 'success',
          duration: 4000,
          placement: 'bottom',
          icon: <Icon name='trending-up' size={20} color={APP_WHITE} />
        })

      } catch (e) {
        toast.show('An error happened when completing your habit. Please try again!', {
          type: 'danger',
          duration: 4000,
          placement: 'bottom',
          icon: <Icon name='alert-circle' size={20} color={APP_WHITE} />
        })
      }
    }
  }

  if (habitSelected === null) {
    return null
  }

  return (
    <View style={styles.container}>
      <Modal
        isVisible={!!habitSelected}
        key={habitSelected.id}
        onBackdropPress={() => setSelectedHabit(null)}
        style={{ padding: 0, margin: 0 }}
        hideModalContentWhileAnimating={true}
      >
        <SafeAreaView style={{ display: 'flex', flex: 1, position: 'relative', alignItems: 'center' }}>
          <View
            style={styles.bodySectionContainer}>
            <View style={styles.titleSection}>
              <View>
                <Text style={styles.habitTitle}>{habitSelected.name}</Text>
                <Text style={styles.highlightText}>Reminder: (In
                  30mins) {/* TODO: write function to figure out the time difference consider a case where reminder is past */} </Text>
              </View>
              <TouchableOpacity onPress={handleOnPressCloseIcon}>
                <Icon style={styles.closeIcon} name='close' size={25} color={APP_WHITE} />
              </TouchableOpacity>
            </View>

            <View style={styles.bodySection}>
              <Icon style={styles.icon} name='notifications-outline' size={25} color={APP_BLACK} />
              <View>
                <Text style={styles.highlightText}>Reminders</Text>
                {/*<Text style={styles.infoText}>{habitSelected?.reminderAt}</Text>*/}
              </View>
            </View>

            <View style={styles.bodySection}>
              <Icon style={styles.icon} name='options-outline' size={25} color={APP_BLACK} />
              <View>
                <Text style={styles.highlightText}>Description</Text>
                <Text style={styles.infoText}>{habitSelected.description}</Text>
              </View>
            </View>

            <View style={styles.actionSection}>
              <TouchableOpacity style={styles.actionSectionButton} onPress={handleOnPressDelete}>
                <Icon name='trash' size={25} color={APP_BLACK} />
                <Text style={styles.infoText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionSectionButton} onPress={handleOnPressEdit}>
                <Icon name='create-outline' size={25} color={APP_BLACK} />
                <Text style={styles.infoText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionSectionButton} onPress={handleOnPressMarkAsDone}>
                <Icon name='checkbox-outline' size={25} color={APP_BLACK} />
                <Text style={styles.infoText}>Mark as done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  bodySectionContainer: {
    width: '100%',
    marginTop: 30,
    position: 'absolute',
    bottom: 0,
    backgroundColor: APP_WHITE,
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#d9d9d9',
    paddingBottom: 15
  },
  bodySection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#d9d9d9'
  },
  actionSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 10
  },
  actionSectionButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100
  },
  habitTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 24,
    color: GRAY_TEXT,
    marginBottom: 3
  },
  highlightText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 12,
    color: GRAY_TEXT
  },
  infoText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 15,
    color: GRAY_TEXT,
    marginTop: 3
  },
  icon: {
    marginRight: 15
  },
  closeIcon: {
    backgroundColor: MAIN_ACCENT_COLOR,
    width: 30,
    height: 30,
    padding: 2,
    display: 'flex',
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    color: APP_WHITE
  }
})
