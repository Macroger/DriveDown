import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import ScoreRing from '../../components/ui/score-ring';
import StatCard from '../../components/ui/stat-card';

export default function DriverScoreScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  // Mock data for recent trips
  const recentTrips = [
    { id: '1', date: '2025-11-20', score: 80, summary: 'Smooth drive, no safety events.' },
    { id: '2', date: '2025-11-18', score: 72, summary: '1 hard brake, good fuel efficiency.' },
    { id: '3', date: '2025-11-15', score: 65, summary: 'Aggressive acceleration detected.' },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Driver Score</Text>
      <ScoreRing score={75} />

      <View style={styles.statsRow}>
        <StatCard label="Avg Speed" value="62 km/h" />
        <StatCard label="Safety Events" value="2" />        
        <StatCard label="Trip Duration" value="1h 45m" />
      </View>

      <View style={styles.trends}>
        <Text style={{ color: theme.text }}>Score improved 10% this week</Text>
        <Text style={{ color: theme.text }}>Hard braking reduced</Text>
        <Text style={{ color: theme.text }}>You drove more during daylight</Text>
      </View>

      <Text style={[styles.recentTripsTitle, { color: theme.text }]}>Recent Trips</Text>
      <FlatList
        data={recentTrips}
        keyExtractor={item => item.id}
        style={styles.recentTripsList}
        renderItem={({ item }) => (
          <View style={[styles.tripCard, { backgroundColor: theme.background, borderColor: theme.icon, borderWidth: 1 }]}> 
            <Text style={[styles.tripDate, { color: theme.icon }]}>{item.date}</Text>
            <Text style={[styles.tripScore, { color: theme.text }]}>Score: {item.score}</Text>
            <Text style={[styles.tripSummary, { color: theme.text }]}>{item.summary}</Text>
          </View>
        )}
      />

      <Button
        title="View Trip Insights"
        onPress={() => router.replace('/(tabs)/explore')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
  trends: { marginVertical: 20 },
  recentTripsTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 30, marginBottom: 10 },
  recentTripsList: { marginBottom: 20 },
  tripCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  tripDate: { fontSize: 13, marginBottom: 2 },
  tripScore: { fontWeight: 'bold', fontSize: 15 },
  tripSummary: { fontSize: 13 },
});