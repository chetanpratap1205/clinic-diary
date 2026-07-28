import { db } from "@/db";
import {
  clinics,
  subscriptions,
  paymentLogs,
  appointments,
  followUps,
  qrCodes,
  patients,
  growthPartners,
  qrScans,
} from "@/db/schema";
import { eq, count, sum, desc, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Phone,
  MapPin,
  IndianRupee,
  CalendarCheck,
  QrCode,
  Users,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssignPartnerOverride } from "./_components/assign-partner-override";

export const dynamic = "force-dynamic";

function SubStatusBadge({ status }: { status: string | null | undefined }) {
  if (status === "active")
    return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">Active</Badge>;
  if (status === "past_due")
    return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50">Past Due</Badge>;
  if (status === "cancelled")
    return <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-50">Cancelled</Badge>;
  return <Badge className="bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-50">Trial / Free</Badge>;
}

export default async function ClinicDetailPage({
  params,
}: {
  params: Promise<{ clinicId: string }>;
}) {
  const { clinicId } = await params;

  // Fetch all data concurrently
  const [
    clinicRows,
    subscriptionRows,
    payments,
    [totalApptsResult],
    thisMonthApptsResult,
    [totalRevenueResult],
    [totalPatientsResult],
    [pendingFollowUps],
    qrCodeRows,
    recentAppointments,
    partners,
    [totalQrScansResult],
    qrApptsResult,
  ] = await Promise.all([
    db.select().from(clinics).where(eq(clinics.id, clinicId)).limit(1),
    db.select().from(subscriptions).where(eq(subscriptions.clinicId, clinicId)).limit(1),
    db.select().from(paymentLogs).where(eq(paymentLogs.clinicId, clinicId)).orderBy(desc(paymentLogs.paidAt)),
    db.select({ value: count() }).from(appointments).where(eq(appointments.clinicId, clinicId)),
    db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM appointments
      WHERE clinic_id = ${clinicId}
        AND appointment_date >= DATE_TRUNC('month', CURRENT_DATE)
    `),
    db.select({ value: sum(paymentLogs.amountPaise) }).from(paymentLogs)
      .where(eq(paymentLogs.clinicId, clinicId)),
    db.select({ value: count() }).from(patients).where(eq(patients.clinicId, clinicId)),
    db.select({ value: count() }).from(followUps).where(eq(followUps.clinicId, clinicId)),
    db.select().from(qrCodes).where(eq(qrCodes.clinicId, clinicId)).limit(1),
    db.select().from(appointments).where(eq(appointments.clinicId, clinicId))
      .orderBy(desc(appointments.createdAt)).limit(8),
    db.select({ id: growthPartners.id, name: growthPartners.name }).from(growthPartners).orderBy(growthPartners.name),
    db.select({ count: count() }).from(qrScans).where(eq(qrScans.clinicId, clinicId)),
    db.execute(sql`
      SELECT acquisition_source AS source, COUNT(*)::int AS count
      FROM appointments
      WHERE clinic_id = ${clinicId} AND acquisition_source LIKE 'qr_%'
      GROUP BY acquisition_source
    `),
  ]);

  const clinic = clinicRows[0];
  if (!clinic) notFound();

  const subscription = subscriptionRows[0];
  const totalRevenue = (Number(totalRevenueResult?.value) || 0) / 100;
  const thisMonthAppts = (thisMonthApptsResult.rows[0] as { count: number })?.count ?? 0;
  const qrCode = qrCodeRows[0];

  // Completion rate
  const completedAppts = recentAppointments.filter(
    (a) => a.status === "completed"
  ).length;
  const completionRate =
    recentAppointments.length > 0
      ? Math.round((completedAppts / recentAppointments.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/clinics"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Clinics
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-700">{clinic.name}</span>
      </div>

      {/* Clinic header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {clinic.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clinic.logoUrl}
              alt={clinic.name}
              className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-teal-50 flex items-center justify-center ring-1 ring-teal-100">
              <Building2 className="w-8 h-8 text-teal-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{clinic.name}</h2>
              <SubStatusBadge status={subscription?.status} />
            </div>
            <p className="text-slate-600 mt-0.5 font-medium">{clinic.doctorName}</p>
            <p className="text-sm text-slate-500">{clinic.specialty}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {clinic.phone}
              </span>
              {clinic.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {clinic.address}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                Joined {format(new Date(clinic.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: IndianRupee,
            label: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString("en-IN")}`,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
            iconColor: "text-emerald-600",
          },
          {
            icon: CalendarCheck,
            label: "Total Appointments",
            value: totalApptsResult.value.toLocaleString(),
            color: "text-indigo-700",
            bg: "bg-indigo-50",
            iconColor: "text-indigo-600",
          },
          {
            icon: Users,
            label: "Patients",
            value: totalPatientsResult.value.toLocaleString(),
            color: "text-sky-700",
            bg: "bg-sky-50",
            iconColor: "text-sky-600",
          },
          {
            icon: CalendarClock,
            label: "This Month Appts",
            value: String(thisMonthAppts),
            color: "text-violet-700",
            bg: "bg-violet-50",
            iconColor: "text-violet-600",
          },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <p className={`text-xl font-bold ${s.color} leading-none`}>{s.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Subscription card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Plan</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {subscription.planId}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <SubStatusBadge status={subscription.status} />
                </div>
                {subscription.currentPeriodStart && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Period Start</span>
                    <span className="font-medium text-slate-700">
                      {format(new Date(subscription.currentPeriodStart), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
                {subscription.currentPeriodEnd && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Period End</span>
                    <span className="font-medium text-slate-700">
                      {format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
                {subscription.razorpaySubscriptionId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Razorpay ID</span>
                    <span className="font-mono text-xs text-slate-600 truncate ml-4">
                      {subscription.razorpaySubscriptionId}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400 py-2">No subscription found.</p>
            )}
          </CardContent>
        </Card>

        {/* Partner Attribution Override */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              Partner Attribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-3">
              If this clinic forgot to use a referral link, you can manually assign them to a partner below.
            </p>
            <AssignPartnerOverride 
              clinicId={clinic.id} 
              currentPartnerId={clinic.referredBy}
              partners={partners}
            />
          </CardContent>
        </Card>

        {/* QR + Follow-ups */}
        <div className="space-y-4">
          <Card className="border-teal-100 bg-gradient-to-br from-white to-teal-50/20">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-teal-600" />
                  Doctor QR Analytics & Performance
                </CardTitle>
                <Link href="/admin/qr" className="text-xs font-semibold text-teal-600 hover:underline">
                  Manage QR →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {qrCode ? (
                <>
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div>
                      <p className="font-mono font-extrabold text-slate-900 text-sm">#{qrCode.code}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Assigned {qrCode.assignedAt ? format(new Date(qrCode.assignedAt), "MMM d, yyyy") : "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Usage Type</p>
                      <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 text-[10px] uppercase font-mono mt-0.5">
                        {qrCode.usageType}
                      </Badge>
                    </div>
                  </div>

                  {/* QR Stats Summary */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Total Scans</p>
                      <p className="text-lg font-black text-slate-800">{totalQrScansResult?.count || 0}</p>
                    </div>
                    <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase">QR Appts Booked</p>
                      <p className="text-lg font-black text-emerald-700">
                        {((qrApptsResult.rows as any[]) || []).reduce((acc: number, r: any) => acc + Number(r.count || 0), 0)}
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Sales Pack Download */}
                  <a
                    href={`/api/admin/qr/sales-pack?id=${qrCode.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    🚀 Download Doctor QR Sales Pack PDF
                  </a>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-400">No QR code assigned to this doctor yet.</p>
                  <Link
                    href="/admin/qr"
                    className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs shadow-xs"
                  >
                    Assign QR Code →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-slate-400" />
                Follow-Ups
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {pendingFollowUps.value}
                </p>
                <p className="text-xs text-slate-500">Pending follow-ups</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Payment History ({payments.length} transactions)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No payments recorded.</p>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Razorpay Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(p.paidAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">{p.planName}</TableCell>
                    <TableCell className="text-sm font-semibold text-emerald-700">
                      ₹{(p.amountPaise / 100).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          p.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-600"
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 truncate max-w-[160px]">
                      {p.razorpayOrderId}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Appointments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Recent Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAppointments.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              No appointments recorded.
            </p>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAppointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {a.patientName}
                        </p>
                        <p className="text-xs text-slate-500">{a.patientPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(a.appointmentDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">{a.appointmentTime}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          a.status === "completed"
                            ? "text-emerald-700"
                            : a.status === "cancelled"
                            ? "text-red-600"
                            : "text-slate-600"
                        }`}
                      >
                        {a.status === "completed" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : a.status === "cancelled" ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        <span className="capitalize">{a.status.replace("_", " ")}</span>
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
