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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  HomeIcon,
  UsersIcon,
  PhoneIcon,
  MailIcon,
  SearchIcon,
  DownloadIcon,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatDateTime } from "@/lib/utils";

const PAGE_SIZE = 20;

interface Contact {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  source?: "inbound" | "outbound";
  createdAt: string;
}

function escapeCsvValue(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function sourceLabel(source?: "inbound" | "outbound"): string {
  return source === "inbound" ? "Buyer" : source === "outbound" ? "Seller" : "";
}

function contactsToCsv(contacts: Contact[]): string {
  const headers = ["Name", "Phone", "Email", "Source", "Added"];
  const rows = contacts.map((c) => [
    escapeCsvValue(c.name ?? ""),
    escapeCsvValue(c.phone ?? ""),
    escapeCsvValue(c.email ?? ""),
    escapeCsvValue(sourceLabel(c.source)),
    escapeCsvValue(c.createdAt ? formatDateTime(c.createdAt) : ""),
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function downloadCsv(contacts: Contact[], filename: string) {
  const csv = contactsToCsv(contacts);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/contacts");
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const filtered = useMemo(
    () =>
      contacts.filter(
        (c) =>
          !search ||
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase()) ||
          c.phone?.includes(search)
      ),
    [contacts, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () =>
      filtered.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
      ),
    [filtered, safePage]
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleExport = useCallback(() => {
    const filename = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(filtered, filename);
  }, [filtered]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <h1 className="font-semibold text-lg">Contacts</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/crm"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <UsersIcon className="size-4" />
            Leads
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


      <main className="flex-1 overflow-auto p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm min-w-[200px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filtered.length} contact{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="gap-2"
          >
            <DownloadIcon className="size-4" />
            Export
          </Button>
        </div>

        <div className="rounded-md border">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Loading contacts...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No contacts yet. Contacts are created when leads schedule calls via the voice chat.
            </div>
          ) : (
            <Table className="[&_th]:border-r [&_th]:border-border [&_th:last-child]:border-r-0 [&_td]:border-r [&_td]:border-border [&_td:last-child]:border-r-0">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Source (Buyer/Seller)</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">
                      {c.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2 text-sm">
                        <PhoneIcon className="size-3.5 text-muted-foreground" />
                        {c.phone ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2 text-sm">
                        <MailIcon className="size-3.5 text-muted-foreground" />
                        {c.email ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.source === "inbound" ? "Buyer" : c.source === "outbound" ? "Seller" : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {c.createdAt ? formatDateTime(c.createdAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!loading && filtered.length > 0 && totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              Page {safePage} of {totalPages}
            </p>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (safePage > 1) setPage(safePage - 1);
                    }}
                    className={
                      safePage <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true;
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safePage) <= 1
                    );
                  })
                  .reduce<number[]>((acc, p, i, arr) => {
                    if (i > 0 && arr[i - 1]! < p - 1) acc.push(-1);
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === -1 ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                          isActive={p === safePage}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (safePage < totalPages) setPage(safePage + 1);
                    }}
                    className={
                      safePage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
}
