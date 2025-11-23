import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useEffect, useState} from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import ScoreRing from '../../components/ui/score-ring';
import StatCard from '../../components/ui/stat-card';
import { fetchRowsWithJoin } from '@/supabase/databaseHelpers';
import { ITripTableFetchDTO } from '@/types/Interfaces/DTOs/trip-table-dtos';

interface TripScoreDetails {
  tripscore_value: number | null;
  trip_duration: string | null;
  trip_rapidAccel: number | null;
  trip_rapidDecel: number | null;
  tripinsight_description: string | null;
  tripinsight_recommendation: string | null;
  error?: string;
}

export default function TripScoreScreen() {
  const [details, setDetails] = useState<TripScoreDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    fetch('https://dagsbgwwdhosdgppojks.functions.supabase.co/fetch-trip-score-details')
      .then(res => res.json())
      .then(data => setDetails(data))
      .catch(() => setDetails({ 
        tripscore_value: null, 
        trip_duration: null, 
        trip_rapidAccel: null, 
        trip_rapidDecel: null, 
        tripinsight_description: null, 
        tripinsight_recommendation: null, 
        error: 'Failed to fetch trip data.' 
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Text>Loading...</Text>;
  if (!details || details.error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>
          {details?.error ?? 'No trip data found.'}
        </Text>
      </View>
    );
  }  

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Trip Score</Text>
      <ScoreRing score={details.tripscore_value ?? 0} />
      <View style={styles.statsRow}>
        <StatCard label="Score" value={details.tripscore_value !== null ? details.tripscore_value.toString() : 'N/A'} />
        <StatCard label="Duration" value={details.trip_duration ?? 'N/A'} />
      </View>
      <View style={styles.trends}>
        <Text style={{ color: theme.text }}>
          {details.tripinsight_description ?? 'No insight available.'}
        </Text>
        <Text style={{ color: theme.text }}>
          {details.tripinsight_recommendation ?? ''}
        </Text>
      </View>
      <Button
        title="Back"
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