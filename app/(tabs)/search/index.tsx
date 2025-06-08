import { PopularTopics } from '@/src/components/explore/PopularTopics';
import { RecentSearches } from '@/src/components/explore/RecentSearches';
import SwipeableCards from '@/src/components/explore/ThreadCards';
import Topics from '@/src/components/explore/Topic'; 
import { AppHeader } from '@/src/components/ui/AppHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchState, setIsSearchState] = useState(false);
  const [showTopics, setShowTopics] = useState(false); // Add this state
  const lastFocusTime = useRef(Date.now());
  const searchInputRef = useRef<TextInput>(null);

  useFocusEffect(
    React.useCallback(() => {
      const currentTime = Date.now();
      const timeDifference = currentTime - lastFocusTime.current;
      if (timeDifference > 30000) {
        setIsSearchState(false);
        setSearchQuery('');
        setShowTopics(false); // Reset topics view too
      }
      
      lastFocusTime.current = currentTime;
    }, [])
  );

  const handleSearchFocus = () => {
    setIsSearchState(true);
  };

  const handleSearchBlur = () => {
    if (!searchQuery.trim()) {
      setIsSearchState(false);
    }
  };

  const handleBackPress = () => {
    if (showTopics) {
      setShowTopics(false);
    } else {
      searchInputRef.current?.blur();
      setIsSearchState(false);
      setSearchQuery('');
    }
  };

  // Add this function to handle topic selection
  const handleTopicPress = (topic: string) => {
    setShowTopics(true);
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
          {(isSearchState || showTopics) && (
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
  
      {showTopics ? (
        // Show Topics component
        <Topics onBack={() => setShowTopics(false)} />
      ) : isSearchState ? (
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <PopularTopics onTopicPress={handleTopicPress} />
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

// Your existing styles remain the same

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  appHeaderWrapper: {
    position: 'relative',
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
    paddingHorizontal: 10,
    marginTop: 25,
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