import { NextRequest, NextResponse } from "next/server";
import { cancelPatientAppointment } from "@/app/actions/patient-auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>Cancellation Error</title><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
        <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc;">
          <div style="background: white; padding: 32px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; max-width: 400px; border: 1px solid #e2e8f0;">
            <h2 style="color: #ef4444;">Invalid Request</h2>
            <p style="color: #64748b;">Missing cancellation token.</p>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const res = await cancelPatientAppointment(token);

  const isSuccess = res.success || res.message?.includes("already cancelled");
  const heading = isSuccess ? "Appointment Cancelled" : "Cancellation Failed";
  const bodyText = res.message || res.error || "Processed cancellation request.";

  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head><title>${heading}</title><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
      <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc;">
        <div style="background: white; padding: 32px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); text-align: center; max-width: 420px; border: 1px solid #e2e8f0;">
          <div style="width: 56px; height: 56px; background-color: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; font-size: 24px;">
            ${isSuccess ? '❌' : '⚠️'}
          </div>
          <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 8px 0;">${heading}</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">${bodyText}</p>
          <p style="color: #94a3b8; font-size: 12px;">You may close this tab or visit the clinic page to pick a new date.</p>
        </div>
      </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
