import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface WaveProps {
  color: string;
  style?: object;
}

export const TopWave: React.FC<WaveProps> = ({ color, style }) => (
  <View style={[styles.container, style]}>
    <Svg height="100%" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
      <Path
        d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        fill={color}
      />
    </Svg>
  </View>
);

export const BottomWave: React.FC<WaveProps> = ({ color, style }) => (
  <View style={[styles.container, style]}>
    <Svg height="100%" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
      <Path
        d="M0,224L48,208C96,192,192,160,288,160C384,160,480,192,576,208C672,224,768,224,864,208C960,192,1056,160,1152,160C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        fill={color}
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: 200,
  },
});

export default { TopWave, BottomWave }; 