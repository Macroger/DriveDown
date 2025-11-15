import { getSupabase } from "@/supabase/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";

// a hook to handle offline upload of trip data
export const useOfflineUpload = () => {
  const saveTripLocally = useCallback(async (tripData: any) => {
    try {
      const key = `trip-${new Date().toISOString()}`;
      await AsyncStorage.setItem(key, JSON.stringify(tripData));
      console.log("Trip data saved locally with key:", key);
    } catch (error) {
      console.error("Error saving trip data locally:", error);
    }
  }, []);

  // function to retry uploading locally saved trip data
  const retryLocalUploads = useCallback(async () => {
    try {
      const supabase = getSupabase();
      const session = await supabase.auth.getSession();
      const access_token = session.data.session?.access_token;

      const keys = await AsyncStorage.getAllKeys();
      const tripKeys = keys.filter((k) => k.startsWith("trip-"));

      for (const key of tripKeys) {
        const tripJson = await AsyncStorage.getItem(key);
        if (!tripJson) continue;
        const tripData = JSON.parse(tripJson);

        const res = await fetch(
          "https://dagsbgwwdhosdgppojks.supabase.co/functions/v1/calculate-trip-score",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(tripData),
          }
        );

        if (res.ok) {
          console.log("Uploaded offline trip:", key);
          await AsyncStorage.removeItem(key);
        } else {
          console.log("Failed to upload offline trip:", key);
        }
      }
    } catch (err) {
      console.error("Error retrying offline uploads:", err);
    }
  }, []);

  // function to upload trip data, with offline support
  const uploadTrip = useCallback(
    async (tripData: any) => {
      try {
        const supabase = getSupabase(); // get the supabase client
        // try uploading to supabase
        const session = await supabase.auth.getSession();
        const access_token = session.data.session?.access_token;

        const res = await fetch(
          "https://dagsbgwwdhosdgppojks.supabase.co/functions/v1/calculate-trip-score",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(tripData),
          }
        );

        if (!res.ok) {
          // Upload failed → save locally
          await saveTripLocally(tripData);
          console.error("Edge function error:", await res.text());
          return null;
        }

        const data = await res.json();
        console.log("Trip created with edge function:", data.trip.trip_id);

        return data.trip; // contains trip_id, score, etc.
      } catch (error) {
        console.error("Error during trip upload:", error);
        await saveTripLocally(tripData);
        return null;
      }
    },
    [saveTripLocally, retryLocalUploads]
  );

  return { uploadTrip, retryLocalUploads, saveTripLocally };
};
