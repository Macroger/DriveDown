// TripDebug.tsx
import { useTrip } from "@/context/TripContext";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";

export default function TripDebug() {
  const { isDriving, speed, tripStarted } = useTrip();

  const statusColor = isDriving ? "#4CAF50" : "#F44336"; // green if driving, red if stopped
  const statusText = isDriving ? "DRIVING 🚗" : "STOPPED 🛑";

  return (
    <View style={styles.container}>
      {/* Octagon */}
      <View style={styles.octagonContainer}>
        <Svg height={OCTAGON_SIZE} width={OCTAGON_SIZE}>
          <Polygon
            points="50,0 150,0 200,50 200,150 150,200 50,200 0,150 0,50"
            fill={statusColor}
          />
        </Svg>
        <View style={styles.octagonTextContainer}>
          <Text style={styles.octagonText}>{statusText}</Text>
        </View>
      </View>

      {/* Optional info below */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Trip Started: {tripStarted ? "Yes" : "No"}
        </Text>
        <Text style={styles.infoText}>
          Speed: {speed.toFixed(1)} m/s (~{(speed * 3.6).toFixed(1)} km/h)
        </Text>
      </View>
    </View>
  );
}

const OCTAGON_SIZE = 200;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  octagonContainer: {
    width: OCTAGON_SIZE,
    height: OCTAGON_SIZE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  octagonTextContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  octagonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    width: "80%",
  },
  infoText: {
    fontSize: 18,
    marginBottom: 8,
  },
});
