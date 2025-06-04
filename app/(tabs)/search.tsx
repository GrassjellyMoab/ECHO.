import { IconSymbol } from '@components/ui/IconSymbol';
import { PopularTopics } from '@components/ui/PopularTopics';
import { RecentSearches } from '@components/ui/RecentSearches';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleExplorePress = () => {
    router.push('/(tabs)/explore');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExplorePress} style={styles.exploreButton}>
          <IconSymbol name="safari" size={24} color="#9C27B0" />
        </TouchableOpacity>
        <Text style={styles.appTitle}>ECHO.</Text>
        <View style={styles.headerSpacer} />
      </View>
      
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
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    fontFamily: 'AnonymousPro-Bold',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicTag: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  topicText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'AnonymousPro-Bold',
  },
  recentSearches: {
    paddingVertical: 20,
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontFamily: 'AnonymousPro-Bold',
  },
  headerSpacer: {
    width: 32,
  },
}); 