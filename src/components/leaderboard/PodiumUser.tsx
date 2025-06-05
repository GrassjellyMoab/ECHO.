import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export interface LeaderUser {
  id: string;
  rank: number;
  username: string;
  points: number;
  avatar: string;
}

interface PodiumUserProps {
  user: LeaderUser;
  position: 'left' | 'center' | 'right';
  height: number;
}

export const PodiumUser: React.FC<PodiumUserProps> = ({ user, position, height }) => {

  const getCrownBackground = (rank: number) => {
    switch (rank) {
      case 1: return require('@/src/assets/images/1stPlaceUser.png');
      case 2: return require('@/src/assets/images/2ndPlaceUser.png');
      case 3: return require('@/src/assets/images/3rdPlaceUser.png');
      default: return require('@/src/assets/images/1stPlaceUser.png');
    }
  };

  const getAvatarOffset = (rank: number, isCenter: boolean) => {
    // Adjust these values based on where the circle is positioned in each crown image
    const offsets = {
      1: { top: isCenter ? -28 : -23, left: isCenter ? -28 : -23 }, // 1st place adjustments
      2: { top: isCenter ? -28 : -23, left: isCenter ? -28 : -23 }, // 2nd place adjustments  
      3: { top: isCenter ? -28 : -23, left: isCenter ? -23 : -23 }, // 3rd place adjustments
    };
    return offsets[rank as keyof typeof offsets] || offsets[1];
  };

  const getPositionStyle = (position: 'left' | 'center' | 'right') => {
    switch (position) {
      case 'left': return styles.podiumLeft;
      case 'center': return styles.podiumCenter;
      case 'right': return styles.podiumRight;
    }
  };

  const crownBackground = getCrownBackground(user.rank);
  const isCenter = position === 'center';
  const avatarOffset = getAvatarOffset(user.rank, isCenter);

  return (
    <View style={[styles.podiumUser, getPositionStyle(position)]}>
      <View style={[styles.avatarContainer, position === 'center' && styles.centerAvatarContainer]}>
        {/* Crown background image */}
        <Image 
          source={crownBackground}
          style={[styles.crownBackground, position === 'center' && styles.centerCrownBackground]} 
        />
        {/* User profile picture */}
        <Image 
          source={require('@/src/assets/images/dummy_avatar.jpg')} 
          style={[
            styles.podiumAvatar, 
            position === 'center' && styles.centerAvatar,
            {
              marginTop: avatarOffset.top,
              marginLeft: avatarOffset.left,
            }
          ]} 
        />
      </View>
      <Text style={styles.podiumUsername}>{user.username}</Text>
      <View style={[styles.podiumBar, { height }]}>
        <Text style={styles.podiumRank}>{user.rank === 1 ? '1ST' : user.rank === 2 ? '2ND' : '3RD'}</Text>
        <Text style={styles.podiumPoints}>{user.points} pts</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  podiumUser: {
    alignItems: 'center',
    flex: 1,
  },
  podiumLeft: {
    marginRight: 14,
  },
  podiumCenter: {
    marginHorizontal: 14,
  },
  podiumRight: {
    marginLeft: 14,
  },
  avatarContainer: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 70,
    height: 70,
  },
  centerAvatarContainer: {
    marginBottom: 8,
    width: 80,
    height: 80,
  },
  crownBackground: {
    position: 'absolute',
    width: 70,
    height: 70,
    zIndex: 1,
    top: 0,
    left: 0,
  },
  centerCrownBackground: {
    width: 80,
    height: 80,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    zIndex: 2,
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  centerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 2,
  },
  podiumUsername: {
    fontWeight: '600',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  podiumBar: {
    backgroundColor: '#662D91',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  podiumRank: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
    marginBottom: 6,
  },
  podiumPoints: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'AnonymousPro-Bold',
  },
}); 