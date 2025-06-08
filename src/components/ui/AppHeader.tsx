import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

const amplitude = 25;
const frequency = 1;
const steps = 100;
const waveHeight = amplitude * 7;

const generateWavePath = ({
  amplitude,
  frequency,
  baseline,
  width,
  steps,
}: {
  amplitude: number;
  frequency: number;
  baseline: number;
  width: number;
  steps: number;
}) => {
  let path = '';
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = baseline + amplitude * Math.cos((i / steps) * frequency * Math.PI * 2);
    path += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
  }
  return path;
};

const generateWaveFillPath = ({
  amplitude,
  frequency,
  baseline,
  width,
  steps,
  height,
}: {
  amplitude: number;
  frequency: number;
  baseline: number;
  width: number;
  steps: number;
  height: number;
}) => {
  const wavePath = generateWavePath({ amplitude, frequency, baseline, width, steps });
  return `${wavePath} L${width},${height} L0,${height} Z`;
};

export const AppHeader = () => {
  const baseline = waveHeight / 2;

  return (
    <View style={styles.container}>
      <View style={styles.emptyRectangle} />
      <View style={styles.header}>
        <Text style={styles.appTitle}>ECHO.</Text>

        <Svg height={waveHeight} width={screenWidth} style={styles.wave}>
          <Path
            d={generateWavePath({
              amplitude,
              frequency,
              baseline,
              width: screenWidth,
              steps,
            })}
            fill="white"
            stroke="#662D91"
            strokeWidth={2}
          />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 20,
  },
  emptyRectangle: {
    padding: 40,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 20,
    position: 'relative',
  },
  appTitle: {
    fontSize: 34,
    margin: -10,
    marginLeft: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
    zIndex: 2,
  },
  wave: {
    position: 'absolute',
    top: -70,
    bottom: 0, // anchor to bottom of header
    left: 0,
    transform: [{ scaleY: -1 }],
    zIndex: 1,
  },
});
