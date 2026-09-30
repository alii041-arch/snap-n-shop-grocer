export type Variant = { label: string; price: number; mrp: number };
export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  emoji: string;
  variants: Variant[];
  rating: number;
  eta: number;
  stock: number;
  tags: string[];
  diet: ("veg" | "vegan" | "gluten-free")[];
  desc: string;
  nutrition: { protein: number; carbs: number; fat: number; kcal: number };
};
export type Category = { id: string; name: string; emoji: string; tint: string };

export const categories: Category[] = [
  { id: "fruits-veg", name: "Fruits & Veg", emoji: "🥦", tint: "oklch(0.95 0.06 145)" },
  { id: "dairy", name: "Dairy & Eggs", emoji: "🥛", tint: "oklch(0.96 0.03 240)" },
  { id: "bakery", name: "Bakery", emoji: "🍞", tint: "oklch(0.95 0.05 70)" },
  { id: "snacks", name: "Snacks", emoji: "🍿", tint: "oklch(0.95 0.06 40)" },
  { id: "beverages", name: "Beverages", emoji: "🧃", tint: "oklch(0.95 0.06 20)" },
  { id: "atta-rice", name: "Atta & Rice", emoji: "🌾", tint: "oklch(0.95 0.06 95)" },
  { id: "masala", name: "Masala & Oil", emoji: "🌶️", tint: "oklch(0.94 0.07 30)" },
  { id: "cleaning", name: "Cleaning", emoji: "🧽", tint: "oklch(0.95 0.05 200)" },
  { id: "personal", name: "Personal Care", emoji: "🧴", tint: "oklch(0.95 0.05 320)" },
  { id: "baby", name: "Baby Care", emoji: "🍼", tint: "oklch(0.96 0.04 280)" },
  { id: "pet", name: "Pet Care", emoji: "🐾", tint: "oklch(0.95 0.04 60)" },
];

