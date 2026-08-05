import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import ArticleScreen from './screens/ArticleScreen';
import FeedScreen from './screens/FeedScreen';
import ReadLaterScreen from './screens/ReadLaterScreen';
import type { FeedStackParamList, RootTabParamList } from './types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReadLaterProvider } from '@read-later/shared';

const Tab = createBottomTabNavigator<RootTabParamList>();
const FeedStack = createNativeStackNavigator<FeedStackParamList>();

function FeedNavigator() {
  return (
    <FeedStack.Navigator>
      <FeedStack.Screen name="FeedList" component={FeedScreen} options={{ title: 'Top Stories' }} />
      <FeedStack.Screen name="Article" component={ArticleScreen} options={{ title: '' }} />
    </FeedStack.Navigator>
  );
}

export default function App() {
  return (
    <ReadLaterProvider storage={AsyncStorage}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              const name =
                route.name === 'Feed'
                  ? 'newspaper-outline'
                  : 'bookmark-outline';
              return <Ionicons name={name as any} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#0066cc',
            tabBarInactiveTintColor: '#888',
            headerShown: false,
          })}
        >
          <Tab.Screen name="Feed" component={FeedNavigator} options={{ title: 'Feed' }} />
          <Tab.Screen
            name="ReadLater"
            component={ReadLaterScreen}
            options={{
              title: 'Read Later',
              headerShown: true,
              headerTitle: 'Read Later',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ReadLaterProvider>
  );
}
