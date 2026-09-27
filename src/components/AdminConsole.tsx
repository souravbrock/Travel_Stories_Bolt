import { useEffect, useState, useCallback } from "react";
import {
  Shield,
  Users,
  Package,
  BedDouble,
  Car,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Store,
  Edit3,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import {
  fetchAdminOverview,
  approveVendor as approveVendorApi,
  approveListing as approveListingApi,
  type ListingType,
} from "../lib/data";
import type { Profile, VendorPackage, VendorAccommodation, VendorVehicle } from "../lib/types";

type AdminTab = "vendors" | "packages" | "accommodations" | "vehicles" | "spots" | "agents";

export function AdminConsole() {
  const { profile, signOut, session } = useAuth();
  const [tab, setTab] = useState<AdminTab>("vendors");
  const [vendors, setVendors] = useState<Profile[]>([]);
  const [packages, setPackages] = useState<(VendorPackage & { vendor_name?: string })[]>([]);
  const [accommodations, setAccommodations] = useState<(VendorAccommodation & { vendor_name?: string })[]>([]);
  const [vehicles, setVehicles] = useState<(VendorVehicle & { vendor_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = useCallback(async () => {
    if (!session) return;
    const data = await fetchAdminOverview(session.token);
    setVendors(data.vendors);
    setPackages(data.packages);
    setAccommodations(data.accommodations);
    setVehicles(data.vehicles);
  }, [session]);

  useEffect(() => {
    setLoading(true);
    fetchVendors().finally(() => setLoading(false));
  }, [fetchVendors]);

  const approveVendor = useCallback(async (id: number) => {
    if (!session) return;
    await approveVendorApi(session.token, id);
    fetchVendors();
  }, [fetchVendors, session]);

  const approveListing = useCallback(async (table: string, id: number) => {
    if (!session) return;
    const type = table === "vendor_packages" ? "packages"
      : table === "vendor_accommodations" ? "accommodations" : "vehicles";
    await approveListingApi(session.token, type as ListingType, id);
    fetchVendors();
  }, [fetchVendors, session]);

  const tabs: { id: AdminTab; label: string; icon: typeof Users; count: number }[] = [
    { id: "vendors", label: "Vendors", icon: Store, count: vendors.length },
    { id: "packages", label: "Packages", icon: Package, count: packages.length },
    { id: "accommodations", label: "Stays", icon: BedDouble, count: accommodations.length },
    { id: "vehicles", label: "Vehicles", icon: Car, count: vehicles.length },
  ];

  return (
    <div className="ts-fade-in">
      {/* Header */}
      <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-6 shadow-lg shadow-emerald-500/20 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <Shield className="h-3 w-3" />
              Admin Console
            </div>
            <h2 className="text-2xl font-bold text-white drop-shadow sm:text-3xl">
              {profile?.full_name}
            </h2>
            <p className="mt-1 text-sm text-white/90">Full management access</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md"
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

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* VENDORS */}
          {tab === "vendors" && vendors.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sand-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-sm font-bold text-orange-700">
                  {v.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{v.full_name}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {v.vendor_type?.replace("_", " ") ?? "Vendor"}
                    {v.phone && ` · ${v.phone}`}
                  </p>
                </div>
              </div>
              <div>
                {v.vendor_approved ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                  </span>
                ) : (
                  <button
                    onClick={() => approveVendor(v.id)}
                    className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 transition-colors hover:bg-amber-100"
                  >
                    <Clock className="h-3.5 w-3.5" /> Approve
                  </button>
                )}
              </div>
            </div>
          ))}
          {tab === "vendors" && vendors.length === 0 && (
            <EmptyState icon={Store} label="No vendor accounts yet" />
          )}

          {/* PACKAGES */}
          {tab === "packages" && packages.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sand-200">
              <div className="flex items-center gap-3">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sand-100">
                    <Package className="h-5 w-5 text-sand-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-800">{p.title}</p>
                  <p className="text-xs text-slate-500">
                    by {p.vendor_name ?? "Unknown"}
                    {p.state_name && ` · ${p.state_name}`}
                    {p.price != null && ` · ₹${p.price.toLocaleString("en-IN")}`}
                  </p>
                </div>
              </div>
              <ApproveButton approved={p.approved} onApprove={() => approveListing("vendor_packages", p.id)} />
            </div>
          ))}
          {tab === "packages" && packages.length === 0 && <EmptyState icon={Package} label="No vendor packages yet" />}

          {/* ACCOMMODATIONS */}
          {tab === "accommodations" && accommodations.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sand-200">
              <div className="flex items-center gap-3">
                {a.image_url ? (
                  <img src={a.image_url} alt={a.name} className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sand-100">
                    <BedDouble className="h-5 w-5 text-sand-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-800">{a.name}</p>
                  <p className="text-xs text-slate-500">
                    by {a.vendor_name ?? "Unknown"}
                    {a.type && ` · ${a.type}`}
                    {a.price_per_night != null && ` · ₹${a.price_per_night.toLocaleString("en-IN")}/night`}
                  </p>
                </div>
              </div>
              <ApproveButton approved={a.approved} onApprove={() => approveListing("vendor_accommodations", a.id)} />
            </div>
          ))}
          {tab === "accommodations" && accommodations.length === 0 && <EmptyState icon={BedDouble} label="No vendor stays yet" />}

          {/* VEHICLES */}
          {tab === "vehicles" && vehicles.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sand-200">
              <div className="flex items-center gap-3">
                {v.image_url ? (
                  <img src={v.image_url} alt={v.vehicle_name} className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sand-100">
                    <Car className="h-5 w-5 text-sand-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-800">{v.vehicle_name}</p>
                  <p className="text-xs text-slate-500">
                    by {v.vendor_name ?? "Unknown"}
                    {v.vehicle_type && ` · ${v.vehicle_type}`}
                    {v.price_per_day != null && ` · ₹${v.price_per_day.toLocaleString("en-IN")}/day`}
                  </p>
                </div>
              </div>
              <ApproveButton approved={v.approved} onApprove={() => approveListing("vendor_vehicles", v.id)} />
            </div>
          ))}
          {tab === "vehicles" && vehicles.length === 0 && <EmptyState icon={Car} label="No vendor vehicles yet" />}
        </div>
      )}

      {/* Existing data management note */}
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sand-200">
        <h3 className="flex items-center gap-2 font-bold text-slate-800">
          <Edit3 className="h-4 w-4 text-emerald-600" />
          Existing Travel Data
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          The admin console provides approval controls for vendor-submitted content. The existing tourist spots, accommodations, travel agents, and packages in the database are managed through phpMyAdmin directly.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Tourist Spots", "Accommodations", "Travel Agents", "Packages", "Districts", "States"].map((item) => (
            <span key={item} className="flex items-center gap-1 rounded-lg bg-sand-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              <MapPin className="h-3 w-3" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {signOut && (
        <button onClick={signOut} className="mt-8 text-sm text-slate-500 hover:text-slate-700">
          Sign out
        </button>
      )}
    </div>
  );
}

function ApproveButton({ approved, onApprove }: { approved: boolean; onApprove: () => void }) {
  if (approved) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> Approved
      </span>
    );
  }
  return (
    <button
      onClick={onApprove}
      className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 transition-colors hover:bg-amber-100"
    >
      <Clock className="h-3.5 w-3.5" /> Approve
    </button>
  );
}

function EmptyState({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-sand-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100">
        <Icon className="h-6 w-6 text-sand-400" />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
