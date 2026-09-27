import { Star } from "lucide-react";

interface Props {
  rating: number;
  size?: "sm" | "md" | "lg";
}

export function RatingStars({ rating, size = "sm" }: Props) {
  const dims = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${dims} ${
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-sand-200 text-sand-200"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-slate-600">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}
