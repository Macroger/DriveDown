export interface ITripTableFetchDTO {
  trip_id: string; // Unique trip identifier
  user_id: string; // User who took the trip
  trip_starttime: string; // ISO timestamp string
  trip_endtime: string;   // ISO timestamp string
  trip_rapidAccel: number; // Number of acceleration events
  trip_rapidDecel: number; // Number of deceleration events
}