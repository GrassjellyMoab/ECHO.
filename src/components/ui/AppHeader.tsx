import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
// ${screenWidth*2/3},${baseline} C${screenWidth*5/6},${baseline-amplitude}
export const AppHeader = () => {
  const baseline = 10;
  const amplitude = 30;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>ECHO.</Text>
      </View>
      <Svg height="30" width={screenWidth} style={styles.wave}>
        {/* Shadow shape */}
        <Path
          d={`M0,${baseline} C${screenWidth / 4},${baseline - amplitude} ${screenWidth * 3 / 4},${baseline + amplitude} ${screenWidth},${baseline}`}
          fill="none"
          stroke="rgba(102, 45, 145, 0.3)"
          strokeWidth="6"
        />

        {/* Main stroke */}
        <Path
          d={`M0,${baseline} C${screenWidth / 4},${baseline - amplitude} ${screenWidth * 3 / 4},${baseline + amplitude} ${screenWidth},${baseline}`}
          fill="none"
          stroke="rgba(102, 45, 145, 0.5)"
          strokeWidth="3"
        />

                {/* Shadow shape */}
        <Path
          d={`M0,${baseline - 10} C${screenWidth / 4},${baseline + amplitude} ${screenWidth * 3 / 4},${baseline - amplitude} ${screenWidth},${baseline + 10}`}
          fill="none"
          stroke="rgba(156, 39, 176, 0.3)"
          strokeWidth="6"
        />

        {/* Main stroke */}
        <Path
          d={`M0,${baseline - 10} C${screenWidth / 4},${baseline + amplitude} ${screenWidth * 3 / 4},${baseline - amplitude} ${screenWidth},${baseline + 10}`}
          fill="none"
          stroke="rgba(156, 39, 176, 0.5)"
          strokeWidth="3"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  appTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingLeft: 30,
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  wave: {
    backgroundColor: '#FFFFFF',
  },
});