import { useEffect, useState, useCallback } from "react";
import {
  Package,
  BedDouble,
  Car,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
  Store,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import type {
  VendorPackage,
  VendorAccommodation,
  VendorVehicle,
} from "../lib/types";

type ListingTab = "packages" | "accommodations" | "vehicles";

export function VendorDashboard() {
  const { profile, signOut } = useAuth();
  const [tab, setTab] = useState<ListingTab>("packages");
  const [packages, setPackages] = useState<VendorPackage[]>([]);
  const [accommodations, setAccommodations] = useState<VendorAccommodation[]>([]);
  const [vehicles, setVehicles] = useState<VendorVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const [pkgRes, accRes, vehRes] = await Promise.all([
      supabase.from("vendor_packages").select("*").eq("vendor_id", profile.id).order("created_at", { ascending: false }),
      supabase.from("vendor_accommodations").select("*").eq("vendor_id", profile.id).order("created_at", { ascending: false }),
      supabase.from("vendor_vehicles").select("*").eq("vendor_id", profile.id).order("created_at", { ascending: false }),
    ]);
    setPackages(pkgRes.data as VendorPackage[] ?? []);
    setAccommodations(accRes.data as VendorAccommodation[] ?? []);
    setVehicles(vehRes.data as VendorVehicle[] ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(async (id: string, type: ListingTab) => {
    const table = type === "packages" ? "vendor_packages" : type === "accommodations" ? "vendor_accommodations" : "vendor_vehicles";
    await supabase.from(table).delete().eq("id", id);
    fetchData();
  }, [fetchData]);

  const approved = profile?.vendor_approved;

  return (
    <div className="ts-fade-in">
      {/* Header */}
      <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-6 shadow-lg shadow-orange-500/20 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <Store className="h-3 w-3" />
              Vendor Dashboard
            </div>
            <h2 className="text-2xl font-bold text-white drop-shadow sm:text-3xl">
              {profile?.full_name}
            </h2>
            <p className="mt-1 text-sm text-white/90 capitalize">
              {profile?.vendor_type?.replace("_", " ") ?? "Vendor"}
            </p>
          </div>
          <div className="text-right">
            {approved ? (
              <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approved
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                <Clock className="h-3.5 w-3.5" />
                Pending Approval
              </div>
            )}
          </div>
        </div>
        {!approved && (
          <p className="mt-3 rounded-xl bg-white/15 px-4 py-2.5 text-sm text-white/90 backdrop-blur">
            Your vendor account is awaiting admin approval. You can create listings now, but they won't appear publicly until approved.
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        {[
          { id: "packages" as ListingTab, label: "Tour Packages", icon: Package, count: packages.length },
          { id: "accommodations" as ListingTab, label: "Stays", icon: BedDouble, count: accommodations.length },
          { id: "vehicles" as ListingTab, label: "Vehicles", icon: Car, count: vehicles.length },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setShowForm(false); }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md"
                  : "bg-white text-slate-600 ring-1 ring-sand-200 hover:bg-sand-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${tab === t.id ? "bg-white/20" : "bg-sand-100"}`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-cyan-700 ring-1 ring-cyan-200 transition-all hover:bg-cyan-50"
        >
          <Plus className="h-4 w-4" />
          Add New {tab === "packages" ? "Package" : tab === "accommodations" ? "Stay" : "Vehicle"}
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6">
          {tab === "packages" && <PackageForm vendorId={profile!.id} onDone={() => { setShowForm(false); fetchData(); }} />}
          {tab === "accommodations" && <AccommodationForm vendorId={profile!.id} onDone={() => { setShowForm(false); fetchData(); }} />}
          {tab === "vehicles" && <VehicleForm vendorId={profile!.id} onDone={() => { setShowForm(false); fetchData(); }} />}
        </div>
      )}

      {/* Listings */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tab === "packages" && packages.map((p) => (
            <ListingCard
              key={p.id}
              title={p.title}
              subtitle={p.state_name ?? ""}
              image={p.image_url}
              price={p.price}
              priceLabel="/package"
              approved={p.approved}
              onDelete={() => handleDelete(p.id, "packages")}
            />
          ))}
          {tab === "accommodations" && accommodations.map((a) => (
            <ListingCard
              key={a.id}
              title={a.name}
              subtitle={a.type ?? ""}
              image={a.image_url}
              price={a.price_per_night}
              priceLabel="/night"
              approved={a.approved}
              onDelete={() => handleDelete(a.id, "accommodations")}
            />
          ))}
          {tab === "vehicles" && vehicles.map((v) => (
            <ListingCard
              key={v.id}
              title={v.vehicle_name}
              subtitle={v.vehicle_type ?? ""}
              image={v.image_url}
              price={v.price_per_day}
              priceLabel="/day"
              approved={v.approved}
              onDelete={() => handleDelete(v.id, "vehicles")}
            />
          ))}
        </div>
      )}

      {signOut && (
        <button
          onClick={signOut}
          className="mt-8 text-sm text-slate-500 hover:text-slate-700"
        >
          Sign out
        </button>
      )}
    </div>
  );
}

function ListingCard({
  title,
  subtitle,
  image,
  price,
  priceLabel,
  approved,
  onDelete,
}: {
  title: string;
  subtitle: string;
  image: string | null;
  price: number | null;
  priceLabel: string;
  approved: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sand-200">
      <div className="relative h-32 overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-sand-100">
            <ImageIcon className="h-8 w-8 text-sand-300" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          {approved ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
              <CheckCircle2 className="h-3 w-3" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
              <Clock className="h-3 w-3" /> Pending
            </span>
          )}
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500">{subtitle}</p>
        {price != null && (
          <p className="mt-1 text-sm font-bold text-slate-700">
            ₹{price.toLocaleString("en-IN")} <span className="text-xs font-normal text-slate-400">{priceLabel}</span>
          </p>
        )}
        <button
          onClick={onDelete}
          className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-3 w-3" /> Delete
        </button>
      </div>
    </div>
  );
}

