// ==========================================================================
// 1. DATA MODEL & STATE
// ==========================================================================
let invoiceState = {
    companyName: "JAY AMBE SCRAP TRADERS",
    companyAddress: "86, SHYAM INDUSTRIAL HUB, BAKROL BUJRANG, DASKROI, AHMEDABAD - 382430",
    companyGstin: "24CXLPJ5068B1ZK",
    companyState: "Gujarat",
    companyStateCode: "24",
    logoVisible: true,

    invoiceNo: "02",
    invoiceDate: "2024-08-31",
    showTaxInvoice: true,
    showDebitMemo: true,
    showOriginal: true,

    receiverName: "JAISWAL ENTERPRISE",
    receiverAddress: "PLOT NO - 156, AJI VASHAT G.I.D.C, ROAD - E, RAJKOT.",
    receiverState: "Gujarat",
    receiverStateCode: "24",
    receiverGstin: "24ABHPJ8275A1ZU",

    items: [
        {
            description: "CI SCRAP DUST",
            hsn: "72041000",
            quantity: 17800.00,
            unit: "KGS",
            rate: 2.00,
            discount: ""
        }
    ],

    vehicleNo: "GJ01KT1797",

    cgstRate: 9.00,
    sgstRate: 9.00,
    tcsAmount: "",
    roundOffAmount: "",
    invoiceTotalOverride: "",

    jurisdiction: "AHMEDABAD",
    companySignatureLabel: "For, JAY AMBE SCRAP TRADERS",
    eoeLabel: "E & O.E.",
    wordsOverride: ""
};

// Default Sample Data (to restore)
const SAMPLE_STATE = JSON.parse(JSON.stringify(invoiceState));

// Zoom factor for the live preview
let currentZoom = 0.85;

// ==========================================================================
// 2. INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Load from LocalStorage if exists
    const savedState = localStorage.getItem("antigravity_bill_state");
    if (savedState) {
        try {
            invoiceState = JSON.parse(savedState);
        } catch (e) {
            console.error("Failed to load saved state", e);
        }
    }

    initFormValues();
    renderItemsList();
    recalculateInvoice();

    // Attach Main Event Listeners
    setupFormListeners();
    setupButtonActions();
    setupZoomControls();

    // Mobile Responsive Additions
    setupMobileTabs();
    autoScaleMobilePreview();
    window.addEventListener("resize", autoScaleMobilePreview);
});

// Toggle sidebar accordion sections
function toggleSection(element) {
    const section = element.parentElement;
    section.classList.toggle("expanded");
}

// Mobile Tab switching logic
function setupMobileTabs() {
    const tabEdit = document.getElementById("tab-btn-edit");
    const tabPreview = document.getElementById("tab-btn-preview");
    const panelEdit = document.querySelector(".editor-panel");
    const panelPreview = document.querySelector(".preview-panel");

    if (!tabEdit || !tabPreview || !panelEdit || !panelPreview) return;

    // Set initial classes on mobile view load
    if (window.innerWidth <= 1024) {
        panelPreview.classList.add("mobile-hide");
    }

    tabEdit.addEventListener("click", () => {
        tabEdit.classList.add("active");
        tabPreview.classList.remove("active");
        
        panelEdit.classList.remove("mobile-hide");
        panelPreview.classList.add("mobile-hide");
    });

    tabPreview.addEventListener("click", () => {
        tabPreview.classList.add("active");
        tabEdit.classList.remove("active");
        
        panelPreview.classList.remove("mobile-hide");
        panelEdit.classList.add("mobile-hide");
        
        // Auto scale to fit the exact phone width
        setTimeout(autoScaleMobilePreview, 50);
    });
}

// Auto scale the A4 invoice preview sheet to fit the device width seamlessly
function autoScaleMobilePreview() {
    const isMobile = window.innerWidth <= 1024;
    const container = document.getElementById("printable-invoice");
    const zoomText = document.getElementById("zoom-level");
    if (!container) return;

    if (!isMobile) {
        // Reset/Respect desktop zoom level
        container.style.setProperty("--zoom-factor", currentZoom);
        if (zoomText) zoomText.innerText = Math.round(currentZoom * 100) + "%";
        return;
    }

    const scrollContainer = document.querySelector(".preview-scroll-container");
    if (!scrollContainer) return;

    const containerWidth = scrollContainer.clientWidth;
    const targetWidth = 794; // approx standard 210mm A4 width in pixels at 96 DPI
    const padding = 20; // total side margins padding
    const availableWidth = containerWidth - padding;

    let scale = availableWidth / targetWidth;
    if (scale < 0.15) scale = 0.15; // absolute floor
    if (scale > 1.2) scale = 1.2; // absolute ceiling

    container.style.setProperty("--zoom-factor", scale);
    if (zoomText) zoomText.innerText = Math.round(scale * 100) + "%";
}

