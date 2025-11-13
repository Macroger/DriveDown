import { useOfflineUpload } from "@/hooks/useOfflineUpload";
import { getSupabase } from "@/supabase/supabaseClient";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";

let isTrackingActive = false;

export const useTripDetector = () => {
  const [isDriving, setIsDriving] = useState(false);
  const [tripStarted, setTripStarted] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [tripId, setTripId] = useState<string | null>(null);

  const lastRawSpeedRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);
  const tripStartTimeRef = useRef<Date | null>(null);
  const tripEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rapidEventsRef = useRef({ rapidAccel: 0, rapidDecel: 0 });
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null
  );

  const START_SPEED_THRESHOLD = 0.3;
  const STOP_SPEED_THRESHOLD = 0.5;
  const TRIP_END_DELAY = 10000; // 10 seconds for testing

  const { uploadTrip } = useOfflineUpload();
  const uploadTripRef = useRef(uploadTrip);
  useEffect(() => {
    uploadTripRef.current = uploadTrip;
  }, [uploadTrip]);

  useEffect(() => {
    const supabase = getSupabase();

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          console.log("✅ User logged in, starting tracking...");
          startTracking(session.user.id);
        } else {
          console.log("❌ User logged out, stopping tracking...");
          stopTracking();
        }
      }
    );

    // Also check if already logged in on mount
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        console.log("✅ Already logged in, starting tracking...");
        startTracking(user.id);
      }
    })();

    return () => {
      listener.subscription.unsubscribe();
      stopTracking();
    };
  }, []);

  const startTracking = async (userId: string) => {
    if (isTrackingActive) return;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("Location permission denied");
      return;
    }

    isTrackingActive = true;

    locationSubscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      async (location) => {
        const currentSpeed = location.coords.speed ?? 0;
        const now = Date.now();
        setSpeed(currentSpeed);

        // Initialize timestamp
        if (lastTimestampRef.current === null) {
          lastTimestampRef.current = now;
          lastRawSpeedRef.current = currentSpeed;
          return;
        }

        const deltaTime = (now - lastTimestampRef.current) / 1000;
        if (deltaTime <= 0) return;

        const acceleration =
          (currentSpeed - lastRawSpeedRef.current) / deltaTime;

        if (acceleration >= 1.5) rapidEventsRef.current.rapidAccel += 1;
        if (acceleration <= -1.5) rapidEventsRef.current.rapidDecel += 1;

        // Trip start
        if (
          !tripStartTimeRef.current &&
          currentSpeed >= START_SPEED_THRESHOLD
        ) {
          tripStartTimeRef.current = new Date();
          setIsDriving(true);
          setTripStarted(true);
          console.log("🚗 Trip started");
        }

        // Trip end
        if (tripStartTimeRef.current && currentSpeed < STOP_SPEED_THRESHOLD) {
          if (!tripEndTimeoutRef.current) {
            tripEndTimeoutRef.current = setTimeout(async () => {
              setIsDriving(false);
              setTripStarted(false);

              const endtime = new Date();
              const tripPayload = {
                user_id: userId,
                trip_starttime:
                  tripStartTimeRef.current?.toISOString() ??
                  new Date().toISOString(),
                trip_endtime: endtime.toISOString(),
                trip_rapidAccel: rapidEventsRef.current.rapidAccel,
                trip_rapidDecel: rapidEventsRef.current.rapidDecel,
              };

              console.log("📤 Uploading trip:", tripPayload);
              const tripData = await uploadTripRef.current(tripPayload);
              if (tripData) setTripId(tripData.trip_id);

              // Reset
              rapidEventsRef.current = { rapidAccel: 0, rapidDecel: 0 };
              tripStartTimeRef.current = null;
              lastRawSpeedRef.current = 0;
              lastTimestampRef.current = null;
              tripEndTimeoutRef.current = null;
            }, TRIP_END_DELAY);
          }
        } else if (tripEndTimeoutRef.current) {
          clearTimeout(tripEndTimeoutRef.current);
          tripEndTimeoutRef.current = null;
        }

        lastRawSpeedRef.current = currentSpeed;
        lastTimestampRef.current = now;
      }
    );

    console.log("✅ Location tracking started");
  };

  const stopTracking = () => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }

    if (tripEndTimeoutRef.current) {
      clearTimeout(tripEndTimeoutRef.current);
      tripEndTimeoutRef.current = null;
    }

    isTrackingActive = false;
    setIsDriving(false);
    setTripStarted(false);
    tripStartTimeRef.current = null;
    lastRawSpeedRef.current = 0;
    lastTimestampRef.current = null;
    rapidEventsRef.current = { rapidAccel: 0, rapidDecel: 0 };
    console.log("🛑 Tracking stopped");
  };

  return { isDriving, tripStarted, speed, tripId };
};
