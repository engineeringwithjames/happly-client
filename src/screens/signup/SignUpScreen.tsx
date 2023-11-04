import { KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { CustomButton, CustomTextInput } from "~components";
import { FIREBASE_AUTH } from "~data";
import { useAtom } from "jotai";
import { userAtom } from "~state";
import { useToast } from "react-native-toast-notifications";
import { ActionCreateUser, ActionDeleteUserById } from "~actions";
import { User } from "~types";
import Icon from "react-native-vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import { formValidationOnBlur, storeData, useMetric } from "~utils";
import { ASYNC_STORAGE_KEYS, ROUTES } from "~constants";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "~hooks";

export const SignUpScreen = () => {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale, moderateScale } = useMetric();

  const { navigate } = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const toast = useToast();

  const [user, setUser] = useAtom(userAtom);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    // TODO: Add a global validation
    let valid = true;
    if (fullName === "") {
      setFullNameError("Please enter your full name");
      setLoading(false);
      valid = false;
    }

    if (email === "") {
      setEmailError("Please enter your email address");
      setLoading(false);
      valid = false;
    }

    if (password === "") {
      setPasswordError("Please enter your password");
      setLoading(false);
      valid = false;
    }

    if (confirmPassword === "") {
      setConfirmPasswordError("Please confirm your password");
      setLoading(false);
      valid = false;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      setLoading(false);
      valid = false;
    }

    return valid;
  };

  const handleSignUp = async () => {
    setLoading(true);

    const isFormValid = validateForm();

    if (isFormValid) {
      try {
        // TODO: Redo this sign up logic due to the new system of authentication

        if (!user) {
          console.log("Could not find user's guest account");
          return;
        }

        const userCredentialPromise = await createUserWithEmailAndPassword(
          FIREBASE_AUTH,
          email,
          password
        );
        if (userCredentialPromise && userCredentialPromise.user) {
          const newUser: User = {
            id: user.id,
            email: userCredentialPromise.user.email,
            name: fullName,
            isAccountVerified: true,
            pushToken: user.pushToken
          };

          await storeData(ASYNC_STORAGE_KEYS.USER_UUID, userCredentialPromise.user.uid);
          await ActionCreateUser(newUser, userCredentialPromise.user.uid);
          await ActionDeleteUserById(user.id);
          setUser(newUser);
          navigate(ROUTES.MAIN_APP, {
            screen: ROUTES.MAIN_HOME
          });
        }
      } catch (error) {
        // TODO: If we find an account that is theirs we should give them the option to sign in automatically
        if (error.code === "auth/email-already-in-use") {
          toast.show("Email address already in use. Please try again!", {
            type: "danger",
            duration: 4000,
            placement: "bottom",
            icon: <Icon name='alert-circle' size={moderateScale(20)} color={theme.APP_WHITE} />
          });
        } else {
          toast.show("Sign up failed. Please try again!", {
            type: "danger",
            duration: 4000,
            placement: "bottom",
            icon: <Icon name='alert-circle' size={moderateScale(20)} color={theme.APP_WHITE} />
          });
        }
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
            Create An Account
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
            Provide required details and click the{" "}
            <Text style={{ color: theme.MAIN_ACCENT_COLOR }}>Sign Up</Text> button below.
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
              label='Full Name'
              placeholder='Enter your full name'
              handleChange={setEmail}
              handleBlur={() => setFullNameError(formValidationOnBlur("fullName", fullName))}
              value={email}
              error={fullNameError}
            />
            <CustomTextInput
              label='Email Address'
              placeholder='Enter your email address'
              handleChange={setEmail}
              handleBlur={() => setEmailError(formValidationOnBlur("email", email))}
              value={email}
              error={emailError}
            />
            <CustomTextInput
              label='Password'
              placeholder='Enter a password'
              handleChange={setPassword}
              handleBlur={() => setPassword(formValidationOnBlur("password", password))}
              value={password}
              secureTextEntry={true}
              error={passwordError}
            />
            <CustomTextInput
              label='Confirm password'
              placeholder='Re-enter your password'
              handleChange={setConfirmPassword}
              handleBlur={() => setConfirmPasswordError(formValidationOnBlur("password", password))}
              value={confirmPassword}
              secureTextEntry={true}
              error={confirmPasswordError}
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
              By clicking the "Sign Up" button, you accept the{" "}
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
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  "https://jamesodeyale.github.io/happly-docs/terms_and_conditions"
                )
              }
            >
              Terms and Conditions
            </Text>
            <Text style={styles.ActionText}> and </Text>
            <Text
              style={[styles.HighlightedText, { color: theme.MAIN_ACCENT_COLOR }]}
              onPress={() =>
                WebBrowser.openBrowserAsync("https://jamesodeyale.github.io/happly-docs/privacy")
              }
            >
              privacy policy
            </Text>
          </Text>
          <CustomButton
            bgColor={theme.MAIN_ACCENT_COLOR}
            color={theme.APP_WHITE}
            text='Sign Up'
            onClick={handleSignUp}
            disabled={loading}
          />
          <Text style={styles.ActionTextContainer}>
            <Text
              style={[
                styles.ActionText,
                {
                  fontSize: moderateScale(14),
                  letterSpacing: moderateScale(0.25)
                }
              ]}
            >
              Already have an account?{" "}
            </Text>
            <Text
              style={[styles.HighlightedText, { color: theme.MAIN_ACCENT_COLOR }]}
              onPress={() => navigate(ROUTES.LOGIN)}
            >
              Login
            </Text>
          </Text>
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
    flexDirection: "row",
    marginTop: 12
    // width: '40%',
    // height: '100%'
  },
  ActionText: {
    fontFamily: "Inter_400Regular",
    fontStyle: "normal",
    fontWeight: "400"
  }
});
