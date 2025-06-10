import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LeaderUser } from './PodiumUser';

interface ListUserProps {
  user: LeaderUser;
}

export const ListUser: React.FC<ListUserProps> = ({ user }) => {
  // Handle both URL strings and local assets
  const getAvatarSource = (avatar: string | any) => {
    if (typeof avatar === 'string') {
      return { uri: avatar };
    }
    return avatar; // Local asset from require()
  };

  return (
    <View style={styles.listUser}>
      <Text style={styles.listRank}>{user.rank.toString().padStart(2, '0')}</Text>
      <Image 
        source={getAvatarSource(user.avatar)}
        style={styles.listAvatar} 
      />
      <Text style={styles.listUsername}>{user.username}</Text>
      <Text style={styles.listPoints}>{user.points} pts</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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