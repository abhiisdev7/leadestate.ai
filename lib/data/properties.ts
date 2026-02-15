const PROPERTY_IMAGES = [
  "https://images.pexels.com/photos/30762643/pexels-photo-30762643.jpeg",
  "https://images.pexels.com/photos/8482540/pexels-photo-8482540.jpeg",
  "https://images.pexels.com/photos/7937740/pexels-photo-7937740.jpeg",
  "https://images.pexels.com/photos/8143668/pexels-photo-8143668.jpeg",
  "https://images.pexels.com/photos/7578851/pexels-photo-7578851.jpeg",
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function assignImagesToProperties<T extends Record<string, unknown>>(
  items: T[],
  imagePool: string[]
): (T & { images: string[] })[] {
  const shuffled = shuffle(imagePool);
  let idx = 0;
  return items.map((item) => {
    const count = 1 + Math.floor(Math.random() * 2);
    const images: string[] = [];
    for (let i = 0; i < count; i++) {
      images.push(shuffled[idx % shuffled.length]);
      idx++;
    }
    return { ...item, images };
  });
}

const RAW_PROPERTIES = [
  {
    address: "1234 Oak Street",
    city: "Austin",
    state: "TX",
    zip: "78701",
    price: 485000,
    beds: 3,
    baths: 2,
    sqft: 1850,
    property_type: "single_family" as const,
    description: "Charming 3-bedroom home with updated kitchen and backyard. Near top-rated schools.",
    features: ["backyard", "good schools", "updated kitchen"],
  },
  {
    address: "5678 Maple Avenue",
    city: "Austin",
    state: "TX",
    zip: "78702",
    price: 520000,
    beds: 4,
    baths: 3,
    sqft: 2200,
    property_type: "single_family" as const,
    description: "Spacious 4-bedroom home with private pool and open floor plan. Perfect for entertaining.",
    features: ["pool", "backyard", "open floor plan"],
  },
  {
    address: "9012 Cedar Lane",
    city: "Austin",
    state: "TX",
    zip: "78703",
    price: 450000,
    beds: 3,
    baths: 2,
    sqft: 1600,
    property_type: "single_family" as const,
    description: "Cozy single-family home in a quiet neighborhood. Low maintenance with mature landscaping.",
    features: ["backyard", "quiet neighborhood"],
  },
  {
    address: "3456 Pine Road",
    city: "Austin",
    state: "TX",
    zip: "78704",
    price: 550000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    property_type: "single_family" as const,
    description: "Luxurious 4-bedroom with master suite and walk-in closets. In a top school district.",
    features: ["backyard", "good schools", "master suite"],
  },
  {
    address: "7890 Elm Drive",
    city: "Austin",
    state: "TX",
    zip: "78705",
    price: 420000,
    beds: 3,
    baths: 2,
    sqft: 1700,
    property_type: "single_family" as const,
    description: "Affordable 3-bedroom with low HOA. Great first-time buyer opportunity.",
    features: ["backyard", "low HOA"],
  },
  {
    address: "1111 Willow Way",
    city: "Austin",
    state: "TX",
    zip: "78731",
    price: 495000,
    beds: 3,
    baths: 2,
    sqft: 1900,
    property_type: "single_family" as const,
    description: "Well-maintained home with 2-car garage. Near excellent schools and parks.",
    features: ["backyard", "good schools", "garage"],
  },
  {
    address: "2222 Birch Blvd",
    city: "Austin",
    state: "TX",
    zip: "78745",
    price: 530000,
    beds: 4,
    baths: 2,
    sqft: 2100,
    property_type: "single_family" as const,
    description: "4-bedroom with private pool and no HOA. Large lot for outdoor living.",
    features: ["backyard", "pool", "no HOA"],
  },
  {
    address: "3333 Spruce Street",
    city: "Austin",
    state: "TX",
    zip: "78746",
    price: 460000,
    beds: 3,
    baths: 2,
    sqft: 1750,
    property_type: "single_family" as const,
    description: "Recently renovated with updated bathrooms. Move-in ready condition.",
    features: ["backyard", "updated bathrooms"],
  },
  {
    address: "4444 Ash Avenue",
    city: "Austin",
    state: "TX",
    zip: "78750",
    price: 510000,
    beds: 4,
    baths: 3,
    sqft: 2050,
    property_type: "single_family" as const,
    description: "Modern finishes throughout. Open kitchen with island, ideal for family living.",
    features: ["backyard", "good schools", "modern finishes"],
  },
  {
    address: "5555 Hickory Circle",
    city: "Austin",
    state: "TX",
    zip: "78751",
    price: 475000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    property_type: "single_family" as const,
    description: "Quiet cul-de-sac location. Peaceful setting with minimal through traffic.",
    features: ["backyard", "quiet cul-de-sac"],
  },
  {
    address: "100 Main Street",
    city: "Round Rock",
    state: "TX",
    zip: "78664",
    price: 425000,
    beds: 3,
    baths: 2,
    sqft: 1850,
    property_type: "single_family" as const,
    description: "Family-friendly home with dedicated family room. Strong school district.",
    features: ["backyard", "good schools", "family room"],
  },
  {
    address: "200 Oak Avenue",
    city: "Round Rock",
    state: "TX",
    zip: "78665",
    price: 465000,
    beds: 4,
    baths: 2,
    sqft: 2100,
    property_type: "single_family" as const,
    description: "Open floor plan with attached garage. Great for growing families.",
    features: ["backyard", "open floor plan", "garage"],
  },
  {
    address: "300 Cedar Park Drive",
    city: "Cedar Park",
    state: "TX",
    zip: "78613",
    price: 485000,
    beds: 4,
    baths: 3,
    sqft: 2300,
    property_type: "single_family" as const,
    description: "Resort-style living with pool and master suite. Premium community amenities.",
    features: ["backyard", "pool", "master suite"],
  },
  {
    address: "400 Whitestone Blvd",
    city: "Cedar Park",
    state: "TX",
    zip: "78613",
    price: 520000,
    beds: 4,
    baths: 3,
    sqft: 2500,
    property_type: "single_family" as const,
    description: "Newer construction with modern kitchen and high-end finishes. Top-rated schools nearby.",
    features: ["backyard", "good schools", "modern kitchen"],
  },
];

export const SEED_PROPERTIES = assignImagesToProperties(RAW_PROPERTIES, PROPERTY_IMAGES);
