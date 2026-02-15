"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ChevronRightIcon,
  HomeIcon,
  CalendarIcon,
  PhoneIcon,
  MailIcon,
  AlertTriangleIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  SearchIcon,
  UsersIcon,
  BarChart3Icon,
} from "lucide-react";
import { cn, formatDateTimeParts } from "@/lib/utils";

interface Property {
  _id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  features?: string[];
  images?: string[];
}

interface Lead {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  status: string;
  intent?: string;
  urgency?: string;
  budget?: number;
  location?: string;
  timeline?: string;
  motivation?: string;
  readiness_score?: number;
  next_action?: string;
  channel?: "inbound" | "outbound";
  suggested_properties?: Property[];
  call_insights?: {
    summary?: string;
    objections?: string[];
    action_items?: string[];
    next_best_action?: string;
  };
  appointments?: Array<{
    date: string;
    time: string;
    confirmed?: boolean;
  }>;
}

function LeadRow({
  lead,
  isExpanded,
  onToggle,
}: {
  lead: Lead;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasDetails =
    lead.call_insights?.summary ||
    lead.call_insights?.next_best_action ||
    (lead.intent === "buy" && lead.suggested_properties && lead.suggested_properties.length > 0);

  return (
    <>
      <TableRow
        className={cn(hasDetails && "cursor-pointer")}
        onClick={() => hasDetails && onToggle()}
      >
        <TableCell className="w-10">
          {hasDetails && (
            <ChevronRightIcon
              className={cn(
                "size-4 transition-transform",
                isExpanded && "rotate-90"
              )}
            />
          )}
        </TableCell>
        <TableCell>
          <div>
            <p className="font-medium">{lead.name ?? "—"}</p>
            {lead.phone && (
              <p className="text-muted-foreground text-xs">{lead.phone}</p>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge
            variant={
              lead.intent === "buy"
                ? "default"
                : lead.intent === "sell"
                  ? "secondary"
                  : "outline"
            }
            className="capitalize"
          >
            {lead.intent ?? "—"}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className={cn(
              "capitalize gap-1 font-medium",
              lead.channel === "inbound"
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-green-100 border-green-300 text-green-700"
            )}
          >
            {lead.channel === "inbound" ? (
              <ArrowDownLeftIcon className="size-3.5 shrink-0" />
            ) : (
              <ArrowUpRightIcon className="size-3.5 shrink-0" />
            )}
            {lead.channel ?? "—"}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge
            variant={
              lead.status === "qualified" ? "default" : "secondary"
            }
            className="capitalize"
          >
            {lead.status}
          </Badge>
        </TableCell>
        <TableCell>
          {lead.budget ? `$${lead.budget.toLocaleString()}` : "—"}
        </TableCell>
        <TableCell>{lead.location ?? "—"}</TableCell>
        <TableCell>{lead.timeline ?? "—"}</TableCell>
        <TableCell className="text-center">
          {lead.readiness_score != null ? (
            <div className="flex justify-center">
              <ProgressCircle value={lead.readiness_score} max={10} size={36} />
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell className="max-w-[180px] truncate">
          {lead.next_action ?? "—"}
        </TableCell>
      </TableRow>
      {isExpanded && hasDetails && (
        <TableRow>
          <TableCell colSpan={10} className="bg-muted/30 p-0">
            <div className="space-y-4 p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Contact</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {lead.phone && (
                      <p className="flex items-center gap-2">
                        <PhoneIcon className="size-3.5" />
                        {lead.phone}
                      </p>
                    )}
                    {lead.email && (
                      <p className="flex items-center gap-2">
                        <MailIcon className="size-3.5" />
                        {lead.email}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Qualification</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Intent: </span>
                      <span className="capitalize">{lead.intent ?? "—"}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Urgency: </span>
                      <span className="capitalize">{lead.urgency ?? "—"}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Motivation: </span>
                      {lead.motivation ?? "—"}
                    </p>
                  </div>
                </div>
                {lead.appointments && lead.appointments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Meetings</h4>
                    <div className="space-y-1 text-sm">
                      {lead.appointments.map((apt, i) => (
                        <p key={i} className="flex items-center gap-2">
                          <CalendarIcon className="size-3.5" />
                          {formatDateTimeParts(apt.date, apt.time)}
                          {apt.confirmed && (
                            <Badge variant="outline" className="text-xs capitalize">
                              Confirmed
                            </Badge>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {(lead.call_insights?.summary ||
                lead.call_insights?.next_best_action) && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Call Insights</h4>
                    {lead.call_insights.summary && (
                      <p className="text-muted-foreground text-sm mb-2">
                        {lead.call_insights.summary}
                      </p>
                    )}
                    {lead.call_insights.objections &&
                      lead.call_insights.objections.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-amber-600 flex items-center gap-1 mb-1">
                            <AlertTriangleIcon className="size-3.5" />
                            Objections
                          </p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {lead.call_insights.objections.map((o, i) => (
                              <li key={i}>{o}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {lead.call_insights.action_items &&
                      lead.call_insights.action_items.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium mb-1">Action items</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {lead.call_insights.action_items.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {lead.call_insights.next_best_action && (
                      <p className="text-sm">
                        <span className="font-medium">Next best action: </span>
                        {lead.call_insights.next_best_action}
                      </p>
                    )}
                  </div>
                )}
              {lead.intent === "buy" &&
                lead.suggested_properties &&
                lead.suggested_properties.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-1.5">
                      Suggested Properties
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {lead.suggested_properties.map((prop: Property) => (
                        <Link
                          key={prop._id}
                          href={`/properties/${prop._id}`}
                          className="rounded border bg-background px-2 py-1.5 text-xs min-w-0 max-w-[200px] block transition-colors hover:bg-muted hover:border-primary/30"
                        >
                          <p className="font-medium text-xs truncate">
                            {prop.address}, {prop.city}
                          </p>
                          <p className="text-primary font-medium text-xs">
                            ${prop.price.toLocaleString()}
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            {prop.beds}b · {prop.baths}ba
                            {prop.sqft ? ` · ${prop.sqft} sqft` : ""}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

type ChartRange = "week" | "monthly" | "yearly";

const CHART_CONFIG = {
  meetings: {
    label: "Scheduled Meetings",
    color: "#22c55e",
  },
  leads: {
    label: "Leads",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState<ChartRange>("week");
  const [chartData, setChartData] = useState<
    Array<{ date: string; label: string; leads: number; meetings: number }>
  >([]);
  const [chartDateRange, setChartDateRange] = useState<string>("");
  const [chartLoading, setChartLoading] = useState(true);

  const fetchChartData = useCallback(async () => {
    setChartLoading(true);
    try {
      const res = await fetch(`/api/crm/stats?range=${chartRange}`);
      if (res.ok) {
        const { chartData: data, dateRangeLabel } = await res.json();
        setChartData(data ?? []);
        setChartDateRange(dateRangeLabel ?? "");
      }
    } catch (err) {
      console.error("Chart fetch error:", err);
    } finally {
      setChartLoading(false);
    }
  }, [chartRange]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeads(data);
      } else if (data.error) {
        console.error("Leads API error:", data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 3000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | "inbound" | "outbound">("all");

  const filteredLeads = useMemo(() => {
    let result = leads;
    if (channelFilter !== "all") {
      result = result.filter((l) => l.channel === channelFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.includes(q) ||
          l.location?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [leads, channelFilter, searchQuery]);

  const displayLeads = filteredLeads;
  const derivedMeetings = leads.flatMap((lead) =>
    (lead.appointments ?? []).map((apt, i) => ({
      id: `${lead._id}-${i}`,
      leadName: lead.name ?? "Unknown",
      leadId: lead._id,
      date: apt.date,
      time: apt.time,
      type: "Meeting",
      channel: (apt as { channel?: "inbound" | "outbound" }).channel ?? "inbound",
      purpose: (apt as { purpose?: string }).purpose ?? "—",
      confirmed: apt.confirmed ?? false,
    }))
  );
  const allMeetingsSorted = [...derivedMeetings].sort(
    (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  );
  const displayMeetings: Array<{
    id: string;
    leadName: string;
    leadId: string;
    date: string;
    time: string;
    type: string;
    channel: "inbound" | "outbound";

    purpose?: string;
    confirmed: boolean;
  }> = allMeetingsSorted.slice(0, 6);
  const leadById = useMemo(() => new Map(leads.map((l) => [l._id, l])), [leads]);
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <h1 className="font-semibold text-lg">CRM – Leads</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/contacts"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <UsersIcon className="size-4" />
            Contacts
          </Link>
          <Link
            href="/properties"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HomeIcon className="size-4" />
            Properties
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-auto px-2 py-4 space-y-6 sm:px-4">
        <section>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="flex flex-row flex-wrap items-start justify-between gap-4 mb-2">
              <div>
                <h2 className="font-semibold text-base flex items-center gap-2">
                  <BarChart3Icon className="size-4" />
                  Leads & Scheduled Meetings
                </h2>
                {chartDateRange && (
                  <p className="text-muted-foreground text-sm mt-1">
                    {chartDateRange}
                  </p>
                )}
              </div>
              <Tabs
                value={chartRange}
                onValueChange={(v) => setChartRange(v as ChartRange)}
              >
                <TabsList variant="default" className="h-9 shrink-0">
                  <TabsTrigger value="week" className="px-3 text-sm">
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="px-3 text-sm">
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger value="yearly" className="px-3 text-sm">
                    Yearly
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {chartLoading ? (
              <div className="flex aspect-video items-center justify-center text-muted-foreground text-sm">
                Loading chart...
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex aspect-video items-center justify-center text-muted-foreground text-sm">
                No data for this period
              </div>
            ) : (
              <ChartContainer config={CHART_CONFIG} className="-ml-6 h-[240px] w-full">
                <BarChart
                  data={chartData}
                  margin={{ top: 40, right: 8, left: 44, bottom: 8 }}
                  accessibilityLayer
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                    width={40}
                    label={{
                      value: "Count",
                      angle: -90,
                      position: "insideLeft",
                      dx: -12,
                      style: { textAnchor: "middle", fontSize: 11 },
                    }}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <ChartLegend
                    content={<ChartLegendContent />}
                    align="right"
                    verticalAlign="top"
                    wrapperStyle={{ paddingBottom: 8 }}
                  />
                  <Bar
                    dataKey="meetings"
                    stackId="a"
                    fill="var(--color-meetings)"
                    radius={[0, 0, 4, 4]}
                    name="Scheduled Meetings"
                  />
                  <Bar
                    dataKey="leads"
                    stackId="a"
                    fill="var(--color-leads)"
                    radius={[4, 4, 0, 0]}
                    name="Leads"
                  />
                </BarChart>
              </ChartContainer>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 justify-between">
            <span className="flex items-center gap-2">
              <CalendarIcon className="size-4" />
              Upcoming Meetings (top 6 by date)
            </span>
            <span className="text-muted-foreground text-sm font-normal">
              Leads <span className="font-semibold text-foreground">{leads.length}</span>
              {" · "}
              Qualified <span className="font-semibold text-foreground">{leads.filter((l) => l.status === "qualified").length}</span>
              {" · "}
              Top 6 meetings
            </span>
          </h2>
          {displayMeetings.length > 0 ? (
            <div className="rounded-md border border-border">
              <Table className="[&_th]:border-r [&_th]:border-border [&_th:last-child]:border-r-0 [&_td]:border-r [&_td]:border-border [&_td:last-child]:border-r-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Lead</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>

                </TableHeader>
                <TableBody>
                  {displayMeetings.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        {formatDateTimeParts(m.date, m.time)}
                      </TableCell>
                      <TableCell className="font-medium">
                        
                        <HoverCard openDelay={200} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <button
                              type="button"
                              className="text-left font-medium underline-offset-4 hover:underline cursor-pointer"
                            >
                              {m.leadName}
                            </button>
                          </HoverCardTrigger>
                          <HoverCardContent align="start" className="w-72">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm">
                                Contact details
                              </h4>
                              {(() => {
                                const lead = leadById.get(m.leadId);
                                if (!lead) return <p className="text-muted-foreground text-sm">No details</p>;
                                return (
                                  <div className="space-y-2 text-sm">
                                    {lead.name && (
                                      <p className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Name:</span>
                                        {lead.name}
                                      </p>
                                    )}
                                    {lead.phone && (
                                      <p className="flex items-center gap-2">
                                        <PhoneIcon className="size-3.5 text-muted-foreground shrink-0" />
                                        {lead.phone}
                                      </p>
                                    )}
                                    {lead.email && (
                                      <p className="flex items-center gap-2">
                                        <MailIcon className="size-3.5 text-muted-foreground shrink-0" />
                                        {lead.email}
                                      </p>
                                    )}
                                    {lead.location && (
                                      <p className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Location:</span>
                                        {lead.location}
                                      </p>
                                    )}
                                    {lead.intent && (
                                      <p className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Intent:</span>
                                        <span className="capitalize">{lead.intent}</span>
                                      </p>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize">
                        {m.type}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {m.purpose ?? "—"}
                      </TableCell>
                      <TableCell
                        className={cn(
                          m.channel === "inbound"
                            ? "bg-blue-50"
                            : "bg-green-50"
                        )}
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize gap-1.5 font-medium",
                            m.channel === "inbound"
                              ? "bg-blue-100 border-blue-300 text-blue-700"
                              : "bg-green-100 border-green-300 text-green-700"
                          )}
                        >
                          {m.channel === "inbound" ? (
                            <ArrowDownLeftIcon className="size-3.5 shrink-0" />
                          ) : (
                            <ArrowUpRightIcon className="size-3.5 shrink-0" />
                          )}
                          {m.channel}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          m.confirmed
                            ? "bg-green-50"
                            : "bg-yellow-50"
                        )}
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize font-medium",
                            m.confirmed
                              ? "bg-green-100 border-green-300 text-green-700"
                              : "bg-yellow-100 border-yellow-300 text-yellow-700"
                          )}
                        >
                          {m.confirmed ? "Confirmed" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed py-8 text-center text-muted-foreground text-sm">
              No upcoming meetings
            </div>
          )}
        </section>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h2 className="font-semibold text-base">Leads</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[180px] sm:w-[200px]"
                />
              </div>
              <Tabs
                value={channelFilter}
                onValueChange={(v) => setChannelFilter(v as "all" | "inbound" | "outbound")}
              >
                <TabsList variant="default" className="h-9">
                  <TabsTrigger value="all" className="px-3 text-sm">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="inbound" className="px-3 text-sm">
                    Inbound
                  </TabsTrigger>
                  <TabsTrigger value="outbound" className="px-3 text-sm">
                    Outbound
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading leads...</p>
          ) : displayLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center rounded-md border border-dashed">
              <p className="text-muted-foreground">
                No leads yet. Leads from voice chats will appear here.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table className="[&_th]:border-r [&_th]:border-border [&_th:last-child]:border-r-0 [&_td]:border-r [&_td]:border-border [&_td:last-child]:border-r-0">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Name</TableHead>
                    <TableHead>Intent</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead className="text-center">Score (10)</TableHead>
                    <TableHead>Next Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayLeads.map((lead) => (
                    <LeadRow
                      key={lead._id}
                      lead={lead}
                      isExpanded={expandedLeadId === lead._id}
                      onToggle={() =>
                        setExpandedLeadId((id) =>
                          id === lead._id ? null : lead._id
                        )
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
