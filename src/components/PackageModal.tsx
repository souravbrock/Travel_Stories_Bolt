import { useState } from "react";
import {
  X,
  Clock,
  Users,
  MapPin,
  BadgeCheck,
  IndianRupee,
  Check,
  Minus,
  Mail,
  Send,
  Star,
  Route,
} from "lucide-react";
import type { TravelPackage } from "../lib/types";
import { RatingStars } from "./RatingStars";

interface Props {
  pkg: TravelPackage;
  onClose: () => void;
}

export function PackageModal({ pkg, onClose }: Props) {
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    travelers: "2",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ts-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-600 backdrop-blur transition-colors hover:bg-white hover:text-slate-900"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Hero image */}
        {pkg.image_url && (
          <div className="relative h-56 overflow-hidden">
            <img
              src={pkg.image_url}
              alt={pkg.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              {pkg.category && (
                <span className="mb-2 inline-block rounded-full bg-accent-500 px-2.5 py-1 text-xs font-semibold text-white">
                  {pkg.category}
                </span>
              )}
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                {pkg.title}
              </h2>
              {pkg.state_name && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-white/90">
                  <MapPin className="h-3.5 w-3.5" />
                  {pkg.state_name}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="max-h-[calc(100vh-20rem)] overflow-y-auto p-5">
          {!pkg.image_url && (
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-slate-800">{pkg.title}</h2>
              {pkg.state_name && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {pkg.state_name}
                </p>
              )}
            </div>
          )}

          {/* Quick stats */}
          <div className="mb-5 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-sand-50 px-3 py-2">
              <Clock className="h-4 w-4 text-primary-600" />
              <div>
                <p className="text-xs text-slate-400">Duration</p>
                <p className="text-sm font-semibold text-slate-700">
                  {pkg.duration_days}D / {pkg.duration_days ? pkg.duration_days - 1 : 0}N
                </p>
              </div>
            </div>
            {pkg.max_group_size && (
              <div className="flex items-center gap-2 rounded-xl bg-sand-50 px-3 py-2">
                <Users className="h-4 w-4 text-primary-600" />
                <div>
                  <p className="text-xs text-slate-400">Group Size</p>
                  <p className="text-sm font-semibold text-slate-700">
                    Max {pkg.max_group_size}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl bg-sand-50 px-3 py-2">
              <Star className="h-4 w-4 text-accent-500" />
              <div>
                <p className="text-xs text-slate-400">Rating</p>
                <p className="text-sm font-semibold text-slate-700">
                  {pkg.rating.toFixed(1)} / 5.0
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {pkg.description && (
            <div className="mb-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                About This Tour
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {pkg.description}
              </p>
            </div>
          )}

          {/* Itinerary */}
          {pkg.itinerary.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-400">
                <Route className="h-4 w-4" />
                Day-by-Day Itinerary
              </h3>
              <div className="space-y-2">
                {pkg.itinerary.map((day, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-xl border border-sand-200 p-3"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {day}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inclusions / Exclusions */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pkg.inclusions.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  What's Included
                </h3>
                <ul className="space-y-1.5">
                  {pkg.inclusions.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {pkg.exclusions.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  What's Not Included
                </h3>
                <ul className="space-y-1.5">
                  {pkg.exclusions.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-error-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Agent info */}
          {pkg.agent && (
            <div className="mb-5 rounded-xl bg-sand-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                  {pkg.agent.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-slate-800">
                      {pkg.agent.name}
                    </p>
                    {pkg.agent.verified && (
                      <BadgeCheck className="h-4 w-4 text-primary-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={pkg.agent.rating} />
                    {pkg.agent.contact_phone && (
                      <span className="text-xs text-slate-500">
                        {pkg.agent.contact_phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {pkg.agent.description && (
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {pkg.agent.description}
                </p>
              )}
            </div>
          )}

          {/* Inquiry form */}
          {inquirySent ? (
            <div className="rounded-xl bg-success-500/10 p-6 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success-500/20">
                <Check className="h-6 w-6 text-success-600" />
              </div>
              <p className="font-semibold text-slate-800">Inquiry Sent!</p>
              <p className="mt-1 text-sm text-slate-500">
                {pkg.agent?.name ?? "The agent"} will contact you at{" "}
                {form.email} within 24 hours.
              </p>
              <button
                onClick={onClose}
                className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          ) : showInquiry ? (
            <form onSubmit={handleSubmit} className="rounded-xl border border-sand-200 p-4">
              <h3 className="mb-3 font-semibold text-slate-800">
                Send Inquiry to {pkg.agent?.name ?? "Agent"}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                />
                <input
                  required
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                />
                <select
                  value={form.travelers}
                  onChange={(e) =>
                    setForm({ ...form, travelers: e.target.value })
                  }
                  className="rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                >
                  {["1", "2", "3", "4", "5", "6+"].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === "1" ? "Traveler" : "Travelers"}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Any specific questions or requirements?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                className="mt-3 w-full rounded-lg border border-sand-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowInquiry(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-sand-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                >
                  <Send className="h-4 w-4" />
                  Send Inquiry
                </button>
              </div>
            </form>
          ) : null}

          {/* Footer with price + actions */}
          {!showInquiry && !inquirySent && (
            <div className="flex items-center justify-between border-t border-sand-200 pt-4">
              <div>
                <p className="text-xs text-slate-400">Starting from</p>
                <div className="flex items-baseline gap-0.5">
                  <IndianRupee className="h-5 w-5 text-slate-700" />
                  <span className="text-2xl font-bold text-slate-800">
                    {pkg.price?.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-slate-400">/person</span>
                </div>
              </div>
              <div className="flex gap-2">
                {pkg.agent?.contact_email && (
                  <a
                    href={`mailto:${pkg.agent.contact_email}`}
                    className="flex items-center gap-1.5 rounded-lg border border-sand-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-sand-50"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                )}
                <button
                  onClick={() => setShowInquiry(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                >
                  <Send className="h-4 w-4" />
                  Send Inquiry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
