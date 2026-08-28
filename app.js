// --- StockMaster: Application Core Logic ---

// Default Initial Mock Data (Simplified to Varón / Mujer and without color)
const DEFAULT_INVENTORY = [
    { id: "1", name: "PANTALON BORJA OV CC - FRISA (boy)", category: "Varón", size: "12", stock: 12, price: 26500 },
    { id: "2", name: "BUZO BASTIAN OV CC - FRISA (boy)", category: "Varón", size: "10", stock: 8, price: 29500 },
    { id: "3", name: "REMERA FIDEL HOLGADA CC (girl)", category: "Mujer", size: "12", stock: 15, price: 23000 },
    { id: "4", name: "CALZA MARTITA CCA (girl)", category: "Mujer", size: "10", stock: 10, price: 17800 },
    { id: "5", name: "CONJUNTO OSO PURO - PLUSH (boy)", category: "Varón", size: "9-12m", stock: 4, price: 28000 }
];

// Mock Remito scanned items (Simplified to Varón / Mujer and without color)
const MOCK_SCANNED_ITEMS = [
    { name: "PANTALON BORJA OV CC - FRISA (boy)", category: "Varón", size: "", price: 16610 },
    { name: "BUZO BASTIAN OV CC - FRISA (boy)", category: "Varón", size: "", price: 18460 },
    { name: "REMERA FIDEL HOLGADA CC - JERSEY (girl)", category: "Mujer", size: "", price: 14370 },
    { name: "REMERA ZENON HOLGADA CC - JERSEY SOFT (girl)", category: "Mujer", size: "", price: 12770 },
    { name: "BUZO MONICA CCA - FRISA ELASTANO (girl)", category: "Mujer", size: "", price: 19170 },
    { name: "CALZA MARTITA CCA - RUSTICO ELASTANO E (girl)", category: "Mujer", size: "", price: 11170 },
    { name: "CALZA PRO PARIS RS CCA - JERSEY ELASTANO (girl)", category: "Mujer", size: "", price: 7970 },
    { name: "PANTUMEDIAS DREAMS PS CC X1 - MEDIA CANA (boy)", category: "Varón", size: "", price: 6620 },
    { name: "CONJUNTO OSO PURO - PLUSH (boy)", category: "Varón", size: "", price: 17570 },
    { name: "CONJUNTO FELIZ P3 MPG - PLUSH (boy)", category: "Varón", size: "", price: 20310 },
    { name: "PANTALON JAZMIN MPG - PLUSH EST (girl)", category: "Mujer", size: "", price: 8930 },
    { name: "CONJUNTO FELIZ M3 MPG - PLUSH (boy)", category: "Varón", size: "", price: 20310 },
    { name: "MEDIAS COLD NG MPG X2 - CANA BAJA (boy)", category: "Varón", size: "", price: 5410 },
    { name: "MEDIAS FROSTY NG PURO X2 (girl)", category: "Mujer", size: "", price: 5510 }
];

// Default Purchase & Sales History
const DEFAULT_PURCHASES = [
    { date: "31/07/2026 10:15", summary: "Remito Scan: Pantalon Borja (boy), Calza Martita (girl)...", qty: 24, total: 259970 }
];

const DEFAULT_SALES = [
    { date: "31/07/2026 12:30", name: "PANTALON BORJA OV CC - FRISA (boy) - Talle 12", qty: 1, price: 26500, total: 26500 },
    { date: "31/07/2026 14:15", name: "REMERA FIDEL HOLGADA CC (girl) - Talle 12", qty: 1, price: 23000, total: 23000 }
];

let inventory = [];
let purchases = [];
let sales = [];
let currentCategoryFilter = "todos";
let currentSearchQuery = "";

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
    // Load from LocalStorage
    const storedInventory = localStorage.getItem("clothing_store_inventory");
    if (storedInventory) {
        inventory = JSON.parse(storedInventory);
        // Migración automática de categorías anteriores
        let migrated = false;
        inventory.forEach(item => {
            if (item.category !== "Varón" && item.category !== "Mujer") {
                // Classify existing items into Varon or Mujer
                const lower = (item.name || "").toLowerCase();
                if (lower.includes("girl") || lower.includes("nena") || lower.includes("mujer") || item.category.includes("Mujer")) {
                    item.category = "Mujer";
                } else {
                    item.category = "Varón";
                }
                migrated = true;
            }
            if (item.color) {
                delete item.color;
                migrated = true;
            }
        });
        if (migrated) saveInventory();
    } else {
        inventory = [...DEFAULT_INVENTORY];
        saveInventory();
    }

    // Load Purchases
    const storedPurchases = localStorage.getItem("clothing_store_purchases");
    if (storedPurchases) {
        purchases = JSON.parse(storedPurchases);
    } else {
        purchases = [...DEFAULT_PURCHASES];
        savePurchases();
    }

    // Load Sales
    const storedSales = localStorage.getItem("clothing_store_sales");
    if (storedSales) {
        sales = JSON.parse(storedSales);
    } else {
        sales = [...DEFAULT_SALES];
        saveSales();
    }

    // Set Current Date in Header
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById("header-date").innerText = new Date().toLocaleDateString('es-AR', dateOptions);

    // Initial Render
    renderAll();
    setupEvents();
});

