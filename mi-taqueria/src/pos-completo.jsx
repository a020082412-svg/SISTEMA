import { useState, useEffect, useCallback } from "react";

// ─── DEFAULTS ────────────────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  businessName: "Mi Taquería",
  waiters: ["Carlos", "María", "José", "Ana"],
  tables: ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5", "Para llevar"],
};

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Tacos de Canasta", category: "Comida", price: 15, stock: 40, minStock: 10, unit: "pza", emoji: "🌮" },
  { id: 2, name: "Agua de Jamaica", category: "Bebida", price: 18, stock: 24, minStock: 8, unit: "vaso", emoji: "🍹" },
  { id: 3, name: "Refresco 600ml", category: "Bebida", price: 20, stock: 5, minStock: 6, unit: "pza", emoji: "🥤" },
  { id: 4, name: "Torta Ahogada", category: "Comida", price: 55, stock: 12, minStock: 4, unit: "pza", emoji: "🥖" },
  { id: 5, name: "Café Americano", category: "Bebida", price: 25, stock: 30, minStock: 10, unit: "taza", emoji: "☕" },
  { id: 6, name: "Quesadilla", category: "Comida", price: 35, stock: 18, minStock: 5, unit: "pza", emoji: "🫓" },
  { id: 7, name: "Pozole", category: "Comida", price: 65, stock: 8, minStock: 3, unit: "plato", emoji: "🍲" },
  { id: 8, name: "Agua Mineral", category: "Bebida", price: 12, stock: 20, minStock: 6, unit: "pza", emoji: "💧" },
];

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F5F0E8;--surface:#FDFAF4;--border:#E2D9C8;
  --ink:#1C1409;--ink2:#7A6A52;--ink3:#B5A48C;
  --accent:#D4501A;--accent2:#2B6B3E;--warn:#C9882A;--card:#FFFFFF;
}
body{background:var(--bg)}
.app{min-height:100vh;background:var(--bg);font-family:'DM Sans',sans-serif;
  background-image:radial-gradient(circle at 15% 85%,rgba(212,80,26,.06) 0%,transparent 50%),
  radial-gradient(circle at 85% 15%,rgba(43,107,62,.06) 0%,transparent 50%)}

/* NAV */
.nav{background:var(--ink);padding:0 20px;display:flex;align-items:center;
  justify-content:space-between;height:52px;position:sticky;top:0;z-index:100}
