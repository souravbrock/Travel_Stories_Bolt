import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Ticket,
  Route,
  Navigation,
  BedDouble,
  Wifi,
  Check,
  IndianRupee,
} from "lucide-react";
import type { TouristSpot, Accommodation, NearbySpot } from "../lib/types";
import { fetchAccommodations, computeNearbySpots } from "../lib/data";
import { RatingStars } from "./RatingStars";

interface Props {
  spot: TouristSpot;
  allSpots: TouristSpot[];
  onBack: () => void;
  onSelectSpot: (spot: TouristSpot, allSpots: TouristSpot[]) => void;
}

export function SpotDetail({
  spot,
  allSpots,
  onBack,
  onSelectSpot,
}: Props) {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedNearby, setSelectedNearby] = useState<NearbySpot | null>(
    null,
  );

  const nearby = useMemo(
    () => computeNearbySpots(spot, allSpots),
    [spot, allSpots],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetchAccommodations(spot.id)
      .then((data) => {
        if (active) setAccommodations(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [spot.id]);

  return (
    <div className="ts-fade-in">
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <button
          onClick={onBack}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-sand-200 transition-colors hover:bg-sand-50"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-800">{spot.name}</h2>
            {spot.category && (
              <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {spot.category}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <RatingStars rating={spot.rating} size="md" />
            {spot.entry_fee && (
              <span className="inline-flex items-center gap-1">
                <Ticket className="h-3.5 w-3.5" />
                {spot.entry_fee}
              </span>
            )}
            {spot.visit_duration && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {spot.visit_duration}
              </span>
            )}
          </div>
        </div>
      </div>

      {spot.description && (
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-slate-600">
          {spot.description}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Distance matrix */}
        <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-cyan-200">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-100 to-teal-100">
              <Route className="h-4 w-4 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                Distance to Nearby Spots
              </h3>
              <p className="text-xs text-slate-500">
                From {spot.name} to other attractions in the region
              </p>
            </div>
          </div>

          {nearby.length === 0 ? (
            <div className="rounded-xl bg-sand-50 p-6 text-center">
              <p className="text-sm text-slate-500">
                No other nearby spots with location data available.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {nearby.map((n) => {
                const isSelected = selectedNearby?.spot.id === n.spot.id;
                return (
                  <div
                    key={n.spot.id}
                    className={`rounded-xl border p-3 transition-all ${
                      isSelected
                        ? "border-primary-400 bg-primary-50 ring-1 ring-primary-200"
                        : "border-sand-200 bg-white hover:border-primary-200 hover:bg-sand-50"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedNearby(isSelected ? null : n);
                      }}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">
                          {n.spot.name}
                        </p>
                        {n.spot.category && (
                          <p className="text-xs text-slate-500">
                            {n.spot.category}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="flex items-center justify-end gap-0.5 text-sm font-semibold text-primary-700">
                          <Navigation className="h-3 w-3" />
                          {n.distanceKm < 1
                            ? `${Math.round(n.distanceKm * 1000)} m`
                            : `${n.distanceKm.toFixed(1)} km`}
                        </p>
                        <p className="flex items-center justify-end gap-0.5 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          {formatTravelTime(n.travelTimeMin)}
                        </p>
                      </div>
                    </button>

                    {isSelected && (
                      <div className="mt-3 flex items-center justify-between border-t border-primary-100 pt-3 ts-fade-in">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-primary-500" />
                          <span>
                            {spot.name} → {n.spot.name}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            onSelectSpot(n.spot, allSpots)
                          }
                          className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110"
                        >
                          View Details
                          <ArrowLeft className="h-3 w-3 rotate-180" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Accommodations */}
        <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-orange-200">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100">
              <BedDouble className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                Stays Near {spot.name}
              </h3>
              <p className="text-xs text-slate-500">
                Hotels, resorts & homestays
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-200 border-t-accent-600" />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-sand-50 p-6 text-center">
              <p className="text-sm text-error-600">
                Failed to load accommodations.
              </p>
            </div>
          ) : accommodations.length === 0 ? (
            <div className="rounded-xl bg-sand-50 p-6 text-center">
              <p className="text-sm text-slate-500">
                No accommodations listed for this spot yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {accommodations.map((acc) => (
                <div
                  key={acc.id}
                  className="overflow-hidden rounded-xl border border-sand-200 transition-shadow hover:shadow-md"
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">
                          {acc.name}
                        </h4>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          {acc.type && (
                            <span className="rounded bg-sand-100 px-1.5 py-0.5 text-xs text-slate-600">
                              {acc.type}
                            </span>
                          )}
                          {acc.tier && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                                acc.tier === "Luxury"
                                  ? "bg-primary-50 text-primary-700"
                                  : acc.tier === "Deluxe"
                                    ? "bg-accent-50 text-accent-700"
                                    : "bg-success-500/10 text-success-600"
                              }`}
                            >
                              {acc.tier}
                            </span>
                          )}
                        </div>
                      </div>
                      <RatingStars rating={acc.rating} />
                    </div>

                    {acc.address && (
                      <p className="mt-1.5 flex items-start gap-1 text-xs text-slate-500">
                        <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                        {acc.address}
                      </p>
                    )}

                    {acc.amenities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {acc.amenities.slice(0, 5).map((a) => (
                          <span
                            key={a}
                            className="inline-flex items-center gap-0.5 rounded-md bg-sand-50 px-1.5 py-0.5 text-xs text-slate-600"
                          >
                            {a === "WiFi" ? (
                              <Wifi className="h-2.5 w-2.5" />
                            ) : (
                              <Check className="h-2.5 w-2.5" />
                            )}
                            {a}
                          </span>
                        ))}
                        {acc.amenities.length > 5 && (
                          <span className="text-xs text-slate-400">
                            +{acc.amenities.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-2.5 flex items-center justify-between border-t border-sand-100 pt-2.5">
                      <div className="flex items-baseline gap-0.5">
                        <IndianRupee className="h-3.5 w-3.5 text-slate-600" />
                        <span className="text-lg font-bold text-slate-800">
                          {acc.price_per_night?.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-500">/night</span>
                      </div>
                      <button className="rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTravelTime(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
