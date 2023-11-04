import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "~hooks";
import Icon from "react-native-vector-icons/Ionicons";
import { SingleChallengeCard } from "~components";
import { ChallengeType } from "~types/ChallengeType";
import {
  ActionCreateChallenge,
  ActionCreateHabit,
  ActionCreateOrUpdateStreak,
  ActionCreateReminders,
  ActionGetChallenges
} from "~actions";
import { onSnapshot } from "firebase/firestore";
import { useAtom, useAtomValue } from "jotai";
import { challengesAtom, userAtom } from "~state";
import { NotificationModal } from "~modals";
import moment from "moment";
import { Frequency, HabitType, TimeOfDay } from "~types";
import { generateHabitId } from "~generators";
import { useToast } from "react-native-toast-notifications";
import { useMetric } from "~utils";

export const ChallengesScreen = () => {
  const toast = useToast();
  const { theme } = useTheme();
  const [challenges, setChallenges] = useAtom(challengesAtom);
  const user = useAtomValue(userAtom);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<ChallengeType["id"] | null>(null);
  const { horizontalScale, verticalScale, moderateScale } = useMetric();

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      getChallenges();
    }
  }, []);

  const getChallenges = async () => {
    const dataDocumentSnapshotQuery = ActionGetChallenges();

    const unsubscribe = onSnapshot(dataDocumentSnapshotQuery, (querySnapshot) => {
      const challenges: ChallengeType[] = [];
      querySnapshot.forEach((doc) => {
        const challenge = doc.data() as ChallengeType;
        challenges.push(challenge);
      });
      setChallenges(challenges);
    });

    return () => unsubscribe();
  };

  const addUserToChallenge = async (formattedDate) => {
    try {
      // console.log("Joining challenge");
      // Alert.alert("Challenge feature is not available yet");
      if (!selectedChallengeId) {
        // TODO: Error handling here
        toast.show("Having problem adding you to that challenge right now...Please try again", {
          type: "danger",
          duration: 4000,
          placement: "bottom",
          icon: <Icon name='alert-circle-sharp' size={moderateScale(20)} color={theme.APP_WHITE} />
        });
        return;
      }

      const challenge = challenges.filter((c) => c.id === selectedChallengeId)[0];

      if (!challenge) {
        // TODO: Error handling here
        toast.show("This challenge has been deleted or does not exist anymore", {
          type: "danger",
          duration: 4000,
          placement: "bottom",
          icon: <Icon name='alert-circle-sharp' size={moderateScale(20)} color={theme.APP_WHITE} />
        });
        return;
      }

      // CREATE A HABIT
      const habit = await ActionCreateHabit({
        id: generateHabitId(),
        name: challenge.name,
        description: challenge.description,
        userId: user.id,
        timeOfDay: TimeOfDay.All,
        frequencyOption: Frequency.Daily,
        createdAt: moment().format("MMMM Do YYYY"),
        reminderAt: [formattedDate],
        type: HabitType.CHALLENGE,
        challengeId: challenge.id,
        selectedDays: []
      });

      if (!habit) {
        toast.show("Something went wrong", {
          type: "danger",
          duration: 4000,
          placement: "bottom",
          icon: <Icon name='alert-circle-sharp' size={moderateScale(20)} color={theme.APP_WHITE} />
        });
        return;
      }

      await ActionCreateOrUpdateStreak(habit.id, habit.userId);

      // CREATE A REMINDER FOR THAT CHALLENGE
      await ActionCreateReminders({
        reminderAt: [formattedDate],
        habitId: habit.id,
        userId: user.id,
        isDaily: true,
        daysOfWeek: []
      });

      // // INCREMENT THE NUMBER OF MEMBERS FOR A CHALLENGE
      await ActionCreateChallenge({
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        participants: [...challenge.participants, user.id],
        hashtags: challenge.hashtags,
        duration: challenge.duration
      });

      // SET THE SELECTED CHALLENGE ID BACK TO UNDEFINED
      setSelectedChallengeId(null);

      // SENT BACK TOAST MESSAGE SAYING THE USER HAS BEEN ADDED TO THE CHALLENGE
      toast.show("You have been added to the challenge!", {
        type: "success",
        duration: 4000,
        placement: "bottom",
        icon: (
          <Icon name='checkmark-circle-sharp' size={moderateScale(20)} color={theme.APP_WHITE} />
        )
      });
    } catch (error) {
      toast.show("Something went wrong", {
        type: "danger",
        duration: 4000,
        placement: "bottom",
        icon: <Icon name='alert-circle-sharp' size={moderateScale(20)} color={theme.APP_WHITE} />
      });
      return;
    }
  };

  const handlePopupReminder = async (challengeId: ChallengeType["id"]) => {
    // setShowNotificationModal(true);
    // setSelectedChallengeId(challengeId);
    Alert.alert("Challenge feature is not available yet");
    return;
  };

  const handleTimeSelected = (selectedDate: Date) => {
    const formattedDate = moment(selectedDate).format("YYYY-MM-DDTHH:mm:ss");
    setShowNotificationModal(false);
    addUserToChallenge(formattedDate);
  };

  return (
    <>
      <SafeAreaView
        style={[
          styles.wrapper,
          {
            backgroundColor: theme.MAIN_BG_COLOR
          }
        ]}
      >
        <View
          style={[
            styles.container,
            {
              paddingVertical: verticalScale(20),
              paddingHorizontal: horizontalScale(20),
              marginBottom: verticalScale(20)
            }
          ]}
        >
          <View
            style={[
              styles.header,
              {
                marginBottom: verticalScale(20)
              }
            ]}
          >
            <Text
              style={[
                styles.headerText,
                {
                  color: theme.MAIN_TEXT_COLOR,
                  fontSize: moderateScale(30),
                  lineHeight: verticalScale(36)
                }
              ]}
            >
              Challenge
            </Text>
            <TouchableOpacity onPress={() => console.log("searching")}>
              <Icon name='search' size={moderateScale(30)} color={theme.MAIN_TEXT_COLOR} />
            </TouchableOpacity>
          </View>
          {/*
          TODO: Down the line I should have a list of challenges created by the
          user and some popular challenges that are trending. For now, I'll just
          have a list of popular challenges.
          Popular Challenges depends on the amount of member in the challenge.
        */}
          {/* {challenges && challenges.length > 0 && (
          <View>
            <Text>This user does not have any challenges</Text>
          </View>
        )} */}

          {challenges && challenges.length === 0 && (
            <View
              style={{
                display: "flex"
              }}
            >
              <Text>No challenge created</Text>
            </View>
          )}
          {challenges && challenges.length > 0 && (
            <ScrollView style={{ marginBottom: verticalScale(70) }}>
              {challenges.map((challenge, index) => (
                <SingleChallengeCard
                  key={index}
                  challenge={challenge}
                  handlePopupReminder={handlePopupReminder}
                  isUserPartOfChallenge={challenge.participants.includes(user.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
      {showNotificationModal && (
        <NotificationModal
          handleTimeSelected={handleTimeSelected}
          closeNotificationModal={() => setShowNotificationModal(false)}
          reminderBody='What time should we remind you to do this challenge?'
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  container: {},
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerText: {
    fontStyle: "normal",
    fontWeight: "700",
    display: "flex"
  }
});