.nav-brand{font-family:'Syne',sans-serif;font-weight:800;font-size:15px;color:#F5F0E8;letter-spacing:.06em}
.nav-brand span{color:var(--accent)}
.nav-tabs{display:flex;gap:3px;flex-wrap:wrap}
.nav-tab{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:.07em;
  text-transform:uppercase;padding:5px 11px;border-radius:4px;border:none;cursor:pointer;
  transition:all .15s;background:transparent;color:#7A6A52}
.nav-tab.active{background:var(--accent);color:white}
.nav-tab:not(.active):hover{background:rgba(245,240,232,.1);color:#F5F0E8}

/* WAITER LAYOUT */
.waiter-layout{display:grid;grid-template-columns:1fr 310px;height:calc(100vh - 52px)}
.left-panel{overflow-y:auto;padding:18px;border-right:1px solid var(--border)}
.right-panel{background:var(--card);display:flex;flex-direction:column;overflow:hidden}

/* SELECTORS */
.selectors{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.sel-group{display:flex;flex-direction:column;gap:4px;flex:1;min-width:110px}
.sel-group label{font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--ink2)}
select,input[type="text"],input[type="number"]{
  font-family:'DM Sans',sans-serif;font-size:14px;padding:8px 11px;
  border:1.5px solid var(--border);border-radius:7px;background:var(--surface);
  color:var(--ink);outline:none;transition:border-color .15s;width:100%;-webkit-appearance:none}
select:focus,input:focus{border-color:var(--accent)}

/* CATEGORY */
.cat-filter{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.cat-btn{font-size:11px;padding:4px 11px;border-radius:20px;border:1.5px solid var(--border);
  background:var(--surface);cursor:pointer;font-family:'DM Sans',sans-serif;
  font-weight:500;color:var(--ink2);transition:all .12s}
.cat-btn.active{background:var(--ink);color:#F5F0E8;border-color:var(--ink)}

/* PRODUCT GRID */
.product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:16px}
.product-card{border:1.5px solid var(--border);border-radius:10px;background:var(--surface);
  padding:10px 8px;cursor:pointer;transition:all .12s;position:relative;text-align:center}
.product-card:hover{border-color:var(--accent);background:#FFF8F5;transform:translateY(-1px)}
.product-card.low{border-color:var(--warn)}
.product-card.out{opacity:.35;cursor:not-allowed;pointer-events:none}
.pc-emoji{font-size:24px;margin-bottom:3px}
.pc-name{font-size:11px;font-weight:500;color:var(--ink);line-height:1.3;margin-bottom:3px}
.pc-price{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:var(--accent)}
.pc-stock{font-size:10px;color:var(--ink3);margin-top:1px}
.in-order-badge{position:absolute;top:-6px;right:-6px;background:var(--accent);color:white;
  font-family:'Syne',sans-serif;font-weight:700;font-size:11px;width:20px;height:20px;
  border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white}

/* ORDER PANEL */
.order-header{padding:14px 16px 10px;border-bottom:1px solid var(--border)}
.order-title{font-family:'Syne',sans-serif;font-weight:800;font-size:15px;color:var(--ink);margin-bottom:1px}
.order-sub{font-size:11px;color:var(--ink2)}
.order-items{flex:1;overflow-y:auto;padding:10px 16px}
.order-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100%;color:var(--ink3);font-size:12px;gap:7px;text-align:center}
.order-empty .icon{font-size:32px;opacity:.4}
.order-item{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid var(--border)}
.order-item:last-child{border-bottom:none}
.oi-info{flex:1;min-width:0}
.oi-name{font-size:12px;font-weight:500;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.oi-price{font-size:10px;color:var(--ink2);margin-top:1px}
.oi-stepper{display:flex;align-items:center;border:1.5px solid var(--border);border-radius:6px;overflow:hidden}
.oi-btn{width:26px;height:26px;border:none;background:var(--surface);font-size:15px;cursor:pointer;
  color:var(--ink);display:flex;align-items:center;justify-content:center;transition:background .1s;font-family:monospace}
.oi-btn:hover{background:var(--border)}
.oi-btn.remove:hover{background:#FDECEA;color:#C0392B}
.oi-qty{width:28px;height:26px;display:flex;align-items:center;justify-content:center;
  font-family:'Syne',sans-serif;font-weight:700;font-size:13px;
  border-left:1.5px solid var(--border);border-right:1.5px solid var(--border)}
.oi-subtotal{font-family:'Syne',sans-serif;font-weight:700;font-size:12px;color:var(--ink);min-width:42px;text-align:right}

/* ORDER FOOTER */
.order-footer{padding:12px 16px;border-top:1.5px solid var(--border);background:var(--surface)}
.order-total-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px}
.order-total-label{font-size:11px;color:var(--ink2)}
.order-total-val{font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:var(--ink)}
.order-items-count{font-size:10px;color:var(--ink3)}
.btn-confirm{width:100%;padding:13px;background:var(--accent);color:white;border:none;border-radius:8px;
  font-family:'Syne',sans-serif;font-size:14px;font-weight:700;letter-spacing:.04em;
  cursor:pointer;transition:all .15s}
.btn-confirm:hover{background:#B8411A}
.btn-confirm:disabled{background:var(--border);color:var(--ink3);cursor:not-allowed}
.btn-clear{width:100%;padding:7px;margin-top:7px;background:transparent;color:var(--ink3);
  border:1px solid var(--border);border-radius:7px;font-family:'DM Sans',sans-serif;
  font-size:11px;cursor:pointer;transition:all .15s}
.btn-clear:hover{border-color:#C0392B;color:#C0392B}

/* OWNER / CONFIG CONTENT */
.page-content{padding:22px;max-width:1040px;margin:0 auto}
.page-title{font-family:'Syne',sans-serif;font-weight:800;font-size:24px;color:var(--ink);margin-bottom:3px}
.page-sub{font-size:12px;color:var(--ink2);margin-bottom:22px}

/* STATS */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:20px}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:13px 15px}
.stat-card.warn{border-color:var(--warn);background:#FFFBF0}
.stat-label{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink2);margin-bottom:4px}
.stat-val{font-family:'Syne',sans-serif;font-weight:800;font-size:22px;color:var(--ink)}
.stat-card.warn .stat-val{color:var(--warn)}
.stat-sub{font-size:10px;color:var(--ink3);margin-top:2px}

/* CARD */
.card{background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:16px}
.card-header{padding:12px 16px;border-bottom:1px solid var(--border);
  display:flex;justify-content:space-between;align-items:center}
.card-title{font-family:'Syne',sans-serif;font-weight:700;font-size:11px;
  letter-spacing:.07em;text-transform:uppercase;color:var(--ink)}
.card-body{padding:16px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}

/* TABLE */
.data-table{width:100%;border-collapse:collapse;font-size:12px}
.data-table th{text-align:left;font-size:10px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--ink3);padding:7px 13px;border-bottom:1px solid var(--border);font-weight:400}
.data-table td{padding:9px 13px;border-bottom:1px solid var(--border);color:var(--ink);vertical-align:middle}
.data-table tr:last-child td{border-bottom:none}
.data-table tr:hover td{background:var(--surface)}

/* BADGE */
.badge{display:inline-block;font-size:10px;padding:2px 7px;border-radius:20px;font-weight:600}
.badge-ok{background:#E8F5ED;color:#2B6B3E}
.badge-warn{background:#FFF3DC;color:#C9882A}
.badge-low{background:#FDECEA;color:#C0392B}

/* BARS */
.bar-bg{height:4px;background:var(--border);border-radius:2px;width:60px;overflow:hidden;margin-top:3px}
.bar-fill{height:100%;border-radius:2px;transition:width .4s}

/* FORMS */
.form-row{display:flex;gap:8px;align-items:flex-end;margin-bottom:10px;flex-wrap:wrap}
.form-group{display:flex;flex-direction:column;gap:4px}
.form-group label{font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--ink2)}
.form-group input{min-width:80px}

/* BUTTONS */
.btn{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;padding:8px 14px;
  border-radius:7px;border:none;cursor:pointer;transition:all .15s;white-space:nowrap}
.btn-primary{background:var(--accent);color:white}
.btn-primary:hover{background:#B8411A}
.btn-dark{background:var(--ink);color:#F5F0E8}
.btn-dark:hover{background:#3D2F1A}
.btn-ghost{background:transparent;color:var(--ink3);border:1px solid var(--border)}
.btn-ghost:hover{border-color:#C0392B;color:#C0392B}
.btn-green{background:var(--accent2);color:white}
.btn-green:hover{background:#1E4F2D}

/* ALERT */
.alert-banner{background:#FFF3DC;border:1px solid #F0D080;border-radius:8px;
  padding:10px 14px;font-size:12px;color:#7A5A10;margin-bottom:16px;
  display:flex;align-items:center;gap:8px}

/* SALE BLOCK */
.sale-block{padding:10px 16px;border-bottom:1px solid var(--border)}
.sale-block:last-child{border-bottom:none}
.sale-meta-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:3px}
.sale-who{font-size:12px;font-weight:500;color:var(--ink)}
.sale-time{font-size:10px;color:var(--ink3)}
.sale-items-list{font-size:11px;color:var(--ink2);line-height:1.7}
.sale-total-line{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:var(--accent);margin-top:2px}

/* CONFIG LISTS */
.config-list{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.config-item{display:flex;align-items:center;gap:8px;padding:8px 12px;
  background:var(--surface);border:1px solid var(--border);border-radius:7px}
.config-item-text{flex:1;font-size:13px;color:var(--ink)}
.config-item input{flex:1;font-size:13px;background:transparent;border:none;
  border-bottom:1.5px solid var(--accent);border-radius:0;padding:2px 4px}

/* CORTE */
.corte-stat{text-align:center;padding:20px;background:var(--surface);
  border:1px solid var(--border);border-radius:10px}
.corte-val{font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:var(--ink);margin-bottom:4px}
.corte-label{font-size:11px;color:var(--ink2);letter-spacing:.08em;text-transform:uppercase}
.corte-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}

/* TOAST */
.toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%) translateY(100px);
  background:var(--ink);color:#F5F0E8;padding:12px 20px;border-radius:10px;
  font-size:13px;font-weight:500;transition:transform .3s cubic-bezier(.34,1.56,.64,1);
  z-index:999;white-space:nowrap}
.toast.show{transform:translateX(-50%) translateY(0)}

/* PRINT TICKET */
@media print{
  body *{visibility:hidden}
  .ticket-print,  .ticket-print *{visibility:visible}
  .ticket-print{position:fixed;top:0;left:0;width:80mm;font-family:monospace;font-size:12px;color:#000}
}
.ticket-preview{font-family:monospace;font-size:12px;background:#fff;
  border:1px dashed #ccc;padding:16px;border-radius:6px;max-width:300px;
  color:#000;line-height:1.8;white-space:pre-wrap}

@media(max-width:700px){
  .waiter-layout{grid-template-columns:1fr;height:auto}
  .right-panel{min-height:380px}
  .product-grid{grid-template-columns:repeat(2,1fr)}
  .stats-row{grid-template-columns:1fr 1fr}
  .two-col{grid-template-columns:1fr}
  .corte-grid{grid-template-columns:1fr 1fr}
}
`;

// ─── TICKET GENERATOR ────────────────────────────────────────────────────────
function buildTicket(sale, businessName) {
  const line = "─".repeat(32);
  const center = (t, w = 32) => {
    const pad = Math.max(0, Math.floor((w - t.length) / 2));
    return " ".repeat(pad) + t;
  };
  const row = (l, r, w = 32) => {
    const space = Math.max(1, w - l.length - r.length);
    return l + " ".repeat(space) + r;
  };
  let t = "";
  t += center(businessName) + "\n";
  t += center("COMANDA DE COCINA") + "\n";
  t += line + "\n";
  t += row("Mesa:", sale.table) + "\n";
  t += row("Mesero:", sale.waiter) + "\n";
  t += row("Hora:", sale.time) + "\n";
  t += line + "\n";
  t += "PRODUCTOS:\n";
  sale.items.forEach(i => {
    t += `  ${i.qty}x  ${i.name}\n`;
  });
  t += line + "\n";
  t += row("TOTAL:", `$${sale.total}`) + "\n";
  t += line + "\n";
  return t;
}

// ─── GUIDE COMPONENTS ────────────────────────────────────────────────────────
function GuideSection({ title, color, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 3, height: 14, background: color, borderRadius: 2 }} />
        {title}
      </div>
      <div style={{ paddingLeft: 12 }}>{children}</div>
    </div>
  );
}

function GuideStep({ n, text }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
      <div style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "var(--ink)", color: "#F5F0E8", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{n}</div>
      <div style={{ fontSize: 13, color: "var(--ink2)", lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function POSCompleto() {
  const [view, setView] = useState("waiter");

  // Persistent state
  const [config, setConfig] = useState(() => load("pos_config", DEFAULT_CONFIG));
  const [products, setProducts] = useState(() => load("pos_products", DEFAULT_PRODUCTS));
  const [sales, setSales] = useState(() => load("pos_sales", []));
  const [cancellations, setCancellations] = useState(() => load("pos_cancellations", []));

  // Session state
  const [order, setOrder] = useState([]);
  const [waiter, setWaiter] = useState(config.waiters[0] || "");
  const [table, setTable] = useState(config.tables[0] || "");
  const [cat, setCat] = useState("Todos");
  const [toast, setToast] = useState("");
  const [ticketSale, setTicketSale] = useState(null);

  // Config edit state
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Comida", price: "", stock: "", minStock: "", unit: "pza", emoji: "🍽️" });
  const [newWaiter, setNewWaiter] = useState("");
  const [newTable, setNewTable] = useState("");
  const [editWaiters, setEditWaiters] = useState(null);
  const [editTables, setEditTables] = useState(null);

  // Persist on change
  useEffect(() => { save("pos_config", config); }, [config]);
  useEffect(() => { save("pos_products", products); }, [products]);
  useEffect(() => { save("pos_sales", sales); }, [sales]);
  useEffect(() => { save("pos_cancellations", cancellations); }, [cancellations]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2600); };

  const categories = ["Todos", ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = cat === "Todos" ? products : products.filter(p => p.category === cat);
  const lowStock = products.filter(p => p.stock <= p.minStock);
  const totalVentas = sales.reduce((s, v) => s + v.total, 0);
  const orderTotal = order.reduce((s, i) => s + i.price * i.qty, 0);
  const orderCount = order.reduce((s, i) => s + i.qty, 0);

  // ── ORDER ACTIONS ──
  const addToOrder = (prod) => {
    if (prod.stock <= 0) return;
    setOrder(prev => {
      const ex = prev.find(i => i.productId === prod.id);
      if (ex) {
        if (ex.qty >= prod.stock) return prev;
        return prev.map(i => i.productId === prod.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { productId: prod.id, name: prod.name, emoji: prod.emoji, price: prod.price, qty: 1 }];
    });
  };

  const changeQty = (productId, delta) => {
    setOrder(prev => prev.map(i => i.productId === productId ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  };

  const confirmOrder = () => {
    if (order.length === 0) return;
    const now = new Date();
    const time = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    const newSale = { id: Date.now(), items: order.map(i => ({ name: i.name, qty: i.qty })), total: orderTotal, waiter, table, time };
    setProducts(prev => prev.map(p => {
      const item = order.find(i => i.productId === p.id);
      return item ? { ...p, stock: p.stock - item.qty } : p;
    }));
    setSales(prev => [newSale, ...prev]);
    setTicketSale(newSale);
    setOrder([]);
    showToast(`✅ Comanda de ${table} registrada`);
  };

  const cancelOrder = () => {
    if (order.length === 0) return;
    const now = new Date();
    const time = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    const cancelled = { id: Date.now(), items: order.map(i => ({ name: i.name, qty: i.qty })), total: orderTotal, waiter, table, time };
    setCancellations(prev => [cancelled, ...prev]);
    setOrder([]);
    showToast(`⚠️ Orden de ${table} cancelada por ${waiter}`);
  };

  const getOrderQty = (productId) => order.find(i => i.productId === productId)?.qty || 0;

  // ── PRINT TICKET ──
  const printTicket = (sale) => {
    const content = buildTicket(sale, config.businessName);
    const win = window.open("", "_blank", "width=350,height=500");
    win.document.write(`<pre style="font-family:monospace;font-size:13px;padding:16px">${content}</pre>`);
    win.document.close();
    win.print();
  };

  // ── STOCK HELPERS ──
  const stockColor = (p) => p.stock === 0 ? "#C0392B" : p.stock <= p.minStock ? "#C9882A" : "#2B6B3E";
  const stockPct = (p) => Math.min(100, (p.stock / (p.minStock * 3)) * 100);

  // ── PRODUCT CRUD ──
  const saveProduct = () => {
    const p = newProduct;
    if (!p.name || !p.price || !p.stock) return;
    const prod = { id: Date.now(), name: p.name, category: p.category, price: parseFloat(p.price), stock: parseInt(p.stock), minStock: parseInt(p.minStock) || 5, unit: p.unit, emoji: p.emoji };
    setProducts(prev => [...prev, prod]);
    setNewProduct({ name: "", category: "Comida", price: "", stock: "", minStock: "", unit: "pza", emoji: "🍽️" });
    showToast("✅ Producto agregado");
  };

  const deleteProduct = (id) => { setProducts(prev => prev.filter(p => p.id !== id)); showToast("Producto eliminado"); };

  const saveEditProduct = (prod) => {
    setProducts(prev => prev.map(p => p.id === prod.id ? prod : p));
    setEditingProduct(null);
    showToast("✅ Producto actualizado");
  };

  // ── CORTE ──
  const topProducts = () => {
    const map = {};
    sales.forEach(s => s.items.forEach(i => { map[i.name] = (map[i.name] || 0) + i.qty; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const topWaiters = () => {
    const map = {};
    sales.forEach(s => { map[s.waiter] = (map[s.waiter] || 0) + s.total; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  };

  const closeCaja = () => {
    if (!window.confirm(`¿Cerrar corte de caja? Se borrarán las ${sales.length} órdenes del día.`)) return;
    setSales([]);
    showToast("✅ Corte de caja realizado");
  };

  return (
    <>
      <style>{S}</style>
      <div className="app">
        {/* NAV */}
        <nav className="nav">
          <div className="nav-brand">{config.businessName.split(" ")[0].toUpperCase()}<span>+</span></div>
          <div className="nav-tabs">
            <button className={`nav-tab ${view === "waiter" ? "active" : ""}`} onClick={() => setView("waiter")}>🧾 Mesero</button>
            <button className={`nav-tab ${view === "owner" ? "active" : ""}`} onClick={() => setView("owner")}>📊 Dueño</button>
            <button className={`nav-tab ${view === "corte" ? "active" : ""}`} onClick={() => setView("corte")}>💰 Corte</button>
            <button className={`nav-tab ${view === "config" ? "active" : ""}`} onClick={() => setView("config")}>⚙️ Config</button>
            <button className={`nav-tab ${view === "guide" ? "active" : ""}`} onClick={() => setView("guide")}>📖 Guía</button>
          </div>
        </nav>

        {/* ══ MESERO ══════════════════════════════════════════════════════════ */}
        {view === "waiter" && (
          <div className="waiter-layout">
            <div className="left-panel">
              <div className="selectors">
                <div className="sel-group">
                  <label>Mesero</label>
                  <select value={waiter} onChange={e => setWaiter(e.target.value)}>
                    {config.waiters.map(w => <option key={w}>{w}</option>)}
                  </select>
                </div>
                <div className="sel-group">
                  <label>Mesa</label>
                  <select value={table} onChange={e => setTable(e.target.value)}>
                    {config.tables.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="cat-filter">
                {categories.map(c => (
                  <button key={c} className={`cat-btn ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
                ))}
              </div>

              <div className="product-grid">
                {filtered.map(p => {
                  const inOrder = getOrderQty(p.id);
                  return (
                    <div key={p.id} className={`product-card ${p.stock === 0 ? "out" : p.stock <= p.minStock ? "low" : ""}`} onClick={() => addToOrder(p)}>
                      {inOrder > 0 && <div className="in-order-badge">{inOrder}</div>}
                      <div className="pc-emoji">{p.emoji}</div>
                      <div className="pc-name">{p.name}</div>
                      <div className="pc-price">${p.price}</div>
                      <div className="pc-stock">{p.stock === 0 ? "Agotado" : `${p.stock} disp.`}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COMANDA */}
            <div className="right-panel">
              <div className="order-header">
                <div className="order-title">Comanda</div>
                <div className="order-sub">{waiter} · {table}</div>
              </div>

              <div className="order-items">
                {order.length === 0
                  ? <div className="order-empty"><div className="icon">🧾</div><div>Toca un producto para agregarlo</div></div>
                  : order.map(item => (
                    <div className="order-item" key={item.productId}>
                      <div style={{ fontSize: 18 }}>{item.emoji}</div>
                      <div className="oi-info">
                        <div className="oi-name">{item.name}</div>
                        <div className="oi-price">${item.price} c/u</div>
                      </div>
                      <div className="oi-stepper">
                        <button className="oi-btn remove" onClick={() => changeQty(item.productId, -1)}>−</button>
                        <div className="oi-qty">{item.qty}</div>
                        <button className="oi-btn" onClick={() => changeQty(item.productId, 1)}>+</button>
                      </div>
                      <div className="oi-subtotal">${item.price * item.qty}</div>
                    </div>
                  ))}
              </div>

              {/* Ticket rápido del último pedido */}
              {ticketSale && order.length === 0 && (
                <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", background: "#F0FAF4" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--accent2)", fontWeight: 500 }}>✅ Última comanda: {ticketSale.table}</span>
                    <button className="btn btn-green" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => printTicket(ticketSale)}>
                      🖨️ Imprimir ticket
                    </button>
                  </div>
                </div>
              )}

              <div className="order-footer">
                <div className="order-total-row">
                  <div>
                    <div className="order-total-label">Total de la orden</div>
                    <div className="order-items-count">{orderCount} producto{orderCount !== 1 ? "s" : ""}</div>
                  </div>
                  <div className="order-total-val">${orderTotal}</div>
                </div>
                <button className="btn-confirm" onClick={confirmOrder} disabled={order.length === 0}>
                  Confirmar Orden →
                </button>
                {order.length > 0 && <button className="btn-clear" onClick={cancelOrder}>Cancelar orden</button>}
              </div>
            </div>
          </div>
        )}

        {/* ══ DUEÑO ═══════════════════════════════════════════════════════════ */}
        {view === "owner" && (
          <div className="page-content">
            <div className="page-title">Panel del Dueño</div>
            <div className="page-sub">Inventario · Órdenes del día</div>

            {lowStock.length > 0 && (
              <div className="alert-banner">⚠️ <strong>{lowStock.length} producto(s) con stock bajo:</strong> {lowStock.map(p => p.name).join(", ")}</div>
            )}

            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Órdenes Hoy</div>
                <div className="stat-val">{sales.length}</div>
                <div className="stat-sub">comandas</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Recaudado</div>
                <div className="stat-val">${totalVentas}</div>
                <div className="stat-sub">MXN</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Productos</div>
                <div className="stat-val">{products.length}</div>
                <div className="stat-sub">en menú</div>
              </div>
              <div className={`stat-card ${lowStock.length > 0 ? "warn" : ""}`}>
                <div className="stat-label">Stock Bajo</div>
                <div className="stat-val">{lowStock.length}</div>
                <div className="stat-sub">por surtir</div>
              </div>
            </div>

            <div className="two-col">
              {/* Inventario */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Inventario</span>
                </div>
                <table className="data-table">
                  <thead><tr><th>Producto</th><th>Stock</th><th>Estado</th></tr></thead>
                  <tbody>
                    {products.map(p => {
                      const s = p.stock === 0 ? "Agotado" : p.stock <= p.minStock ? "Bajo" : "OK";
                      const bc = p.stock === 0 ? "badge-low" : p.stock <= p.minStock ? "badge-warn" : "badge-ok";
                      return (
                        <tr key={p.id}>
                          <td><span style={{ marginRight: 5 }}>{p.emoji}</span>{p.name}</td>
                          <td>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>{p.stock} <span style={{ fontSize: 10, fontWeight: 400, color: "var(--ink3)" }}>{p.unit}</span></div>
                            <div className="bar-bg"><div className="bar-fill" style={{ width: `${stockPct(p)}%`, background: stockColor(p) }} /></div>
                          </td>
                          <td><span className={`badge ${bc}`}>{s}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Surtir */}
                <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <select style={{ flex: 1 }} id="restock-sel">
                    {products.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
                  </select>
                  <input type="number" id="restock-qty" defaultValue={10} style={{ width: 70 }} />
                  <button className="btn btn-dark" onClick={() => {
                    const pid = parseInt(document.getElementById("restock-sel").value);
                    const qty = parseInt(document.getElementById("restock-qty").value);
                    if (!qty || qty <= 0) return;
                    setProducts(prev => prev.map(p => p.id === pid ? { ...p, stock: p.stock + qty } : p));
                    showToast("✅ Inventario actualizado");
                  }}>+ Surtir</button>
                </div>
              </div>

              {/* Órdenes */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Órdenes del Día</span>
                  <span style={{ fontSize: 11, color: "var(--ink2)" }}>${totalVentas} total</span>
                </div>
                <div style={{ maxHeight: 420, overflowY: "auto" }}>
                  {sales.length === 0
                    ? <div style={{ padding: 24, textAlign: "center", color: "var(--ink3)", fontSize: 12 }}>Sin órdenes hoy</div>
                    : sales.map(s => (
                      <div className="sale-block" key={s.id}>
                        <div className="sale-meta-row">
                          <div className="sale-who">🪑 {s.table} · {s.waiter}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="sale-time">{s.time}</div>
                            <button className="btn btn-ghost" style={{ fontSize: 10, padding: "3px 8px" }} onClick={() => printTicket(s)}>🖨️</button>
                          </div>
                        </div>
                        <div className="sale-items-list">{s.items.map((it, i) => <div key={i}>• {it.qty}x {it.name}</div>)}</div>
                        <div className="sale-total-line">${s.total}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Cancelaciones */}
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header">
                <span className="card-title">⚠️ Órdenes Canceladas</span>
                <span style={{ fontSize: 11, color: "var(--ink2)" }}>{cancellations.length} cancelaciones</span>
              </div>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {cancellations.length === 0
                  ? <div style={{ padding: 20, textAlign: "center", color: "var(--ink3)", fontSize: 12 }}>Sin cancelaciones hoy ✅</div>
                  : cancellations.map(c => (
                    <div className="sale-block" key={c.id} style={{ borderLeft: "3px solid #C0392B" }}>
                      <div className="sale-meta-row">
                        <div className="sale-who" style={{ color: "#C0392B" }}>❌ {c.table} · {c.waiter}</div>
                        <div className="sale-time">{c.time}</div>
                      </div>
                      <div className="sale-items-list">{c.items.map((it, i) => <div key={i}>• {it.qty}x {it.name}</div>)}</div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#C0392B", marginTop: 2 }}>-${c.total}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )} ═══════════════════════════════════════════════════════════ */}
        {view === "corte" && (
          <div className="page-content">
            <div className="page-title">Corte de Caja</div>
            <div className="page-sub">Resumen del dia - Cierre de turno</div>

            <div className="corte-grid">
              <div className="corte-stat">
                <div className="corte-val">${totalVentas}</div>
                <div className="corte-label">Total del día</div>
              </div>
              <div className="corte-stat">
                <div className="corte-val">{sales.length}</div>
                <div className="corte-label">Órdenes</div>
              </div>
              <div className="corte-stat">
                <div className="corte-val">${sales.length > 0 ? Math.round(totalVentas / sales.length) : 0}</div>
                <div className="corte-label">Ticket promedio</div>
              </div>
            </div>

            <div className="two-col">
              {/* Más vendidos */}
              <div className="card">
                <div className="card-header"><span className="card-title">Más Vendidos</span></div>
                <div className="card-body">
                  {topProducts().length === 0
                    ? <div style={{ color: "var(--ink3)", fontSize: 12 }}>Sin datos</div>
                    : topProducts().map(([name, qty], i) => (
                      <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < topProducts().length - 1 ? "1px solid var(--border)" : "none", fontSize: 13 }}>
                        <span style={{ color: "var(--ink)" }}>{name}</span>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>{qty} pza</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Por mesero */}
              <div className="card">
                <div className="card-header"><span className="card-title">Por Mesero</span></div>
                <div className="card-body">
                  {topWaiters().length === 0
                    ? <div style={{ color: "var(--ink3)", fontSize: 12 }}>Sin datos</div>
                    : topWaiters().map(([name, total], i) => (
                      <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < topWaiters().length - 1 ? "1px solid var(--border)" : "none", fontSize: 13 }}>
                        <span style={{ color: "var(--ink)" }}>{name}</span>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "var(--accent2)" }}>${total}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button className="btn btn-dark" onClick={() => {
                const content = `CORTE DE CAJA - ${config.businessName}\n${"═".repeat(32)}\nFecha: ${new Date().toLocaleDateString("es-MX")}\nÓrdenes: ${sales.length}\nTotal: $${totalVentas}\nTicket prom: $${sales.length > 0 ? Math.round(totalVentas / sales.length) : 0}\n\nMÁS VENDIDOS:\n${topProducts().map(([n, q]) => `  ${n}: ${q} pza`).join("\n")}\n\nPOR MESERO:\n${topWaiters().map(([n, t]) => `  ${n}: $${t}`).join("\n")}`;
                const win = window.open("", "_blank", "width=350,height=500");
                win.document.write(`<pre style="font-family:monospace;font-size:13px;padding:16px">${content}</pre>`);
                win.document.close(); win.print();
              }}>🖨️ Imprimir corte</button>
              <button className="btn btn-ghost" style={{ color: "#C0392B", borderColor: "#C0392B" }} onClick={closeCaja}>
                🔒 Cerrar caja y borrar órdenes
              </button>
            </div>
          </div>
        )}

        {/* ══ CONFIGURACIÓN ═══════════════════════════════════════════════════ */}
        {view === "config" && (
          <div className="page-content">
            <div className="page-title">Configuración</div>
            <div className="page-sub">Personaliza tu negocio</div>

            {/* Nombre del negocio */}
            <div className="card">
              <div className="card-header"><span className="card-title">Negocio</span></div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Nombre del negocio</label>
                    <input type="text" value={config.businessName}
                      onChange={e => setConfig(c => ({ ...c, businessName: e.target.value }))} />
                  </div>
                  <button className="btn btn-primary" onClick={() => showToast("✅ Guardado")}>Guardar</button>
                </div>
              </div>
            </div>

            {/* Meseros */}
            <div className="card">
              <div className="card-header"><span className="card-title">Meseros</span></div>
              <div className="card-body">
                <div className="config-list">
                  {(editWaiters || config.waiters).map((w, i) => (
                    <div className="config-item" key={i}>
                      {editWaiters
                        ? <input className="config-item input" value={w} onChange={e => {
                            const arr = [...editWaiters]; arr[i] = e.target.value; setEditWaiters(arr);
                          }} />
                        : <span className="config-item-text">👤 {w}</span>}
                      <button className="btn btn-ghost" style={{ fontSize: 10, padding: "3px 8px" }} onClick={() => {
                        const arr = (editWaiters || config.waiters).filter((_, j) => j !== i);
                        setConfig(c => ({ ...c, waiters: arr }));
                        if (editWaiters) setEditWaiters(arr);
                        showToast("Mesero eliminado");
                      }}>✕</button>
                    </div>
                  ))}
                </div>
                <div className="form-row">
                  <input type="text" placeholder="Nombre del mesero" value={newWaiter} onChange={e => setNewWaiter(e.target.value)} style={{ flex: 1 }} />
                  <button className="btn btn-primary" onClick={() => {
                    if (!newWaiter.trim()) return;
                    setConfig(c => ({ ...c, waiters: [...c.waiters, newWaiter.trim()] }));
                    setNewWaiter(""); showToast("✅ Mesero agregado");
                  }}>+ Agregar</button>
                </div>
                {editWaiters && (
                  <button className="btn btn-dark" style={{ marginTop: 8 }} onClick={() => {
                    setConfig(c => ({ ...c, waiters: editWaiters })); setEditWaiters(null); showToast("✅ Nombres guardados");
                  }}>💾 Guardar nombres</button>
                )}
                {!editWaiters && (
                  <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setEditWaiters([...config.waiters])}>✏️ Editar nombres</button>
                )}
              </div>
            </div>

            {/* Mesas */}
            <div className="card">
              <div className="card-header"><span className="card-title">Mesas</span></div>
              <div className="card-body">
                <div className="config-list">
                  {(editTables || config.tables).map((t, i) => (
                    <div className="config-item" key={i}>
                      {editTables
                        ? <input className="config-item input" value={t} onChange={e => {
                            const arr = [...editTables]; arr[i] = e.target.value; setEditTables(arr);
                          }} />
                        : <span className="config-item-text">🪑 {t}</span>}
                      <button className="btn btn-ghost" style={{ fontSize: 10, padding: "3px 8px" }} onClick={() => {
                        const arr = (editTables || config.tables).filter((_, j) => j !== i);
                        setConfig(c => ({ ...c, tables: arr }));
                        if (editTables) setEditTables(arr);
                      }}>✕</button>
                    </div>
                  ))}
                </div>
                <div className="form-row">
                  <input type="text" placeholder="Nombre de mesa" value={newTable} onChange={e => setNewTable(e.target.value)} style={{ flex: 1 }} />
                  <button className="btn btn-primary" onClick={() => {
                    if (!newTable.trim()) return;
                    setConfig(c => ({ ...c, tables: [...c.tables, newTable.trim()] }));
                    setNewTable(""); showToast("✅ Mesa agregada");
                  }}>+ Agregar</button>
                </div>
                {editTables && (
                  <button className="btn btn-dark" style={{ marginTop: 8 }} onClick={() => {
                    setConfig(c => ({ ...c, tables: editTables })); setEditTables(null); showToast("✅ Mesas guardadas");
                  }}>💾 Guardar mesas</button>
                )}
                {!editTables && (
                  <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setEditTables([...config.tables])}>✏️ Editar nombres</button>
                )}
              </div>
            </div>

            {/* Productos */}
            <div className="card">
              <div className="card-header"><span className="card-title">Productos del Menú</span></div>
              <div className="card-body">
                {/* Agregar nuevo */}
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink2)", marginBottom: 10 }}>Nuevo producto</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Emoji</label>
                      <input type="text" value={newProduct.emoji} onChange={e => setNewProduct(p => ({ ...p, emoji: e.target.value }))} style={{ width: 60 }} />
                    </div>
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>Nombre</label>
                      <input type="text" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="Nombre del producto" />
                    </div>
                    <div className="form-group">
                      <label>Categoría</label>
                      <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}>
                        <option>Comida</option><option>Bebida</option><option>Postre</option><option>Extra</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Precio $</label>
                      <input type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="0" style={{ width: 80 }} />
                    </div>
                    <div className="form-group">
                      <label>Stock inicial</label>
                      <input type="number" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))} placeholder="0" style={{ width: 80 }} />
                    </div>
                    <div className="form-group">
                      <label>Mínimo</label>
                      <input type="number" value={newProduct.minStock} onChange={e => setNewProduct(p => ({ ...p, minStock: e.target.value }))} placeholder="5" style={{ width: 70 }} />
                    </div>
                    <div className="form-group">
                      <label>Unidad</label>
                      <input type="text" value={newProduct.unit} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))} placeholder="pza" style={{ width: 70 }} />
                    </div>
                    <button className="btn btn-primary" style={{ alignSelf: "flex-end" }} onClick={saveProduct}>+ Agregar</button>
                  </div>
                </div>

                {/* Lista editable */}
                <table className="data-table">
                  <thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Mín.</th><th></th></tr></thead>
                  <tbody>
                    {products.map(p => (
                      editingProduct?.id === p.id
                        ? <tr key={p.id} style={{ background: "#FFFBF0" }}>
                            <td><input value={editingProduct.emoji} onChange={e => setEditingProduct(ep => ({ ...ep, emoji: e.target.value }))} style={{ width: 40, marginRight: 6 }} /><input value={editingProduct.name} onChange={e => setEditingProduct(ep => ({ ...ep, name: e.target.value }))} style={{ width: 140 }} /></td>
                            <td><input type="number" value={editingProduct.price} onChange={e => setEditingProduct(ep => ({ ...ep, price: parseFloat(e.target.value) }))} style={{ width: 70 }} /></td>
                            <td><input type="number" value={editingProduct.stock} onChange={e => setEditingProduct(ep => ({ ...ep, stock: parseInt(e.target.value) }))} style={{ width: 60 }} /></td>
                            <td><input type="number" value={editingProduct.minStock} onChange={e => setEditingProduct(ep => ({ ...ep, minStock: parseInt(e.target.value) }))} style={{ width: 55 }} /></td>
                            <td style={{ display: "flex", gap: 4 }}>
                              <button className="btn btn-primary" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => saveEditProduct(editingProduct)}>✓</button>
                              <button className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setEditingProduct(null)}>✕</button>
                            </td>
                          </tr>
                        : <tr key={p.id}>
                            <td><span style={{ marginRight: 6 }}>{p.emoji}</span>{p.name}</td>
                            <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>${p.price}</td>
                            <td>{p.stock} {p.unit}</td>
                            <td style={{ color: "var(--ink3)" }}>{p.minStock}</td>
                            <td style={{ display: "flex", gap: 4 }}>
                              <button className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setEditingProduct({ ...p })}>✏️</button>
                              <button className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => deleteProduct(p.id)}>🗑️</button>
                            </td>
                          </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* ══ GUÍA ════════════════════════════════════════════════════════════ */}
        {view === "guide" && (
          <div className="page-content">
            <div className="page-title">Guía de Uso</div>
            <div className="page-sub">Impresora de tickets · Meseros · Dueño</div>

            {/* MESEROS */}
            <div className="card">
              <div className="card-header"><span className="card-title">🧾 Cómo usan el sistema los meseros</span></div>
              <div className="card-body">
                <GuideSection title="Tomar una orden" color="var(--accent2)">
                  <GuideStep n="1" text="Selecciona tu nombre en 'Mesero' y la mesa que atiendes." />
                  <GuideStep n="2" text="Toca cada producto que pide el cliente — puedes agregar varios productos distintos en la misma orden." />
                  <GuideStep n="3" text="Si el cliente pide más cantidad del mismo producto, tócalo otra vez o usa el botón + en la comanda." />
                  <GuideStep n="4" text="Revisa el total en la parte de abajo y toca 'Confirmar Orden'. La orden queda registrada y el ticket se imprime en cocina." />
                </GuideSection>
                <GuideSection title="Cancelar una orden" color="var(--accent)">
                  <GuideStep n="1" text="Si el cliente cambia de opinión antes de confirmar, toca 'Cancelar orden' en la parte de abajo." />
                  <GuideStep n="2" text="La cancelación queda registrada con tu nombre, la mesa y la hora — el dueño puede verla en su panel." />
                  <GuideStep n="3" text="Una orden ya confirmada no se puede cancelar desde aquí — avisa al dueño directamente." />
                </GuideSection>
              </div>
            </div>

            {/* DUEÑO */}
            <div className="card">
              <div className="card-header"><span className="card-title">📊 Cómo usa el sistema el dueño</span></div>
              <div className="card-body">
                <GuideSection title="Durante el servicio" color="var(--accent2)">
                  <GuideStep n="1" text="Abre el panel 📊 Dueño para ver todas las órdenes del día en tiempo real." />
                  <GuideStep n="2" text="Si hay stock bajo aparece una alerta en rojo en la parte de arriba — surtir desde el mismo panel." />
                  <GuideStep n="3" text="Las órdenes canceladas aparecen abajo en rojo con el nombre del mesero que las canceló y la hora." />
                  <GuideStep n="4" text="Puedes reimprimir cualquier ticket tocando 🖨️ junto a cada orden." />
                </GuideSection>
                <GuideSection title="Al cerrar el día" color="var(--accent)">
                  <GuideStep n="1" text="Abre 💰 Corte de Caja para ver el total del día, órdenes, ticket promedio y ranking por mesero." />
                  <GuideStep n="2" text="Toca 'Imprimir corte' para tener el resumen en papel." />
                  <GuideStep n="3" text="Toca 'Cerrar caja' para limpiar las órdenes del día y empezar fresco al día siguiente." />
                </GuideSection>
              </div>
            </div>

            {/* IMPRESORA */}
            <div className="card">
              <div className="card-header"><span className="card-title">🖨️ Conectar la impresora de tickets</span></div>
              <div className="card-body">
                <GuideSection title="Qué comprar" color="var(--accent2)">
                  <GuideStep n="1" text="Busca en Mercado Libre: 'impresora térmica 80mm WiFi POS'. Costo: $800–1,500 MXN." />
                  <GuideStep n="2" text="Que tenga WiFi integrado — así cualquier celular en la misma red puede imprimir sin cables." />
                  <GuideStep n="3" text="Marcas confiables: Epson TM-T20, MUNBYN, RONGTA. Todas funcionan igual para este sistema." />
                </GuideSection>
                <GuideSection title="Conectarla al WiFi del negocio" color="var(--accent)">
                  <GuideStep n="1" text="Enciende la impresora y mantén presionado el botón FEED hasta que imprima una hoja de configuración." />
                  <GuideStep n="2" text="Descarga la app del fabricante en tu celular y úsala para conectar la impresora al WiFi del negocio." />
                  <GuideStep n="3" text="Una vez conectada, todos los celulares en esa red WiFi pueden imprimir a ella." />
                </GuideSection>
                <GuideSection title="Imprimir desde el celular" color="var(--warn)">
                  <GuideStep n="1" text="Android: ve a Configuración → Conexiones → Impresión y agrega la impresora por WiFi." />
                  <GuideStep n="2" text="iPhone: las impresoras con AirPrint aparecen automáticamente si están en la misma red WiFi." />
                  <GuideStep n="3" text="Al tocar 🖨️ en la app, selecciona la impresora térmica en la lista — el ticket sale directo." />
                </GuideSection>
              </div>
            </div>

          </div>
        )}

      </div>

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}
