"use client";

import { Search, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const history = [
    "Avatar",
    "Black Panther",
    "Dune",
    "Afrobeats"
  ];

  const trending = [
    "Avatar 3",
    "Mission Impossible",
    "Burna Boy",
    "Wizkid",
    "Sinners"
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 md:px-8 py-8">

      {/* Header */}
      <h1 className="text-3xl font-bold mb-8">
        Search
      </h1>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Movies, Music, Creators..."
          className="
            w-full
            bg-[#171717]
            border
            border-gray-800
            rounded-xl
            pl-12
            pr-4
            py-4
            text-white
            outline-none
            focus:border-red-500
          "
        />
      </div>

      {/* Search History */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} />
          <h2 className="font-semibold">
            Recent Searches
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {history.map((item) => (
            <button
              key={item}
              className="
                px-4 py-2
                rounded-full
                bg-[#171717]
                hover:bg-[#222]
                transition
              "
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} />
          <h2 className="font-semibold">
            Trending Searches
          </h2>
        </div>

        <div className="grid gap-3">
          {trending.map((item, index) => (
            <div
              key={item}
              className="
                flex
                items-center
                justify-between
                p-4
                rounded-xl
                bg-[#171717]
                hover:bg-[#222]
                cursor-pointer
                transition
              "
            >
              <span>
                {index + 1}. {item}
              </span>

              <TrendingUp size={16} />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}