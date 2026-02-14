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
    price: 485000,
    beds: 3,
    baths: 2,
    sqft: 1850,
    features: ["backyard", "good schools", "updated kitchen"],
  },
  {
    address: "5678 Maple Avenue",
    city: "Austin",
    state: "TX",
    price: 520000,
    beds: 4,
    baths: 3,
    sqft: 2200,
    features: ["pool", "backyard", "open floor plan"],
  },
  {
    address: "9012 Cedar Lane",
    city: "Austin",
    state: "TX",
    price: 450000,
    beds: 3,
    baths: 2,
    sqft: 1600,
    features: ["backyard", "quiet neighborhood"],
  },
  {
    address: "3456 Pine Road",
    city: "Austin",
    state: "TX",
    price: 550000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    features: ["backyard", "good schools", "master suite"],
  },
  {
    address: "7890 Elm Drive",
    city: "Austin",
    state: "TX",
    price: 420000,
    beds: 3,
    baths: 2,
    sqft: 1700,
    features: ["backyard", "low HOA"],
  },
  {
    address: "1111 Willow Way",
    city: "Austin",
    state: "TX",
    price: 495000,
    beds: 3,
    baths: 2,
    sqft: 1900,
    features: ["backyard", "good schools", "garage"],
  },
  {
    address: "2222 Birch Blvd",
    city: "Austin",
    state: "TX",
    price: 530000,
    beds: 4,
    baths: 2,
    sqft: 2100,
    features: ["backyard", "pool", "no HOA"],
  },
  {
    address: "3333 Spruce Street",
    city: "Austin",
    state: "TX",
    price: 460000,
    beds: 3,
    baths: 2,
    sqft: 1750,
    features: ["backyard", "updated bathrooms"],
  },
  {
    address: "4444 Ash Avenue",
    city: "Austin",
    state: "TX",
    price: 510000,
    beds: 4,
    baths: 3,
    sqft: 2050,
    features: ["backyard", "good schools", "modern finishes"],
  },
  {
    address: "5555 Hickory Circle",
    city: "Austin",
    state: "TX",
    price: 475000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    features: ["backyard", "quiet cul-de-sac"],
  },
  {
    address: "100 Main Street",
    city: "Round Rock",
    state: "TX",
    price: 425000,
    beds: 3,
    baths: 2,
    sqft: 1850,
    features: ["backyard", "good schools", "family room"],
  },
  {
    address: "200 Oak Avenue",
    city: "Round Rock",
    state: "TX",
    price: 465000,
    beds: 4,
    baths: 2,
    sqft: 2100,
    features: ["backyard", "open floor plan", "garage"],
  },
  {
    address: "300 Cedar Park Drive",
    city: "Cedar Park",
    state: "TX",
    price: 485000,
    beds: 4,
    baths: 3,
    sqft: 2300,
    features: ["backyard", "pool", "master suite"],
  },
  {
    address: "400 Whitestone Blvd",
    city: "Cedar Park",
    state: "TX",
    price: 520000,
    beds: 4,
    baths: 3,
    sqft: 2500,
    features: ["backyard", "good schools", "modern kitchen"],
  },
];

export const SEED_PROPERTIES = assignImagesToProperties(RAW_PROPERTIES, PROPERTY_IMAGES);