// ==========================================================================
// 3. EVENT BINDING & FORM SYNC
// ==========================================================================
function initFormValues() {
    // Sender
    document.getElementById("company-name").value = invoiceState.companyName;
    document.getElementById("company-address").value = invoiceState.companyAddress;
    document.getElementById("company-gstin").value = invoiceState.companyGstin;
    document.getElementById("company-state").value = invoiceState.companyState;
    document.getElementById("company-state-code").value = invoiceState.companyStateCode;
    document.getElementById("logo-visible").checked = invoiceState.logoVisible;

    // Metadata
    document.getElementById("invoice-no").value = invoiceState.invoiceNo;
    document.getElementById("invoice-date").value = invoiceState.invoiceDate;
    document.getElementById("show-tax-invoice").checked = invoiceState.showTaxInvoice;
    document.getElementById("show-debit-memo").checked = invoiceState.showDebitMemo;
    document.getElementById("show-original").checked = invoiceState.showOriginal;

    // Receiver
    document.getElementById("receiver-name").value = invoiceState.receiverName;
    document.getElementById("receiver-address").value = invoiceState.receiverAddress;
    document.getElementById("receiver-state").value = invoiceState.receiverState;
    document.getElementById("receiver-state-code").value = invoiceState.receiverStateCode;
    document.getElementById("receiver-gstin").value = invoiceState.receiverGstin;

    // Transport & Taxes
    document.getElementById("vehicle-no").value = invoiceState.vehicleNo;
    document.getElementById("cgst-rate").value = invoiceState.cgstRate;
    document.getElementById("sgst-rate").value = invoiceState.sgstRate;
    document.getElementById("tcs-amount").value = invoiceState.tcsAmount;
    document.getElementById("round-off-amount").value = invoiceState.roundOffAmount;
    document.getElementById("invoice-total-override").value = invoiceState.invoiceTotalOverride;

    // Terms
    document.getElementById("jurisdiction").value = invoiceState.jurisdiction;
    document.getElementById("company-signature-label").value = invoiceState.companySignatureLabel;
    document.getElementById("eoe-label").value = invoiceState.eoeLabel;
}

function setupFormListeners() {
    const inputs = [
        { id: "company-name", key: "companyName" },
        { id: "company-address", key: "companyAddress" },
        { id: "company-gstin", key: "companyGstin" },
        { id: "company-state", key: "companyState" },
        { id: "company-state-code", key: "companyStateCode" },
        { id: "logo-visible", key: "logoVisible", isCheckbox: true },
        
        { id: "invoice-no", key: "invoiceNo" },
        { id: "invoice-date", key: "invoiceDate" },
        { id: "show-tax-invoice", key: "showTaxInvoice", isCheckbox: true },
        { id: "show-debit-memo", key: "showDebitMemo", isCheckbox: true },
        { id: "show-original", key: "showOriginal", isCheckbox: true },

        { id: "receiver-name", key: "receiverName" },
        { id: "receiver-address", key: "receiverAddress" },
        { id: "receiver-state", key: "receiverState" },
        { id: "receiver-state-code", key: "receiverStateCode" },
        { id: "receiver-gstin", key: "receiverGstin" },

        { id: "vehicle-no", key: "vehicleNo" },
        { id: "cgst-rate", key: "cgstRate", isNumeric: true },
        { id: "sgst-rate", key: "sgstRate", isNumeric: true },
        { id: "tcs-amount", key: "tcsAmount", isNumeric: true, allowEmpty: true },
        { id: "round-off-amount", key: "roundOffAmount", isNumeric: true, allowEmpty: true },
        { id: "invoice-total-override", key: "invoiceTotalOverride", isNumeric: true, allowEmpty: true },

        { id: "jurisdiction", key: "jurisdiction" },
        { id: "company-signature-label", key: "companySignatureLabel" },
        { id: "eoe-label", key: "eoeLabel" }
    ];

    inputs.forEach(inputInfo => {
        const el = document.getElementById(inputInfo.id);
        if (!el) return;

        const eventType = el.tagName === "TEXTAREA" || el.tagName === "INPUT" ? "input" : "change";

        el.addEventListener(eventType, () => {
            if (inputInfo.isCheckbox) {
                invoiceState[inputInfo.key] = el.checked;
            } else if (inputInfo.isNumeric) {
                if (inputInfo.allowEmpty && el.value === "") {
                    invoiceState[inputInfo.key] = "";
                } else {
                    invoiceState[inputInfo.key] = parseFloat(el.value) || 0;
                }
            } else {
                invoiceState[inputInfo.key] = el.value;
            }

            recalculateInvoice();
            saveStateToStorage();
        });
    });
}

