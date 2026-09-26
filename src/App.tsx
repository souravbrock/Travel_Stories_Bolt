import { useEffect, useState, useCallback } from "react";
import {
  Sparkles,
  Package,
  LayoutGrid,
  Wand2,
  Plane,
  Heart,
  Shield,
} from "lucide-react";
import type { State, TouristSpot } from "./lib/types";
import { fetchStates } from "./lib/data";
import { ConfigNotice } from "./components/ConfigNotice";
import { IndiaMap } from "./components/IndiaMap";
import { StateMap } from "./components/StateMap";
import { SpotDetail } from "./components/SpotDetail";
import { Marketplace } from "./components/Marketplace";
import { TourBuilder } from "./components/TourBuilder";

type Tab = "map" | "packages" | "builder";

type View =
  | { level: "india" }
  | { level: "state"; state: State }
  | { level: "spot"; spot: TouristSpot; allSpots: TouristSpot[]; parentState: State };

const TAB_CONFIG: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "map", label: "Map Explorer", icon: LayoutGrid },
  { id: "packages", label: "Tour Packages", icon: Package },
  { id: "builder", label: "Custom Tour", icon: Wand2 },
];

function App() {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [view, setView] = useState<View>({ level: "india" });
  const [tab, setTab] = useState<Tab>("map");

  useEffect(() => {
    let active = true;
    fetchStates()
      .then((data) => {
        if (active) setStates(data);
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
  }, []);

  const handleSelectState = useCallback((state: State) => {
    setView({ level: "state", state });
  }, []);

  const handleBackToIndia = useCallback(() => {
    setView({ level: "india" });
  }, []);

  const handleSelectSpot = useCallback(
    (spot: TouristSpot, allSpots: TouristSpot[]) => {
      if (view.level === "state") {
        setView({
          level: "spot",
          spot,
          allSpots,
          parentState: view.state,
        });
      } else if (view.level === "spot") {
        setView({
          level: "spot",
          spot,
          allSpots,
          parentState: view.parentState,
        });
      }
    },
    [view],
  );

  const handleBackFromSpot = useCallback(() => {
    if (view.level === "spot") {
      setView({ level: "state", state: view.parentState });
    }
  }, [view]);

  return (
    <div className="ts-app-bg min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-sand-200 ts-glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button
            onClick={() => {
              setTab("map");
              handleBackToIndia();
            }}
            className="flex items-center gap-2.5"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl ts-gradient-primary shadow-md shadow-cyan-500/30">
              <img src="/logo.svg" alt="Travel Stories logo" className="h-6 w-6" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-400 ring-2 ring-white" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold leading-tight text-slate-800">
                Travel Stories
              </h1>
              <p className="text-xs leading-tight text-slate-500">
                Discover India
              </p>
            </div>
          </button>

          {/* Tabs */}
          <nav className="flex items-center gap-1 rounded-xl bg-sand-100/80 p-1">
            {TAB_CONFIG.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? `text-cyan-600` : ""}`} />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-3 py-1.5 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
            <Sparkles className="h-3.5 w-3.5" />
            {states.length} States
          </div>
        </div>

        {/* Breadcrumb (only for map tab) */}
        {tab === "map" && view.level !== "india" && (
          <div className="border-t border-sand-100 bg-white/50 px-4 py-2">
            <nav className="mx-auto flex max-w-7xl items-center gap-2 text-sm text-slate-500">
              <button
                onClick={handleBackToIndia}
                className="transition-colors hover:text-cyan-600"
              >
                India
              </button>
              <span className="text-sand-300">/</span>
              <button
                onClick={handleBackToIndia}
                className="transition-colors hover:text-cyan-600"
              >
                {view.level === "state"
                  ? view.state.name
                  : view.parentState.name}
              </button>
              {view.level === "spot" && (
                <>
                  <span className="text-sand-300">/</span>
                  <span className="font-semibold text-cyan-700">
                    {view.spot.name}
                  </span>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === "packages" ? (
          <Marketplace />
        ) : tab === "builder" ? (
          <TourBuilder states={states} />
        ) : loading ? (
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-200 border-t-cyan-600" />
              <p className="text-sm text-slate-500">
                Loading India travel data...
              </p>
            </div>
          </div>
        ) : error ? (
          <ConfigNotice context="The map explorer" />
        ) : view.level === "india" ? (
          <div className="ts-fade-in">
            {/* Hero banner */}
            <div className="mb-6 overflow-hidden rounded-3xl ts-gradient-hero p-8 shadow-lg shadow-cyan-500/20 sm:p-12">
              <div className="relative">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  <Sparkles className="h-3 w-3" />
                  Incredible India
                </div>
                <h2 className="text-3xl font-bold text-white drop-shadow-lg sm:text-5xl">
                  Explore Incredible India
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
                  Hover over states to discover travel highlights and seasonal
                  recommendations. Click any state to dive into its districts and
                  uncover famous tourist spots, stays, and more.
                </p>
                {/* Feature pills */}
                <div className="mt-5 flex flex-wrap gap-3">
                  {[
                    { icon: Plane, label: "Curated Tours" },
                    { icon: Heart, label: "Handpicked Stays" },
                    { icon: Shield, label: "Verified Agents" },
                  ].map((f) => {
                    const Icon = f.icon;
                    return (
                      <div
                        key={f.label}
                        className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white backdrop-blur"
                      >
                        <Icon className="h-4 w-4" />
                        {f.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <IndiaMap states={states} onSelectState={handleSelectState} />
          </div>
        ) : view.level === "state" ? (
          <StateMap
            state={view.state}
            onBack={handleBackToIndia}
            onSelectSpot={handleSelectSpot}
          />
        ) : (
          <SpotDetail
            spot={view.spot}
            allSpots={view.allSpots}
            onBack={handleBackFromSpot}
            onSelectSpot={handleSelectSpot}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-sand-200 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-slate-400">
          Travel Stories — Interactive India Travel Discovery
        </div>
      </footer>
    </div>
  );
}

export default App;
