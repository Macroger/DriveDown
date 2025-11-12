import { useTripDetector } from "@/hooks/useTripDetector";
import React, { createContext, useContext } from "react";

// Context to provide trip detection state throughout the app
type TripContextType = ReturnType<typeof useTripDetector>;

// create the context
const TripContext = createContext<TripContextType | undefined>(undefined);

// provider component
export const TripProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const trip = useTripDetector();
  return <TripContext.Provider value={trip}>{children}</TripContext.Provider>;
};

// custom hook to use the trip context
export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error("useTrip must be used within a TripProvider");
  return context;
};
