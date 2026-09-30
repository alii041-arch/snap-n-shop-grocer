import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { byId, type Product } from "./data";

export type CartLine = { id: string; v: number; qty: number };
export type Order = { id: string; lines: CartLine[]; total: number; at: number; address: string };

type State = {
  cart: CartLine[];
  wishlist: string[];
  orders: Order[];
  user: string | null;
  location: string;
  budget: number | null;
};

const initial: State = { cart: [], wishlist: [], orders: [], user: null, location: "HSR Layout, Bengaluru", budget: null };

type Ctx = State & {
  qty: (id: string, v?: number) => number;
  setQty: (id: string, v: number, qty: number) => void;
  add: (id: string, v?: number) => void;
  toggleWish: (id: string) => void;
  clearCart: () => void;
  placeOrder: (total: number) => string;
  set: (p: Partial<State>) => void;
  cartOpen: boolean;
  setCartOpen: (b: boolean) => void;
  aiOpen: boolean;
  aiPrompt: string;
  openAI: (prompt?: string) => void;
  closeAI: () => void;
  bump: number;
  itemCount: number;
  itemTotal: number;
  mrpTotal: number;
};

const StoreCtx = createContext<Ctx | null>(null);
const KEY = "freshdash-store-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [bump, setBump] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setS({ ...initial, ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(s));
  }, [s, ready]);

  const setQty = useCallback((id: string, v: number, qty: number) => {
    setS((st) => {
      const rest = st.cart.filter((l) => !(l.id === id && l.v === v));
      const cart = qty > 0 ? [...rest, { id, v, qty }] : rest;
      const ordered = st.cart.map((l) => cart.find((c) => c.id === l.id && c.v === l.v)).filter(Boolean) as CartLine[];
      const added = cart.filter((c) => !st.cart.some((l) => l.id === c.id && l.v === c.v));
      return { ...st, cart: [...ordered, ...added] };
    });
  }, []);

  const qty = (id: string, v = 0) => s.cart.find((l) => l.id === id && l.v === v)?.qty ?? 0;
  const add = (id: string, v = 0) => {
    setQty(id, v, qty(id, v) + 1);
    setBump((b) => b + 1);
  };

  const lines = s.cart.map((l) => ({ l, p: byId(l.id) as Product })).filter((x) => x.p);
  const itemCount = lines.reduce((a, x) => a + x.l.qty, 0);
  const itemTotal = lines.reduce((a, x) => a + x.p.variants[x.l.v].price * x.l.qty, 0);
  const mrpTotal = lines.reduce((a, x) => a + x.p.variants[x.l.v].mrp * x.l.qty, 0);

  const value: Ctx = {
    ...s,
    qty,
    setQty,
    add,
    toggleWish: (id) => setS((st) => ({ ...st, wishlist: st.wishlist.includes(id) ? st.wishlist.filter((w) => w !== id) : [...st.wishlist, id] })),
    clearCart: () => setS((st) => ({ ...st, cart: [] })),
    placeOrder: (total) => {
      const id = "FD" + Date.now().toString().slice(-6);
      setS((st) => ({ ...st, orders: [{ id, lines: st.cart, total, at: Date.now(), address: st.location }, ...st.orders], cart: [] }));
      return id;
    },
    set: (p) => setS((st) => ({ ...st, ...p })),
    cartOpen,
    setCartOpen,
    aiOpen,
    aiPrompt,
    openAI: (prompt = "") => {
      setAiPrompt(prompt);
      setAiOpen(true);
    },
    closeAI: () => setAiOpen(false),
    bump,
    itemCount,
    itemTotal,
    mrpTotal,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

export const FREE_DELIVERY = 199;
export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
