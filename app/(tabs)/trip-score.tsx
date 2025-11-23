import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { FlatList } from 'react-native-gesture-handler';
import ScoreRing from '@/components/ui/score-ring';
import StatCard from '@/components/ui/stat-card';


interface TripScoreDetails {
  tripscore_value: number | null;
  trip_duration: string | null;
  trip_rapidAccel: number | null;
  trip_rapidDecel: number | null;
  tripinsight_description: string | null;
  tripinsight_recommendation: string | null;
  error?: string;
}

interface TripSummary {
  id: number;
  date: string;
  score: number;
  summary: string;
}

export default function TripScoreScreen(){
  
  const [details, setDetails] = useState<TripScoreDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<TripSummary[]>([]);
  const [summariesLoading, setSummariesLoading] = useState(true);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState(
    summaries.map(trip => ({
      label: `${trip.date} (Score: ${trip.score})`,
      value: trip.id,
    }))
  );

  console.log('TripScoreScreen render', {
  loading,
  details,
  selectedTripId,
  summaries,
  summariesLoading,
  dropdownItems,
});

  // When summaries are loaded, set the default selected trip
// Keep dropdownItems in sync with summaries
useEffect(() => {
  console.log('useEffect: Sync dropdownItems with summaries', { summaries });
  setDropdownItems(
    summaries.map(trip => ({
      label: `${trip.date} (Score: ${trip.score})`,
      value: trip.id,
    }))
  );
}, [summaries]);

  // Fetch the trip score details using the edge function
  useEffect(() => {
    console.log('useEffect: Fetch trip score details', { selectedTripId });
  if (selectedTripId === null) return;
  setLoading(true);
  fetch(`https://dagsbgwwdhosdgppojks.functions.supabase.co/fetch-trip-score-details?trip_id=${selectedTripId}`)
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
}, [selectedTripId]);

  // Fetch a series of previous trip summaries
  useEffect(() => {
    console.log('useEffect: Fetch previous trip summaries');
    setSummariesLoading(true);
    fetch('https://dagsbgwwdhosdgppojks.functions.supabase.co/fetch-trip-score-summaries?limit=5')
      .then(res => res.json())
      .then(data => setSummaries(Array.isArray(data) ? data : []))
      .catch(() => setSummaries([]))
      .finally(() => setSummariesLoading(false));
  }, []);

  useEffect(() => {
  if (summaries.length > 0 && selectedTripId === null) {
    setSelectedTripId(summaries[0].id);
  }
}, [summaries, selectedTripId]);

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
    {/* Picker section with card styling */}
    <DropDownPicker
      open={open}
      value={selectedTripId}
      items={dropdownItems}
      setOpen={setOpen}
      setValue={setSelectedTripId}
      setItems={setDropdownItems}
      style={{
        backgroundColor: theme.background,
        borderColor: theme.tint,
        zIndex: 1000, // Add here to ensure it appears above other elements
      }}
      textStyle={{
        color: theme.text,
        fontSize: 16,
        
      }}
      dropDownContainerStyle={{
        backgroundColor: theme.background,
        borderColor: theme.tint,
        zIndex: 1001, // Add here to ensure it appears above other elements
      }}
      listItemLabelStyle={{
        color: theme.text,
      }}
      placeholder="Select a trip"
      zIndex={1000} // To ensure it appears above other elements
      zIndexInverse={3000}
    />

    <Text style={[styles.title, { color: theme.text }]}>Trip Score</Text>
    <ScoreRing score={details.tripscore_value ?? 0} />
    <View style={styles.statsRow}>
      <StatCard label="Safety Events" value={details.tripscore_value !== null ? details.tripscore_value.toString() : 'N/A'} />
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

      {/* Previous Scores Section */}
      <Text style={[styles.recentTripsTitle, { color: theme.text }]}>Previous Scores</Text>
      <FlatList
        data={summaries}
        keyExtractor={item => item.id.toString()}
        style={styles.recentTripsList}
        ListEmptyComponent={
          summariesLoading ? (
            <Text style={{ color: theme.text }}>Loading...</Text>
          ) : (
            <Text style={{ color: theme.text }}>No recent trips found.</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.tripCard, { backgroundColor: theme.background, borderWidth: 1, borderColor: theme.tint }]}>
            <Text style={[styles.tripDate, { color: theme.text }]}>{item.date}</Text>
            <Text style={[styles.tripScore, { color: theme.tint }]}>{item.score}</Text>
            <Text style={[styles.tripSummary, { color: theme.text }]}>{item.summary}</Text>
          </View>
        )}
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
  pickerContainer: {
  borderRadius: 10,
  borderWidth: 1,
  marginBottom: 16,
  paddingHorizontal: 8,
  paddingVertical: 2,
  // Optionally add shadow for iOS
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  // Optionally add elevation for Android
  elevation: 2,
},
  tripDate: { fontSize: 13, marginBottom: 2 },
  tripScore: { fontWeight: 'bold', fontSize: 15 },
  tripSummary: { fontSize: 13 },
});