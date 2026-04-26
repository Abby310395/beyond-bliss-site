// =====================================================
// Beyond Bliss Creations — App Logic
// Cart · Filters · Razorpay · WhatsApp ordering
// =====================================================

const CONFIG = {
  // ⚠️ REPLACE WITH YOUR RAZORPAY KEY ID
  // Sign up at https://razorpay.com → Settings → API Keys
  // Use rzp_test_XXXX for testing, rzp_live_XXXX for real payments
  RAZORPAY_KEY_ID: "rzp_test_REPLACE_ME",
  BUSINESS_NAME: "Beyond Bliss Creations",
  BUSINESS_DESC: "Handcrafted Heritage from Saharanpur",
  WHATSAPP_NUMBER: "919797592768", // E.164 without +
  CONTACT_PHONE: "+919797592768",
  THEME_COLOR: "#2a1810",
};

// State
let cart = JSON.parse(localStorage.getItem("bb_cart") || "[]");
let activeFilter = "all";
let pendingOrder = null;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const grid = $("#productGrid");
const filtersEl = $("#filters");

// ==================== FILTERS ====================
function buildFilters() {
  const counts = { all: PRODUCTS.length };
  PRODUCTS.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
  
  const chips = [
    `<button class="chip active" data-filter="all">All <span class="chip-count">${counts.all}</span></button>`
  ];
  Object.entries(CATEGORIES).forEach(([key, label]) => {
    if (counts[key]) {
      chips.push(`<button class="chip" data-filter="${key}">${label} <span class="chip-count">${counts[key]}</span></button>`);
    }
  });
  filtersEl.innerHTML = chips.join("");
  
  filtersEl.addEventListener("click", e => {
    const c = e.target.closest(".chip");
    if (!c) return;
    activeFilter = c.dataset.filter;
    $$(".chip", filtersEl).forEach(x => x.classList.toggle("active", x === c));
    renderProducts();
  });
}

// ==================== PRODUCTS ====================
function renderProducts() {
  const items = activeFilter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === activeFilter);
  grid.innerHTML = items.map((p, i) => `
    <article class="card" style="animation-delay:${(i % 12) * 50}ms">
      <div class="card-img">
        <span class="card-tag">${p.categoryLabel}</span>
        ${p.discount ? `<span class="card-off">${p.discount}% OFF</span>` : ""}
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.opacity='0.3';this.alt='Image unavailable'"/>
      </div>
      <div class="card-body">
        <span class="card-dim">${p.dimensions || "Sheesham wood"}</span>
        <h3 class="card-name">${p.name}</h3>
        <p class="card-desc">${p.desc}</p>
        <div class="card-foot">
          <div class="price">
            <span class="price-now">${inr(p.price)}</span>
            <span class="price-mrp">${inr(p.mrp)}</span>
          </div>
          <button class="btn-add" data-slug="${p.slug}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>
            Add
          </button>
        </div>
        <a class="card-wa" href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'm interested in: ${p.name} — ${inr(p.price)}. Is it in stock?`)}" target="_blank" rel="noopener">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/></svg>
          Ask on WhatsApp
        </a>
      </div>
    </article>
  `).join("");
  
  $$(".btn-add", grid).forEach(b => {
    b.addEventListener("click", e => {
      e.stopPropagation();
      addToCart(b.dataset.slug);
      b.classList.add("added");
      b.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg> Added`;
      setTimeout(() => {
        b.classList.remove("added");
        b.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg> Add`;
      }, 1400);
    });
  });
}

// ==================== CART ====================
function saveCart() { localStorage.setItem("bb_cart", JSON.stringify(cart)); }

function addToCart(slug) {
  const p = PRODUCTS.find(x => x.slug === slug);
  if (!p) return;
  const existing = cart.find(c => c.slug === slug);
  if (existing) existing.qty += 1;
  else cart.push({ slug, qty: 1 });
  saveCart();
  updateCartUI();
  toast(`Added "${p.name}"`);
  bumpCart();
}

function changeQty(slug, delta) {
  const it = cart.find(c => c.slug === slug);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) cart = cart.filter(c => c.slug !== slug);
  saveCart();
  updateCartUI();
}

function removeItem(slug) {
  cart = cart.filter(c => c.slug !== slug);
  saveCart();
  updateCartUI();
}

function cartTotals() {
  let subtotal = 0, count = 0;
  cart.forEach(c => {
    const p = PRODUCTS.find(x => x.slug === c.slug);
    if (p) { subtotal += p.price * c.qty; count += c.qty; }
  });
  return { subtotal, count, total: subtotal };
}

function updateCartUI() {
  const { count, total } = cartTotals();
  const cc = $("#cartCount");
  cc.textContent = count;
  cc.classList.toggle("hide", count === 0);
  $("#subTotal").textContent = inr(total);
  $("#grandTotal").textContent = inr(total);
  $("#cartFoot").style.display = count > 0 ? "block" : "none";
  
  const body = $("#cartBody");
  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <h4>Your cart is empty</h4>
        <p>Find something you'll love.</p>
      </div>`;
    return;
  }
  body.innerHTML = cart.map(c => {
    const p = PRODUCTS.find(x => x.slug === c.slug);
    if (!p) return "";
    return `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${p.image}" alt="${p.name}"/></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${inr(p.price)} × ${c.qty} = <strong>${inr(p.price * c.qty)}</strong></div>
          <div class="qty-row">
            <div class="qty">
              <button data-action="dec" data-slug="${p.slug}">−</button>
              <span>${c.qty}</span>
              <button data-action="inc" data-slug="${p.slug}">+</button>
            </div>
            <button class="cart-rm" data-action="rm" data-slug="${p.slug}">Remove</button>
          </div>
        </div>
      </div>`;
  }).join("");
  
  $$("#cartBody [data-action]").forEach(b => {
    b.addEventListener("click", () => {
      const slug = b.dataset.slug;
      if (b.dataset.action === "inc") changeQty(slug, 1);
      else if (b.dataset.action === "dec") changeQty(slug, -1);
      else if (b.dataset.action === "rm") removeItem(slug);
    });
  });
}

