import { PopularTopics } from '@/src/components/explore/PopularTopics';
import { RecentSearches } from '@/src/components/explore/RecentSearches';
import SwipeableCards from '@/src/components/explore/ThreadCards';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchState, setIsSearchState] = useState(false);
  const lastFocusTime = useRef(Date.now());
  const searchInputRef = useRef<TextInput>(null);

  useFocusEffect(
    React.useCallback(() => {
      const currentTime = Date.now();
      const timeDifference = currentTime - lastFocusTime.current;
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
    router.push('/search/explore');
  };

  return (
    <View style={styles.container}>
      <View style={styles.appHeaderWrapper}>
        <AppHeader />
      </View>
      
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          {isSearchState && (
            <TouchableOpacity onPress={handleBackPress}>
              <IconSymbol name="chevron.back" size={20} color="#666" />
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
  
      {isSearchState ? (
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
    backgroundColor: 'white',
  },
  appHeaderWrapper: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: 'white'
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingVertical: 20,
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
    backgroundColor: 'transparent',
  },
});