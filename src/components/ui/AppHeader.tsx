import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

export const AppHeader = () => {
  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.appTitle}>ECHO.</Text>
        </View>
        <Svg height="37" width={screenWidth} style={styles.wave}>
        {/* Shadow shape */}
            <Path
                d={`M0,2 L${screenWidth},6 L${screenWidth},8 Q${screenWidth*3/4},30 ${screenWidth/2},14 T0,30 Z`}
                fill="rgba(0,0,0,0.1)"
                stroke="none"
            />
            {/* Main wave shape */}
            <Path
                d={`M0,0 L${screenWidth},4 L${screenWidth},6 Q${screenWidth*3/4},28 ${screenWidth/2},12 T0,28 Z`}
                fill="#FFFFFF"
                stroke="none"
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
      paddingTop: 67,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: '#FFFFFF',
    },
    appTitle: {
      fontSize: 34,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#000',
      fontFamily: 'AnonymousPro-Bold',
    },
    wave: {
      position: 'absolute',
      bottom: -25,
    },
});