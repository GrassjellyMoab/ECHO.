import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const HorizontalLine: React.FC = () => {
  return <View style={styles.horizontalLine} />;
};

const styles = StyleSheet.create({
  horizontalLine: {
    height: 3,
    backgroundColor: '#662D91',
    marginTop: 0,
    marginHorizontal: -30,
    marginBottom: 0,
    width: screenWidth,
  },
}); 