import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Trip = {
  id: string;
  date: string;
  distance: string;
  duration: string;
  events: number;
  fuel: string;
};

type Props = {
  trip: Trip;
};

export default function TripCard({ trip }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.date}>{trip.date}</Text>
      <Text>Distance: {trip.distance}</Text>
      <Text>Duration: {trip.duration}</Text>
      <Text>Safety Events: {trip.events}</Text>
      <Text>Fuel Efficiency: {trip.fuel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 15, marginVertical: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  date: { fontWeight: 'bold', marginBottom: 5 },
});