function setupButtonActions() {
    // Add new row button
    document.getElementById("btn-add-item").addEventListener("click", () => {
        invoiceState.items.push({
            description: "",
            hsn: "",
            quantity: 0,
            unit: "KGS",
            rate: 0,
            discount: ""
        });
        renderItemsList();
        recalculateInvoice();
        saveStateToStorage();
        
        // Scroll to the new item in the form
        setTimeout(() => {
            const list = document.getElementById("items-list");
            list.lastElementChild.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });

    // Reset Form button
    document.getElementById("btn-reset").addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all data and start a blank invoice?")) {
            invoiceState = {
                companyName: "",
                companyAddress: "",
                companyGstin: "",
                companyState: "",
                companyStateCode: "",
                logoVisible: true,
                invoiceNo: "",
                invoiceDate: "",
                showTaxInvoice: true,
                showDebitMemo: true,
                showOriginal: true,
                receiverName: "",
                receiverAddress: "",
                receiverState: "",
                receiverStateCode: "",
                receiverGstin: "",
                items: [],
                vehicleNo: "",
                cgstRate: 0,
                sgstRate: 0,
                tcsAmount: "",
                roundOffAmount: "",
                invoiceTotalOverride: "",
                jurisdiction: "",
                companySignatureLabel: "",
                eoeLabel: "",
                wordsOverride: ""
            };
            initFormValues();
            renderItemsList();
            recalculateInvoice();
            saveStateToStorage();
        }
    });

    // Load Sample Data button
    document.getElementById("btn-load-sample").addEventListener("click", () => {
        if (confirm("Restore pre-filled sample data matching your reference image?")) {
            invoiceState = JSON.parse(JSON.stringify(SAMPLE_STATE));
            initFormValues();
            renderItemsList();
            recalculateInvoice();
            saveStateToStorage();
        }
    });

    // Auto-calculate Round Off button
    document.getElementById("btn-calc-roundoff").addEventListener("click", () => {
        const sub = calculateSubtotal();
        const cgst = sub * (invoiceState.cgstRate / 100);
        const sgst = sub * (invoiceState.sgstRate / 100);
        const tcs = parseFloat(invoiceState.tcsAmount) || 0;
        const totalRaw = sub + cgst + sgst + tcs;
        const totalRounded = Math.round(totalRaw);
        
        const roundOffVal = (totalRounded - totalRaw).toFixed(2);
        
        document.getElementById("round-off-amount").value = roundOffVal;
        invoiceState.roundOffAmount = parseFloat(roundOffVal);
        recalculateInvoice();
        saveStateToStorage();
    });

    // Print / Save PDF buttons (Desktop & Mobile)
    const triggerPrint = () => {
        window.print();
    };
    
    document.getElementById("btn-print").addEventListener("click", triggerPrint);
    
    const mobilePrintBtn = document.getElementById("btn-print-mobile");
    if (mobilePrintBtn) {
        mobilePrintBtn.addEventListener("click", triggerPrint);
    }
}

function setupZoomControls() {
    const container = document.getElementById("printable-invoice");
    const zoomText = document.getElementById("zoom-level");

    document.getElementById("btn-zoom-in").addEventListener("click", () => {
        if (currentZoom < 1.5) {
            currentZoom += 0.05;
            container.style.setProperty("--zoom-factor", currentZoom);
            zoomText.innerText = Math.round(currentZoom * 100) + "%";
        }
    });

    document.getElementById("btn-zoom-out").addEventListener("click", () => {
        if (currentZoom > 0.4) {
            currentZoom -= 0.05;
            container.style.setProperty("--zoom-factor", currentZoom);
            zoomText.innerText = Math.round(currentZoom * 100) + "%";
        }
    });
}

