"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArchiveIcon, ArrowRightIcon, Bath, BedDouble, HomeIcon, MicIcon, PlusIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
  status?: "active" | "sold" | "archived";
}

function AddPropertyModal({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    price: "",
    beds: "",
    baths: "",
    sqft: "",
    features: "",
    imageUrls: [""],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: form.address,
          city: form.city,
          state: form.state,
          price: form.price ? Number(form.price) : undefined,
          beds: form.beds ? Number(form.beds) : undefined,
          baths: form.baths ? Number(form.baths) : undefined,
          sqft: form.sqft || undefined,
          features: form.features || undefined,
          images: form.imageUrls.filter((url) => url.trim() !== ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add property");
        return;
      }
      setForm({
        address: "",
        city: "",
        state: "",
        price: "",
        beds: "",
        baths: "",
        sqft: "",
        features: "",
        imageUrls: [""],
      });
      setOpen(false);
      onSuccess();
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="size-4" />
          Add property
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add property</DialogTitle>
          <DialogDescription>
            Add a new listing to your properties.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Address</label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="1234 Oak Street"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">City</label>
              <Input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Austin"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">State</label>
              <Input
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                placeholder="TX"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Price ($)</label>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="485000"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Beds</label>
              <Input
                type="number"
                min={0}
                value={form.beds}
                onChange={(e) => setForm((f) => ({ ...f, beds: e.target.value }))}
                placeholder="3"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Baths</label>
              <Input
                type="number"
                min={0}
                value={form.baths}
                onChange={(e) => setForm((f) => ({ ...f, baths: e.target.value }))}
                placeholder="2"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Sqft (optional)</label>
              <Input
                type="number"
                min={0}
                value={form.sqft}
                onChange={(e) => setForm((f) => ({ ...f, sqft: e.target.value }))}
                placeholder="1850"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Features (optional, comma-separated)</label>
              <Input
                value={form.features}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                placeholder="backyard, good schools, updated kitchen"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Image URLs (optional)</label>
              <div className="flex flex-col gap-2">
                {form.imageUrls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={url}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          imageUrls: f.imageUrls.map((u, j) =>
                            j === i ? e.target.value : u
                          ),
                        }))
                      }
                      placeholder="https://..."
                      type="url"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Add image URL"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          imageUrls: [...f.imageUrls, ""],
                        }))
                      }
                    >
                      <PlusIcon className="size-4" />
                    </Button>
                    {form.imageUrls.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Remove image URL"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            imageUrls: f.imageUrls.filter((_, j) => j !== i),
                          }))
                        }
                      >
                        <XIcon className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PropertyCard({
  property,
  onStatusChange,
}: {
  property: Property;
  onStatusChange: () => void;
}) {
  const imageUrl = property.images?.[0];
  const status = property.status ?? "active";
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (newStatus: "sold" | "archived") => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/properties/${property._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) onStatusChange();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="group relative overflow-hidden rounded-xl border-0 bg-background gap-3 -py-6 shadow-sm transition-all duration-200 hover:shadow-lg">
      {/* Hover overlay with action buttons */}
      <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {status === "active" && (
          <>
            <Button
              size="sm"
              variant="secondary"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleStatus("sold")}
              disabled={updating}
            >
              Sold
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-muted hover:bg-muted/80"
              onClick={() => handleStatus("archived")}
              disabled={updating}
            >
              <ArchiveIcon className="size-4" />
              Archive
            </Button>
          </>
        )}
        {(status === "sold" || status === "archived") && (
          <Button
            size="sm"
            variant="secondary"
            className="bg-background"
            onClick={async () => {
              setUpdating(true);
              try {
                const res = await fetch(`/api/properties/${property._id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "active" }),
                });
                if (res.ok) onStatusChange();
              } catch (e) {
                console.error(e);
              } finally {
                setUpdating(false);
              }
            }}
            disabled={updating}
          >
            Mark active
          </Button>
        )}
        <Button
          size="icon"
          variant="secondary"
          className="bg-background hover:bg-background/90 size-9 shrink-0"
          asChild
        >
          <Link href={`/properties/${property._id}`} aria-label="View details">
            <ArrowRightIcon className="size-4 -rotate-45" />
          </Link>
        </Button>
      </div>

      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${property.address}, ${property.city}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <HomeIcon className="size-12" />
          </div>
        )}
        {/* Price badge */}
        <div className="absolute right-3 top-3 rounded-lg bg-background/95 px-3 py-1.5 text-sm font-semibold shadow-sm backdrop-blur-sm">
          ${property.price.toLocaleString()}
        </div>
        {/* Status badge */}
        {(status === "sold" || status === "archived") && (
          <div className="absolute left-3 top-3 rounded-lg bg-background/95 px-2.5 py-1 text-xs font-medium capitalize shadow-sm backdrop-blur-sm">
            {status}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        <div>
          <p className="font-semibold text-base leading-tight">
            {property.address}
          </p>
          <p className="text-muted-foreground text-sm">
            {property.city}, {property.state}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDouble className="size-4" />
            {property.beds} bed
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="size-4" />
            {property.baths} bath
          </span>
          {property.sqft && (
            <span>{property.sqft.toLocaleString()} sqft</span>
          )}
        </div>

        {property.features?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {property.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    try {
      const res = await fetch("/api/properties");
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="font-semibold text-lg">Properties</h1>
        <div className="flex items-center">
          <Link
            href="/crm"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Button>
              Dashboard
            </Button>
          </Link>
          <AddPropertyModal onSuccess={fetchProperties} />
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Button variant="outline">
              <MicIcon className="size-4" />
              Voice Chat
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading properties...</p>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <HomeIcon className="size-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              No properties yet. Load sample Austin listings to get started.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await fetch("/api/seed", { method: "POST" });
                    fetchProperties();
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Load sample data
              </Button>
              <Button asChild variant="ghost">
                <Link href="/crm">Back to CRM</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((prop) => (
              <PropertyCard
                key={prop._id}
                property={prop}
                onStatusChange={fetchProperties}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