type Seed = [string, string, string, string, number, number, string, string[]?, Product["diet"]?];
// name, brand, category, emoji, price, mrp, unit, tags, diet
const seeds: Seed[] = [
  ["Fresh Tomato", "FreshDash", "fruits-veg", "🍅", 32, 40, "500 g", ["Fresh"]],
  ["Onion", "FreshDash", "fruits-veg", "🧅", 38, 45, "1 kg", ["Bestseller"]],
  ["Potato", "FreshDash", "fruits-veg", "🥔", 35, 42, "1 kg"],
  ["Banana Robusta", "FreshDash", "fruits-veg", "🍌", 49, 60, "6 pcs", ["Bestseller"]],
  ["Shimla Apple", "FreshDash", "fruits-veg", "🍎", 159, 199, "4 pcs", ["Organic"]],
  ["Coriander Leaves", "FreshDash", "fruits-veg", "🌿", 12, 20, "100 g"],
  ["Green Chilli", "FreshDash", "fruits-veg", "🌶️", 15, 20, "100 g"],
  ["Ginger", "FreshDash", "fruits-veg", "🫚", 28, 35, "200 g"],
  ["Alphonso Mango", "FreshDash", "fruits-veg", "🥭", 349, 449, "1 kg", ["Seasonal"]],
  ["Avocado", "FreshDash", "fruits-veg", "🥑", 129, 160, "1 pc", ["Organic"]],
  ["Amul Taaza Milk", "Amul", "dairy", "🥛", 29, 29, "500 ml", ["Bestseller"]],
  ["Amul Butter", "Amul", "dairy", "🧈", 58, 60, "100 g", ["Bestseller"]],
  ["Farm Fresh Eggs", "Eggoz", "dairy", "🥚", 89, 99, "12 pcs", [], []],
  ["Mother Dairy Curd", "Mother Dairy", "dairy", "🥣", 35, 40, "400 g"],
  ["Amul Paneer", "Amul", "dairy", "🧀", 95, 105, "200 g", ["Bestseller"]],
  ["Amul Cheese Slices", "Amul", "dairy", "🧀", 145, 160, "10 slices"],
  ["Greek Yogurt", "Epigamia", "dairy", "🥣", 60, 70, "90 g"],
  ["Brown Bread", "Harvest Gold", "bakery", "🍞", 50, 55, "400 g"],
  ["Butter Croissant", "Theobroma", "bakery", "🥐", 99, 120, "2 pcs"],
  ["Pav Buns", "Britannia", "bakery", "🍔", 35, 40, "6 pcs"],
  ["Chocolate Muffin", "Britannia", "bakery", "🧁", 45, 50, "2 pcs"],
  ["Multigrain Bread", "Harvest Gold", "bakery", "🍞", 60, 65, "450 g", ["Healthy"]],
  ["Lay's Classic Salted", "Lay's", "snacks", "🥔", 20, 20, "52 g", ["Bestseller"]],
  ["Maggi 2-Minute Noodles", "Nestlé", "snacks", "🍜", 84, 96, "Pack of 6", ["Bestseller"]],
  ["Haldiram's Bhujia", "Haldiram's", "snacks", "🥨", 55, 60, "200 g"],
  ["Dark Fantasy Choco Fills", "Sunfeast", "snacks", "🍪", 40, 45, "75 g"],
  ["Popcorn Butter", "Act II", "snacks", "🍿", 30, 35, "70 g"],
  ["Dairy Milk Silk", "Cadbury", "snacks", "🍫", 85, 95, "60 g"],
  ["Roasted Almonds", "Happilo", "snacks", "🌰", 299, 399, "200 g", ["Healthy"], ["veg", "vegan", "gluten-free"]],
  ["Coca-Cola", "Coca-Cola", "beverages", "🥤", 40, 45, "750 ml", ["Bestseller"], ["veg", "vegan"]],
  ["Paper Boat Aamras", "Paper Boat", "beverages", "🧃", 30, 35, "200 ml"],
  ["Tata Tea Gold", "Tata", "beverages", "🍵", 145, 165, "250 g"],
  ["Nescafé Classic", "Nestlé", "beverages", "☕", 185, 210, "50 g"],
  ["Tender Coconut Water", "Raw Pressery", "beverages", "🥥", 50, 60, "200 ml", ["Healthy"], ["veg", "vegan", "gluten-free"]],
  ["Red Bull", "Red Bull", "beverages", "🥫", 115, 125, "250 ml"],
  ["Aashirvaad Atta", "Aashirvaad", "atta-rice", "🌾", 289, 330, "5 kg", ["Bestseller"]],
  ["India Gate Basmati Rice", "India Gate", "atta-rice", "🍚", 199, 240, "1 kg", ["Bestseller"], ["veg", "vegan", "gluten-free"]],
  ["Toor Dal", "Tata Sampann", "atta-rice", "🫘", 165, 190, "1 kg"],
  ["Moong Dal", "Tata Sampann", "atta-rice", "🫘", 145, 170, "1 kg"],
  ["Rolled Oats", "Quaker", "atta-rice", "🥣", 185, 210, "1 kg", ["Healthy"]],
  ["Sugar", "Madhur", "atta-rice", "🧂", 55, 60, "1 kg"],
  ["Fortune Sunflower Oil", "Fortune", "masala", "🫗", 165, 190, "1 L"],
  ["MDH Garam Masala", "MDH", "masala", "🌶️", 78, 85, "100 g"],
  ["Everest Biryani Masala", "Everest", "masala", "🍛", 65, 72, "50 g"],
  ["Tata Salt", "Tata", "masala", "🧂", 28, 30, "1 kg"],
  ["Turmeric Powder", "Catch", "masala", "🟡", 42, 50, "100 g"],
  ["Pure Cow Ghee", "Amul", "masala", "🫙", 299, 330, "500 ml"],
  ["Surf Excel Matic", "Surf Excel", "cleaning", "🧺", 245, 290, "1 kg", ["Bestseller"]],
  ["Vim Dishwash Gel", "Vim", "cleaning", "🧽", 105, 120, "500 ml"],
  ["Harpic Toilet Cleaner", "Harpic", "cleaning", "🚽", 95, 110, "500 ml"],
  ["Lizol Floor Cleaner", "Lizol", "cleaning", "🧴", 199, 229, "975 ml"],
  ["Dove Shampoo", "Dove", "personal", "🧴", 225, 260, "340 ml"],
  ["Colgate MaxFresh", "Colgate", "personal", "🪥", 99, 110, "150 g"],
  ["Dettol Handwash", "Dettol", "personal", "🧼", 89, 99, "200 ml"],
  ["Nivea Body Lotion", "Nivea", "personal", "🧴", 275, 325, "400 ml"],
  ["Pampers Diapers M", "Pampers", "baby", "👶", 699, 899, "56 pcs"],
  ["Cerelac Wheat Apple", "Nestlé", "baby", "🍼", 259, 280, "300 g"],
  ["Johnson's Baby Wipes", "Johnson's", "baby", "🧻", 149, 179, "72 pcs"],
  ["Pedigree Adult Dog Food", "Pedigree", "pet", "🐕", 389, 450, "1.2 kg"],
  ["Whiskas Tuna Cat Food", "Whiskas", "pet", "🐈", 199, 225, "480 g"],
  ["Pet Chew Bones", "Drools", "pet", "🦴", 149, 180, "4 pcs"],
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export const products: Product[] = seeds.map(([name, brand, category, emoji, price, mrp, unit, tags = [], diet]) => {
  const h = hash(name);
  const big = Math.round(price * 1.85);
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name,
    brand,
    category,
    emoji,
    variants: [
      { label: unit, price, mrp },
      { label: `2 x ${unit}`, price: big, mrp: mrp * 2 },
    ],
    rating: 3.9 + (h % 11) / 10,
    eta: 6 + (h % 9),
    stock: h % 17 === 0 ? 0 : h % 7 === 0 ? 3 : 20 + (h % 40),
    tags,
    diet: diet ?? ["veg"],
    desc: `${brand} ${name} — handpicked, quality-checked and delivered fresh to your door in minutes. Stored under ideal conditions for maximum freshness.`,
    nutrition: { protein: 2 + (h % 18), carbs: 10 + (h % 50), fat: 1 + (h % 20), kcal: 60 + (h % 400) },
  };
});

