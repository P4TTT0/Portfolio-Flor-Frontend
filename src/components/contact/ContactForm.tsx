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
        className="hidden md:block absolute"
        style={{ top: "6vh", left: "4vw", width: "46%" }}
      >
        <Image
          src="/assets/elements/contact-text.svg"
          alt="¿Buscas la voz para tu marca?"
          width={880}
          height={550}
          className="w-full object-contain"
          priority
        />
      </div>

      {/* "contáctame" label: above the card, right-aligned */}
      <p
        className="hidden md:block absolute font-body text-sm font-semibold tracking-widest text-neutral-800"
        style={{ right: "4vw", top: "calc(24vh - 30px)" }}
      >
        contáctame
      </p>

      {/* Paper card: starts at 24vh, bleeds off the bottom (clipped by section overflow-hidden) */}
      <div
        className="hidden md:block absolute rounded-t-xl overflow-hidden"
        style={{
          left: "51%",
          right: "4vw",
          top: "24vh",
          bottom: "-60px",
          backgroundImage: "url('/assets/elements/contact-paper.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        {formFields}
      </div>

      {/* ── MOBILE (<md) ──────────────────────────────────────────────── */}
      <div className="md:hidden w-full h-full flex flex-col items-center justify-center px-6 gap-4">
        {/* SVG heading above the form */}
        <Image
          src="/assets/elements/contact-text.svg"
          alt="¿Buscas la voz para tu marca?"
          width={880}
          height={550}
          className="w-full max-w-[260px] object-contain"
          priority
        />
        {/* Paper form card */}
        <div
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            backgroundImage: "url('/assets/elements/contact-paper.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {formFields}
        </div>
        {/* contáctame below the form */}
        <p className="font-body text-sm font-semibold tracking-widest text-neutral-800">
          contáctame
        </p>
      </div>

    </div>
  );
}
