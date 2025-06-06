import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface RecentSearchesProps {
  searches?: string[];
  onSearchPress?: (search: string) => void;
}

export const RecentSearches = ({ searches = [], onSearchPress }: RecentSearchesProps) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Recent Searches</Text>
      <View style={styles.recentSearches}>
        {searches.length === 0 ? (
          <Text style={styles.emptyState}>No recent searches</Text>
        ) : (
          searches.map((search, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.searchItem}
              onPress={() => onSearchPress?.(search)}
            >
              <Text style={styles.searchText}>{search}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  recentSearches: {
    paddingVertical: 20,
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontFamily: 'AnonymousPro-Bold',
  },
  searchItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  searchText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
});