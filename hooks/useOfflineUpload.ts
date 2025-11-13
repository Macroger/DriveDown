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
      const supabase = getSupabase(); // get the supabase client

      const keys = await AsyncStorage.getAllKeys();
      const tripKeys = keys.filter((k) => k.startsWith("trip-"));

      for (const key of tripKeys) {
        const tripJson = await AsyncStorage.getItem(key);
        if (!tripJson) continue;
        const tripData = JSON.parse(tripJson);

        const { data, error } = await supabase
          .from("trip")
          .insert(tripData)
          .select()
          .single();
        if (!error) {
          console.log("Successfully uploaded local trip data with key:", key);
          await AsyncStorage.removeItem(key); // remove after successful upload
        } else {
          console.error("Error uploading local trip data for key:", key, error);
        }
      }
    } catch (error) {
      console.error("Error during retrying local uploads:", error);
    }
  }, []);

  // function to upload trip data, with offline support
  const uploadTrip = useCallback(
    async (tripData: any) => {
      try {
        const supabase = getSupabase(); // get the supabase client
        // try uploading to supabase
        const { data, error } = await supabase
          .from("trip")
          .insert(tripData)
          .select()
          .single();

        if (!error && data) {
          console.log("Trip data uploaded successfully with ID:", data.trip_id);
          /* Here is where you can add logic to send data to other tables connected to trip_id as you will have the trip_id available with: data.trip_id */

          return data;
        } else {
          console.error("Error uploading trip data:", error);
          await saveTripLocally(tripData);
        }
      } catch (error) {
        console.error("Error during trip upload:", error);
        await saveTripLocally(tripData);
      }

      // retry any local uploads after attempting this upload
      await retryLocalUploads();
      return null; // indicate upload failure
    },
    [saveTripLocally, retryLocalUploads]
  );

  return { uploadTrip, retryLocalUploads, saveTripLocally };
};
