import { useMemo, useState, useCallback, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Ticket,
  Calendar,
  Sparkles,
} from "lucide-react";
import type { State, District, TouristSpot } from "../lib/types";
import { stateTopoUrl } from "../lib/mapData";
import { fetchDistricts, fetchSpotsByState } from "../lib/data";
import { RatingStars } from "./RatingStars";

interface Props {
  state: State;
  onBack: () => void;
  onSelectSpot: (spot: TouristSpot, allSpots: TouristSpot[]) => void;
}

export function StateMap({ state, onBack, onSelectSpot }: Props) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null,
  );
  const [districtSpots, setDistrictSpots] = useState<TouristSpot[]>([]);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const topoUrl = stateTopoUrl(state.name);

  const districtMap = useMemo(() => {
    const m = new Map<string, District>();
    for (const d of districts) m.set(d.name, d);
    return m;
  }, [districts]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setSelectedDistrict(null);
    setDistrictSpots([]);

    Promise.all([fetchDistricts(state.id), fetchSpotsByState(state.id)])
      .then(([d, s]) => {
        if (!active) return;
        setDistricts(d);
        setSpots(s);
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
  }, [state.id]);

  const handleSelectDistrict = useCallback(
    (district: District) => {
      setSelectedDistrict(district);
      const s = spots.filter((sp) => sp.district_id === district.id);
      setDistrictSpots(s);
    },
    [spots],
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          <p className="text-sm text-slate-500">Loading {state.name}...</p>
        </div>
      </div>
    );
  }

  if (error || !topoUrl) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <p className="text-sm text-error-600">
          {topoUrl
            ? `Failed to load ${state.name} map data.`
            : `Map data not available for ${state.name}.`}
        </p>
        <button
          onClick={onBack}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Back to India map
        </button>
      </div>
    );
  }

  return (
    <div className="ts-fade-in">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-sand-200 transition-colors hover:bg-sand-50"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{state.name}</h2>
            {state.tagline && (
              <p className="text-sm text-slate-500">{state.tagline}</p>
            )}
          </div>
        </div>
        <div className="hidden gap-2 sm:flex">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
            <Calendar className="h-3 w-3" />
            {state.best_season ?? "Year-round"}
          </span>
          {state.peak_season && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent-700">
              <Sparkles className="h-3 w-3" />
              Peak: {state.peak_season}
            </span>
          )}
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* District map */}
        <div className="min-w-0 rounded-2xl bg-gradient-to-br from-sand-50 to-primary-50 p-4 shadow-sm ring-1 ring-sand-200">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: getScale(state.name), center: getCenter(state.name) }}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={topoUrl}>
              {({ geographies }) => {
                const markers = geographies
                  .filter((geo) => {
                    const dName = geo.properties?.district as string;
                    return districtMap.has(dName);
                  })
                  .map((geo) => {
                    const dName = geo.properties?.district as string;
                    const centroid = geoCentroid(geo);
                    return { dName, centroid };
                  });

                return (
                  <>
                    {geographies.map((geo) => {
                      const dName = geo.properties?.district as string;
                      const district = districtMap.get(dName);
                      const isSelected =
                        selectedDistrict?.name === dName;
                      const isHovered = hoveredDistrict === dName;
                      const hasData = !!district;

                      let fill = "#e7dcc4";
                      if (hasData) fill = "#f0e6d2";
                      if (isHovered && hasData) fill = "#f97316";
                      if (isSelected) fill = "#ea580c";

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() =>
                            hasData && setHoveredDistrict(dName)
                          }
                          onMouseLeave={() => setHoveredDistrict(null)}
                          onClick={() =>
                            hasData && district && handleSelectDistrict(district)
                          }
                          fill={fill}
                          stroke="#ffffff"
                          strokeWidth={0.6}
                          style={{
                            outline: "none",
                            cursor: hasData ? "pointer" : "default",
                            transition: "fill 200ms ease",
                          }}
                        />
                      );
                    })}
                    {markers.map(({ dName, centroid }) => (
                      <Marker
                        key={dName}
                        coordinates={centroid as [number, number]}
                        onMouseEnter={() => setHoveredDistrict(dName)}
                        onMouseLeave={() => setHoveredDistrict(null)}
                      >
                        <circle
                          r={2.5}
                          fill="#ea580c"
                          stroke="#fff"
                          strokeWidth={1}
                          className="cursor-pointer"
                        />
                      </Marker>
                    ))}
                  </>
                );
              }}
            </Geographies>
          </ComposableMap>

          {hoveredDistrict && (
            <div className="mt-2 text-center text-sm font-medium text-accent-700">
              {hoveredDistrict}
              {districtMap.get(hoveredDistrict)?.description &&
                ` — ${districtMap.get(hoveredDistrict)!.description}`}
            </div>
          )}
          {!hoveredDistrict && (
            <div className="mt-2 text-center text-xs text-slate-500">
              Hover over a district to see details. Click to view tourist spots.
            </div>
          )}
        </div>

        {/* Side panel: district spots */}
        <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          {selectedDistrict ? (
            <div className="ts-slide-in">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {selectedDistrict.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {districtSpots.length} tourist{" "}
                    {districtSpots.length === 1 ? "spot" : "spots"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedDistrict(null);
                    setDistrictSpots([]);
                  }}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-sand-100"
                >
                  Clear
                </button>
              </div>

              {selectedDistrict.description && (
                <p className="mb-3 text-sm leading-relaxed text-slate-600">
                  {selectedDistrict.description}
                </p>
              )}

              {districtSpots.length === 0 ? (
                <div className="rounded-xl bg-sand-50 p-6 text-center">
                  <p className="text-sm text-slate-500">
                    No tourist spots catalogued for this district yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {districtSpots.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => onSelectSpot(spot, spots)}
                      className="group block w-full overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-sand-200 transition-all hover:shadow-md hover:ring-primary-300"
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 group-hover:text-primary-700">
                              {spot.name}
                            </h4>
                            {spot.category && (
                              <span className="mt-0.5 inline-block rounded bg-sand-100 px-1.5 py-0.5 text-xs text-slate-600">
                                {spot.category}
                              </span>
                            )}
                          </div>
                          <RatingStars rating={spot.rating} />
                        </div>
                        {spot.description && (
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {spot.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                          {spot.entry_fee && (
                            <span className="inline-flex items-center gap-1">
                              <Ticket className="h-3 w-3" />
                              {spot.entry_fee}
                            </span>
                          )}
                          {spot.visit_duration && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {spot.visit_duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sand-200">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-50">
                  <MapPin className="h-6 w-6 text-accent-500" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">
                  {districts.length} Districts in {state.name}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  Click any district on the map to discover its famous tourist
                  spots, from heritage sites to natural wonders.
                </p>
              </div>

              <div className="mt-4 space-y-1.5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  All Districts
                </p>
                {districts.map((d) => {
                  const count = spots.filter(
                    (s) => s.district_id === d.id,
                  ).length;
                  return (
                    <button
                      key={d.id}
                      onClick={() => handleSelectDistrict(d)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-sand-50"
                    >
                      <span className="font-medium text-slate-700">
                        {d.name}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        {count > 0 && (
                          <>
                            <Star className="h-3 w-3 fill-accent-500 text-accent-500" />
                            {count}
                          </>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getCenter(stateName: string): [number, number] {
  const centers: Record<string, [number, number]> = {
    Kerala: [76.5, 10.0],
    Rajasthan: [74.0, 26.5],
    Goa: [74.0, 15.3],
    "Himachal Pradesh": [77.5, 31.5],
    "Tamil Nadu": [78.5, 11.0],
    "Andhra Pradesh": [80.0, 15.9],
    "Arunachal Pradesh": [94.5, 28.0],
    Assam: [92.5, 26.2],
    Bihar: [85.5, 25.8],
    Chhattisgarh: [81.8, 21.0],
    Gujarat: [71.5, 22.5],
    Haryana: [76.5, 29.2],
    Jharkhand: [85.5, 23.8],
    Karnataka: [76.5, 14.5],
    "Madhya Pradesh": [78.0, 23.5],
    Maharashtra: [76.5, 19.5],
    Manipur: [93.9, 24.5],
    Meghalaya: [91.5, 25.5],
    Mizoram: [92.8, 23.3],
    Nagaland: [94.3, 26.0],
    Odisha: [84.5, 20.5],
    Punjab: [75.3, 31.0],
    Sikkim: [88.4, 27.5],
    Telangana: [79.0, 18.0],
    Tripura: [91.5, 23.8],
    "Uttar Pradesh": [80.5, 27.0],
    Uttarakhand: [79.5, 30.0],
    "West Bengal": [87.5, 23.5],
    "Andaman and Nicobar Islands": [92.9, 12.0],
    Chandigarh: [76.78, 30.74],
    "Dadra and Nagar Haveli and Daman and Diu": [73.0, 20.4],
    Delhi: [77.2, 28.6],
    "Jammu and Kashmir": [75.0, 33.8],
    Ladakh: [77.8, 34.2],
    Lakshadweep: [72.5, 10.5],
    Puducherry: [79.83, 11.93],
  };
  return centers[stateName] ?? [78.96, 22.5];
}

// Small states/UTs need a larger zoom or they render as a dot at the
// default scale. Values tuned so each state fills the map panel.
function getScale(stateName: string): number {
  const scales: Record<string, number> = {
    Chandigarh: 30000,
    Delhi: 12000,
    Puducherry: 9000,
    "Dadra and Nagar Haveli and Daman and Diu": 9000,
    Lakshadweep: 6000,
    Goa: 6000,
    Sikkim: 6000,
    Tripura: 6000,
    "Andaman and Nicobar Islands": 1500,
  };
  return scales[stateName] ?? 2500;
}
