"use client";

interface CategoryBarProps {
  selected: string;
  onSelect: (category: string) => void;
}

const categories = [
  { name: "All", icon: "✨" },
  { name: "Beach", icon: "🏖️" },
  { name: "Mountains", icon: "🏔️" },
  { name: "Homes", icon: "🏡" },
  { name: "Tropical", icon: "🌴" },
  { name: "Cabins", icon: "🛖" },
  { name: "Apartments", icon: "🏢" },
  { name: "Luxury", icon: "💎" },
];

export default function CategoryBar({
  selected,
  onSelect,
}: CategoryBarProps) {
  return (
    <div className="mx-auto mt-8 max-w-[1440px] overflow-x-auto px-6">
      <div className="flex min-w-max gap-8">

        {categories.map((category) => {
          const active = selected === category.name;

          return (
            <button
              key={category.name}
              onClick={() => onSelect(category.name)}
              className={`flex min-w-[70px] flex-col items-center gap-2 border-b-2 pb-3 text-sm ${
                active
                  ? "border-black font-semibold text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              <span className="text-2xl">
                {category.icon}
              </span>

              <span>
                {category.name}
              </span>
            </button>
          );
        })}

      </div>
    </div>
  );
}