import "react-native-gesture-handler";
import { ROUTES } from "../constants";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { OnboardScreen, AccountRecoveryScreen, SettingsScreen, CreateRoomScreen, CreateChallengeScreen, RoomScreen } from "~screens";
import { BottomTabNavigator } from "~navigation/BottomTabNavigator";
import { LoginScreen } from "~screens/login/LoginScreen";
import { SignUpScreen } from "~screens/signup/SignUpScreen";
import { ModalStack } from "~navigation/ModalStack";
import { isAppReadyAtom, isUserOnboardedAtom } from "~state";
import { useAtomValue } from "jotai";

const { Navigator, Screen, Group } = createStackNavigator();
// TODO: Add TypeScript Support to Navigator - const { Navigator, Screen, Group } = createStackNavigator<RootStackParamList>()

export const RootNavigator = () => {
  const isAppReady = useAtomValue(isAppReadyAtom);
  const isUserOnboarded = useAtomValue(isUserOnboardedAtom);

  return (
    <Navigator screenOptions={{ headerShown: false }}>
      {isAppReady && !isUserOnboarded ? (
        <Group key='unauthorized'>
          <Screen name={ROUTES.BENEFIT} component={OnboardScreen} />
        </Group>
      ) : null}

      {isAppReady && isUserOnboarded ? (
        <Group key='authorized'>
          <Screen name={ROUTES.MAIN_APP} component={BottomTabNavigator} />
          <Screen name={ROUTES.RECOVER_ACCOUNT} component={AccountRecoveryScreen} />
          <Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
          <Screen name={ROUTES.LOGIN} component={LoginScreen} />
          <Screen name={ROUTES.SIGNUP} component={SignUpScreen} />
          <Screen name={ROUTES.CREATE_ROOM} component={CreateRoomScreen} />
          <Screen name={ROUTES.CREATE_CHALLENGE} component={CreateChallengeScreen} />
          <Screen name={ROUTES.SINGLE_ROOM} component={RoomScreen} />
        </Group>
      ) : null}

      {isAppReady ? (
        <Group key='modals' screenOptions={{ presentation: "modal" }}>
          <Screen name={ROUTES.MODAL} component={ModalStack} />
        </Group>
      ) : null}
    </Navigator>
  );
};
