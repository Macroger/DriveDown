import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  score: number; // 0–100
  size?: number; // diameter of the ring
  strokeWidth?: number;
};

export default function ScoreRing({ score, size = 120, strokeWidth = 12 }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          stroke="#e0e0e0"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <Circle
          stroke={score >= 70 ? '#4caf50' : score >= 40 ? '#ff9800' : '#f44336'}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.label}>
        <Text style={styles.scoreText}>{score}%</Text>
        <Text style={styles.subText}>Driver Score</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  label: { position: 'absolute', alignItems: 'center' },
  scoreText: { fontSize: 24, fontWeight: 'bold' },
  subText: { fontSize: 14, color: '#555' },
});