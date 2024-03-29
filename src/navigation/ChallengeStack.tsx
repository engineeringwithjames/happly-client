import "react-native-gesture-handler";
import { ROUTES } from "~constants";
import { ChallengesScreen } from "~screens";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const { Navigator, Screen } = createStackNavigator();

export const ChallengeStack = () => {
  return (
    <Navigator screenOptions={{ headerShown: false }}>
      <Screen name={ROUTES.ALL_CHALLENGES} component={ChallengesScreen} />
    </Navigator>
  );
};
