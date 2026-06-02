import RansomName from "./RansomName";

interface HeaderProps {
  name: string;
  role: string;
}

export default function Header({ name, role }: HeaderProps) {
  return (
    <header className="relative pt-4 pb-2 sm:pt-6 sm:pb-3 px-4 text-center select-none">
      {/* --- Title — ransom name --- */}
      <h1 className="py-1">
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
