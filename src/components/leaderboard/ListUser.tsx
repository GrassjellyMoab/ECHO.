import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LeaderUser } from './PodiumUser';

interface ListUserProps {
  user: LeaderUser;
}

export const ListUser: React.FC<ListUserProps> = ({ user }) => {
  return (
    <View style={styles.listUser}>
      <Text style={styles.listRank}>{user.rank.toString().padStart(2, '0')}</Text>
      {/* TODO: EDIT SOURCE WHEN IMAGES ARE LOADED */}
      <Image 
        source={require('@/src/assets/images/dummy_avatar.jpg')} 
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