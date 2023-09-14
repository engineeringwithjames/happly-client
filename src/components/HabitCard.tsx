import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import { useSetAtom, useAtomValue } from "jotai";
import { useToast } from "react-native-toast-notifications";
import { Habit, HabitType, Stats, Streak } from "~types";
import {
  progressAtom,
  selectedDayOfTheWeekAtom,
  selectedHabitAtom
} from "~state";
import {
  ActionCreateOrUpdateStreak,
  ActionGetStatsByHabitId,
  ActionGetStreakByHabitId
} from "~actions";
import { APP_GRAY, APP_GREEN, APP_WHITE } from "~styles";
import moment from "moment";
import {
  checkIfChallengeIsCompleted,
  getMessageRelatedToStreakData,
  markHabitAsDone,
  validateHabitStreak
} from "~utils";
import { useTheme } from "~hooks";

type HabitCardType = {
  habit: Habit;
  progress: Stats[];
};

export const HabitCard = ({ habit, progress }: HabitCardType) => {
  const toast = useToast();
  const { theme } = useTheme();

  const currentDate = moment().format("YYYY-MM-DD");
  const currentMonth = moment(currentDate).month() + 1;
  const setHabitSelected = useSetAtom(selectedHabitAtom);
  const setProgress = useSetAtom(progressAtom);
  const selectedDay = useAtomValue(selectedDayOfTheWeekAtom);

  const foundProgress = progress.find((stat) => stat.habitId === habit.id);

  const [streakCountMessage, setStreakCountMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      getHabitStreak();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleHabitClick = () => {
    if (habit) {
      setHabitSelected(habit);
    }
  };

  const handleCompletedHabit = async () => {
    const { message, stat } = await markHabitAsDone({
      habit,
      selectedDay,
      isHabitCard: true
    });

    if (!stat) {
      toast.show(message, {
        type: "danger",
        duration: 4000,
        placement: "bottom",
        icon: <Icon name='alert-circle' size={20} color={theme.APP_WHITE} />
      });
      return;
    }

    await ActionCreateOrUpdateStreak(habit.id, habit.userId);

    // TODO: Add logic to check the stats and update the habit accordingly
    setProgress((prev) => [...prev, stat]);

    getHabitStreak();

    if (habit.type === HabitType.REGULAR) {
      toast.show(message, {
        type: "success",
        duration: 4000,
        placement: "bottom",
        icon: <Icon name='trending-up' size={20} color={theme.APP_WHITE} />
      });
    } else {
      const data = await checkIfChallengeIsCompleted({
        challengeId: habit.challengeId,
        habitId: habit.id
      });
      if (!data) {
        toast.show(
          "Having trouble check if you have completed your challenge. Please try again!",
          {
            type: "success",
            duration: 4000,
            placement: "bottom",
            icon: <Icon name='trending-up' size={20} color={theme.APP_WHITE} />
          }
        );
      } else {
        const { streakCount, challengeDuration } = data;
        if (streakCount >= challengeDuration) {
          toast.show("Woooohooooo you have completed the challenge", {
            type: "success",
            duration: 4000,
            placement: "bottom",
            icon: <Icon name='trending-up' size={20} color={theme.APP_WHITE} />
          });
        } else {
          toast.show(
            `You rock. You have ${
              challengeDuration - streakCount
            } day(s) left to complete the challenge`,
            {
              type: "success",
              duration: 4000,
              placement: "bottom",
              icon: (
                <Icon name='trending-up' size={20} color={theme.APP_WHITE} />
              )
            }
          );
        }
      }
    }
  };

  const getHabitStreak = async () => {
    if (!habit) {
      return;
    }

    const streakDocs = await ActionGetStreakByHabitId(habit.id);
    const statsDocs = await ActionGetStatsByHabitId(habit.id);

    if (!streakDocs) return;

    if (!statsDocs) return;

    const streaks: Streak[] = [];
    streakDocs.forEach((doc) => {
      const data = doc.data() as unknown as Streak;
      streaks.push(data);
    });

    const progress: Stats[] = [];
    statsDocs.forEach((stat) => {
      const data = stat.data() as unknown as Stats;
      if (new Date(data.completedAt).getMonth() + 1 === currentMonth)
        progress.push(data);
    });

    const streak = await validateHabitStreak(streaks[0], habit, progress);

    if (streak) {
      const streakCountMessage = getMessageRelatedToStreakData(streak);
      setStreakCountMessage(streakCountMessage);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleHabitClick}
        style={styles.habitNameContainer}
      >
        <Text style={styles.habitName}>{habit.name}</Text>
        {streakCountMessage && streakCountMessage !== "" ? (
          <Text style={styles.habitInfo}>{streakCountMessage}</Text>
        ) : (
          <Text style={styles.habitInfo}>{habit.description}</Text>
        )}
      </TouchableOpacity>
      <View style={styles.habitProgressContainer}>
        <View style={styles.habitProgress}>
          {foundProgress ? (
            <View
              style={{
                width: 50,
                backgroundColor: "white",
                borderRadius: 50
              }}
            >
              <Icon
                style={{
                  marginTop: -9,
                  marginLeft: -5,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
                name='checkmark-circle'
                size={63}
                color={APP_GREEN}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.habitProgressInner}
              onPress={handleCompletedHabit}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 80,
    backgroundColor: APP_GRAY,
    borderRadius: 10,
    marginBottom: 20,
    padding: 20
  },
  habitNameContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "80%"
  },
  habitName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5
  },
  habitProgressContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  habitInfo: {
    backgroundColor: APP_GRAY,
    fontSize: 10,
    lineHeight: 12
  },
  habitProgress: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: APP_GREEN,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  habitProgressInner: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: APP_WHITE
  }
});
