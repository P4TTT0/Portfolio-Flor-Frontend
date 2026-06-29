"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

type FormState = "idle" | "loading" | "success" | "error";

interface FormData {
  email: string;
  phone: string;
  name: string;
  message: string;
}

const inputClass =
  "w-full bg-transparent border-0 border-b border-neutral-400/40 pb-2 pt-1 text-sm font-body text-neutral-700 placeholder:text-neutral-400/70 focus:outline-none focus:border-neutral-600/60 transition-colors";

export default function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [form, setForm] = useState<FormData>({
    email: "",
    phone: "",
    name: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setState("success");
      setForm({ email: "", phone: "", name: "", message: "" });
    } catch {
      setState("error");
    }
  }

  const formFields = (
    <div className="flex flex-col gap-6 p-10 pt-12">
      <div className="grid grid-cols-2 gap-6">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="email"
          required
          className={inputClass}
        />
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="celular"
          className={inputClass}
        />
      </div>
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="nombre"
        required
        className={inputClass}
      />
      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder="mensaje"
        required
        rows={5}
        className={`${inputClass} resize-none`}
      />
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-body">
          {state === "success" && (
            <span className="text-neutral-600">¡Mensaje enviado!</span>
          )}
          {state === "error" && (
            <span className="text-red-500">Algo salió mal. Intentá de nuevo.</span>
          )}
        </span>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={state === "loading"}
          className="text-xs font-body tracking-widest text-neutral-700 border-b border-neutral-700 pb-px hover:text-neutral-900 hover:border-neutral-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {state === "loading" ? "enviando..." : "enviar"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full relative">

      {/* ── DESKTOP (md+) ─────────────────────────────────────────────── */}

      {/* SVG heading: anchored top-left */}
      <div
        className="hidden md:block absolute animate-[deep-float_4s_ease-in-out_infinite]"
        style={{ top: "14vh", left: "12vw", width: "34%" }}
      >
        <Image
          src="/assets/elements/contact-text.svg"
          alt="¿Buscas la voz para tu marca?"
          width={880}
          height={550}
          className="w-full object-contain"
          priority
          style={{ filter: "invert(27%)" }}
        />
      </div>

      {/* "contáctame" label: above the card, right-aligned */}
      <p
        className="hidden md:block absolute font-body text-sm font-semibold tracking-widest text-neutral-800"
        style={{ right: "14vw", top: "calc(24vh - 30px)" }}
      >
        contáctame
      </p>

      {/* Paper card: starts at 24vh, bleeds off the bottom (clipped by section overflow-hidden) */}
      <div
        className="hidden md:block absolute rounded-t-xl overflow-hidden"
        style={{
          left: "49%",
          right: "13vw",
          top: "25vh",
          bottom: "-60px",
          backgroundImage: "url('/assets/elements/contact-paper.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        {formFields}
      </div>

      {/* phone-cable: bottom-left, partially off-screen */}
      <div
        className="hidden md:block absolute pointer-events-none"
        style={{ bottom: "-5%", left: "-2%", width: "44%", transform: "rotate(-130deg)" }}
        aria-hidden="true"
      >
        <Image
          src="/assets/elements/phone-cable.png"
          alt=""
          width={600}
          height={338}
          className="w-full object-contain"
        />
      </div>

      {/* hanging-phone: top-right, partially off-screen on the right */}
      <div
        className="hidden md:block absolute pointer-events-none animate-[gentle-float_5s_ease-in-out_infinite]"
        style={{ top: "-4%", right: "-4%", width: "21%" }}
        aria-hidden="true"
      >
        <Image
          src="/assets/elements/hanging-phone.png"
          alt=""
          width={545}
          height={660}
          className="w-full object-contain"
        />
      </div>

      {/* ── MOBILE (<md) ──────────────────────────────────────────────── */}
      <div className="md:hidden w-full h-full relative flex flex-col items-center justify-center px-6 gap-4">

        {/* hanging-phone: centered at top, cord exits off-screen */}
        <div
          className="absolute pointer-events-none animate-[gentle-float_5s_ease-in-out_infinite]"
          style={{
            top: '-9%',
            left: '24%',
            width: '53%',
            zIndex: 999
          }}
          aria-hidden="true"
        >
          <Image
            src="/assets/elements/hanging-phone.png"
            alt=""
            width={545}
            height={660}
            className="w-full object-contain"
          />
        </div>

        {/* phone-cable: bottom layer, behind the paper card */}
        <div
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{
            transform: 'rotate(-134deg)',
            width: '108%',
            bottom: '-35px',
            left: '-15px'
          }}
          aria-hidden="true"
        >
          <Image
            src="/assets/elements/phone-cable.png"
            alt=""
            width={600}
            height={338}
            className="w-full object-contain"
          />
        </div>

        {/* Paper form card — above the cable */}
        <div
          className="relative w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            zIndex: 1,
            backgroundImage: "url('/assets/elements/contact-paper.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {formFields}
        </div>

        {/* contáctame below the form */}
        <p className="relative font-body text-sm font-semibold tracking-widest text-neutral-800" style={{ zIndex: 1 }}>
          contáctame
        </p>

      </div>

    </div>
  );
}
