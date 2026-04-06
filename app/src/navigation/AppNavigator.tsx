import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../types';

// Screens
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import AddGlucoseScreen from '../screens/Glucose/AddGlucoseScreen';
import AddFoodScreen from '../screens/Food/AddFoodScreen';
import AddJournalScreen from '../screens/Journal/AddJournalScreen';
import DiagnosisDetailScreen from '../screens/Diagnosis/DiagnosisDetailScreen';
import TipDetailScreen from '../screens/Tips/TipDetailScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';

// Tab navigator
import TabNavigator from './TabNavigator';

// Stack screens that exist outside tabs
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ReportsScreen from '../screens/Reports/ReportsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import WaterScreen from '../screens/Water/WaterScreen';
import MedicationsScreen from '../screens/Medications/MedicationsScreen';
import GoalsScreen from '../screens/Goals/GoalsScreen';
import FAQScreen from '../screens/FAQ/FAQScreen';
import DiagnosisScreen from '../screens/Diagnosis/DiagnosisScreen';
import TipsScreen from '../screens/Tips/TipsScreen';

const Stack = createNativeStackNavigator<any>();

export default function AppNavigator() {
  const { onboarded } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!onboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : null}
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
        <Stack.Screen name="Medications" component={MedicationsScreen} />
        <Stack.Screen name="Goals" component={GoalsScreen} />
        <Stack.Screen name="FAQ" component={FAQScreen} />
        <Stack.Screen name="Diagnosis" component={DiagnosisScreen} />
        <Stack.Screen name="Tips" component={TipsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
