import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { Provider as StateProvider, useAtom } from "jotai";
import { ToastProvider } from "react-native-toast-notifications";
import { Navigation } from "~navigation";
import { AppLoading } from "~AppLoading";
import { AppState } from "react-native";
import { currentTimeOfDayAtom, selectedDayOfTheWeekAtom } from "~state";
import moment from "moment";
import { GetCurrentTimeOfDay } from "~utils/timeUtils";

const App = () => {
  const [selectedDay, setSelectedDay] = useAtom(selectedDayOfTheWeekAtom);
  const [currentTimeOfDay, setCurrentTimeOfDay] = useAtom(currentTimeOfDayAtom);
  const [appState, setAppState] = React.useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    console.log(`app state changed - ${nextAppState}`);
    if (nextAppState === "active") {
      // set the selected day to the current day
      const currentDay = moment().format("MMMM Do YYYY");
      if (selectedDay !== currentDay) {
        setSelectedDay(currentDay);
      }

      const timeOfDay = GetCurrentTimeOfDay();
      if (currentTimeOfDay !== timeOfDay) {
        setCurrentTimeOfDay(timeOfDay);
      }
    }
    setAppState(nextAppState);
  };

  return (
    <StateProvider>
      <ToastProvider placement='top' offsetTop={120} offsetBottom={120}>
        <AppLoading>
          <Navigation />
        </AppLoading>
      </ToastProvider>
    </StateProvider>
  );
};

export default App;
