import { useEffect, useState, useCallback } from "react";
import {
  Sparkles,
  Package,
  LayoutGrid,
  Wand2,
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
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-sand-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button
            onClick={() => {
              setTab("map");
              handleBackToIndia();
            }}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-sm">
              <img src="/logo.svg" alt="Travel Stories logo" className="h-6 w-6" />
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
          <nav className="flex items-center gap-1 rounded-xl bg-sand-100 p-1">
            <button
              onClick={() => setTab("map")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === "map"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Map Explorer</span>
            </button>
            <button
              onClick={() => setTab("packages")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === "packages"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Tour Packages</span>
            </button>
            <button
              onClick={() => setTab("builder")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === "builder"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">Custom Tour</span>
            </button>
          </nav>

          <div className="flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700">
            <Sparkles className="h-3.5 w-3.5" />
            {states.length} States
          </div>
        </div>

        {/* Breadcrumb (only for map tab) */}
        {tab === "map" && view.level !== "india" && (
          <div className="border-t border-sand-100 px-4 py-2">
            <nav className="mx-auto flex max-w-7xl items-center gap-2 text-sm text-slate-500">
              <button
                onClick={handleBackToIndia}
                className="transition-colors hover:text-primary-600"
              >
                India
              </button>
              <span className="text-sand-300">/</span>
              <button
                onClick={handleBackToIndia}
                className="transition-colors hover:text-primary-600"
              >
                {view.level === "state"
                  ? view.state.name
                  : view.parentState.name}
              </button>
              {view.level === "spot" && (
                <>
                  <span className="text-sand-300">/</span>
                  <span className="font-semibold text-primary-700">
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
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
              <p className="text-sm text-slate-500">
                Loading India travel data...
              </p>
            </div>
          </div>
        ) : error ? (
          <ConfigNotice context="The map explorer" />
        ) : view.level === "india" ? (
          <div className="ts-fade-in">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                Explore Incredible India
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                Hover over states to discover travel highlights and seasonal
                recommendations. Click any state to dive into its districts and
                uncover famous tourist spots, stays, and more.
              </p>
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
      <footer className="border-t border-sand-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-slate-400">
          Travel Stories — Interactive India Travel Discovery
        </div>
      </footer>
    </div>
  );
}

export default App;
