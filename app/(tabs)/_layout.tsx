import { Tabs } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/src/components/ui/IconSymbol';
import TabBarBackground from '@/src/components/ui/TabBarBackground';
import CreateModal from './CreateModal';

const { width: screenWidth } = Dimensions.get('window');

const SlidingTabBar = ({ state, descriptors, navigation }: any) => {
 const insets = useSafeAreaInsets();
 const slideAnimation = useRef(new Animated.Value(0)).current;
 const [showCreateModal, setShowCreateModal] = useState(false);
 
 const marginHorizontal = 20;
 // Now we have 4 regular tabs + 1 create button in the middle
 const tabWidth = (screenWidth - marginHorizontal * 2) / 5;

 useEffect(() => {
   // Calculate position for sliding highlight
   let targetPosition = 0;
   
   switch (state.index) {
     case 0: // index (home)
       targetPosition = 0 * tabWidth + marginHorizontal;
       break;
     case 1: // search  
       targetPosition = 1 * tabWidth + marginHorizontal;
       break;
     case 2: // leaderboard
       targetPosition = 3 * tabWidth + marginHorizontal;
       break;
     case 3: // profile
       targetPosition = 4 * tabWidth + marginHorizontal;
       break;
   }
   
   Animated.spring(slideAnimation, {
     toValue: targetPosition,
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
       {/* Home Tab */}
       <TouchableOpacity
         onPress={() => navigation.navigate('home')}
         style={styles.tabButton}
       >
         <View style={styles.tabIconContainer}>
           <IconSymbol 
             size={28} 
             name={state.index === 0 ? 'home' : 'home-outline'} 
             color={state.index === 0 ? '#662D91' : '#C9B1D3'} 
           />
           <Text style={[
             styles.tabLabel,
             { color: state.index === 0 ? '#662D91' : '#C9B1D3' }
           ]}>
             Home
           </Text>
         </View>
       </TouchableOpacity>

       {/* Search Tab */}
       <TouchableOpacity
         onPress={() => navigation.navigate('search')}
         style={styles.tabButton}
       >
         <View style={styles.tabIconContainer}>
           <IconSymbol 
             size={28} 
             name={state.index === 1 ? 'search' : 'search-outline'} 
             color={state.index === 1 ? '#662D91' : '#C9B1D3'} 
           />
           <Text style={[
             styles.tabLabel,
             { color: state.index === 1 ? '#662D91' : '#C9B1D3' }
           ]}>
             Search
           </Text>
         </View>
       </TouchableOpacity>

       {/* Create Button */}
       <TouchableOpacity
         onPress={() => setShowCreateModal(true)}
         style={styles.createTabButton}
       >
         <View style={styles.createButtonContainer}>
           <View style={styles.createButton}>
             <IconSymbol size={32} name="add" color="white" />
           </View>
         </View>
       </TouchableOpacity>

       {/* Leaderboard Tab */}
       <TouchableOpacity
         onPress={() => navigation.navigate('leaderboard')}
         style={styles.tabButton}
       >
         <View style={styles.tabIconContainer}>
           <IconSymbol 
             size={28} 
             name={state.index === 2 ? 'podium' : 'podium-outline'} 
             color={state.index === 2 ? '#662D91' : '#C9B1D3'} 
           />
           <Text style={[
             styles.tabLabel,
             { color: state.index === 2 ? '#662D91' : '#C9B1D3' }
           ]}>
             Leaderboard
           </Text>
         </View>
       </TouchableOpacity>

       {/* Profile Tab */}
       <TouchableOpacity
         onPress={() => navigation.navigate('profile')}
         style={styles.tabButton}
       >
         <View style={styles.tabIconContainer}>
           <IconSymbol 
             size={28} 
             name={state.index === 3 ? 'person' : 'person-outline'} 
             color={state.index === 3 ? '#662D91' : '#C9B1D3'} 
           />
           <Text style={[
             styles.tabLabel,
             { color: state.index === 3 ? '#662D91' : '#C9B1D3' }
           ]}>
             Profile
           </Text>
         </View>
       </TouchableOpacity>
     </View>
     
     <CreateModal 
       visible={showCreateModal} 
       onClose={() => setShowCreateModal(false)} 
     />
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
       name="home"
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
     ios: 13,
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