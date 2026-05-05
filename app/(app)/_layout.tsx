import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { auth } from '@/services/auth';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICON: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  home:     { active: 'home',          inactive: 'home-outline' },
  lessons:  { active: 'book',          inactive: 'book-outline' },
  practice: { active: 'musical-notes', inactive: 'musical-notes-outline' },
  progress: { active: 'bar-chart',     inactive: 'bar-chart-outline' },
  profile:  { active: 'person',        inactive: 'person-outline' },
};

const PURPLE = '#6C47FF';
const GRAY   = '#ABABC0';

export default function AppLayout() {
  // Guard: if no session, send back to splash
  if (!auth.getUser()) return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: PURPLE,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -2 },
          height: 64,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICON[route.name];
          const name = focused ? icons.active : icons.inactive;
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home"     options={{ title: 'Home' }} />
      <Tabs.Screen name="lessons"  options={{ title: 'Lessons' }} />
      <Tabs.Screen name="practice" options={{ title: 'Practice' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile' }} />
    </Tabs>
  );
}
