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

  const speedBufferRef = useRef<number[]>([]);
  const lastSmoothedSpeedRef = useRef(0);
  const accelConsecutiveRef = useRef({ accel: 0, decel: 0 });
  const lastEventTimeRef = useRef<number | null>(null);

  // Threshholds (adjustable)
  const RAPID_ACCEL_THRESHOLD = 1.6; // m/s²
  const RAPID_DECEL_THRESHOLD = -2.2; // m/s²
  const MIN_SPEED_TO_COUNT_EVENTS = 2.0; // ignore when nearly stopped

  // Smoothing + debounce settings
  const SMOOTH_WINDOW = 3;
  const REQUIRED_CONSECUTIVE = 2;
  const EVENT_COOLDOWN_MS = 5000;

  const START_SPEED_THRESHOLD = 5.0;
  const STOP_SPEED_THRESHOLD = 3.0;
  const TRIP_END_DELAY = 30000; // 30 seconds for testing

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
        const rawSpeed = location.coords.speed ?? 0;
        const now = Date.now();
        setSpeed(rawSpeed);

        // Initialize timestamp
        if (lastTimestampRef.current === null) {
          lastTimestampRef.current = now;
          speedBufferRef.current = [rawSpeed];
          lastSmoothedSpeedRef.current = rawSpeed;
          return;
        }

        const deltaTime = (now - lastTimestampRef.current) / 1000;
        if (deltaTime <= 0) return;

        // smoothing
        speedBufferRef.current.push(rawSpeed);
        if (speedBufferRef.current.length > SMOOTH_WINDOW) {
          speedBufferRef.current.shift();
        }

        const smoothedSpeed =
          speedBufferRef.current.reduce((a, b) => a + b, 0) /
          speedBufferRef.current.length;

        const acceleration =
          (smoothedSpeed - lastSmoothedSpeedRef.current) / deltaTime;

        const smallLag = 0.05;
        if (acceleration >= RAPID_ACCEL_THRESHOLD - smallLag) {
          accelConsecutiveRef.current.accel += 1;
        } else {
          accelConsecutiveRef.current.accel = 0;
        }

        if (acceleration <= RAPID_DECEL_THRESHOLD + smallLag) {
          accelConsecutiveRef.current.decel += 1;
        } else {
          accelConsecutiveRef.current.decel = 0;
        }

        //
        // 4) COOLDOWN CHECK
        //
        const lastEvent = lastEventTimeRef.current ?? 0;
        const inCooldown = now - lastEvent < EVENT_COOLDOWN_MS;
        const minSpeedOK = smoothedSpeed >= MIN_SPEED_TO_COUNT_EVENTS;

        //
        // 5) REGISTER EVENTS
        //
        if (
          !inCooldown &&
          minSpeedOK &&
          accelConsecutiveRef.current.accel >= REQUIRED_CONSECUTIVE
        ) {
          rapidEventsRef.current.rapidAccel += 1;
          lastEventTimeRef.current = now;
          accelConsecutiveRef.current.accel = 0;
          console.log("⚡ Rapid acceleration detected");
        }

        if (
          !inCooldown &&
          minSpeedOK &&
          accelConsecutiveRef.current.decel >= REQUIRED_CONSECUTIVE
        ) {
          rapidEventsRef.current.rapidDecel += 1;
          lastEventTimeRef.current = now;
          accelConsecutiveRef.current.decel = 0;
          console.log("🛑 Rapid deceleration detected");
        }
        // Trip start
        if (
          !tripStartTimeRef.current &&
          smoothedSpeed >= START_SPEED_THRESHOLD
        ) {
          tripStartTimeRef.current = new Date();
          setIsDriving(true);
          setTripStarted(true);
          console.log("🚗 Trip started");
        }

        // Trip end
        if (tripStartTimeRef.current && smoothedSpeed < STOP_SPEED_THRESHOLD) {
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
              speedBufferRef.current = [];
              accelConsecutiveRef.current = { accel: 0, decel: 0 };
            }, TRIP_END_DELAY);
          }
        } else if (tripEndTimeoutRef.current) {
          clearTimeout(tripEndTimeoutRef.current);
          tripEndTimeoutRef.current = null;
        }

        lastSmoothedSpeedRef.current = smoothedSpeed;
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
    lastTimestampRef.current = null;
    rapidEventsRef.current = { rapidAccel: 0, rapidDecel: 0 };
    speedBufferRef.current = [];
    accelConsecutiveRef.current = { accel: 0, decel: 0 };
    console.log("🛑 Tracking stopped");
  };

  return { isDriving, tripStarted, speed, tripId };
};
