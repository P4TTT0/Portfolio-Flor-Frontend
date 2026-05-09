import Clip from "@/components/craft/Clip";
import Sticker from "@/components/craft/Sticker";
import Tape from "@/components/craft/Tape";

interface HeaderProps {
  name: string;
  role: string;
}

export default function Header({ name, role }: HeaderProps) {
  return (
    <header className="relative pt-4 pb-2 sm:pt-6 sm:pb-3 px-4 text-center select-none">
      {/* --- Decorative stickers around the name --- */}

      {/* Top-left: sage circle sticker */}
      <Sticker rotation={-8} className="absolute left-[8%] top-2 w-8 h-8 sm:w-10 sm:h-10">
        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-sage/60" />
      </Sticker>

      {/* Top-right: blush circle sticker */}
      <Sticker rotation={6} className="absolute right-[10%] top-1.5 w-8 h-8 sm:w-9 sm:h-9">
        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blush/60" />
      </Sticker>

      {/* Left: avocado + paperclip */}
      <Sticker rotation={-4} className="absolute left-[3%] top-12 w-12 h-12 sm:w-14 sm:h-14">
        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-sm bg-avocado/50 rotate-12" />
      </Sticker>
      <Clip
        type="paperclip"
        color="#818263"
        className="absolute left-[5%] top-[3.2rem] -rotate-6 scale-75"
      />

      {/* Right: peach sticker with tape */}
      <div className="absolute right-[8%] top-10 sm:top-12" aria-hidden="true">
        <Tape width="40px" rotation={-6} className="mb-[-2px] ml-2" />
        <span className="block w-12 h-6 sm:w-14 sm:h-7 bg-peach/70 rounded-sm shadow-sm" />
      </div>

      {/* --- Title — smaller to give room to folders --- */}
      <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl
        text-text-primary leading-tight tracking-tight">
        {name}
      </h1>

      {/* --- Subtitle --- */}
      <p className="font-body text-xs sm:text-sm md:text-base
        text-text-secondary mt-1 tracking-[0.15em] uppercase">
        {role}
      </p>

      {/* Bottom decorative stickers */}
      <Sticker rotation={10} className="absolute left-[25%] -bottom-1 w-6 h-6 sm:w-7 sm:h-7">
        <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-oat/60" />
      </Sticker>
      <Sticker rotation={-6} className="absolute right-[22%] -bottom-0.5 w-10 h-10 sm:w-12 sm:h-12">
        <span className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-avocado/50 rounded-full" />
      </Sticker>
    </header>
  );
}
