import { useState, useMemo } from "react";
import {
  Plane,
  Train,
  Car,
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Users,
  BedDouble,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Cookie,
  IndianRupee,
  Caravan,
  Sparkles,
  CheckCircle2,
  Calendar,
  Plus,
  Minus,
} from "lucide-react";
import type { State } from "../lib/types";

type TransitMode = "flight" | "train" | "self-drive";
type BookingPref = "self" | "platform";
type FleetType =
  | "innova"
  | "xylo"
  | "scorpio"
  | "bolero"
  | "winger"
  | "tempo-traveller"
  | "luxury-sedan"
  | "luxury-suv";
type AccommodationTier = "budget" | "deluxe" | "luxury";
type AccommodationType = "hotel" | "resort" | "homestay";
type MealSlot = "breakfast" | "lunch" | "snacks" | "dinner";
type MealScope = "trip-wide" | "day-by-day";

interface TourConfig {
  origin: string;
  destination: string;
  departureDate: string;
  tripDays: number;
  travelers: number;
  transitMode: TransitMode;
  bookingPref: BookingPref;
  fleet: FleetType[];
  accommodationTier: AccommodationTier;
  accommodationType: AccommodationType;
  mealScope: MealScope;
  tripMeals: Record<MealSlot, boolean>;
  dayMeals: Record<number, Record<MealSlot, boolean>>;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
}

const STEPS = [
  { id: 1, label: "Transit & Origin", icon: Plane },
  { id: 2, label: "Local Fleet", icon: Car },
  { id: 3, label: "Accommodation", icon: BedDouble },
  { id: 4, label: "Meals & Review", icon: Utensils },
];

const FLEET_OPTIONS: {
  id: FleetType;
  name: string;
  category: string;
  seats: string;
  pricePerDay: number;
  icon: typeof Car;
}[] = [
  { id: "innova", name: "Toyota Innova", category: "SUV / MUV", seats: "6–7 seats", pricePerDay: 3500, icon: Car },
  { id: "xylo", name: "Mahindra Xylo", category: "SUV / MUV", seats: "6–7 seats", pricePerDay: 2800, icon: Car },
  { id: "scorpio", name: "Mahindra Scorpio", category: "SUV / MUV", seats: "7–8 seats", pricePerDay: 3000, icon: Car },
  { id: "bolero", name: "Mahindra Bolero", category: "SUV / MUV", seats: "7–8 seats", pricePerDay: 2500, icon: Car },
  { id: "winger", name: "Tata Winger", category: "Group Transport", seats: "9–11 seats", pricePerDay: 4500, icon: Caravan },
  { id: "tempo-traveller", name: "Tempo Traveller", category: "Group Transport", seats: "12–17 seats", pricePerDay: 5000, icon: Caravan },
  { id: "luxury-sedan", name: "Luxury Sedan", category: "Premium", seats: "4 seats", pricePerDay: 8000, icon: Car },
  { id: "luxury-suv", name: "Luxury SUV", category: "Premium", seats: "4–5 seats", pricePerDay: 12000, icon: Car },
];

const MEAL_SLOTS: { id: MealSlot; label: string; icon: typeof Coffee }[] = [
  { id: "breakfast", label: "Breakfast", icon: Coffee },
  { id: "lunch", label: "Lunch", icon: Sun },
  { id: "snacks", label: "Evening Snacks", icon: Cookie },
  { id: "dinner", label: "Dinner", icon: Moon },
];

const initialConfig: TourConfig = {
  origin: "",
  destination: "",
  departureDate: "",
  tripDays: 5,
  travelers: 2,
  transitMode: "flight",
  bookingPref: "self",
  fleet: [],
  accommodationTier: "deluxe",
  accommodationType: "hotel",
  mealScope: "trip-wide",
  tripMeals: { breakfast: true, lunch: false, snacks: false, dinner: true },
  dayMeals: {},
  leadName: "",
  leadEmail: "",
  leadPhone: "",
};

