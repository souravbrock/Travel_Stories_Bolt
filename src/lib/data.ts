import { supabase } from "./supabase";
import type {
  State,
  District,
  TouristSpot,
  Accommodation,
  NearbySpot,
} from "./types";

export async function fetchStates(): Promise<State[]> {
  const { data, error } = await supabase
    .from("states")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchDistricts(stateId: number): Promise<District[]> {
  const { data, error } = await supabase
    .from("districts")
    .select("*")
    .eq("state_id", stateId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchSpotsByDistrict(
  districtId: number,
): Promise<TouristSpot[]> {
  const { data, error } = await supabase
    .from("tourist_spots")
    .select("*")
    .eq("district_id", districtId)
    .order("rating", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSpotsByState(
  stateId: number,
): Promise<TouristSpot[]> {
  const { data, error } = await supabase
    .from("tourist_spots")
    .select("*, districts!inner(state_id)")
    .eq("districts.state_id", stateId)
    .order("rating", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as TouristSpot[];
}

export async function fetchAccommodations(
  spotId: number,
): Promise<Accommodation[]> {
  const { data, error } = await supabase
    .from("accommodations")
    .select("*")
    .eq("tourist_spot_id", spotId)
    .order("price_per_night", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

const EARTH_R_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_R_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateTravelTime(distanceKm: number): number {
  const avgSpeedKmh = 40;
  return Math.round((distanceKm / avgSpeedKmh) * 60);
}

export function computeNearbySpots(
  current: TouristSpot,
  all: TouristSpot[],
  maxKm = 500,
): NearbySpot[] {
  if (current.latitude == null || current.longitude == null) return [];
  return all
    .filter((s) => s.id !== current.id && s.latitude != null && s.longitude != null)
    .map((s) => {
      const dist = haversineKm(
        current.latitude!,
        current.longitude!,
        s.latitude!,
        s.longitude!,
      );
      return { spot: s, distanceKm: dist, travelTimeMin: estimateTravelTime(dist) };
    })
    .filter((n) => n.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
