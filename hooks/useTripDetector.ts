import { useOfflineUpload } from "@/hooks/useOfflineUpload";
import { getSupabase } from "@/supabase/supabaseClient";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

// a hook that uses expo-location to detect if the user is driving to start and stop a trip
export const useTripDetector = () => {
  const [isDriving, setIsDriving] = useState(false);
  const [tripStarted, setTripStarted] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [lastSpeed, setLastSpeed] = useState(0);
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
  const [tripEndTime, setTripEndTime] = useState<Date | null>(null);
  const [tripId, setTripId] = useState<string | null>(null);
  const [rapidEvents, setRapidEvents] = useState({
    rapidAccel: 0,
    rapidDecel: 0,
  });

  const START_SPEED_THRESHOLD = 5; // speed in m/s to consider as driving
  const STOP_SPEED_THRESHOLD = 2; // speed in m/s to consider as stopped
  const TRIP_END_DELAY = 20000; // 20 Seconds delay to confirm trip end

  const { uploadTrip } = useOfflineUpload(); // use the offline upload hook

  useEffect(() => {
    const supabase = getSupabase(); // get the supabase client

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

          // speed difference from last reading
          const speedDiff = currentSpeed - lastSpeed;

          // detect rapid acceleration
          if (speedDiff >= 3) {
            // threshold for rapid acceleration
            setRapidEvents((prev) => ({
              ...prev,
              rapidAccel: prev.rapidAccel + 1,
            }));
            console.log("Rapid Acceleration detected");
          }

          // detect rapid deceleration
          if (speedDiff <= -3) {
            // threshold for rapid deceleration
            setRapidEvents((prev) => ({
              ...prev,
              rapidDecel: prev.rapidDecel + 1,
            }));
            console.log("Rapid Deceleration detected");
          }

          // update last speed
          setLastSpeed(currentSpeed);

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
              tripEndTimeout = setTimeout(async () => {
                setIsDriving(false);
                setTripStarted(false);
                setTripEndTime(new Date());

                // create trip payload
                const tripPayload = {
                  user_id: user.id,
                  trip_starttime: tripStartTime,
                  trip_endtime: tripEndTime,
                  trip_detectedAccelerationEvents:
                    rapidEvents.rapidAccel + rapidEvents.rapidDecel,
                };
                // send tripPayload to supabase
                const tripData = await uploadTrip(tripPayload); // upload trip using the offline upload hook
                if (tripData) setTripId(tripData.trip_id); // set the trip ID from response

                // reset per-trip states
                setRapidEvents({ rapidAccel: 0, rapidDecel: 0 });
                setLastSpeed(0);

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

  return { isDriving, tripStarted, speed, tripId }; // return the trip state
};
