import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Clock,
  Users,
  MapPin,
  BadgeCheck,
  IndianRupee,
  Star,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { TravelPackage } from "../lib/types";
import { fetchPackages } from "../lib/data";
import { ConfigNotice } from "./ConfigNotice";
import { PackageModal } from "./PackageModal";

const CATEGORIES = ["All", "Heritage", "Beach", "Adventure", "Honeymoon", "Pilgrimage"];

export function Marketplace() {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "price-low" | "price-high">(
    "rating",
  );
  const [selected, setSelected] = useState<TravelPackage | null>(null);

  useEffect(() => {
    let active = true;
    fetchPackages()
      .then((data) => {
        if (active) setPackages(data);
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

  const filtered = useMemo(() => {
    let list = packages;
    if (category !== "All") {
      list = list.filter((p) => p.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.state_name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }
    list = [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price-low")
        return (a.price ?? 0) - (b.price ?? 0);
      return (b.price ?? 0) - (a.price ?? 0);
    });
    return list;
  }, [packages, category, search, sortBy]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (error) {
    return <ConfigNotice context="The tour marketplace" />;
  }

  return (
    <div className="ts-fade-in">
      {/* Hero */}
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">
          Curated Tour Packages
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          Browse and compare ready-made tour packages from verified travel
          agents across India. Find your perfect trip and connect directly with
          the agent.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search packages, states, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-sand-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "rating" | "price-low" | "price-high",
                )
              }
              className="rounded-xl border border-sand-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-primary-400"
            >
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-primary-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-sand-200 hover:bg-sand-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-slate-500">
        {filtered.length} {filtered.length === 1 ? "package" : "packages"} found
      </p>

      {/* Package grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-sand-200">
          <p className="text-sm text-slate-500">
            No packages match your filters. Try a different search or category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onClick={() => setSelected(pkg)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <PackageModal
          pkg={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function PackageCard({
  pkg,
  onClick,
}: {
  pkg: TravelPackage;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-sand-200 transition-all hover:shadow-lg hover:ring-primary-200"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {pkg.image_url ? (
          <img
            src={pkg.image_url}
            alt={pkg.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-sand-100">
            <MapPin className="h-8 w-8 text-sand-300" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          {pkg.category && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
              {pkg.category}
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3">
          <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 backdrop-blur">
            <Star className="h-3 w-3 fill-accent-500 text-accent-500" />
            <span className="text-xs font-semibold text-slate-700">
              {pkg.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-slate-800 group-hover:text-primary-700">
          {pkg.title}
        </h3>
        {pkg.state_name && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            {pkg.state_name}
          </p>
        )}

        {pkg.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {pkg.description}
          </p>
        )}

        {/* Agent */}
        {pkg.agent && (
          <div className="mt-3 flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">
              {pkg.agent.name.charAt(0)}
            </div>
            <span className="text-xs font-medium text-slate-600">
              {pkg.agent.name}
            </span>
            {pkg.agent.verified && (
              <BadgeCheck className="h-3.5 w-3.5 text-primary-500" />
            )}
          </div>
        )}

        {/* Meta */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
          {pkg.duration_days && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {pkg.duration_days}D / {pkg.duration_days - 1}N
            </span>
          )}
          {pkg.max_group_size && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              Max {pkg.max_group_size}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-auto flex items-end justify-between border-t border-sand-100 pt-3">
          <div>
            <p className="text-xs text-slate-400">Starting from</p>
            <div className="flex items-baseline gap-0.5">
              <IndianRupee className="h-4 w-4 text-slate-700" />
              <span className="text-xl font-bold text-slate-800">
                {pkg.price?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <span className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white">
            View Details
          </span>
        </div>
      </div>
    </button>
  );
}
