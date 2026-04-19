import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import { Colors } from '../theme';

// Auth screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Onboarding
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';

// Stack screens
import AddGlucoseScreen from '../screens/Glucose/AddGlucoseScreen';
import AddFoodScreen from '../screens/Food/AddFoodScreen';
import AddJournalScreen from '../screens/Journal/AddJournalScreen';
import DiagnosisDetailScreen from '../screens/Diagnosis/DiagnosisDetailScreen';
import TipDetailScreen from '../screens/Tips/TipDetailScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ReportsScreen from '../screens/Reports/ReportsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import WaterScreen from '../screens/Water/WaterScreen';
import SleepScreen from '../screens/Sleep/SleepScreen';
import AddSleepScreen from '../screens/Sleep/AddSleepScreen';
import MedicationsScreen from '../screens/Medications/MedicationsScreen';
import GoalsScreen from '../screens/Goals/GoalsScreen';
import FAQScreen from '../screens/FAQ/FAQScreen';
import DiagnosisScreen from '../screens/Diagnosis/DiagnosisScreen';
import TipsScreen from '../screens/Tips/TipsScreen';

// Tab navigator
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator<any>();

export default function AppNavigator() {
  const { onboarded } = useApp();
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!isLoggedIn ? (
          // ─── Auth stack ────────────────────────────────────────────────────────
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_right' }} />
          </>
        ) : (
          // ─── App stack ─────────────────────────────────────────────────────────
          <>
            {!onboarded && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="AddGlucose" component={AddGlucoseScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="AddFood" component={AddFoodScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="AddJournal" component={AddJournalScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="DiagnosisDetail" component={DiagnosisDetailScreen} />
            <Stack.Screen name="TipDetail" component={TipDetailScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Water" component={WaterScreen} />
            <Stack.Screen name="Sleep" component={SleepScreen} />
            <Stack.Screen name="AddSleep" component={AddSleepScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Medications" component={MedicationsScreen} />
            <Stack.Screen name="Goals" component={GoalsScreen} />
            <Stack.Screen name="FAQ" component={FAQScreen} />
            <Stack.Screen name="Diagnosis" component={DiagnosisScreen} />
            <Stack.Screen name="Tips" component={TipsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
