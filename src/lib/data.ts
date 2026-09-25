import { apiGet, apiPost } from "./api";
import type {
  State,
  District,
  TouristSpot,
  Accommodation,
  NearbySpot,
  TravelAgent,
  TravelPackage,
} from "./types";

export async function fetchStates(): Promise<State[]> {
  return apiGet<State[]>("/states.php");
}

export async function fetchDistricts(stateId: number): Promise<District[]> {
  return apiGet<District[]>(`/districts.php?state_id=${stateId}`);
}

export async function fetchSpotsByDistrict(
  districtId: number,
): Promise<TouristSpot[]> {
  return apiGet<TouristSpot[]>(`/spots.php?district_id=${districtId}`);
}

export async function fetchSpotsByState(
  stateId: number,
): Promise<TouristSpot[]> {
  return apiGet<TouristSpot[]>(`/spots.php?state_id=${stateId}`);
}

export async function fetchAccommodations(
  spotId: number,
): Promise<Accommodation[]> {
  return apiGet<Accommodation[]>(`/accommodations.php?spot_id=${spotId}`);
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

export async function fetchPackages(): Promise<TravelPackage[]> {
  return apiGet<TravelPackage[]>("/packages.php");
}

export async function fetchAgents(): Promise<TravelAgent[]> {
  return apiGet<TravelAgent[]>("/agents.php");
}

export interface InquiryInput {
  package_id: number | null;
  name: string;
  email: string;
  phone: string;
  travelers: string;
  message: string;
}

export async function sendInquiry(input: InquiryInput): Promise<{ ok: boolean; id: number }> {
  return apiPost<{ ok: boolean; id: number }>("/inquire.php", input);
}
