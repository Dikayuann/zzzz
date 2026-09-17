import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Mail,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Radio,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample initial data for demonstrating dashboard capabilities
const recentCampaigns = [
  {
    id: "camp_1",
    name: "Flash Sale Promo Ramadhan 2026",
    channels: ["EMAIL", "TELEGRAM"],
    status: "COMPLETED",
    audience: 2450,
    delivered: 2412,
    date: "16 Sep 2026, 10:30",
  },
  {
    id: "camp_2",
    name: "Pengumuman Maintenance Server & Downtime",
    channels: ["TELEGRAM"],
    status: "COMPLETED",
    audience: 840,
    delivered: 840,
    date: "15 Sep 2026, 22:00",
  },
  {
    id: "camp_3",
    name: "Newsletter Mingguan: Tips Optimasi Bisnis",
    channels: ["EMAIL"],
    status: "SCHEDULED",
    audience: 1890,
    delivered: 0,
    date: "18 Sep 2026, 09:00",
  },
  {
    id: "camp_4",
    name: "Survey Kepuasan Pelanggan Q3",
    channels: ["EMAIL", "TELEGRAM"],
    status: "DRAFT",
    audience: 1200,
    delivered: 0,
    date: "14 Sep 2026, 14:15",
  },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Selamat Datang, {user?.name || "Admin"}! 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau dan kelola siaran massal Email serta Telegram dari satu dashboard terpusat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate("/channels")}
          >
            <Radio className="h-4 w-4 text-blue-500" />
            Cek Channel
          </Button>
          <Button
            variant="gradient"
            className="gap-2 shadow-md shadow-blue-500/20"
            onClick={() => navigate("/campaigns")}
          >
            <Plus className="h-4 w-4" />
            Kirim Blast Baru
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Broadcasted */}
        <Card className="hover:shadow-md transition-all border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Pesan Terkirim
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Send className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18,450</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center font-bold">
                <TrendingUp className="h-3 w-3 mr-0.5 inline" /> +14.2%
              </span>{" "}
              dari bulan lalu
            </p>
          </CardContent>
        </Card>

        {/* Telegram Blast */}
        <Card className="hover:shadow-md transition-all border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Telegram Blast
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <MessageSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7,820</div>
            <p className="text-xs text-muted-foreground mt-1">
              Delivery rate <strong className="text-foreground">99.8%</strong> (Instant)
            </p>
          </CardContent>
        </Card>

        {/* Email Blast */}
        <Card className="hover:shadow-md transition-all border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email Blast (SMTP)
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Mail className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,630</div>
            <p className="text-xs text-muted-foreground mt-1">
              Open rate <strong className="text-foreground">38.5%</strong> · 12 bounces
            </p>
          </CardContent>
        </Card>

        {/* Target Contacts */}
        <Card className="hover:shadow-md transition-all border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Kontak & Target
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,290</div>
            <p className="text-xs text-muted-foreground mt-1">
              Terverifikasi & Opt-in aktif
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Readiness Status Banner */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">Telegram Bot Channel</h4>
                <Badge variant="success" className="text-[10px]">
                  Siap Blast
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bot aktif terhubung ke Telegram Bot API untuk broadcast langsung ke chat/grup.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => navigate("/channels")}
          >
            Kelola <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        <div className="rounded-2xl border p-5 bg-gradient-to-r from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">SMTP Email Server</h4>
                <Badge variant="success" className="text-[10px]">
                  Terkonfigurasi
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kredensial SMTP organisasi siap digunakan untuk pengiriman email massal.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => navigate("/channels")}
          >
            Kelola <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Riwayat Broadcast Terakhir</CardTitle>
            <CardDescription>
              Daftar status pengiriman campaign melalui Email dan Telegram
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => navigate("/campaigns")}
          >
            Lihat Semua <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Campaign</TableHead>
                <TableHead>Saluran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target Penerima</TableHead>
                <TableHead>Waktu Kirim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCampaigns.map((camp) => (
                <TableRow key={camp.id} className="cursor-pointer hover:bg-muted/40">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-foreground">{camp.name}</span>
                      <span className="text-[11px] text-muted-foreground">{camp.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {camp.channels.includes("EMAIL") && (
                        <Badge variant="secondary" className="gap-1 text-[11px] font-medium">
                          <Mail className="h-3 w-3 text-amber-500" />
                          Email
                        </Badge>
                      )}
                      {camp.channels.includes("TELEGRAM") && (
                        <Badge variant="secondary" className="gap-1 text-[11px] font-medium">
                          <MessageSquare className="h-3 w-3 text-sky-500" />
                          Telegram
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {camp.status === "COMPLETED" && (
                      <Badge variant="success" className="gap-1 text-[11px]">
                        <CheckCircle2 className="h-3 w-3" />
                        Selesai
                      </Badge>
                    )}
                    {camp.status === "SCHEDULED" && (
                      <Badge variant="info" className="gap-1 text-[11px]">
                        <Clock className="h-3 w-3" />
                        Terjadwal
                      </Badge>
                    )}
                    {camp.status === "DRAFT" && (
                      <Badge variant="outline" className="text-[11px]">
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="font-semibold">{camp.delivered}</span>
                    <span className="text-muted-foreground"> / {camp.audience} penerima</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {camp.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
