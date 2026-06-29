import ContactForm from "@/components/contact/ContactForm";

interface ContactSectionProps {
  id: string;
}

export default function ContactSection({ id }: ContactSectionProps) {
  return (
    <section
      id={id}
      className="snap-start h-dvh flex items-center justify-center relative overflow-hidden"
    >
      <div className="absolute inset-0" style={{ backgroundColor: "#EFD7CF" }} aria-hidden="true" />
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <ContactForm />
      </div>
    </section>
  );
}
