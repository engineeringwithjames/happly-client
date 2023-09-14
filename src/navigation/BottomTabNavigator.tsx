import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ROUTES } from "~constants";
import { HABIT_OPTION, MAIN_ACCENT_COLOR, SECONDARY_BG_COLOR } from "~styles";
import { CustomTabItem } from "~components";
import { HomeStack } from "~navigation/HomeStack";
import { HabitStack } from "~navigation/HabitStack";
import { ChallengeStack } from "~navigation/ChallengeStack";
import { RoomStack } from "~navigation/RoomStack";
import { CreateHabitScreen } from "~screens";
import { useScreenTracker, useTheme } from "~hooks";
import { useRoute } from "@react-navigation/native";
import { horizontalScale, moderateScale, verticalScale } from "~utils";

const { Navigator, Screen } = createBottomTabNavigator();

const specialScreens = new Set([ROUTES.CREATE_HABIT, ROUTES.CREATE_CHALLENGE, ROUTES.CREATE_ROOM]);

export const BottomTabNavigator = () => {
  const { theme } = useTheme();
  const route = useRoute();

  return (
    <Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarInactiveTintColor: HABIT_OPTION,
        tabBarStyle: {
          ...styles.tabBarStyle,
          display: specialScreens.has(route.name) ? "none" : "flex",
          backgroundColor: theme.SECONDARY_BG_COLOR
        },
        tabBarActiveTintColor: MAIN_ACCENT_COLOR,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          let tabName;

          if (route.name === ROUTES.HOME) {
            iconName = focused ? "ios-home-sharp" : "ios-home-outline";
            tabName = "Home";
          } else if (route.name === ROUTES.ALL_HABIT) {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
            tabName = "Habit";
          } else if (route.name === ROUTES.CHALLENGES) {
            iconName = focused ? "ios-trophy" : "ios-trophy-outline";
            tabName = "Challenge";
          } else if (route.name === ROUTES.ROOMS) {
            iconName = focused ? "ios-chatbox-ellipses" : "ios-chatbox-ellipses-outline";
            tabName = "Rooms";
          } else if (route.name === ROUTES.CREATE_HABIT) {
            iconName = focused ? "add-circle" : "add-circle-outline";
            tabName = "Create";
          }

          return (
            <CustomTabItem name={tabName} icon={iconName} size={moderateScale(22)} color={color} focused={focused} />
          );
        }
      })}
    >
      <Screen name={ROUTES.HOME} component={HomeStack} />
      <Screen name={ROUTES.ALL_HABIT} component={HabitStack} />
      <Screen name={ROUTES.CREATE_HABIT} component={CreateHabitScreen} />
      <Screen name={ROUTES.CHALLENGES} component={ChallengeStack} />
      <Screen name={ROUTES.ROOMS} component={RoomStack} />
    </Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    display: "flex",
    position: "absolute",
    borderTopWidth: 0,
    bottom: 0,
    right: 0,
    left: 0,
    height: verticalScale(90),
    paddingLeft: horizontalScale(15),
    paddingRight: horizontalScale(15),
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    zIndex: 10
  }
});
