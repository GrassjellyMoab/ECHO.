import { LeaderUser, ListUser, Podium } from '@/src/components/leaderboard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const mockLeaderboard: LeaderUser[] = [
  {
    id: '1',
    rank: 1,
    username: '@emilylim',
    points: 152,
    avatar: 'https://via.placeholder.com/80x80/4FC3F7/ffffff?text=EL'
  },
  {
    id: '2',
    rank: 2,
    username: '@LebronJames',
    points: 147,
    avatar: 'https://via.placeholder.com/80x80/9C27B0/ffffff?text=LJ'
  },
  {
    id: '3',
    rank: 3,
    username: '@TruthSeeker',
    points: 144,
    avatar: 'https://via.placeholder.com/80x80/FF6B6B/ffffff?text=TS'
  },
  {
    id: '4',
    rank: 4,
    username: '@wanderbyte',
    points: 121,
    avatar: 'https://via.placeholder.com/50x50/FFD93D/ffffff?text=WB'
  },
  {
    id: '5',
    rank: 5,
    username: '@sunset.sync',
    points: 118,
    avatar: 'https://via.placeholder.com/50x50/FF8A50/ffffff?text=SS'
  },
  {
    id: '6',
    rank: 6,
    username: '@honeycrash',
    points: 109,
    avatar: 'https://via.placeholder.com/50x50/A8E6CF/ffffff?text=HC'
  },
  {
    id: '7',
    rank: 7,
    username: '@itsEliVance',
    points: 101,
    avatar: 'https://via.placeholder.com/50x50/87CEEB/ffffff?text=EV'
  },
];

export default function LeaderboardScreen() {
  const topThree = mockLeaderboard.slice(0, 3);
  const restOfUsers = mockLeaderboard.slice(3);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <AppHeader />
      </View>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
  headerContainer: {
    zIndex: 10,
    elevation: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  listSection: {
    paddingHorizontal: 30,
    paddingBottom: 50,
    backgroundColor: '#FFFFFF',
  },
}); 