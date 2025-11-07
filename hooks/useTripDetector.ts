import { supabase } from "@/supabase/supabaseClient";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

// a hook that uses expo-location to detect if the user is driving to start and stop a trip
export const useTripDetector = () => {
  const [isDriving, setIsDriving] = useState(false);
  const [tripStarted, setTripStarted] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
  const [tripEndTime, setTripEndTime] = useState<Date | null>(null);

  const START_SPEED_THRESHOLD = 5; // speed in m/s to consider as driving
  const STOP_SPEED_THRESHOLD = 2; // speed in m/s to consider as stopped
  const TRIP_END_DELAY = 20000; // 20 Seconds delay to confirm trip end

  useEffect(() => {
    let tripEndTimeout: ReturnType<typeof setTimeout> | null = null; // to hold the timeout for trip end confirmation
    let locationSubscription: Location.LocationSubscription; // holds the trackiing subscription (can be used to turn of the tracking))

    const startTracking = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync(); // ask user for location permission
      if (status !== "granted") {
        console.warn("Location permission not granted");
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          // NOTE: change these settings to balance accuracy and battery usage
          // (lower interval when recording trip events i.e. rapidAccel, so it has more data points to work with)
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // get location every 5 seconds
          distanceInterval: 5, // 5 meters so that load on battery is low
        },
        (location) => {
          const currentSpeed = location.coords.speed ?? 0;
          setSpeed(currentSpeed);

          // check if trip is started / if not started, start trip
          if (currentSpeed >= START_SPEED_THRESHOLD && !tripStarted) {
            setIsDriving(true);
            setTripStarted(true);
            setTripStartTime(new Date());
            console.log("Whoohoo! Trip started");
          }

          // check if trip is ended /
          if (currentSpeed < STOP_SPEED_THRESHOLD && tripStarted) {
            if (!tripEndTimeout) {
              // only set timeout if not already set
              tripEndTimeout = setTimeout(() => {
                setIsDriving(false);
                setTripStarted(false);
                setTripEndTime(new Date());
                console.log("Trip ended. Have a safe day!");
                tripEndTimeout = null;
              }, TRIP_END_DELAY);
            }
          } else {
            // if speed goes above threshold again, clear the timeout
            if (tripEndTimeout) {
              clearTimeout(tripEndTimeout);
              tripEndTimeout = null;
            }
          }
        }
      );
    };

    startTracking(); // initiate the tracking on mount

    return () => {
      if (locationSubscription) locationSubscription.remove(); // stop tracking when done trip
      if (tripEndTimeout) clearTimeout(tripEndTimeout); // clear the timeout if component unmounts
    };
  }, [tripStarted]); // re-run effect if tripStarted changes

  return { isDriving, tripStarted, speed, tripStartTime, tripEndTime }; // return the trip state
};