function saveStateToStorage() {
    localStorage.setItem("antigravity_bill_state", JSON.stringify(invoiceState));
}

// ==========================================================================
// 4. ITEMS FORM BUILDER
// ==========================================================================
function renderItemsList() {
    const list = document.getElementById("items-list");
    list.innerHTML = "";

    if (invoiceState.items.length === 0) {
        list.innerHTML = `<div class="text-center" style="padding: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">No items added yet. Click 'Add Item' above!</div>`;
        return;
    }

    invoiceState.items.forEach((item, index) => {
        const itemCard = document.createElement("div");
        itemCard.className = "item-editor-card";
        
        itemCard.innerHTML = `
            <div class="item-card-header">
                <span class="item-card-index">Item #${index + 1}</span>
                <button type="button" class="btn-delete-item" onclick="deleteItem(${index})" title="Delete Item">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
            <div class="form-group">
                <label>Description of Goods</label>
                <input type="text" value="${item.description}" placeholder="e.g. CI SCRAP DUST" oninput="updateItemField(${index}, 'description', this.value)">
            </div>
            <div class="form-row col-2">
                <div class="form-group">
                    <label>HSN/SAC</label>
                    <input type="text" value="${item.hsn}" placeholder="e.g. 72041000" oninput="updateItemField(${index}, 'hsn', this.value)">
                </div>
                <div class="form-group">
                    <label>Unit</label>
                    <input type="text" value="${item.unit}" placeholder="KGS" oninput="updateItemField(${index}, 'unit', this.value)">
                </div>
            </div>
            <div class="form-row col-3">
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" step="0.01" value="${item.quantity}" placeholder="0.00" oninput="updateItemField(${index}, 'quantity', parseFloat(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label>Rate</label>
                    <input type="number" step="0.01" value="${item.rate}" placeholder="0.00" oninput="updateItemField(${index}, 'rate', parseFloat(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label>Discount</label>
                    <input type="number" step="0.01" value="${item.discount}" placeholder="0.00" oninput="updateItemField(${index}, 'discount', this.value === '' ? '' : parseFloat(this.value) || 0)">
                </div>
            </div>
        `;
        list.appendChild(itemCard);
    });
}

function updateItemField(index, field, value) {
    invoiceState.items[index][field] = value;
    recalculateInvoice();
    saveStateToStorage();
}

function deleteItem(index) {
    invoiceState.items.splice(index, 1);
    renderItemsList();
    recalculateInvoice();
    saveStateToStorage();
}

// ==========================================================================
// 5. MATH CALCULATIONS & RENDER BINDING
// ==========================================================================
function calculateSubtotal() {
    return invoiceState.items.reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const disc = parseFloat(item.discount) || 0;
        const amt = (qty * rate) - disc;
        return sum + amt;
    }, 0);
}

function calculateTotalQuantity() {
    return invoiceState.items.reduce((sum, item) => {
        return sum + (parseFloat(item.quantity) || 0);
    }, 0);
}

