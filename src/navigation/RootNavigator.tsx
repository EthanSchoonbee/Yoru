import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import { LibraryScreen } from '../screens/LibraryScreen';
import { ShelfScreen } from '../screens/ShelfScreen';
import { ReaderScreen } from '../screens/ReaderScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade',animationDuration: 100 }}>
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="Shelf" component={ShelfScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} />
    </Stack.Navigator>
  );
}