export const byId = (id: string) => products.find((p) => p.id === id);
export const inCategory = (c: string) => products.filter((p) => p.category === c);
export const discount = (v: Variant) => Math.round(((v.mrp - v.price) / v.mrp) * 100);

export const recipes = [
  { id: "paneer-butter-masala", name: "Paneer Butter Masala", emoji: "🍛", time: "35 min", serves: 4, items: ["amul-paneer", "amul-butter", "fresh-tomato", "onion", "mdh-garam-masala", "ginger"] },
  { id: "veg-biryani", name: "Veg Biryani", emoji: "🍚", time: "50 min", serves: 6, items: ["india-gate-basmati-rice", "onion", "fresh-tomato", "everest-biryani-masala", "pure-cow-ghee", "mother-dairy-curd", "coriander-leaves"] },
  { id: "masala-maggi", name: "Masala Maggi", emoji: "🍜", time: "10 min", serves: 2, items: ["maggi-2-minute-noodles", "onion", "fresh-tomato", "green-chilli"] },
  { id: "healthy-breakfast", name: "Power Breakfast Bowl", emoji: "🥣", time: "8 min", serves: 2, items: ["rolled-oats", "banana-robusta", "greek-yogurt", "roasted-almonds"] },
];

export const brands = ["Amul", "Nestlé", "Tata", "Britannia", "Haldiram's", "Cadbury", "Lay's", "Paper Boat", "Dove", "Surf Excel", "Fortune", "MDH"];

export const pairings: Record<string, string[]> = {
  "brown-bread": ["amul-butter", "farm-fresh-eggs"],
  "multigrain-bread": ["amul-butter", "farm-fresh-eggs"],
  "maggi-2-minute-noodles": ["amul-cheese-slices", "onion"],
  "amul-paneer": ["fresh-tomato", "mdh-garam-masala"],
  "india-gate-basmati-rice": ["toor-dal", "pure-cow-ghee"],
  "lay-s-classic-salted": ["coca-cola", "popcorn-butter"],
  "tata-tea-gold": ["amul-taaza-milk", "sugar"],
};
