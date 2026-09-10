import RansomName from "./RansomName";

interface HeaderProps {
  name: string;
  role: string;
}

export default function Header({ name, role }: HeaderProps) {
  return (
    <header className="relative pt-[75px] sm:pt-[50px] pb-2 sm:pb-3 px-4 text-center select-none">
      {/* --- Title — ransom name --- */}
      {/*
        The ransom letters are individual images, so the h1 had no text of its
        own — crawlers and screen readers were reading it one alt character at a
        time. The visually hidden span carries the real heading; the letters are
        marked decorative.
      */}
      <h1 className="py-1">
        <span className="sr-only">{name} — {role}</span>
        <RansomName name={name} />
      </h1>

      {/* --- Subtitle --- */}
      <p className="font-body text-xs sm:text-sm md:text-base
        text-text-secondary mt-1 tracking-[0.15em] uppercase">
        {role}
      </p>
    </header>
  );
}
