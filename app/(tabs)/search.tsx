import { IconSymbol } from '@components/ui/IconSymbol';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '@components/ui/AppHeader';
import { PopularTopics } from '@components/ui/PopularTopics';
import { RecentSearches } from '@components/ui/RecentSearches';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
      <AppHeader />
      
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search threads, users, topics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.content}>
        <PopularTopics />
        <RecentSearches />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
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
  content: {
    paddingHorizontal: 20,
  },
});