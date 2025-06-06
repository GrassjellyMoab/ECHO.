import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HorizontalLine } from './HorizontalLine';
import { LeaderUser, PodiumUser } from './PodiumUser';

interface PodiumProps {
  topThree: LeaderUser[];
}

export const Podium: React.FC<PodiumProps> = ({ topThree }) => {
  // Arrange podium: 2nd, 1st, 3rd
  const podiumOrder = [topThree[1], topThree[0], topThree[2]]; // 2nd, 1st, 3rd
  const podiumHeights = [140, 180, 120]; // Heights for 2nd, 1st, 3rd

  return (
    <View style={styles.podiumSection}>
      {/* Title positioned at top left */}
      <View style={styles.titleContainer}>
        <Text style={styles.podiumTitle}>PODIUM</Text>
        <Text style={styles.podiumDate}>13th - 19th May</Text>
      </View>

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
      
      {/* Horizontal line beneath the podium */}
      <HorizontalLine />
    </View>
  );
};

const styles = StyleSheet.create({
  podiumSection: {
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 5,
    backgroundColor: '#FFFFFF',
    marginBottom: 0,
    zIndex: 1,
  },
  titleContainer: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  podiumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
    marginBottom: 4,
  },
  podiumDate: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 280,
    marginBottom: 0,
  },
}); 