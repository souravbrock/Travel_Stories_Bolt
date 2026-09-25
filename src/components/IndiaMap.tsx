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

export function IndiaMap({ states, onSelectState }: Props) {
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const stateMap = useMemo(() => {
    const m = new Map<string, State>();
    for (const s of states) m.set(s.name, s);
    return m;
  }, [states]);

  const hoveredState = hoveredName ? stateMap.get(hoveredName) ?? null : null;
  const hasData = (name: string) => stateMap.has(name);

  const handleEnter = useCallback((name: string) => setHoveredName(name), []);
  const handleLeave = useCallback(() => setHoveredName(null), []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      {/* Map */}
      <div className="relative rounded-2xl bg-gradient-to-br from-primary-50 to-sand-50 p-4 shadow-sm ring-1 ring-sand-200">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1100, center: [78.96, 22.5] }}
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
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary-500" />
            Click a highlighted state to explore
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />
            Coming soon
          </span>
        </div>
      </div>

      {/* Preview card */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        {hoveredState ? (
          <StatePreviewCard state={hoveredState} onSelect={onSelectState} />
        ) : (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sand-200 ts-fade-in">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                <MapPin className="h-7 w-7 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Explore India
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">
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
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sand-200 ts-fade-in">
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
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          Explore {state.name}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