interface Props {
  states: State[];
}

export function TourBuilder({ states }: Props) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<TourConfig>(initialConfig);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof TourConfig>(
    key: K,
    value: TourConfig[K],
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFleet = (id: FleetType) => {
    setConfig((prev) => ({
      ...prev,
      fleet: prev.fleet.includes(id)
        ? prev.fleet.filter((f) => f !== id)
        : [...prev.fleet, id],
    }));
  };

  const toggleTripMeal = (slot: MealSlot) => {
    setConfig((prev) => ({
      ...prev,
      tripMeals: {
        ...prev.tripMeals,
        [slot]: !prev.tripMeals[slot],
      },
    }));
  };

  const toggleDayMeal = (day: number, slot: MealSlot) => {
    setConfig((prev) => {
      const dayMeals = { ...prev.dayMeals };
      if (!dayMeals[day]) {
        dayMeals[day] = {
          breakfast: false,
          lunch: false,
          snacks: false,
          dinner: false,
        };
      }
      dayMeals[day] = { ...dayMeals[day], [slot]: !dayMeals[day][slot] };
      return { ...prev, dayMeals };
    });
  };

  const canProceed = useMemo(() => {
    if (step === 1)
      return (
        config.origin.trim() !== "" &&
        config.destination.trim() !== "" &&
        config.departureDate !== ""
      );
    if (step === 2) return config.fleet.length > 0;
    return true;
  }, [step, config]);

  const estimatedCost = useMemo(() => {
    const fleetCost = config.fleet.reduce((sum, id) => {
      const f = FLEET_OPTIONS.find((o) => o.id === id);
      return sum + (f?.pricePerDay ?? 0);
    }, 0) * config.tripDays;

    const tierMultiplier = {
      budget: 1500,
      deluxe: 4000,
      luxury: 10000,
    };
    const stayCost =
      tierMultiplier[config.accommodationTier] * config.tripDays * Math.ceil(config.travelers / 2);

    const mealCostPerPerson = config.mealScope === "trip-wide"
      ? Object.values(config.tripMeals).filter(Boolean).length * 300
      : Object.values(config.dayMeals).reduce(
          (sum, day) => sum + Object.values(day).filter(Boolean).length * 300,
          0,
        );
    const mealCost = mealCostPerPerson * config.travelers;

    return fleetCost + stayCost + mealCost;
  }, [config]);

  if (submitted) {
    return (
      <div className="ts-fade-in flex min-h-[400px] flex-col items-center justify-center">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-sand-200">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-500/10">
            <CheckCircle2 className="h-8 w-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Tour Request Submitted!</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Your custom tour plan has been received. Our travel team will review
            your preferences and contact you at <span className="font-medium text-slate-700">{config.leadEmail}</span> within 24 hours
            with a detailed itinerary and quote.
          </p>
          <div className="mt-5 rounded-xl bg-sand-50 p-4 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Estimated Budget</span>
              <span className="flex items-center font-bold text-slate-800">
                <IndianRupee className="h-4 w-4" />
                {estimatedCost.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setConfig(initialConfig);
              setStep(1);
              setSubmitted(false);
            }}
            className="mt-5 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            Plan Another Tour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ts-fade-in">
      {/* Header */}
      <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 p-8 shadow-lg shadow-emerald-500/20 sm:p-10">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          <Sparkles className="h-3 w-3" />
          Personalized Itinerary
        </div>
        <h2 className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl">
          Build Your Custom Tour
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90">
          Create a personalized itinerary tailored to your route, transport,
          stays, and meal preferences. Our team will craft the perfect trip for
          you.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-md shadow-cyan-500/30"
                        : isDone
                          ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white"
                          : "bg-sand-100 text-slate-400"
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`hidden text-xs font-medium sm:block ${
                      isActive
                        ? "text-cyan-700"
                        : isDone
                          ? "text-emerald-600"
                          : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 rounded-full transition-colors ${
                      step > s.id ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-sand-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-emerald-200">
        {step === 1 && (
          <Step1Transit
            config={config}
            update={update}
            states={states}
          />
        )}
        {step === 2 && (
          <Step2Fleet config={config} toggleFleet={toggleFleet} />
        )}
        {step === 3 && (
          <Step3Accommodation config={config} update={update} />
        )}
        {step === 4 && (
          <Step4Meals
            config={config}
            update={update}
            toggleTripMeal={toggleTripMeal}
            toggleDayMeal={toggleDayMeal}
            estimatedCost={estimatedCost}
            onSubmit={() => setSubmitted(true)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        {step < 4 ? (
          <button
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            disabled={!canProceed}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 transition-all hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ============ STEP 1: Transit & Origin ============
function Step1Transit({
  config,
  update,
  states,
}: {
  config: TourConfig;
  update: <K extends keyof TourConfig>(key: K, value: TourConfig[K]) => void;
  states: State[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <MapPin className="h-5 w-5 text-primary-600" />
          Origin & Destination
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Where are you starting from, and which state do you want to explore?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            Departure Point
          </label>
          <input
            type="text"
            placeholder="e.g. Mumbai, Delhi, Bangalore"
            value={config.origin}
            onChange={(e) => update("origin", e.target.value)}
            className="w-full rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            Destination State
          </label>
          <select
            value={config.destination}
            onChange={(e) => update("destination", e.target.value)}
            className="w-full rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400"
          >
            <option value="">Select a state</option>
            {states.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            Departure Date
          </label>
          <input
            type="date"
            value={config.departureDate}
            onChange={(e) => update("departureDate", e.target.value)}
            className="w-full rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-primary-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            Trip Duration (days)
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => update("tripDays", Math.max(1, config.tripDays - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-sand-200 text-slate-500 hover:bg-sand-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex-1 rounded-xl border border-sand-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-700">
              {config.tripDays} days
            </span>
            <button
              onClick={() => update("tripDays", Math.min(30, config.tripDays + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-sand-200 text-slate-500 hover:bg-sand-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            Travelers
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => update("travelers", Math.max(1, config.travelers - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-sand-200 text-slate-500 hover:bg-sand-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex-1 rounded-xl border border-sand-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-700">
              <Users className="mr-1 inline h-3.5 w-3.5" />
              {config.travelers}
            </span>
            <button
              onClick={() => update("travelers", Math.min(20, config.travelers + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-sand-200 text-slate-500 hover:bg-sand-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transit mode */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">
          Transit Mode
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "flight" as TransitMode, label: "Flight", icon: Plane },
            { id: "train" as TransitMode, label: "Train", icon: Train },
            { id: "self-drive" as TransitMode, label: "Self-Drive", icon: Car },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = config.transitMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => update("transitMode", mode.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  isSelected
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-sand-200 text-slate-500 hover:border-sand-300 hover:bg-sand-50"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Booking preference */}
      {config.transitMode !== "self-drive" && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-700">
            Booking Preference
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => update("bookingPref", "self")}
              className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                config.bookingPref === "self"
                  ? "border-primary-500 bg-primary-50"
                  : "border-sand-200 hover:border-sand-300 hover:bg-sand-50"
              }`}
            >
              <Users className="mt-0.5 h-5 w-5 text-slate-500" />
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  I'll book my own tickets
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Handle your own flight or train tickets
                </p>
              </div>
            </button>
            <button
              onClick={() => update("bookingPref", "platform")}
              className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                config.bookingPref === "platform"
                  ? "border-primary-500 bg-primary-50"
                  : "border-sand-200 hover:border-sand-300 hover:bg-sand-50"
              }`}
            >
              <Sparkles className="mt-0.5 h-5 w-5 text-accent-500" />
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Platform-assisted booking
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  We'll help arrange your transit tickets
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ STEP 2: Local Fleet ============
function Step2Fleet({
  config,
  toggleFleet,
}: {
  config: TourConfig;
  toggleFleet: (id: FleetType) => void;
}) {
  const categories = useMemo(() => {
    const cats = new Map<string, typeof FLEET_OPTIONS>();
    for (const f of FLEET_OPTIONS) {
      if (!cats.has(f.category)) cats.set(f.category, []);
      cats.get(f.category)!.push(f);
    }
    return Array.from(cats.entries());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <Car className="h-5 w-5 text-primary-600" />
          Local Transport Fleet
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Select your preferred vehicle(s) for local travel during the trip.
          You can choose multiple if your group needs different vehicles.
        </p>
      </div>

      {categories.map(([cat, options]) => (
        <div key={cat}>
          <h4 className="mb-2 text-sm font-semibold text-slate-700">{cat}</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {options.map((f) => {
              const isSelected = config.fleet.includes(f.id);
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFleet(f.id)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary-500 bg-primary-50"
                      : "border-sand-200 hover:border-sand-300 hover:bg-sand-50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-primary-600 text-white"
                        : "bg-sand-100 text-slate-500"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {f.name}
                    </p>
                    <p className="text-xs text-slate-500">{f.seats}</p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center text-sm font-bold text-slate-700">
                      <IndianRupee className="h-3 w-3" />
                      {f.pricePerDay.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-slate-400">/day</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-primary-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {config.fleet.length === 0 && (
        <p className="rounded-lg bg-accent-50 px-4 py-2.5 text-sm text-accent-700">
          Select at least one vehicle to continue.
        </p>
      )}
    </div>
  );
}

// ============ STEP 3: Accommodation ============
function Step3Accommodation({
  config,
  update,
}: {
  config: TourConfig;
  update: <K extends keyof TourConfig>(key: K, value: TourConfig[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <BedDouble className="h-5 w-5 text-primary-600" />
          Accommodation Preferences
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Choose your preferred tier and property type for your stay.
        </p>
      </div>

      {/* Tier */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">Tier</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "budget" as AccommodationTier, label: "Budget", desc: "₹1,500+/night", color: "success" },
            { id: "deluxe" as AccommodationTier, label: "Deluxe", desc: "₹4,000+/night", color: "accent" },
            { id: "luxury" as AccommodationTier, label: "Luxury", desc: "₹10,000+/night", color: "primary" },
          ].map((tier) => {
            const isSelected = config.accommodationTier === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => update("accommodationTier", tier.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all ${
                  isSelected
                    ? "border-primary-500 bg-primary-50"
                    : "border-sand-200 hover:border-sand-300 hover:bg-sand-50"
                }`}
              >
                <span className="text-sm font-semibold text-slate-800">
                  {tier.label}
                </span>
                <span className="text-xs text-slate-500">{tier.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Property type */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">
          Property Type
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "hotel" as AccommodationType, label: "Hotel", icon: BedDouble },
            { id: "resort" as AccommodationType, label: "Resort", icon: Sparkles },
            { id: "homestay" as AccommodationType, label: "Homestay", icon: Users },
          ].map((type) => {
            const Icon = type.icon;
            const isSelected = config.accommodationType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => update("accommodationType", type.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  isSelected
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-sand-200 text-slate-500 hover:border-sand-300 hover:bg-sand-50"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-sand-50 p-4">
        <p className="text-sm leading-relaxed text-slate-600">
          <Calendar className="mr-1 inline h-4 w-4 text-primary-500" />
          Accommodation will be allocated based on your {config.tripDays}-day
          itinerary and night stops. Our team will map stays to the tourist
          spots you visit each day.
        </p>
      </div>
    </div>
  );
}

// ============ STEP 4: Meals & Review ============
function Step4Meals({
  config,
  update,
  toggleTripMeal,
  toggleDayMeal,
  estimatedCost,
  onSubmit,
}: {
  config: TourConfig;
  update: <K extends keyof TourConfig>(key: K, value: TourConfig[K]) => void;
  toggleTripMeal: (slot: MealSlot) => void;
  toggleDayMeal: (day: number, slot: MealSlot) => void;
  estimatedCost: number;
  onSubmit: () => void;
}) {
  const [showLeadForm, setShowLeadForm] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <Utensils className="h-5 w-5 text-primary-600" />
          Meal Preferences
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Configure meal plans for your trip — either set the same plan for all
          days, or customize each day individually.
        </p>
      </div>

      {/* Meal scope toggle */}
      <div className="flex gap-2 rounded-xl bg-sand-100 p-1">
        <button
          onClick={() => update("mealScope", "trip-wide")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            config.mealScope === "trip-wide"
              ? "bg-white text-primary-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Trip-wide (Bulk)
        </button>
        <button
          onClick={() => update("mealScope", "day-by-day")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            config.mealScope === "day-by-day"
              ? "bg-white text-primary-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Day-by-Day
        </button>
      </div>

      {/* Trip-wide meals */}
      {config.mealScope === "trip-wide" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MEAL_SLOTS.map((slot) => {
            const Icon = slot.icon;
            const isSelected = config.tripMeals[slot.id];
            return (
              <button
                key={slot.id}
                onClick={() => toggleTripMeal(slot.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  isSelected
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-sand-200 text-slate-500 hover:border-sand-300 hover:bg-sand-50"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{slot.label}</span>
                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 text-primary-600" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Day-by-day meals */}
      {config.mealScope === "day-by-day" && (
        <div className="space-y-3">
          {Array.from({ length: config.tripDays }, (_, i) => i + 1).map((day) => (
            <div
              key={day}
              className="rounded-xl border border-sand-200 p-3"
            >
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Day {day}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {MEAL_SLOTS.map((slot) => {
                  const Icon = slot.icon;
                  const dayMeals = config.dayMeals[day] ?? {
                    breakfast: false,
                    lunch: false,
                    snacks: false,
                    dinner: false,
                  };
                  const isSelected = dayMeals[slot.id];
                  return (
                    <button
                      key={slot.id}
                      onClick={() => toggleDayMeal(day, slot.id)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-primary-400 bg-primary-50 text-primary-700"
                          : "border-sand-200 text-slate-500 hover:bg-sand-50"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cost estimate */}
      <div className="rounded-xl bg-primary-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">
              Estimated Trip Cost
            </p>
            <p className="text-xs text-slate-400">
              Based on {config.tripDays} days, {config.travelers} travelers
            </p>
          </div>
          <div className="flex items-baseline gap-0.5">
            <IndianRupee className="h-5 w-5 text-primary-700" />
            <span className="text-2xl font-bold text-primary-700">
              {estimatedCost.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Lead form */}
      {!showLeadForm ? (
        <button
          onClick={() => setShowLeadForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <Sparkles className="h-4 w-4" />
          Submit Tour Request
        </button>
      ) : (
        <div className="space-y-4 rounded-xl border border-sand-200 p-4">
          <h4 className="font-semibold text-slate-800">Contact Details</h4>
          <p className="text-sm text-slate-500">
            We'll use these to send your custom itinerary and quote.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              required
              type="text"
              placeholder="Full Name"
              value={config.leadName}
              onChange={(e) => update("leadName", e.target.value)}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
            />
            <input
              required
              type="email"
              placeholder="Email Address"
              value={config.leadEmail}
              onChange={(e) => update("leadEmail", e.target.value)}
              className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
            />
          </div>
          <input
            type="tel"
            placeholder="Phone Number"
            value={config.leadPhone}
            onChange={(e) => update("leadPhone", e.target.value)}
            className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
          />
          <button
            onClick={() => {
              if (
                config.leadName.trim() &&
                config.leadEmail.trim()
              ) {
                onSubmit();
              }
            }}
            disabled={!config.leadName.trim() || !config.leadEmail.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm & Submit
          </button>
        </div>
      )}
    </div>
  );
}
