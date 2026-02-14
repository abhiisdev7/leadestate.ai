"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { HomeIcon, Bath, BedDouble, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const fetchProperty = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/properties/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Property not found");
        setProperty(null);
        return;
      }
      setProperty(data);
      setError(null);
    } catch (err) {
      setError(String(err));
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  if (!id || loading) {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="flex shrink-0 items-center border-b px-4 py-3">
          <Link href="/properties">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="size-4 mr-1" />
              Back
            </Button>
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </main>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="flex shrink-0 items-center border-b px-4 py-3">
          <Link href="/properties">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="size-4 mr-1" />
              Back
            </Button>
          </Link>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <p className="text-destructive text-sm">{error ?? "Property not found"}</p>
          <Button asChild variant="outline">
            <Link href="/properties">View all properties</Link>
          </Button>
        </main>
      </div>
    );
  }

  const images = property.images ?? [];
  const hasMultipleImages = images.length > 1;
  const status = property.status ?? "active";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <Link href="/properties">
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="size-4 mr-1" />
            Back to properties
          </Button>
        </Link>
        <Link href="/crm">
          <Button variant="outline" size="sm">
            CRM
          </Button>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center overflow-auto p-4">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          {/* Images - carousel if multiple, single image otherwise */}
          <div className="relative">
            {hasMultipleImages ? (
              <Carousel
                opts={{ align: "center", loop: true }}
                className="w-full"
              >
                <CarouselContent className="-ml-0">
                  {images.map((src, i) => (
                    <CarouselItem key={i} className="pl-0">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={src}
                          alt={`${property.address}, ${property.city} - Image ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 672px"
                          priority={i === 0}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            ) : images.length === 1 ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
                <Image
                  src={images[0]}
                  alt={`${property.address}, ${property.city}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                  priority
                />
              </div>
            ) : (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <HomeIcon className="size-16" />
                </div>
              </div>
            )}
            <div className="absolute right-4 top-4 rounded-lg bg-background/95 px-4 py-2 text-lg font-semibold shadow-sm backdrop-blur-sm">
              ${property.price.toLocaleString()}
            </div>
            {(status === "sold" || status === "archived") && (
              <div className="absolute left-4 top-4 rounded-lg bg-background/95 px-3 py-1.5 text-sm font-medium capitalize shadow-sm backdrop-blur-sm">
                {status}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <h1 className="font-semibold text-xl">{property.address}</h1>
              <p className="text-muted-foreground">
                {property.city}, {property.state}
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-muted-foreground">
              <span className="flex items-center gap-2">
                <BedDouble className="size-4" />
                {property.beds} bed
              </span>
              <span className="flex items-center gap-2">
                <Bath className="size-4" />
                {property.baths} bath
              </span>
              {property.sqft && (
                <span>{property.sqft.toLocaleString()} sqft</span>
              )}
            </div>

            {property.features?.length ? (
              <div>
                <h3 className="font-medium text-sm mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((f) => (
                    <span
                      key={f}
                      className="rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
