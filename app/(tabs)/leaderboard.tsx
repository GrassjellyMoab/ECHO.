import { LeaderUser, ListUser, Podium } from '@/src/components/leaderboard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { useCollectionData } from '@/src/store/dataStore';
import { FirebaseImageData, useImagesStore } from '@/src/store/imgStore';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

function getData(users: any[], leaderboard: any[], userImages: FirebaseImageData[]): LeaderUser[] {

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

  const ranks: LeaderUser[] = rankedUsers.map((user, index) => ({
    id: (index + 1).toString(),
    rank: index + 1,
    username: '@' + user.username,
    points: user.points,
    avatar: userImages.find(img => img.name === `${user.username.toLowerCase().replace("@", "")}.png`)?.url || require('@/src/assets/avatars/defaultAvatar.png'),
  }));

  return ranks;
}


export default function LeaderboardScreen() {
  const getImagesByFolder = useImagesStore(state => state.getImagesByFolder);
  const userImages = getImagesByFolder('users');

  const users = useCollectionData('users');
  const leaderboard = useCollectionData('leaderboard');

  if (!users || !leaderboard || users.length === 0 || leaderboard.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View>
          <Text>Please log in to view the leaderboard</Text>
        </View>
      </View>
    );
  }

  const mockLeaderboard = getData(users, leaderboard, userImages);

  const topThree = mockLeaderboard.slice(0, 3);
  const restOfUsers = mockLeaderboard.slice(3);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
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
}); 