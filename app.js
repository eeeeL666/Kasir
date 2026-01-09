// ===== Data menu =====
const menuMakanan = [
  ["Mie Ayam", 10000],
  ["Mie Rebus + Nasi", 10000],
  ["Indomie Goreng", 3500],
  ["Nasi + Telur", 5000],
  ["Nasi Uduk", 5000],
  ["Gorengan", 1000],
  ["Siomay", 1000],
  ["Pempek", 1000],
];

const menuMinuman = [
  ["Aqua", 3000],
  ["Ultra Mimi", 6000],
  ["Teajus Apel", 2000],
  ["Teh Sisri", 2000],
  ["Marimas Mangga", 2000],
  ["Marimas Jeruk", 2000],
  ["Pop Ice", 5000],
];

// ===== State keranjang =====
let keranjang = []; // array of {nama, harga}
let selectedMenuRow = { makanan: null, minuman: null };
let selectedKeranjangIndex = null;

// ===== Util =====
function formatRupiah(angka) {
  return "Rp" + (angka || 0).toLocaleString("id-ID");
}

function nowString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ===== Render menu =====
function renderTable(tableId, data, typeKey) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = "";
  data.forEach(([nama, harga], idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nama}</td>
      <td style="text-align:right">${formatRupiah(harga)}</td>
      <td><button class="btn btn-primary btn-sm">Pilih</button></td>
    `;
    tr.addEventListener("click", () => {
      // toggle selected row
      [...tbody.children].forEach((row) => row.classList.remove("selected"));
      tr.classList.add("selected");
      selectedMenuRow[typeKey] = { idx, nama, harga };
    });
    tr.querySelector("button").addEventListener("click", (e) => {
      e.stopPropagation();
      selectedMenuRow[typeKey] = { idx, nama, harga };
      tr.click();
    });
    tbody.appendChild(tr);
  });
}

// ===== Keranjang ops =====
function tambahKeKeranjang(typeKey) {
  const selected = selectedMenuRow[typeKey];
  if (!selected) {
    alert("Pilih menu terlebih dahulu!");
    return;
  }
  keranjang.push({ nama: selected.nama, harga: selected.harga });
  renderKeranjang();
  updateTotal();
}

function renderKeranjang() {
  const ul = document.getElementById("list-keranjang");
  ul.innerHTML = "";
  keranjang.forEach((item, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.nama}</span>
      <span>${formatRupiah(item.harga)}</span>
    `;
    li.addEventListener("click", () => {
      // toggle selection
      [...ul.children].forEach((el) => el.classList.remove("selected"));
      li.classList.add("selected");
      selectedKeranjangIndex = idx;
    });
    ul.appendChild(li);
  });
}

function hapusItemTerpilih() {
  if (selectedKeranjangIndex === null) {
    alert("Pilih item di keranjang untuk dihapus!");
    return;
  }
  keranjang.splice(selectedKeranjangIndex, 1);
  selectedKeranjangIndex = null;
  renderKeranjang();
  updateTotal();
}

function updateTotal() {
  const total = keranjang.reduce((acc, it) => acc + it.harga, 0);
  document.getElementById("lbl-total").textContent = formatRupiah(total);
}

// ===== Struk =====
function buatStrukText() {
  if (keranjang.length === 0) {
    alert("Keranjang masih kosong!");
    return null;
  }
  const uangStr = document.getElementById("input-uang").value.trim();
  const uang = parseInt(uangStr, 10);
  if (isNaN(uang)) {
    alert("Masukkan nominal uang yang valid!");
    return null;
  }
  const total = keranjang.reduce((acc, it) => acc + it.harga, 0);
  if (uang < total) {
    alert(`Total: ${formatRupiah(total)}\nUang tidak cukup!`);
    return null;
  }
  const kembalian = uang - total;
  const garis = "-".repeat(30);
  const header = "===== STRUK PEMBAYARAN =====";
  const toko = "Warung Bude";
  const waktu = nowString();

  const lines = [
    header,
    toko,
    waktu,
    garis,
    ...keranjang.map((it) => `${(it.nama + " ").padEnd(20, ".")} ${formatRupiah(it.harga)}`),
    garis,
    `Total Belanja : ${formatRupiah(total)}`,
    `Uang Diberikan: ${formatRupiah(uang)}`,
    `Kembalian     : ${formatRupiah(kembalian)}`,
    "=".repeat(30),
    "Terima kasih telah berbelanja!",
  ];
  return lines.join("\n");
}

function tampilkanStruk() {
  const struk = buatStrukText();
  if (!struk) return;
  const modal = document.getElementById("modal-struk");
  const pre = document.getElementById("struk-text");
  pre.textContent = struk;
  modal.setAttribute("aria-hidden", "false");
}

function simpanStrukTxt() {
  const struk = buatStrukText();
  if (!struk) return;
  const blob = new Blob([struk], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  const ts = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const filename = `struk_${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.txt`;
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
}

// ===== Modal control =====
function closeModal() {
  document.getElementById("modal-struk").setAttribute("aria-hidden", "true");
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  // Render menu
  renderTable("table-makanan", menuMakanan, "makanan");
  renderTable("table-minuman", menuMinuman, "minuman");

  // Bind buttons
  document.getElementById("btn-tambah-makanan").addEventListener("click", () => tambahKeKeranjang("makanan"));
  document.getElementById("btn-tambah-minuman").addEventListener("click", () => tambahKeKeranjang("minuman"));
  document.getElementById("btn-hapus").addEventListener("click", hapusItemTerpilih);
  document.getElementById("btn-struk").addEventListener("click", tampilkanStruk);
  document.getElementById("btn-simpan").addEventListener("click", simpanStrukTxt);

  // Modal
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-ok").addEventListener("click", closeModal);
  document.getElementById("modal-struk").addEventListener("click", (e) => {
    if (e.target.id === "modal-struk") closeModal();
  });

  // Initial total
  updateTotal();
});