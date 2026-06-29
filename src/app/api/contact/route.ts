import { NextResponse } from "next/server";
import { Resend } from "resend";
import { client } from "@/lib/sanity";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Campos requeridos incompletos." },
        { status: 400 }
      );
    }

    const profile = await client.fetch<{ email?: string }>(
      `*[_type == "profile"][0]{ email }`
    );

    const recipientEmail = profile?.email;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Email de destino no configurado." },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: recipientEmail,
      replyTo: email,
      subject: `Nuevo contacto desde tu portfolio — ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f9f9f7; border-radius: 12px;">
          <h2 style="margin: 0 0 24px; font-size: 20px; color: #1a1a1a;">Nuevo mensaje de contacto</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 13px; width: 80px;">Nombre</td>
              <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 13px;">Email</td>
              <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a;"><a href="mailto:${email}" style="color: #4a4a4a;">${email}</a></td>
            </tr>
            ${
              phone
                ? `<tr>
              <td style="padding: 8px 0; color: #666; font-size: 13px;">Celular</td>
              <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a;">${phone}</td>
            </tr>`
                : ""
            }
          </table>
          <div style="margin-top: 24px; padding: 16px; background: #fff; border-radius: 8px; border: 1px solid #e5e5e5;">
            <p style="margin: 0; font-size: 13px; color: #666; margin-bottom: 8px;">Mensaje</p>
            <p style="margin: 0; font-size: 14px; color: #1a1a1a; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact/route] Error:", err);
    return NextResponse.json(
      { error: "Error interno al enviar el mensaje." },
      { status: 500 }
    );
  }
}
