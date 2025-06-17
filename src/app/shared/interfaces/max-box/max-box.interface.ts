export interface MapboxFeature {
  center: [number, number]; // [longitude, latitude]
  place_name: string;
  text: string;
}

export interface MapboxGeocodingResponse {
  features: MapboxFeature[];
}

export interface MapboxRoute {
  distance: number; // em metros
  duration: number; // em segundos
}

export interface MapboxDirectionsResponse {
  routes: MapboxRoute[];
}
