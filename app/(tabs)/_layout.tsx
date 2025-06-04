import { Tabs } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { Platform, TouchableOpacity, View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@components/ui/IconSymbol';
import TabBarBackground from '@components/ui/TabBarBackground';

const { width: screenWidth } = Dimensions.get('window');

const SlidingTabBar = ({ state, descriptors, navigation }: any) => {
 const insets = useSafeAreaInsets();
 const slideAnimation = useRef(new Animated.Value(0)).current;
 
 const marginHorizontal = 20;
 const tabWidth = (screenWidth - marginHorizontal * 2) / state.routes.length;

 useEffect(() => {
   Animated.spring(slideAnimation, {
     toValue: state.index * tabWidth + marginHorizontal,
     useNativeDriver: true,
     tension: 100,
     friction: 8,
   }).start();
 }, [state.index]);

 return (
   <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
     <TabBarBackground />
     
     <Animated.View
       style={[
         styles.slidingHighlight,
         {
           width: 50,
           transform: [
             {
               translateX: Animated.add(
                 slideAnimation,
                 new Animated.Value((tabWidth - 50) / 2)
               ),
             },
           ],
         },
       ]}
     />
     
     <View style={styles.tabBar}>
       {state.routes.map((route: any, index: number) => {
         const { options } = descriptors[route.key];
         const label = options.tabBarLabel !== undefined 
           ? options.tabBarLabel 
           : options.title !== undefined 
           ? options.title 
           : route.name;

         const isFocused = state.index === index;
         const isCreateTab = route.name === 'create';

         const onPress = () => {
           const event = navigation.emit({
             type: 'tabPress',
             target: route.key,
             canPreventDefault: true,
           });

           if (!isFocused && !event.defaultPrevented) {
             navigation.navigate(route.name);
           }
         };

         if (isCreateTab) {
           return (
             <TouchableOpacity
               key={route.key}
               onPress={onPress}
               style={styles.createTabButton}
             >
               <View style={styles.createButtonContainer}>
                 <View style={styles.createButton}>
                   <IconSymbol size={32} name="add" color="white" />
                 </View>
               </View>
             </TouchableOpacity>
           );
         }

         const getIconName = (routeName: string, focused: boolean) => {
           switch (routeName) {
             case 'index':
               return focused ? 'home' : 'home-outline';
             case 'search':
               return focused ? 'search' : 'search-outline';
             case 'leaderboard':
               return focused ? 'podium' : 'podium-outline';
             case 'profile':
               return focused ? 'person' : 'person-outline';
             default:
               return 'help-circle';
           }
         };

         return (
           <TouchableOpacity
             key={route.key}
             onPress={onPress}
             style={styles.tabButton}
           >
             <View style={styles.tabIconContainer}>
               <IconSymbol 
                 size={28} 
                 name={getIconName(route.name, isFocused)} 
                 color={isFocused ? '#662D91' : '#C9B1D3'} 
               />
               <Text style={[
                 styles.tabLabel,
                 { color: isFocused ? '#662D91' : '#C9B1D3' }
               ]}>
                 {label}
               </Text>
             </View>
           </TouchableOpacity>
         );
       })}
     </View>
   </View>
 );
};

export default function TabLayout() {
 return (
   <Tabs
     tabBar={(props) => <SlidingTabBar {...props} />}
     screenOptions={{
       headerShown: false,
     }}
   >
     <Tabs.Screen
       name="index"
       options={{
         title: 'Home',
       }}
     />
     <Tabs.Screen
       name="search"
       options={{
         title: 'Search',
       }}
     />
     <Tabs.Screen
       name="create"
     />
     <Tabs.Screen
       name="leaderboard"
       options={{
         title: 'Leaderboard',
       }}
     />
     <Tabs.Screen
       name="profile"
       options={{
         title: 'Profile',
       }}
     />
   </Tabs>
 );
}

const styles = StyleSheet.create({
 tabBarContainer: {
   position: 'relative',
   height: Platform.select({
     ios: 80,
     default: 70,
   }),
 },
 slidingHighlight: {
   position: 'absolute',
   top: 3,
   height: 3,
   backgroundColor: '#662D91',
   borderRadius: 2,
   zIndex: 2,
 },
 tabBar: {
   flexDirection: 'row',
   height: '100%',
   alignItems: 'center',
   justifyContent: 'space-around',
   paddingHorizontal: 20,
   paddingTop: Platform.select({
     ios: 15,
     default: 0,
   }),
 },
 tabButton: {
   flex: 1,
   alignItems: 'center',
   justifyContent: 'center',
   paddingTop: 10,
 },
 createTabButton: {
   flex: 1,
   alignItems: 'center',
   justifyContent: 'center',
 },
 tabIconContainer: {
   alignItems: 'center',
 },
 tabLabel: {
   fontSize: 10,
   marginTop: 4,
   fontWeight: '500',
 },
 createButtonContainer: {
   alignItems: 'center',
   justifyContent: 'center',
   paddingTop: 5,
   width: '100%',
   height: '100%',
 },
 createButton: {
   width: 60,
   height: 40,
   backgroundColor: '#662D91',
   borderRadius: 16,
   alignItems: 'center',
   justifyContent: 'center',
   shadowColor: '#000',
   shadowOffset: {
     width: 0,
     height: 2,
   },
   shadowOpacity: 0.25,
   shadowRadius: 3.84,
   elevation: 5,
 },
});