import { LeaderUser, ListUser, Podium } from '@/src/components/leaderboard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { useCollectionData } from '@/src/store/dataStore';
import { useImagesStore } from '@/src/store/imgStore';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

function getData(
  users: any[], 
  leaderboard: any[], 
  getImageByName: (name: string, folder?: 'badges' | 'threads' | 'users') => any
): LeaderUser[] {
  if (!users || !leaderboard || users.length === 0 || leaderboard.length === 0) {
    return [];
  }

  const userMap = new Map(users.map(user => [user.id, user]));

  // Join leaderboard with user data
  const rankedUsers = leaderboard
    .map(({ id, points }) => {
      const user = userMap.get(id);
      return user ? { username: user.username, points } : null;
    })
    .filter((user): user is { username: string; points: number } => user !== null)
    .sort((a, b) => b.points - a.points);

  const ranks: LeaderUser[] = rankedUsers.map((user, index) => {
    // Try to find the user image using the store's method
    const userImage = getImageByName(user.username, 'users');
    
    console.log(`[Leaderboard] Looking for image for user: ${user.username}`);
    console.log(`[Leaderboard] Found image:`, userImage);
    
    return {
      id: (index + 1).toString(),
      rank: index + 1,
      username: '@' + user.username,
      points: user.points,
      avatar: userImage?.url || require('@/src/assets/avatars/defaultAvatar.png'),
    };
  });

  return ranks;
}

export default function LeaderboardScreen() {
  const { images, isLoading, loadImages, getImageByName } = useImagesStore();
  
  const users = useCollectionData('users');
  const leaderboard = useCollectionData('leaderboard');

  // Load images when component mounts
  React.useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Show loading state while images are loading
  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </View>
    );
  }

  // Show login prompt if no data
  if (!users || !leaderboard || users.length === 0 || leaderboard.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Please log in to view the leaderboard</Text>
        </View>
      </View>
    );
  }

  const mockLeaderboard = getData(users, leaderboard, getImageByName);

  // Handle case where no leaderboard data is available
  if (mockLeaderboard.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>No leaderboard data available</Text>
        </View>
      </View>
    );
  }

  const topThree = mockLeaderboard.slice(0, 3);
  const restOfUsers = mockLeaderboard.slice(3);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false} 
        stickyHeaderIndices={[0]}
      >
        <AppHeader />
        <Podium topThree={topThree} />

        <View style={styles.listSection}>
          {restOfUsers.map((user) => (
            <ListUser key={user.id} user={user} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 0,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  listSection: {
    paddingHorizontal: 30,
    paddingBottom: 50,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});