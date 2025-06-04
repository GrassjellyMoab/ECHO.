import { AppHeader } from '@/src/components/ui/AppHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { PopularTopics } from '@/src/components/ui/PopularTopics';
import { RecentSearches } from '@/src/components/ui/RecentSearches';
import SwipeableCards from '@/src/components/ui/ThreadCards';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useRef } from 'react';
import { ScrollView, StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchState, setIsSearchState] = useState(false);
  const lastFocusTime = useRef(Date.now());
  const searchInputRef = useRef<TextInput>(null);

  // resets search state after not coming back for 30 seconds, else it preserves the state
  useFocusEffect(
    React.useCallback(() => {
      const currentTime = Date.now();
      const timeDifference = currentTime - lastFocusTime.current;
      //set time here
      if (timeDifference > 30000) {
        setIsSearchState(false);
        setSearchQuery('');
      }
      
      lastFocusTime.current = currentTime;
    }, [])
  );

  const handleSearchFocus = () => {
    setIsSearchState(true);
  };

  const handleSearchBlur = () => {
    // Only blur if there's no search text
    if (!searchQuery.trim()) {
      setIsSearchState(false);
    }
  };

  const handleBackPress = () => {
    searchInputRef.current?.blur();
    setIsSearchState(false);
    setSearchQuery('');
  };
  const router = useRouter();

  const handleExplorePress = () => {
    router.push('/(tabs)/explore');
  };

  return (
    <View style={styles.container}>
      {/* Fixed header - always visible */}
      <AppHeader />
      
      {/* Fixed search section - always visible */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          {isSearchState && (
            <TouchableOpacity onPress={handleBackPress}>
              <IconSymbol name="chevron.left" size={20} color="#666" />
            </TouchableOpacity>
          )}
          <IconSymbol name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef} 
            style={styles.searchInput}
            placeholder="Search threads, users, topics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
        </View>
      </View>

      {/* Conditional content area */}
      {isSearchState ? (
        // Search mode: Enable scrolling for search results
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <PopularTopics />
            <RecentSearches />
          </View>
        </ScrollView>
      ) : (
        // Cards mode: NO scrolling, let cards handle all gestures
        <View style={styles.cardsContainer}>
          <SwipeableCards />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  exploreButton: {
    padding: 8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
    // Ensure this doesn't interfere with touches
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  cardsContainer: {
    flex: 1,
    // Remove any potential gesture blocking
    backgroundColor: 'transparent',
  },
});