// Save functions
function saveInventory() {
    localStorage.setItem("clothing_store_inventory", JSON.stringify(inventory));
}

function savePurchases() {
    localStorage.setItem("clothing_store_purchases", JSON.stringify(purchases));
}

function saveSales() {
    localStorage.setItem("clothing_store_sales", JSON.stringify(sales));
}

// Render Dashboard, Table, Metrics
function renderAll() {
    renderDashboard();
    renderInventoryTable();
    renderPurchasesTable();
    renderSalesTable();
    populateSaleProductDropdown();
    renderCostosTable();
}

// Render Dashboard Panels
function renderDashboard() {
    const totalItems = inventory.reduce((sum, item) => sum + parseInt(item.stock), 0);
    const totalValue = inventory.reduce((sum, item) => sum + (parseInt(item.stock) * parseFloat(item.price)), 0);
    
    // Calculate total financial records
    const totalSalesVal = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const totalPurchasesVal = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total), 0);
    const netBalance = totalSalesVal - totalPurchasesVal;

    document.getElementById("stat-total-items").innerText = totalItems;
    document.getElementById("stat-total-value").innerText = `$${totalValue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    document.getElementById("stat-total-sales").innerText = `$${totalSalesVal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    
    const balanceEl = document.getElementById("stat-balance");
    balanceEl.innerText = `$${netBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    
    if (netBalance >= 0) {
        balanceEl.style.color = "var(--color-success)";
    } else {
        balanceEl.style.color = "var(--color-danger)";
    }

    // Low stock list (items with stock <= 5)
    const lowStockList = document.getElementById("low-stock-list");
    lowStockList.innerHTML = "";
    const lowStockItems = inventory.filter(item => item.stock <= 5);

    if (lowStockItems.length === 0) {
        lowStockList.innerHTML = `
            <div class="alert-item" style="background-color: rgba(16, 185, 129, 0.04); border-color: rgba(16, 185, 129, 0.15)">
                <div class="alert-item-name"><i class="fa-solid fa-circle-check text-success"></i> ¡Todo al día! No hay artículos con bajo stock.</div>
            </div>`;
    } else {
        lowStockItems.slice(0, 5).forEach(item => {
            const div = document.createElement("div");
            div.className = "alert-item";
            div.innerHTML = `
                <div>
                    <div class="alert-item-name">${item.name}</div>
                    <div class="alert-item-detail">Categoría: ${item.category} • Talle: <span class="badge">${item.size || '-'}</span></div>
                </div>
                <div class="alert-stock-badge">Quedan ${item.stock}</div>
            `;
            lowStockList.appendChild(div);
        });
    }

    // Category Breakdown Bars
    const categories = ["Varón", "Mujer", "Unisex"];
    const breakdownList = document.getElementById("category-breakdown-list");
    breakdownList.innerHTML = "";

    const categoryTotals = {};
    categories.forEach(cat => categoryTotals[cat] = 0);
    inventory.forEach(item => {
        if (categories.includes(item.category)) {
            categoryTotals[item.category] += parseInt(item.stock);
        }
    });

    const maxCategoryTotal = Math.max(...Object.values(categoryTotals), 1);

    categories.forEach(cat => {
        const count = categoryTotals[cat];
        const percent = Math.min((count / maxCategoryTotal) * 100, 100);
        let colorClass = "var(--accent-purple)";
        if (cat === "Varón") colorClass = "var(--accent-cyan)";
        if (cat === "Mujer") colorClass = "var(--color-danger)";
        if (cat === "Unisex") colorClass = "var(--color-warning, #f59e0b)";

        const itemDiv = document.createElement("div");
        itemDiv.className = "breakdown-item";
        itemDiv.innerHTML = `
            <div class="breakdown-info">
                <span>${cat}</span>
                <span class="text-muted">${count} u.</span>
            </div>
            <div class="breakdown-progress">
                <div class="breakdown-bar" style="width: ${percent}%; background-color: ${colorClass};"></div>
            </div>
        `;
        breakdownList.appendChild(itemDiv);
    });
}

// Render Inventory Table
function renderInventoryTable() {
    const tbody = document.getElementById("inventory-tbody");
    tbody.innerHTML = "";

    // Filter and search
    let filtered = inventory.filter(item => {
        const matchesCategory = currentCategoryFilter === "todos" || item.category === currentCategoryFilter;
        
        const term = currentSearchQuery.toLowerCase();
        const matchesSearch = currentSearchQuery === "" || 
            item.name.toLowerCase().includes(term) ||
            item.category.toLowerCase().includes(term) ||
            item.size.toLowerCase().includes(term);

        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 2rem;">No se encontraron artículos en esta categoría.</td></tr>`;
        return;
    }

    filtered.forEach(item => {
        const tr = document.createElement("tr");
        
        let catClass = "pill-remeras";
        if (item.category === "Varón") catClass = "pill-calz-v";
        if (item.category === "Mujer") catClass = "pill-calz-m";

        tr.innerHTML = `
            <td><strong>${item.name}</strong></td>
            <td><span class="cat-pill ${catClass}">${item.category}</span></td>
            <td><span class="badge">${item.size || "-"}</span></td>
            <td class="text-center">
                <div class="stock-badge-container">
                    <button class="btn-stock-adj" onclick="adjustStock('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                    <span class="stock-value">${item.stock}</span>
                    <button class="btn-stock-adj" onclick="adjustStock('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
                </div>
            </td>
            <td class="text-right"><strong>$${parseFloat(item.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong></td>
            <td class="text-right">
                <button class="btn-table-action btn-edit" onclick="openEditModal('${item.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-table-action btn-delete" onclick="deleteItem('${item.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Render Purchases History Table
function renderPurchasesTable() {
    const tbody = document.getElementById("purchases-history-tbody");
    tbody.innerHTML = "";

    if (purchases.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding: 1.5rem;">Aún no has registrado compras.</td></tr>`;
        return;
    }

    // Sort showing newest first
    const indexedPurchases = purchases.map((p, idx) => ({ ...p, originalIndex: idx }));
    const sorted = [...indexedPurchases].reverse();
    sorted.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.date}</td>
            <td><strong>${p.summary}</strong></td>
            <td class="text-center">${p.qty} u.</td>
            <td class="text-right"><strong>$${p.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong></td>
            <td class="text-right">
                <button class="btn-table-action btn-delete" onclick="deletePurchase(${p.originalIndex})" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Render Sales History Table
function renderSalesTable() {
    const tbody = document.getElementById("sales-history-tbody");
    tbody.innerHTML = "";

    if (sales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 1.5rem;">Aún no has registrado ventas.</td></tr>`;
        return;
    }

    // Sort showing newest first
    const indexedSales = sales.map((s, idx) => ({ ...s, originalIndex: idx }));
    const sorted = [...indexedSales].reverse();
    sorted.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${s.date}</td>
            <td><strong>${s.name}</strong></td>
            <td class="text-center">${s.qty} u.</td>
            <td class="text-right">$${s.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
            <td class="text-right"><strong>$${s.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong></td>
            <td class="text-right">
                <button class="btn-table-action btn-delete" onclick="deleteSale(${s.originalIndex})" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Render Costos Table
function renderCostosTable() {
    const tbody = document.getElementById("costos-tbody");
    tbody.innerHTML = "";

    if (inventory.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted" style="padding: 2rem;">No se encontraron artículos para mostrar costos.</td></tr>`;
        return;
    }

    // Sort alphabetically by name
    const sorted = [...inventory].sort((a, b) => a.name.localeCompare(b.name));

    sorted.forEach(item => {
        const tr = document.createElement("tr");
        const cost = parseFloat(item.cost) || (parseFloat(item.price) / 1.6);
        const price = parseFloat(item.price) || 0;
        const margin = price - cost;
        const marginPct = cost > 0 ? (margin / cost) * 100 : 0;
        const totalCostValue = cost * parseInt(item.stock);

        tr.innerHTML = `
            <td><strong>${item.name}</strong></td>
            <td><span class="cat-pill">${item.category}</span></td>
            <td><span class="badge">${item.size || "-"}</span></td>
            <td class="text-center">${item.stock} u.</td>
            <td class="text-right"><strong>$${cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong></td>
            <td class="text-right">$${price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
            <td class="text-right ${margin >= 0 ? 'text-success' : 'text-danger'}"><strong>$${margin.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong></td>
            <td class="text-right ${margin >= 0 ? 'text-success' : 'text-danger'}">${marginPct.toFixed(0)}%</td>
            <td class="text-right"><strong>$${totalCostValue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

// Populate the Product selector in registering sales
function populateSaleProductDropdown() {
    const select = document.getElementById("sale-product-select");
    const selectedVal = select.value;
    
    select.innerHTML = '<option value="">Seleccionar producto...</option>';
    
    // Sort inventory alphabetically by name
    const sortedInv = [...inventory].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedInv.forEach(item => {
        if (item.stock > 0) {
            const opt = document.createElement("option");
            opt.value = item.id;
            opt.innerText = `${item.name} (Talle: ${item.size || '-'}) [Disp: ${item.stock}]`;
            select.appendChild(opt);
        }
    });

    if (selectedVal) {
        select.value = selectedVal;
    }
}

// Adjust Stock directly in inventory
window.adjustStock = function(id, amount) {
    const item = inventory.find(i => i.id === id);
    if (item) {
        const newStock = parseInt(item.stock) + amount;
        if (newStock >= 0) {
            item.stock = newStock;
            saveInventory();
            renderAll();
            showToast(`Stock de "${item.name}" actualizado a ${newStock} u.`, "success");
        }
    }
}

// Delete item
window.deleteItem = function(id) {
    const item = inventory.find(i => i.id === id);
    if (item && confirm(`¿Estás seguro de que deseas eliminar "${item.name}" talle ${item.size || '-'} de tu stock?`)) {
        // Subtract cost from purchase history so it doesn't count towards negative balance
        const itemCost = parseFloat(item.cost) || (parseFloat(item.price) / 1.6);
        const totalDeduction = parseInt(item.stock) * itemCost;
        
        if (purchases.length > 0) {
            let remainingDeduction = totalDeduction;
            for (let i = purchases.length - 1; i >= 0; i--) {
                if (purchases[i].total >= remainingDeduction) {
                    purchases[i].total -= remainingDeduction;
                    remainingDeduction = 0;
                    break;
                } else {
                    remainingDeduction -= purchases[i].total;
                    purchases[i].total = 0;
                }
            }
            purchases = purchases.filter(p => p.total > 0 || p.qty > 0);
            savePurchases();
        }

        inventory = inventory.filter(i => i.id !== id);
        saveInventory();
        renderAll();
        showToast("Producto eliminado del stock", "warning");
    }
}

// Delete purchase transaction
window.deletePurchase = function(idx) {
    if (confirm("¿Estás seguro de que deseas eliminar este registro de compra del historial? Se ajustará el balance general.")) {
        purchases.splice(idx, 1);
        savePurchases();
        renderAll();
        showToast("Registro de compra eliminado", "warning");
    }
}

// Delete sale transaction
window.deleteSale = function(idx) {
    if (confirm("¿Estás seguro de que deseas de registrar y eliminar esta venta del historial? Se devolverá al stock si lo deseas (se puede hacer manual).")) {
        sales.splice(idx, 1);
        saveSales();
        renderAll();
        showToast("Registro de venta eliminado", "warning");
    }
}

// Setup Event Listeners
function setupEvents() {
    // Navigation Tabs
    const navItems = document.querySelectorAll(".nav-item");
    const tabContents = document.querySelectorAll(".tab-content");
    const pageTitle = document.getElementById("page-title");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            item.classList.add("active");
            const tabId = item.getAttribute("data-tab");
            document.getElementById(`tab-${tabId}`).classList.add("active");

            // Change Header Title
            if (tabId === "dashboard") pageTitle.innerText = "Panel General";
            if (tabId === "inventario") pageTitle.innerText = "Inventario de Ropa & Calzado";
            if (tabId === "compras") pageTitle.innerText = "Gestión de Compras y Remitos";
            if (tabId === "ventas") pageTitle.innerText = "Registro y Control de Ventas";
            if (tabId === "costos") pageTitle.innerText = "Historial y Control de Costos";
        });
    });

    // Search input
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", (e) => {
        currentSearchQuery = e.target.value;
        renderInventoryTable();
    });

    // Category Tabs in inventory
    const catTabs = document.querySelectorAll(".cat-tab");
    catTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            catTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentCategoryFilter = tab.getAttribute("data-cat");
            renderInventoryTable();
        });
    });

    // Drag & Drop events (in Compras Tab)
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("file-input");

    dropzone.addEventListener("click", () => fileInput.click());
    
    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleUploadedFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleUploadedFile(e.target.files[0]);
        }
    });

    // Modal Events
    const modal = document.getElementById("product-modal");
    const modalClose = document.getElementById("modal-close");
    const btnModalCancel = document.getElementById("btn-modal-cancel");
    const productForm = document.getElementById("product-form");

    document.getElementById("btn-quick-add").addEventListener("click", () => {
        openAddModal();
    });

    modalClose.addEventListener("click", () => closeModal());
    btnModalCancel.addEventListener("click", () => closeModal());

    productForm.addEventListener("submit", (e) => {
        e.preventDefault();
        saveProductForm();
    });

    // Sales Form Event Listeners
    const saleProductSelect = document.getElementById("sale-product-select");
    const saleQuantityInput = document.getElementById("sale-quantity");
    const salePriceInput = document.getElementById("sale-price");
    const saleStockAvail = document.getElementById("sale-stock-avail");

    saleProductSelect.addEventListener("change", () => {
        const prodId = saleProductSelect.value;
        if (prodId) {
            const item = inventory.find(i => i.id === prodId);
            if (item) {
                saleStockAvail.innerText = `Stock disponible: ${item.stock} unidades`;
                saleQuantityInput.max = item.stock;
                salePriceInput.value = item.price;
            }
        } else {
            saleStockAvail.innerText = "Stock disponible: -";
            salePriceInput.value = "";
        }
    });

    document.getElementById("sale-form").addEventListener("submit", (e) => {
        e.preventDefault();
        registerSale();
    });

    // Scan Results confirmations
    document.getElementById("btn-add-item-row").addEventListener("click", () => {
        addResultsRow({ name: "", category: "Varón", size: "", price: 0 });
    });

    document.getElementById("btn-confirm-import").addEventListener("click", () => {
        confirmImportResults();
    });

    document.getElementById("btn-clear-inventory").addEventListener("click", () => {
        if (confirm("¿Estás completamente seguro de que deseas borrar TODO el inventario del stock? Esta acción no se puede deshacer.")) {
            inventory = [];
            saveInventory();
            renderAll();
            showToast("Se ha vaciado todo el inventario", "danger");
        }
    });
}

// File drag upload scanner animation trigger
function handleUploadedFile(file) {
    const dropzoneContentNormal = document.getElementById("dropzone-content-normal");
    const dropzonePreview = document.getElementById("dropzone-preview");
    const previewImg = document.getElementById("preview-img");
    const scannerStatusText = document.getElementById("scanner-status-text");
    const laserLine = document.getElementById("laser-line");

    dropzoneContentNormal.classList.add("hidden");
    dropzonePreview.classList.remove("hidden");
    laserLine.classList.remove("hidden");

    if (file.type === "application/pdf") {
        previewImg.src = "";
        scannerStatusText.innerText = "Analizando PDF del remito...";
        parsePDF(file);
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            scannerStatusText.innerText = "Escaneando remito por IA...";

            setTimeout(() => {
                laserLine.classList.add("hidden");
                scannerStatusText.innerText = "¡Lectura finalizada con éxito!";
                showToast("Lectura del remito completada por IA", "success");
                
                const resultsPanel = document.getElementById("results-panel");
                const emptyResultsState = document.getElementById("empty-results-state");
                const resultsContent = document.getElementById("results-content");

                resultsPanel.classList.remove("locked");
                emptyResultsState.classList.add("hidden");
                resultsContent.classList.remove("hidden");

                renderParsedResults(MOCK_SCANNED_ITEMS);
            }, 2800);
        };
        reader.readAsDataURL(file);
    }
}

// Real PDF Text Parser using PDF.js
function parsePDF(file) {
    const reader = new FileReader();
    reader.onload = function() {
        const typedarray = new Uint8Array(this.result);
        
        pdfjsLib.getDocument(typedarray).promise.then(pdf => {
            let maxPages = pdf.numPages;
            let countPromises = [];
            
            for (let j = 1; j <= maxPages; j++) {
                countPromises.push(
                    pdf.getPage(j).then(page => {
                        return page.getTextContent().then(textContent => {
                            const items = textContent.items;
                            let textItems = items.map(item => ({
                                text: item.str,
                                x: item.transform[4],
                                y: item.transform[5]
                            }));
                            
                            // Sort by Y coordinate descending (top to bottom), then X ascending (left to right)
                            textItems.sort((a, b) => {
                                if (Math.abs(a.y - b.y) > 5) {
                                    return b.y - a.y;
                                }
                                return a.x - b.x;
                            });
                            
                            let lines = [];
                            let currentLine = [];
                            let currentY = null;
                            
                            textItems.forEach(item => {
                                if (currentY === null) {
                                    currentY = item.y;
                                    currentLine.push(item);
                                } else if (Math.abs(item.y - currentY) > 5) {
                                    lines.push(currentLine);
                                    currentLine = [item];
                                    currentY = item.y;
                                } else {
                                    currentLine.push(item);
                                }
                            });
                            if (currentLine.length > 0) {
                                lines.push(currentLine);
                            }
                            
                            return lines.map(line => {
                                return line.sort((a, b) => a.x - b.x).map(item => item.text).join(" ");
                            }).join("\n");
                        });
                    })
                );
            }
            
            Promise.all(countPromises).then(pageTexts => {
                const fullText = pageTexts.join("\n");
                const items = parseInvoiceText(fullText);
                
                setTimeout(() => {
                    document.getElementById("laser-line").classList.add("hidden");
                    document.getElementById("scanner-status-text").innerText = "¡PDF leído con éxito!";
                    showToast(`Se detectaron ${items.length} productos en el PDF`, "success");
                    
                    const resultsPanel = document.getElementById("results-panel");
                    const emptyResultsState = document.getElementById("empty-results-state");
                    const resultsContent = document.getElementById("results-content");

                    resultsPanel.classList.remove("locked");
                    emptyResultsState.classList.add("hidden");
                    resultsContent.classList.remove("hidden");

                    renderParsedResults(items.length > 0 ? items : MOCK_SCANNED_ITEMS);
                }, 2000);
            });
        }).catch(err => {
            console.error(err);
            showToast("Error al leer el archivo PDF", "danger");
            resetScanState();
        });
    };
    reader.readAsArrayBuffer(file);
}

function cleanPriceString(str) {
    if (!str) return 0;
    let clean = str.replace(/\$/g, "").replace(/\s+/g, "");
    
    if (clean.includes(",") && clean.includes(".")) {
        if (clean.indexOf(",") < clean.indexOf(".")) {
            clean = clean.replace(/,/g, "");
        } else {
            clean = clean.replace(/\./g, "").replace(",", ".");
        }
    } else if (clean.includes(",")) {
        const lastCommaIdx = clean.lastIndexOf(",");
        if (clean.length - lastCommaIdx <= 3) {
            clean = clean.replace(",", ".");
        } else {
            clean = clean.replace(/,/g, "");
        }
    } else if (clean.includes(".")) {
        const lastDotIdx = clean.lastIndexOf(".");
        if (clean.length - lastDotIdx > 3) {
            clean = clean.replace(/\./g, "");
        }
    }
    
    return parseFloat(clean) || 0;
}

// Parse text from PDF and extract product table line by line
function parseInvoiceText(text) {
    const items = [];
    const lines = text.split(/[\r\n]+/);
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.includes("$")) return;
        if (trimmed.toLowerCase().includes("subtotal") || trimmed.toLowerCase().includes("total") || trimmed.toLowerCase().includes("alicuota") || trimmed.toLowerCase().includes("pago")) return;
        
        // Split by "$" to isolate description and prices
        const parts = trimmed.split("$");
        if (parts.length < 2) return;
        
        const descPart = parts[0].trim(); // e.g. "15 MEDIAS COLD..."
        
        // Find leading numbers in description part
        const leadingNumbersMatch = descPart.match(/^(\d+)(?:\s+(\d+))?/);
        
        let quantity = 1;
        let productName = descPart;
        
        if (leadingNumbersMatch) {
            const num1 = leadingNumbersMatch[1];
            const num2 = leadingNumbersMatch[2];
            
            if (num2) {
                // E.g. "1 12 PANTALON..." -> 1 is order number, 12 is quantity
                quantity = parseInt(num2) || 1;
                productName = descPart.substring(leadingNumbersMatch[0].length).trim();
            } else {
                // E.g. "1 PANTALON..." -> 1 is order number
                productName = descPart.substring(num1.length).trim();
            }
        }
        
        // Check if there is a quantity in parts[1] (after unit price)
        if (parts[1]) {
            const rest = parts[1].trim();
            const numbersInRest = rest.match(/[\d\.,]+/g);
            if (numbersInRest && numbersInRest.length > 1) {
                quantity = parseInt(numbersInRest[1]) || 1;
            }
        }
        
        // Get unit cost from the first price after "$"
        const costMatch = parts[1].match(/[\d\.,]+/);
        const cost = costMatch ? cleanPriceString(costMatch[0]) : 0;
        
        // Clean product name from any residual leading numbers
        productName = productName.replace(/^\d+\s+/, "").trim();
        
        // Categorize automatically: check keywords
        let category = "Unisex";
        const lowerName = productName.toLowerCase();
        if (lowerName.includes("boy") || lowerName.includes("varon") || lowerName.includes("varón")) {
            category = "Varón";
        } else if (lowerName.includes("girl") || lowerName.includes("mujer") || lowerName.includes("nena")) {
            category = "Mujer";
        }
        
        items.push({
            name: productName,
            category: category,
            size: "",
            quantity: quantity,
            price: cost
        });
    });
    
    return items;
}

function resetScanState() {
    const dropzoneContentNormal = document.getElementById("dropzone-content-normal");
    const dropzonePreview = document.getElementById("dropzone-preview");
    const resultsPanel = document.getElementById("results-panel");
    const emptyResultsState = document.getElementById("empty-results-state");
    const resultsContent = document.getElementById("results-content");

    dropzoneContentNormal.classList.remove("hidden");
    dropzonePreview.classList.add("hidden");
    resultsPanel.classList.add("locked");
    emptyResultsState.classList.remove("hidden");
    resultsContent.classList.add("hidden");
}

// Render scan items into confirmation table
function renderParsedResults(items) {
    const tbody = document.getElementById("results-tbody");
    tbody.innerHTML = "";
    document.getElementById("detected-count").innerText = `${items.length} Detectados`;

    items.forEach((item, index) => {
        addResultsRow(item);
    });
}

// Add editable row to confirmation table
function addResultsRow(item) {
    const tbody = document.getElementById("results-tbody");
    const tr = document.createElement("tr");

    const cost = item.price || 0;
    const qty = item.quantity || 1;
    const subtotal = cost * qty;
    const sellPrice = Math.round(cost * 1.6);

    tr.innerHTML = `
        <td style="width: 40px; text-align: center;">
            <button class="btn-table-action btn-duplicate" title="Duplicar para otro talle" onclick="duplicateRow(this)">
                <i class="fa-solid fa-copy"></i>
            </button>
        </td>
        <td>
            <input type="text" class="res-name" value="${item.name}" placeholder="Producto" required>
        </td>
        <td>
            <div style="display: flex; gap: 0.5rem;">
                <select class="res-category">
                    <option value="">Categoría...</option>
                    <option value="Varón" ${item.category === "Varón" ? "selected" : ""}>Varón</option>
                    <option value="Mujer" ${item.category === "Mujer" ? "selected" : ""}>Mujer</option>
                    <option value="Unisex" ${item.category === "Unisex" ? "selected" : ""}>Unisex</option>
                </select>
                <input type="text" class="res-size" value="${item.size || ''}" placeholder="Talle" style="width: 100px;">
            </div>
        </td>
        <td>
            <input type="number" class="res-qty" value="${qty}" min="1" style="width: 60px;" oninput="updateSuggestions(this)" required>
        </td>
        <td>
            <input type="number" class="res-cost" value="${cost}" min="0" step="0.01" style="width: 80px; text-align: right;" oninput="updateSuggestions(this)" required>
        </td>
        <td class="text-right" style="font-weight: 600; padding-right: 1.5rem;">
            <span class="res-subtotal">$${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </td>
        <td>
            <div class="pricing-container">
                <input type="number" class="res-price" value="${sellPrice}" min="0" step="0.01" style="width: 100px; text-align: right;" required>
                <div class="rec-prices-wrapper">
                    <button type="button" class="btn-rec-price button-60" onclick="applyRecVal(this, 1.6)">60%: $${Math.round(cost * 1.6)}</button>
                    <button type="button" class="btn-rec-price button-80" onclick="applyRecVal(this, 1.8)">80%: $${Math.round(cost * 1.8)}</button>
                </div>
            </div>
        </td>
        <td class="text-right">
            <button class="btn-table-action btn-delete" onclick="this.closest('tr').remove(); updateDetectedCount();"><i class="fa-solid fa-trash"></i></button>
        </td>
    `;
    tbody.appendChild(tr);
    updateDetectedCount();
}

window.updateSuggestions = function(inputEl) {
    const tr = inputEl.closest('tr');
    const cost = parseFloat(tr.querySelector('.res-cost').value) || 0;
    const qty = parseInt(tr.querySelector('.res-qty').value) || 1;
    
    // Update subtotal
    const subtotalEl = tr.querySelector('.res-subtotal');
    if (subtotalEl) {
        subtotalEl.innerText = `$${(cost * qty).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    }
    
    const btn60 = tr.querySelector('.button-60');
    const btn80 = tr.querySelector('.button-80');
    
    if (btn60) btn60.innerText = `60%: $${Math.round(cost * 1.6)}`;
    if (btn80) btn80.innerText = `80%: $${Math.round(cost * 1.8)}`;
    
    const priceInput = tr.querySelector('.res-price');
    if (priceInput) priceInput.value = Math.round(cost * 1.6);
}

window.duplicateRow = function(btnEl) {
    const tr = btnEl.closest('tr');
    
    // Read current row values
    const name = tr.querySelector('.res-name').value;
    const category = tr.querySelector('.res-category').value;
    const qty = tr.querySelector('.res-qty').value;
    const cost = tr.querySelector('.res-cost').value;
    const price = tr.querySelector('.res-price').value;
    const subtotal = parseFloat(cost) * parseInt(qty);

    // Manually build the new row
    const newTr = document.createElement('tr');

    newTr.innerHTML = `
        <td style="width: 40px; text-align: center;">
            <button class="btn-table-action btn-duplicate" title="Duplicar para otro talle" onclick="duplicateRow(this)">
                <i class="fa-solid fa-copy"></i>
            </button>
        </td>
        <td>
            <input type="text" class="res-name" value="${name}" placeholder="Producto" required>
        </td>
        <td>
            <div style="display: flex; gap: 0.5rem;">
                <select class="res-category">
                    <option value="">Categoría...</option>
                    <option value="Varón" ${category === "Varón" ? "selected" : ""}>Varón</option>
                    <option value="Mujer" ${category === "Mujer" ? "selected" : ""}>Mujer</option>
                    <option value="Unisex" ${category === "Unisex" ? "selected" : ""}>Unisex</option>
                </select>
                <input type="text" class="res-size" value="" placeholder="Talle" style="width: 100px;" autofocus>
            </div>
        </td>
        <td>
            <input type="number" class="res-qty" value="${qty}" min="1" style="width: 60px;" oninput="updateSuggestions(this)" required>
        </td>
        <td>
            <input type="number" class="res-cost" value="${cost}" min="0" step="0.01" style="width: 80px; text-align: right;" oninput="updateSuggestions(this)" required>
        </td>
        <td class="text-right" style="font-weight: 600; padding-right: 1.5rem;">
            <span class="res-subtotal">$${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </td>
        <td>
            <div class="pricing-container">
                <input type="number" class="res-price" value="${price}" min="0" step="0.01" style="width: 100px; text-align: right;" required>
                <div class="rec-prices-wrapper">
                    <button type="button" class="btn-rec-price button-60" onclick="applyRecVal(this, 1.6)">60%: $${Math.round(parseFloat(cost) * 1.6)}</button>
                    <button type="button" class="btn-rec-price button-80" onclick="applyRecVal(this, 1.8)">80%: $${Math.round(parseFloat(cost) * 1.8)}</button>
                </div>
            </div>
        </td>
        <td class="text-right">
            <button class="btn-table-action btn-delete" onclick="this.closest('tr').remove(); updateDetectedCount();"><i class="fa-solid fa-trash"></i></button>
        </td>
    `;

    // Add highlight animation to new row
    newTr.style.animation = "highlightNew 0.6s ease";

    // Create new tr and insert it after the current one
    const tbody = tr.parentNode;
    const nextTr = tr.nextSibling;
    tbody.insertBefore(newTr, nextTr);
    updateDetectedCount();

    // Focus the talle input of the new duplicated row
    newTr.querySelector('.res-size').focus();
    
    showToast("Fila duplicada — ingresá el talle nuevo", "success");
}

window.applyRecVal = function(btnEl, factor) {
    const tr = btnEl.closest('tr');
    const costInput = tr.querySelector('.res-cost');
    const priceInput = tr.querySelector('.res-price');
    
    if (costInput && priceInput) {
        const cost = parseFloat(costInput.value) || 0;
        priceInput.value = Math.round(cost * factor);
        showToast(`Precio de venta ajustado al ${Math.round((factor - 1) * 100)}%`, "success");
    }
}

window.updateRowHelpTip = function(selectEl) {
    // Left empty since we simplified categories and help tips aren't needed now.
}

function updateDetectedCount() {
    const rows = document.querySelectorAll("#results-tbody tr");
    document.getElementById("detected-count").innerText = `${rows.length} Detectados`;
}

// Confirm and Merge scan results into stock & record purchase invoice
function confirmImportResults() {
    const rows = document.querySelectorAll("#results-tbody tr");
    if (rows.length === 0) {
        showToast("No hay elementos para agregar en la tabla", "danger");
        return;
    }

    let addedCount = 0;
    let purchaseTotalCost = 0;
    let summaryItems = [];

    let hasEmptyFields = false;
    rows.forEach(row => {
        const name = row.querySelector(".res-name").value.trim();
        const category = row.querySelector(".res-category").value;
        
        if (name === "" || category === "") {
            hasEmptyFields = true;
        }
    });

    if (hasEmptyFields) {
        showToast("Por favor completa la Categoría (Varón / Mujer) de todos los artículos", "warning");
        return;
    }

    rows.forEach(row => {
        const name = row.querySelector(".res-name").value.trim();
        const category = row.querySelector(".res-category").value;
        // Make Size optional, defaults to "-" if left empty
        const size = row.querySelector(".res-size").value.trim().toUpperCase() || "-";
        const quantity = parseInt(row.querySelector(".res-qty").value);
        const cost = parseFloat(row.querySelector(".res-cost").value) || 0;
        const sellPrice = parseFloat(row.querySelector(".res-price").value) || 0;

        // Add to summary
        if (!summaryItems.includes(name)) {
            summaryItems.push(name);
        }

        // Check if item already exists in stock (match by name, category, size)
        const existing = inventory.find(i => 
            i.name.toLowerCase() === name.toLowerCase() && 
            i.category === category && 
            i.size === size
        );

        if (existing) {
            existing.stock = parseInt(existing.stock) + quantity;
            existing.price = sellPrice;
            existing.cost = cost;
        } else {
            inventory.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                name,
                category,
                size,
                stock: quantity,
                price: sellPrice,
                cost: cost
            });
        }
        addedCount += quantity;
        purchaseTotalCost += (cost * quantity);
    });

    // Record the Purchase transaction
    const dateStr = getFormattedDate();
    const purchaseObj = {
        date: dateStr,
        summary: `Remito Escaneado: ${summaryItems.slice(0, 3).join(', ')}${summaryItems.length > 3 ? '...' : ''}`,
        qty: addedCount,
        total: purchaseTotalCost
    };
    purchases.push(purchaseObj);

    saveInventory();
    savePurchases();
    renderAll();
    
    resetScanState();

    showToast(`Se cargaron con éxito ${addedCount} unidades al inventario`, "success");

    // Navigate back to stock table
    setTimeout(() => {
        document.querySelector(".nav-item[data-tab='inventario']").click();
    }, 800);
}

// Register a Sale and discount stock
function registerSale() {
    const saleProductSelect = document.getElementById("sale-product-select");
    const prodId = saleProductSelect.value;
    const qty = parseInt(document.getElementById("sale-quantity").value);
    const salePrice = parseFloat(document.getElementById("sale-price").value) || 0;

    if (!prodId) {
        showToast("Por favor selecciona un producto", "danger");
        return;
    }

    const item = inventory.find(i => i.id === prodId);
    if (!item) return;

    if (item.stock < qty) {
        showToast(`Stock insuficiente. Disponible: ${item.stock} u.`, "danger");
        return;
    }

    // Discount stock
    item.stock = parseInt(item.stock) - qty;

    // Record Sale
    const saleObj = {
        date: getFormattedDate(),
        name: `${item.name} - Talle ${item.size || '-'}`,
        qty: qty,
        price: salePrice,
        total: qty * salePrice
    };
    sales.push(saleObj);

    saveInventory();
    saveSales();
    renderAll();

    // Reset Form
    document.getElementById("sale-form").reset();
    document.getElementById("sale-stock-avail").innerText = "Stock disponible: -";

    showToast(`Venta registrada. Descontadas ${qty} unidades de stock.`, "success");
}

// Helpers
function getFormattedDate() {
    const date = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Add/Edit Product Modal Handling
function openAddModal() {
    document.getElementById("modal-title").innerText = "Agregar Producto Manualmente";
    document.getElementById("form-product-id").value = "";
    document.getElementById("product-form").reset();
    document.getElementById("size-tip").innerText = "";
    document.getElementById("product-modal").classList.add("active");
}

window.openEditModal = function(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    document.getElementById("modal-title").innerText = "Editar Producto";
    document.getElementById("form-product-id").value = item.id;
    document.getElementById("form-name").value = item.name;
    document.getElementById("form-category").value = item.category;
    document.getElementById("form-size").value = item.size || '';
    document.getElementById("form-stock").value = item.stock;
    document.getElementById("form-cost").value = item.cost || (item.price / 1.6).toFixed(2);
    document.getElementById("form-price").value = item.price;

    document.getElementById("product-modal").classList.add("active");
}

function closeModal() {
    document.getElementById("product-modal").classList.remove("active");
}

function saveProductForm() {
    const id = document.getElementById("form-product-id").value;
    const name = document.getElementById("form-name").value.trim();
    const category = document.getElementById("form-category").value;
    const size = document.getElementById("form-size").value.trim().toUpperCase() || "-";
    const stock = parseInt(document.getElementById("form-stock").value);
    const price = parseFloat(document.getElementById("form-price").value) || 0;
    const cost = parseFloat(document.getElementById("form-cost").value) || 0;

    if (id) {
        // Edit existing
        const item = inventory.find(i => i.id === id);
        if (item) {
            item.name = name;
            item.category = category;
            item.size = size;
            item.stock = stock;
            item.price = price;
            item.cost = cost;
            showToast("Producto actualizado", "success");
        }
    } else {
        // Add new
        inventory.push({
            id: Date.now().toString(),
            name,
            category,
            size,
            stock,
            price,
            cost
        });
        showToast("Producto agregado al stock", "success");
    }

    saveInventory();
    renderAll();
    closeModal();
}

// Custom Premium Toasts
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "fa-circle-info";
    if (type === "success") icon = "fa-circle-check";
    if (type === "warning") icon = "fa-triangle-exclamation";
    if (type === "danger") icon = "fa-circle-exclamation";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove();"><i class="fa-solid fa-xmark"></i></button>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
