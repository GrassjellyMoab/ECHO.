import { AppHeader } from '@/src/components/ui/AppHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

interface LeaderUser {
  id: string;
  rank: number;
  username: string;
  points: number;
  avatar: string;
}

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

const PodiumUser = ({ user, position, height }: { user: LeaderUser; position: 'left' | 'center' | 'right'; height: number }) => {
  const getCrownColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#FFD700';
    }
  };

  const getPositionStyle = (position: 'left' | 'center' | 'right') => {
    switch (position) {
      case 'left': return styles.podiumLeft;
      case 'center': return styles.podiumCenter;
      case 'right': return styles.podiumRight;
    }
  };

  const crownColor = getCrownColor(user.rank);
  
  return (
    <View style={[styles.podiumUser, getPositionStyle(position)]}>
      <View style={styles.crownContainer}>
        <IconSymbol name="crown.fill" size={position === 'center' ? 32 : 24} color={crownColor} />
      </View>
      <Image source={{ uri: user.avatar }} style={[styles.podiumAvatar, position === 'center' && styles.centerAvatar]} />
      <Text style={styles.podiumUsername}>{user.username}</Text>
      <View style={[styles.podiumBar, { height }]}>
        <Text style={styles.podiumRank}>{user.rank === 1 ? '1ST' : user.rank === 2 ? '2ND' : '3RD'}</Text>
        <Text style={styles.podiumPoints}>{user.points} pts</Text>
      </View>
    </View>
  );
};

const ListUser = ({ user }: { user: LeaderUser }) => (
  <View style={styles.listUser}>
    <Text style={styles.listRank}>{user.rank.toString().padStart(2, '0')}</Text>
    <Image source={{ uri: user.avatar }} style={styles.listAvatar} />
    <Text style={styles.listUsername}>{user.username}</Text>
    <Text style={styles.listPoints}>{user.points} pts</Text>
  </View>
);

export default function LeaderboardScreen() {
  const topThree = mockLeaderboard.slice(0, 3);
  const restOfUsers = mockLeaderboard.slice(3);
  
  // Arrange podium: 2nd, 1st, 3rd
  const podiumOrder = [topThree[1], topThree[0], topThree[2]]; // 2nd, 1st, 3rd
  const podiumHeights = [120, 160, 100]; // Heights for 2nd, 1st, 3rd

  return (
    <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
      <AppHeader />
      
      <View style={styles.podiumSection}>
        <Text style={styles.podiumTitle}>PODIUM</Text>
        <Text style={styles.podiumDate}>13th - 19th May</Text>
        
        <View style={styles.podiumContainer}>
          {podiumOrder.map((user, index) => (
            <PodiumUser 
              key={user.id} 
              user={user} 
              position={index === 0 ? 'left' : index === 1 ? 'center' : 'right'}
              height={podiumHeights[index]}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.listSection}>
        {restOfUsers.map((user) => (
          <ListUser key={user.id} user={user} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  podiumSection: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  podiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  podiumDate: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 280,
  },
  podiumUser: {
    alignItems: 'center',
    flex: 1,
  },
  podiumLeft: {
    marginRight: 8,
  },
  podiumCenter: {
    marginHorizontal: 8,
  },
  podiumRight: {
    marginLeft: 8,
  },
  crownContainer: {
    marginBottom: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  centerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  podiumUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  podiumBar: {
    backgroundColor: '#9C27B0',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
  },
  podiumRank: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
    marginBottom: 4,
  },
  podiumPoints: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'AnonymousPro-Bold',
  },
  listSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listUser: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  listRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
    width: 40,
  },
  listAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 16,
  },
  listUsername: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#9C27B0',
    fontFamily: 'AnonymousPro-Bold',
  },
  listPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
}); 