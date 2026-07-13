import { db } from "@/db";
import { reminderLogs, appointments, clinics } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarClock, Mail, MessageSquare, Smartphone } from "lucide-react";

export default async function LogsPage() {
  const recentLogs = await db
    .select({
      id: reminderLogs.id,
      channel: reminderLogs.channel,
      triggerType: reminderLogs.triggerType,
      sentAt: reminderLogs.sentAt,
      status: reminderLogs.status,
      message: reminderLogs.message,
      clinicName: clinics.name,
      patientName: appointments.patientName,
    })
    .from(reminderLogs)
    .leftJoin(appointments, eq(reminderLogs.appointmentId, appointments.id))
    .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
    .orderBy(desc(reminderLogs.sentAt))
    .limit(100);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "sms": return <Smartphone className="w-4 h-4 text-slate-500" />;
      case "whatsapp": return <MessageSquare className="w-4 h-4 text-green-500" />;
      case "email": return <Mail className="w-4 h-4 text-blue-500" />;
      default: return <CalendarClock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">System Logs</h2>
        <p className="text-slate-500 mt-1">Monitor automated reminder delivery and system events.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Clinic / Patient</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No logs found.
                </TableCell>
              </TableRow>
            ) : (
              recentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-sm text-slate-600">
                    {format(new Date(log.sentAt), "MMM d, h:mm a")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getChannelIcon(log.channel)}
                      <span className="capitalize text-sm font-medium">{log.channel}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {log.triggerType.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">{log.clinicName || "Unknown"}</span>
                      <span className="text-xs text-slate-500">To: {log.patientName || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.status === "sent" ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Sent
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Failed
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