function bumpCart() {
  const cc = $("#cartCount");
  cc.classList.remove("bump");
  void cc.offsetWidth;
  cc.classList.add("bump");
}

// ==================== DRAWER ====================
const drawer = $("#cartDrawer");
const overlay = $("#cartOverlay");
function openCart() { drawer.classList.add("open"); overlay.classList.add("show"); document.body.style.overflow = "hidden"; }
function closeCart() { drawer.classList.remove("open"); overlay.classList.remove("show"); document.body.style.overflow = ""; }
$("#cartBtn").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

// ==================== TOAST ====================
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
}

// ==================== WHATSAPP ORDER ====================
$("#waOrderBtn").addEventListener("click", () => {
  if (!cart.length) return;
  const lines = ["Hi! I'd like to order:", ""];
  cart.forEach(c => {
    const p = PRODUCTS.find(x => x.slug === c.slug);
    if (p) lines.push(`• ${p.name} × ${c.qty} = ${inr(p.price * c.qty)}`);
  });
  const { total } = cartTotals();
  lines.push("", `*Total: ${inr(total)}*`, "(Free shipping pan-India)");
  const msg = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`, "_blank");
});

// ==================== CHECKOUT ====================
const modal = $("#checkoutModal");
$("#checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return;
  closeCart();
  modal.classList.add("show");
});
$("#modalClose").addEventListener("click", () => modal.classList.remove("show"));
modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show"); });

$("#checkoutForm").addEventListener("submit", e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const customer = Object.fromEntries(fd);
  modal.classList.remove("show");
  startRazorpay(customer);
});

// ==================== RAZORPAY ====================
function startRazorpay(customer) {
  const { total } = cartTotals();
  
  if (CONFIG.RAZORPAY_KEY_ID === "rzp_test_REPLACE_ME") {
    // No key configured — fall back to WhatsApp order with details
    const lines = [
      "Hi! New order:",
      `Name: ${customer.name}`,
      `Phone: ${customer.phone}`,
      `Email: ${customer.email}`,
      `Address: ${customer.address}, ${customer.city} — ${customer.pincode}, ${customer.state}`,
      "",
      "Items:"
    ];
    cart.forEach(c => {
      const p = PRODUCTS.find(x => x.slug === c.slug);
      if (p) lines.push(`• ${p.name} × ${c.qty} = ${inr(p.price * c.qty)}`);
    });
    lines.push("", `*Total: ${inr(total)}* (FREE shipping)`);
    const msg = encodeURIComponent(lines.join("\n"));
    // Soft notice + WhatsApp redirect — customer sees a friendly message
    if (confirm("Almost done! 🎉\n\nWe'll send your order details to our team on WhatsApp to confirm and arrange payment via UPI / bank transfer.\n\nClick OK to continue.")) {
      window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    }
    return;
  }
  
  const rzp = new Razorpay({
    key: CONFIG.RAZORPAY_KEY_ID,
    amount: total * 100, // paise
    currency: "INR",
    name: CONFIG.BUSINESS_NAME,
    description: CONFIG.BUSINESS_DESC,
    image: "/logo.png", // optional
    prefill: {
      name: customer.name,
      email: customer.email,
      contact: customer.phone,
    },
    notes: {
      address: `${customer.address}, ${customer.city}, ${customer.pincode}, ${customer.state}`,
      items: cart.map(c => {
        const p = PRODUCTS.find(x => x.slug === c.slug);
        return p ? `${p.name} × ${c.qty}` : "";
      }).join(" | "),
    },
    theme: { color: CONFIG.THEME_COLOR },
    handler: function (response) {
      // Payment success — save & confirm
      const orderId = response.razorpay_payment_id;
      // Send confirmation via WhatsApp
      const lines = [
        `✅ ORDER CONFIRMED · ${orderId}`,
        `Name: ${customer.name} | ${customer.phone}`,
        `Address: ${customer.address}, ${customer.city} ${customer.pincode}`,
        "",
        "Items:"
      ];
      cart.forEach(c => {
        const p = PRODUCTS.find(x => x.slug === c.slug);
        if (p) lines.push(`• ${p.name} × ${c.qty} = ${inr(p.price * c.qty)}`);
      });
      lines.push("", `Paid: ${inr(total)}`);
      window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
      cart = [];
      saveCart();
      updateCartUI();
      alert(`Payment successful! Order ID: ${orderId}\nWe've opened WhatsApp to send your confirmation.`);
    },
    modal: {
      ondismiss: function () { /* user cancelled */ }
    }
  });
  rzp.open();
}

// ==================== FOOTER CATEGORY LINKS ====================
$$("[data-cat]").forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    const cat = a.dataset.cat;
    const chip = $(`.chip[data-filter="${cat}"]`);
    if (chip) chip.click();
    $("#shop").scrollIntoView({ behavior: "smooth" });
  });
});

// ==================== INIT ====================
buildFilters();
renderProducts();
updateCartUI();
