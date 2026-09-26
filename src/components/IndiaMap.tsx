import { useMemo, useState, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { MapPin, Calendar, Sparkles, ArrowRight } from "lucide-react";
import type { State } from "../lib/types";
import { INDIA_TOPO_URL } from "../lib/mapData";

interface Props {
  states: State[];
  onSelectState: (state: State) => void;
}

// States on the eastern side of the map: the floating panel docks left
// for these so it never covers the state being hovered.
const EASTERN_STATES = new Set([
  "West Bengal",
  "Odisha",
  "Bihar",
  "Jharkhand",
  "Chhattisgarh",
  "Assam",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Meghalaya",
  "Sikkim",
  "Andaman and Nicobar Islands",
]);

export function IndiaMap({ states, onSelectState }: Props) {
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const stateMap = useMemo(() => {
    const m = new Map<string, State>();
    for (const s of states) m.set(s.name, s);
    return m;
  }, [states]);

  const hoveredState = hoveredName ? stateMap.get(hoveredName) ?? null : null;
  const hasData = (name: string) => stateMap.has(name);
  const dockLeft = hoveredState ? EASTERN_STATES.has(hoveredState.name) : false;

  const handleEnter = useCallback((name: string) => setHoveredName(name), []);
  const handleLeave = useCallback(() => setHoveredName(null), []);

  return (
    <div className="grid w-full grid-cols-1 gap-6">
      {/* Map */}
      <div className="relative min-w-0 overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 p-4 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-200">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 950, center: [78.96, 23.2] }}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={INDIA_TOPO_URL}>
            {({ geographies }) => {
              const markers = geographies
                .filter((geo) => hasData(geo.properties?.st_nm as string))
                .map((geo) => {
                  const name = geo.properties?.st_nm as string;
                  const centroid = geoCentroid(geo);
                  return { name, centroid, state: stateMap.get(name)! };
                });

              return (
                <>
                  {geographies.map((geo) => {
                    const name = geo.properties?.st_nm as string;
                    const state = stateMap.get(name);
                    const isHovered = hoveredName === name;
                    const hasInfo = hasData(name);

                    let fill = "#dbe7f0";
                    if (state?.color) fill = state.color + "30";
                    if (isHovered && hasInfo) fill = state?.color ?? "#2f8fff";
                    if (isHovered && !hasInfo) fill = "#94a3b8";

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => handleEnter(name)}
                        onMouseLeave={handleLeave}
                        onClick={() => hasInfo && state && onSelectState(state)}
                        fill={fill}
                        stroke="#ffffff"
                        strokeWidth={0.5}
                        strokeOpacity={0.8}
                        style={{
                          outline: "none",
                          cursor: hasInfo ? "pointer" : "default",
                          transition: "fill 200ms ease",
                        }}
                      />
                    );
                  })}
                  {markers.map(({ name, centroid, state }) => (
                    <Marker
                      key={name}
                      coordinates={centroid as [number, number]}
                      onMouseEnter={() => handleEnter(name)}
                      onMouseLeave={handleLeave}
                      onClick={() => onSelectState(state)}
                    >
                      <circle
                        r={3}
                        fill={state.color ?? "#2f8fff"}
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

        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-500" />
            Click a highlighted state to explore
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />
            Coming soon
          </span>
        </div>
      </div>

      {/* Floating preview: inline below the map on mobile, fixed to the
          side of the viewport on desktop so it stays visible while
          scrolling / hovering across the map. Anchored below the sticky
          site header (top-24) and above the viewport bottom so tall cards
          are always fully reachable. The container is click-through
          (pointer-events-none) so it never blocks map hovers; the card
          itself re-enables events. Eastern states dock the panel left. */}
      <div
        className={`pointer-events-none lg:fixed lg:bottom-6 lg:top-24 lg:z-30 lg:w-[340px] lg:overflow-y-auto ${
          dockLeft ? "lg:left-6" : "lg:right-6"
        }`}
      >
        {hoveredState ? (
          <div className="pointer-events-auto lg:rounded-2xl lg:shadow-xl">
            <StatePreviewCard state={hoveredState} onSelect={onSelectState} />
          </div>
        ) : (
          <div className="pointer-events-auto rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sand-200 ts-fade-in lg:p-4 lg:text-center lg:shadow-xl">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 lg:h-10 lg:w-10">
                <MapPin className="h-7 w-7 text-cyan-600 lg:h-5 lg:w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 lg:text-sm">
                Explore India
              </h3>
              <p className="text-sm leading-relaxed text-slate-500 lg:text-xs">
                Hover over any state on the map to see travel highlights and
                seasonal recommendations. Click to dive into districts and
                tourist spots.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatePreviewCard({
  state,
  onSelect,
}: {
  state: State;
  onSelect: (s: State) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-cyan-200 ts-fade-in">
      {state.image_url && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={state.image_url}
            alt={state.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-xl font-bold text-white drop-shadow">
              {state.name}
            </h3>
            {state.tagline && (
              <p className="text-sm font-medium text-white/90">
                {state.tagline}
              </p>
            )}
          </div>
        </div>
      )}
      {!state.image_url && (
        <div
          className="flex h-20 items-center px-4"
          style={{ background: state.color ?? "#2f8fff" }}
        >
          <h3 className="text-xl font-bold text-white">{state.name}</h3>
        </div>
      )}
      <div className="p-4">
        {state.description && (
          <p className="mb-3 text-sm leading-relaxed text-slate-600">
            {state.description}
          </p>
        )}

        <div className="mb-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">
            <Calendar className="h-3 w-3" />
            {state.best_season ?? "Year-round"}
          </span>
          {state.peak_season && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
              <Sparkles className="h-3 w-3" />
              Peak: {state.peak_season}
            </span>
          )}
        </div>

        {state.highlights.length > 0 && (
          <div className="mb-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Highlights
            </p>
            <div className="flex flex-wrap gap-1.5">
              {state.highlights.map((h) => (
                <span
                  key={h}
                  className="rounded-md bg-sand-100 px-2 py-0.5 text-xs text-slate-600"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => onSelect(state)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/40 hover:brightness-110"
        >
          Explore {state.name}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