function recalculateInvoice() {
    // 1. Sync Text Values to Preview DOM
    document.getElementById("preview-comp-name").innerText = invoiceState.companyName || "COMPANY NAME";
    document.getElementById("preview-comp-address").innerText = invoiceState.companyAddress || "Address line";
    document.getElementById("preview-comp-gstin").innerText = invoiceState.companyGstin || "-";
    document.getElementById("preview-comp-state").innerText = invoiceState.companyState || "-";
    document.getElementById("preview-comp-state-code").innerText = invoiceState.companyStateCode || "-";

    const logoBox = document.getElementById("preview-logo-box");
    if (invoiceState.logoVisible) {
        logoBox.classList.remove("logo-hidden");
    } else {
        logoBox.classList.add("logo-hidden");
    }

    document.getElementById("preview-recv-name").innerText = invoiceState.receiverName || "CUSTOMER NAME";
    document.getElementById("preview-recv-address").innerText = invoiceState.receiverAddress || "Customer Address line";
    document.getElementById("preview-recv-state").innerText = invoiceState.receiverState || "-";
    document.getElementById("preview-recv-state-code").innerText = invoiceState.receiverStateCode || "-";
    document.getElementById("preview-recv-gstin").innerText = invoiceState.receiverGstin || "-";

    document.getElementById("preview-inv-no").innerText = invoiceState.invoiceNo || "-";
    
    // Format Date to DD/MM/YYYY
    const rawDate = invoiceState.invoiceDate;
    let formattedDate = "-";
    if (rawDate) {
        const dateParts = rawDate.split("-");
        if (dateParts.length === 3) {
            formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        }
    }
    document.getElementById("preview-inv-date").innerText = formattedDate;

    // Header Tags
    toggleTag("preview-tag-tax", invoiceState.showTaxInvoice);
    toggleTag("preview-tag-debit", invoiceState.showDebitMemo);
    toggleTag("preview-tag-original", invoiceState.showOriginal);

    document.getElementById("preview-vehicle-no").innerText = invoiceState.vehicleNo ? `NO - ${invoiceState.vehicleNo}` : "-";
    document.getElementById("preview-jurisdiction").innerText = invoiceState.jurisdiction || "";
    document.getElementById("preview-sig-label").innerText = invoiceState.companySignatureLabel || "";
    document.getElementById("preview-eoe-label").innerText = invoiceState.eoeLabel || "";

    // 2. Compute Numbers & Items
    const subtotalAmt = calculateSubtotal();
    const subtotalQty = calculateTotalQuantity();

    // Render Preview Table Body
    const tbody = document.getElementById("preview-table-body");
    tbody.innerHTML = "";

    invoiceState.items.forEach((item, index) => {
        const qty = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const disc = parseFloat(item.discount) || 0;
        const amt = (qty * rate) - disc;

        const tr = document.createElement("tr");
        tr.className = "item-row";
        tr.innerHTML = `
            <td class="col-sr">${index + 1}</td>
            <td class="col-desc bold">${item.description || ""}</td>
            <td class="col-hsn">${item.hsn || ""}</td>
            <td class="col-qty">${qty > 0 ? qty.toFixed(2) : ""}</td>
            <td class="col-unit">${qty > 0 ? (item.unit || "KGS") : ""}</td>
            <td class="col-rate">${rate > 0 ? rate.toFixed(2) : ""}</td>
            <td class="col-disc">${disc > 0 ? disc.toFixed(2) : ""}</td>
            <td class="col-amt">${amt > 0 ? amt.toFixed(2) : ""}</td>
        `;
        tbody.appendChild(tr);
    });

    // Add Spacer Row to stretch borders nicely to A4 height limits
    const spacerTr = document.createElement("tr");
    spacerTr.className = "spacer-row";
    spacerTr.innerHTML = `
        <td class="col-sr"></td>
        <td class="col-desc"></td>
        <td class="col-hsn"></td>
        <td class="col-qty"></td>
        <td class="col-unit"></td>
        <td class="col-rate"></td>
        <td class="col-disc"></td>
        <td class="col-amt"></td>
    `;
    tbody.appendChild(spacerTr);

    // Populate Table subtotal row values
    document.getElementById("preview-total-qty").innerText = subtotalQty > 0 ? subtotalQty.toFixed(2) : "";
    document.getElementById("preview-total-unit").innerText = invoiceState.items.length > 0 ? (invoiceState.items[0].unit || "KGS") : "";
    document.getElementById("preview-subtotal-amount").innerText = subtotalAmt.toFixed(2);

    // 3. Tax Calculations
    const cgstAmt = subtotalAmt * (invoiceState.cgstRate / 100);
    const sgstAmt = subtotalAmt * (invoiceState.sgstRate / 100);
    const tcsAmt = parseFloat(invoiceState.tcsAmount) || 0;
    const roundOffAmt = parseFloat(invoiceState.roundOffAmount) || 0;

    // Display rates in labels
    document.getElementById("preview-cgst-rate-val").innerText = invoiceState.cgstRate.toFixed(2);
    document.getElementById("preview-sgst-rate-val").innerText = invoiceState.sgstRate.toFixed(2);

    // Display values in preview
    document.getElementById("preview-cgst-amount").innerText = cgstAmt > 0 ? cgstAmt.toFixed(2) : "";
    document.getElementById("preview-sgst-amount").innerText = sgstAmt > 0 ? sgstAmt.toFixed(2) : "";
    
    // TCS Row visibility
    const tcsRow = document.getElementById("row-tcs");
    if (tcsAmt > 0) {
        tcsRow.classList.remove("empty-tax-row");
        document.getElementById("preview-tcs-amount").innerText = tcsAmt.toFixed(2);
    } else {
        tcsRow.classList.add("empty-tax-row");
        document.getElementById("preview-tcs-amount").innerText = "";
    }

    // Round Off Row visibility
    const roundOffRow = document.getElementById("row-roundoff");
    if (roundOffAmt !== 0) {
        roundOffRow.classList.remove("empty-tax-row");
        // Format round off with positive/negative symbol
        const sign = roundOffAmt > 0 ? "+" : "";
        document.getElementById("preview-roundoff-amount").innerText = sign + roundOffAmt.toFixed(2);
    } else {
        roundOffRow.classList.add("empty-tax-row");
        document.getElementById("preview-roundoff-amount").innerText = "";
    }

    // Grand Total calculation
    let grandTotal = subtotalAmt + cgstAmt + sgstAmt + tcsAmt + roundOffAmt;
    
    // Support Manual Override if needed
    if (invoiceState.invoiceTotalOverride !== "" && !isNaN(invoiceState.invoiceTotalOverride)) {
        grandTotal = parseFloat(invoiceState.invoiceTotalOverride);
    }

    document.getElementById("preview-grand-total").innerText = grandTotal.toFixed(2);

    // 4. Words Translation
    let totalInWords = "";
    if (invoiceState.wordsOverride) {
        totalInWords = invoiceState.wordsOverride;
    } else {
        totalInWords = convertNumberToWords(grandTotal);
    }
    document.getElementById("preview-total-words").innerText = totalInWords;

    // Keep mobile preview scaling in sync with calculations
    autoScaleMobilePreview();
}

