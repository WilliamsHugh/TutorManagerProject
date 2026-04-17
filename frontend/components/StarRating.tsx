"use client";
import { Star } from "lucide-react";

export default function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-200 fill-gray-200"
          }
        />
      ))}
    </div>
  );
}