// ===== FORMS =====

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100";

function PackageForm({ vendorId, onDone }: { vendorId: string; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stateName, setStateName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [maxGroup, setMaxGroup] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim()) { setError("Title is required"); return; }
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("vendor_packages").insert({
      vendor_id: vendorId,
      title,
      description: description || null,
      state_name: stateName || null,
      duration_days: duration ? parseInt(duration) : null,
      price: price ? parseFloat(price) : null,
      category: category || null,
      max_group_size: maxGroup ? parseInt(maxGroup) : null,
      image_url: image || null,
    });
    setBusy(false);
    if (error) { setError(error.message); return; }
    onDone();
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-sand-200">
      <h3 className="mb-4 font-bold text-slate-800">New Tour Package</h3>
      {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Title"><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kerala Backwaters Tour" /></FormField>
        <FormField label="State"><input className={inputClass} value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="Kerala" /></FormField>
        <FormField label="Duration (days)"><input type="number" className={inputClass} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="5" /></FormField>
        <FormField label="Price (₹)"><input type="number" className={inputClass} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="25000" /></FormField>
        <FormField label="Category"><input className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Heritage" /></FormField>
        <FormField label="Max Group Size"><input type="number" className={inputClass} value={maxGroup} onChange={(e) => setMaxGroup(e.target.value)} placeholder="10" /></FormField>
        <FormField label="Image URL"><input className={inputClass} value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." /></FormField>
      </div>
      <FormField label="Description"><textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Package description..." /></FormField>
      <div className="mt-4 flex gap-2">
        <button onClick={submit} disabled={busy} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create Package
        </button>
        <button onClick={onDone} className="rounded-xl bg-sand-100 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sand-200">Cancel</button>
      </div>
    </div>
  );
}

function AccommodationForm({ vendorId, onDone }: { vendorId: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("hotel");
  const [tier, setTier] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [amenities, setAmenities] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("vendor_accommodations").insert({
      vendor_id: vendorId,
      name,
      type,
      tier: tier || null,
      price_per_night: price ? parseFloat(price) : null,
      address: address || null,
      amenities: amenities ? amenities.split(",").map((a) => a.trim()) : [],
      image_url: image || null,
    });
    setBusy(false);
    if (error) { setError(error.message); return; }
    onDone();
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-sand-200">
      <h3 className="mb-4 font-bold text-slate-800">New Stay Listing</h3>
      {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Name"><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Sunset Resort" /></FormField>
        <FormField label="Type">
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="hotel">Hotel</option>
            <option value="homestay">Homestay</option>
            <option value="resort">Resort</option>
          </select>
        </FormField>
        <FormField label="Tier"><input className={inputClass} value={tier} onChange={(e) => setTier(e.target.value)} placeholder="Deluxe" /></FormField>
        <FormField label="Price/Night (₹)"><input type="number" className={inputClass} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="3500" /></FormField>
        <FormField label="Address"><input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Beach Road, Goa" /></FormField>
        <FormField label="Image URL"><input className={inputClass} value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." /></FormField>
      </div>
      <FormField label="Amenities (comma-separated)"><input className={inputClass} value={amenities} onChange={(e) => setAmenities(e.target.value)} placeholder="WiFi, Pool, AC, Breakfast" /></FormField>
      <div className="mt-4 flex gap-2">
        <button onClick={submit} disabled={busy} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create Listing
        </button>
        <button onClick={onDone} className="rounded-xl bg-sand-100 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sand-200">Cancel</button>
      </div>
    </div>
  );
}

function VehicleForm({ vendorId, onDone }: { vendorId: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [seats, setSeats] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) { setError("Vehicle name is required"); return; }
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("vendor_vehicles").insert({
      vendor_id: vendorId,
      vehicle_name: name,
      vehicle_type: type || null,
      seats: seats || null,
      price_per_day: price ? parseFloat(price) : null,
      image_url: image || null,
    });
    setBusy(false);
    if (error) { setError(error.message); return; }
    onDone();
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-sand-200">
      <h3 className="mb-4 font-bold text-slate-800">New Vehicle Listing</h3>
      {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Vehicle Name"><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Toyota Innova" /></FormField>
        <FormField label="Vehicle Type"><input className={inputClass} value={type} onChange={(e) => setType(e.target.value)} placeholder="SUV" /></FormField>
        <FormField label="Seats"><input className={inputClass} value={seats} onChange={(e) => setSeats(e.target.value)} placeholder="6-7 seats" /></FormField>
        <FormField label="Price/Day (₹)"><input type="number" className={inputClass} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="3500" /></FormField>
        <FormField label="Image URL"><input className={inputClass} value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." /></FormField>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={submit} disabled={busy} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create Listing
        </button>
        <button onClick={onDone} className="rounded-xl bg-sand-100 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sand-200">Cancel</button>
      </div>
    </div>
  );
}
