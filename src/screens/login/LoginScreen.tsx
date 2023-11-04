import { KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { CustomButton, CustomTextInput } from "~components";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "~data";
import { useSetAtom } from "jotai";
import { userAtom } from "~state";
import { User } from "~types";
import { ActionGetUserByUID } from "~actions";
import Icon from "react-native-vector-icons/Ionicons";
import { useToast } from "react-native-toast-notifications";
import { formValidationOnBlur, storeData, useMetric } from "~utils";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ASYNC_STORAGE_KEYS, ROUTES } from "~constants";
import { useTheme } from "~hooks";

export const LoginScreen = () => {
  const { navigate } = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { theme } = useTheme();
  const { horizontalScale, verticalScale, moderateScale } = useMetric();

  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  const setUser = useSetAtom(userAtom);

  const validateForm = () => {
    let valid = true;
    if (password === "") {
      setPasswordError("Please enter your password");
      setLoading(false);
      valid = false;
    }

    if (email === "") {
      setEmailError("Please enter your email address");
      setLoading(false);
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    setLoading(true);

    const isFormValid = validateForm();

    if (isFormValid) {
      try {
        // TODO: Redo this sign up logic due to the new system of authentication
        const userCredentialPromise = await signInWithEmailAndPassword(
          FIREBASE_AUTH,
          email,
          password
        );
        if (userCredentialPromise && userCredentialPromise.user) {
          const dataDocumentSnapshot = await ActionGetUserByUID(userCredentialPromise.user.uid);
          if (dataDocumentSnapshot.exists()) {
            const user = dataDocumentSnapshot.data() as User;
            if (user) {
              await storeData(ASYNC_STORAGE_KEYS.USER_ID, user.id);
              await storeData(ASYNC_STORAGE_KEYS.USER_UUID, userCredentialPromise.user.uid);
              setUser(user);
              navigate(ROUTES.MAIN_APP, {
                screen: ROUTES.MAIN_HOME
              });
            }
          } else {
            toast.show("'Your account doesn't exist. Please sign up'", {
              type: "danger",
              duration: 4000,
              placement: "bottom",
              icon: <Icon name='alert-circle' size={moderateScale(20)} color={theme.APP_WHITE} />
            });
          }
        }
      } catch (error) {
        toast.show("Login failed. Please try again!", {
          type: "danger",
          duration: 4000,
          placement: "bottom",
          icon: <Icon name='alert-circle' size={moderateScale(20)} color={theme.APP_WHITE} />
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.AuthScreenContainer,
        {
          backgroundColor: theme.SECONDARY_BG_COLOR
        }
      ]}
    >
      <KeyboardAvoidingView
        behavior='padding'
        style={[
          styles.AuthForm,
          {
            paddingTop: verticalScale(80),
            paddingBottom: verticalScale(60),
            paddingLeft: horizontalScale(20),
            paddingRight: horizontalScale(20)
          }
        ]}
      >
        <View style={styles.AuthFormHeaderContainer}>
          <Text
            style={[
              styles.AuthFormHeader,
              {
                fontSize: moderateScale(28),
                marginBottom: verticalScale(12)
              }
            ]}
          >
            Welcome Back ✌️
          </Text>
          <Text
            style={[
              styles.AuthFormInfo,
              {
                fontSize: moderateScale(16),
                lineHeight: verticalScale(19)
              }
            ]}
          >
            Enter login details to get started.
          </Text>
          <View
            style={[
              styles.AuthFormBody,
              {
                marginTop: verticalScale(40)
              }
            ]}
          >
            <CustomTextInput
              label='Email Address'
              placeholder='Enter Email Address'
              handleChange={setEmail}
              handleBlur={() => setEmailError(formValidationOnBlur("email", email))}
              value={email}
              error={emailError}
            />
            <CustomTextInput
              label='Password'
              placeholder='Enter Password'
              handleChange={setPassword}
              handleBlur={() => setPasswordError(formValidationOnBlur("password", password))}
              value={password}
              secureTextEntry={true}
              error={passwordError}
            />
          </View>
        </View>
        <View style={styles.AuthFormActionBtn}>
          <Text
            style={[
              styles.ActionTextContainer,
              {
                marginVertical: verticalScale(12),
                lineHeight: verticalScale(20)
              }
            ]}
          >
            <Text
              style={[
                styles.ActionText,
                {
                  fontSize: moderateScale(14),
                  letterSpacing: moderateScale(0.25)
                }
              ]}
            >
              Don't have an account?{" "}
            </Text>
            <Text
              style={[
                styles.HighlightedText,
                {
                  color: theme.MAIN_ACCENT_COLOR,
                  fontSize: moderateScale(14),
                  letterSpacing: moderateScale(0.25)
                }
              ]}
              onPress={() => navigate(ROUTES.SIGNUP)}
            >
              Sign Up
            </Text>
          </Text>
          <CustomButton
            bgColor={theme.MAIN_ACCENT_COLOR}
            color={theme.APP_WHITE}
            text='Login'
            onClick={handleLogin}
            disabled={loading}
          />
          <View
            style={[
              styles.ActionTextContainer,
              {
                marginVertical: verticalScale(12)
              }
            ]}
          >
            <Text
              style={[
                styles.ActionText,
                {
                  fontSize: moderateScale(14),
                  letterSpacing: moderateScale(0.25)
                }
              ]}
            >
              Forgot Password?{" "}
            </Text>
            <Text
              style={[
                styles.HighlightedText,
                {
                  color: theme.MAIN_ACCENT_COLOR,
                  fontSize: moderateScale(14),
                  letterSpacing: moderateScale(0.25)
                }
              ]}
              onPress={() => console.log("navigate to password recovery")}
            >
              Recover Password
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  AuthScreenContainer: {},
  AuthForm: {
    height: "100%",
    display: "flex",
    justifyContent: "space-between"
  },
  AuthFormHeaderContainer: {
    display: "flex",
    justifyContent: "space-between"
  },
  AuthFormHeader: {
    fontFamily: "Inter_700Bold",
    fontStyle: "normal",
    fontWeight: "700"
  },
  AuthFormInfo: {
    fontFamily: "Inter_400Regular",
    fontStyle: "normal",
    color: "#959595"
  },
  AuthFormBody: {},
  AuthFormActionBtn: {
    display: "flex",
    alignItems: "center"
  },
  HighlightedText: {
    fontFamily: "Inter_700Bold",
    fontStyle: "normal",
    fontWeight: "700"
  },
  ActionTextContainer: {
    display: "flex",
    flexDirection: "row"
  },
  ActionText: {
    fontFamily: "Inter_400Regular",
    fontStyle: "normal",
    fontWeight: "400",
    color: "#686868"
  }
});