function toggleTag(id, isVisible) {
    const el = document.getElementById(id);
    if (!el) return;
    if (isVisible) {
        el.classList.remove("tag-hidden");
    } else {
        el.classList.add("tag-hidden");
    }
}

// ==========================================================================
// 6. INDIAN NUMBER TO WORDS CONVERTER
// ==========================================================================
function convertNumberToWords(num) {
    if (num === 0 || isNaN(num)) return 'ZERO';
    
    // Parse to float, get positive value
    let positiveNum = Math.abs(parseFloat(num));
    
    // Round to 2 decimal places to capture paise cleanly
    let parts = positiveNum.toFixed(2).split('.');
    let rupees = parseInt(parts[0]);
    let paise = parseInt(parts[1]);
    
    let words = "";
    
    if (rupees > 0) {
        words += convertIndianAmount(rupees);
    }
    
    if (paise > 0) {
        if (words !== "") {
            words += " AND PAISE " + convertIndianAmount(paise);
        } else {
            words += "PAISE " + convertIndianAmount(paise);
        }
    }
    
    // If it's a specific amount, let's keep it styled matching the reference image.
    // The reference has "FOURTY TWO THOUSAND AND EIGHT"
    // Let's standardise forty/fourty - let's replace "FORTY" with "FOURTY" to look 100% same!
    let finalWords = words.trim();
    finalWords = finalWords.replace(/\bFORTY\b/g, "FOURTY");
    
    return finalWords;
}

function convertIndianAmount(num) {
    const single = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
    const double = ["TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
    const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
    
    if (num === 0) return "";
    
    function helper(n) {
        let str = "";
        if (n >= 100) {
            str += single[Math.floor(n / 100)] + " HUNDRED ";
            n %= 100;
        }
        if (n >= 20) {
            str += tens[Math.floor(n / 10)] + " ";
            n %= 10;
        }
        if (n >= 10) {
            str += double[n - 10] + " ";
            n = 0;
        }
        if (n > 0) {
            str += single[n] + " ";
        }
        return str.trim();
    }
    
    let res = "";
    let crore = Math.floor(num / 10000000);
    num %= 10000000;
    let lakh = Math.floor(num / 100000);
    num %= 100000;
    let thousand = Math.floor(num / 1000);
    num %= 1000;
    
    if (crore > 0) {
        res += helper(crore) + " CRORE ";
    }
    if (lakh > 0) {
        res += helper(lakh) + " LAKH ";
    }
    if (thousand > 0) {
        res += helper(thousand) + " THOUSAND ";
    }
    if (num > 0) {
        if (res !== "") {
            res += "AND " + helper(num);
        } else {
            res += helper(num);
        }
    }
    return res.trim();
}
