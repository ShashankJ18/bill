// ==========================================================================
// 1. DATA MODEL & STATE
// Secure access key hash (SHA-256) of your password (default is "Dilip0981").
// If you want to change your password, generate a new SHA-256 hash online and paste it below!
const APP_PASSWORD_HASH = "3235f8a9c814c0a2de906f364f7eac27f6bc7d1cb4175e3d6129df4ef03ef73f";

// Securely Obfuscated Invoice Template String (Contains private company name, GSTINs, Bank details)
const ENCODED_TEMPLATE = "eyJjb21wYW55TmFtZSI6IkpBWSBBTUJFIFNDUkFQIFRSQURFUlMiLCJjb21wYW55QWRkcmVzcyI6IlBMT1QgTk8uRDM2QiBHQUxMT1BTIElORFVTVFJJQUwgUEFSSyAyIE5FQVIgUlVQQSBTQ1JFRU4gTkggOEFcblNBUktIRUogLSBCQVZMQSBST0FEIFJBSk9EQSBDSEFOR09EQVIgQUhNRURBQkFEIDM4MjIyMCIsImNvbXBhbnlHc3RpbiI6IjI0Q1hMUEo1MDY4QjFaSyIsImNvbXBhbnlTdGF0ZSI6Ikd1amFyYXQiLCJjb21wYW55U3RhdGVDb2RlIjoiMjQiLCJsb2dvVmlzaWJsZSI6dHJ1ZSwiaW52b2ljZU5vIjoiMDIiLCJpbnZvaWNlRGF0ZSI6IjIwMjYtMDUtMjUiLCJzaG93VGF4SW52b2ljZSI6dHJ1ZSwic2hvd0RlYml0TWVtbyI6dHJ1ZSwic2hvd09yaWdpbmFsIjp0cnVlLCJyZWNlaXZlck5hbWUiOiJKYWlzd2FsIEVudGVycHJpc2UiLCJyZWNlaXZlckFkZHJlc3MiOiJQTE9UIE5PIC0gMTU4LCBBSkkgVkFTSEFUIEcuSS5ELkMuLCBST0FELUUsIFJBSktPVCIsInJlY2VpdmVyU3RhdGUiOiJHdWphcmF0IiwicmVjZWl2ZXJTdGF0ZUNvZGUiOiIyNCIsInJlY2VpdmVyR3N0aW4iOiIyNEFBREZBNzMzOE4xWjkiLCJpdGVtcyI6W3siZGVzY3JpcHRpb24iOiJDSSBTQ1JBUCBEVVNUIiwiaHNuIjoiNzIwNDEwMDAiLCJxdWFudGl0eSI6IiIsInVuaXQiOiJLR1MiLCJyYXRlIjoiIiwiZGlzY291bnQiOiIifV0sInZlaGljbGVObyI6IkdKMDNCWjc0NDQiLCJjZ3N0UmF0ZSI6OSwic2dzdFJhdGUiOjksInRjc0Ftb3VudCI6IiIsInJvdW5kT2ZmQW1vdW50IjoiIiwiaW52b2ljZVRvdGFsT3ZlcnJpZGUiOiIiLCJiYW5rTmFtZSI6IlRIRSBWSUpBWSBDTy1PUCBCQU5LIExURCIsImJhbmtBY05vIjoiMTMyMDEzMTAxMDAzMTgwIiwiYmFua0lmc2MiOiJWQ09CMDAwMDAxMyIsImJhbmtCcmFuY2giOiJPREhBViIsImJhbmtBY1R5cGUiOiJDVVJSRU5UIiwianVyaXNkaWN0aW9uIjoiQUhNRURBQkFEIiwiY29tcGFueVNpZ25hdHVyZUxhYmVsIjoiRm9yLCBKQVkgQU1CRSBTQ1JBUCBUUkFERVJTIiwiZW9lTGFiZWwiOiJFICYgTy5FLiIsIndvcmRzT3ZlcnJpZGUiOiIifQ==";

let invoiceState = {
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
    cgstRate: 9.00,
    sgstRate: 9.00,
    tcsAmount: "",
    roundOffAmount: "",
    invoiceTotalOverride: "",
    bankName: "",
    bankAcNo: "",
    bankIfsc: "",
    bankBranch: "",
    bankAcType: "",
    jurisdiction: "",
    companySignatureLabel: "",
    eoeLabel: "",
    wordsOverride: ""
};

let SAMPLE_STATE = JSON.parse(JSON.stringify(invoiceState));

// Zoom factor for the live preview
let currentZoom = 0.85;

// ==========================================================================
// 2. INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    setupPasswordGate();
    setupAntiInspect();

    // Setup Theme Toggler (Default Light Mode)
    setupThemeToggler();

    // Default sidebar tab
    switchSidebarTab('parties');

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

    // Interactive Inline Editing (Directly in Preview Sheet)
    setupInlineEditing();
});

// Sidebar tab switching UX makeover
function switchSidebarTab(tabName) {
    // 1. Update tab button active states
    const tabButtons = document.querySelectorAll('.sidebar-tab-btn');
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 2. Hide/show relevant form sections
    const formSections = document.querySelectorAll('.form-section');
    formSections.forEach(section => {
        if (section.getAttribute('data-sidebar-tab') === tabName) {
            section.classList.add('active-tab');
        } else {
            section.classList.remove('active-tab');
        }
    });
}

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

    // Bank details
    document.getElementById("bank-name").value = invoiceState.bankName;
    document.getElementById("bank-ac-no").value = invoiceState.bankAcNo;
    document.getElementById("bank-ifsc").value = invoiceState.bankIfsc;
    document.getElementById("bank-branch").value = invoiceState.bankBranch;
    document.getElementById("bank-ac-type").value = invoiceState.bankAcType;

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

        { id: "bank-name", key: "bankName" },
        { id: "bank-ac-no", key: "bankAcNo" },
        { id: "bank-ifsc", key: "bankIfsc" },
        { id: "bank-branch", key: "bankBranch" },
        { id: "bank-ac-type", key: "bankAcType" },

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
                bankName: "",
                bankAcNo: "",
                bankIfsc: "",
                bankBranch: "",
                bankAcType: "",
                jurisdiction: "",
                companySignatureLabel: "",
                eoeLabel: "",
                wordsOverride: ""
            };
            initFormValues();
            renderItemsList();
            recalculateInvoice();
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

// Theme toggle logic (Default Light Mode, high-end Vercel Dark Switch)
function setupThemeToggler() {
    const toggleBtn = document.getElementById("btn-theme-toggle");
    if (!toggleBtn) return;

    // Check saved theme or default to light
    const savedTheme = localStorage.getItem("gst-invoice-theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(toggleBtn, savedTheme);

    toggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("gst-invoice-theme", newTheme);
        updateThemeIcon(toggleBtn, newTheme);
    });
}

function updateThemeIcon(btn, theme) {
    if (theme === "dark") {
        btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        btn.title = "Switch to Light Theme";
    } else {
        btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        btn.title = "Switch to Dark Theme";
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
    // No-op: Run-time only application, does not cache to storage
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

function recalculateInvoice(skipTableRebuild = false) {
    // 1. Sync Text Values to Preview DOM
    setInnerTextSafe("preview-comp-name", invoiceState.companyName || "COMPANY NAME");
    setInnerTextSafe("preview-comp-address", invoiceState.companyAddress || "Address line");
    setInnerTextSafe("preview-comp-gstin", invoiceState.companyGstin || "-");
    setInnerTextSafe("preview-comp-state", invoiceState.companyState || "-");
    setInnerTextSafe("preview-comp-state-code", invoiceState.companyStateCode || "-");

    const logoBox = document.getElementById("preview-logo-box");
    if (invoiceState.logoVisible) {
        logoBox.classList.remove("logo-hidden");
    } else {
        logoBox.classList.add("logo-hidden");
    }

    setInnerTextSafe("preview-recv-name", invoiceState.receiverName || "CUSTOMER NAME");
    setInnerTextSafe("preview-recv-address", invoiceState.receiverAddress || "Customer Address line");
    setInnerTextSafe("preview-recv-state", invoiceState.receiverState || "-");
    setInnerTextSafe("preview-recv-state-code", invoiceState.receiverStateCode || "-");
    setInnerTextSafe("preview-recv-gstin", invoiceState.receiverGstin || "-");

    setInnerTextSafe("preview-inv-no", invoiceState.invoiceNo || "-");

    // Format Date to DD/MM/YYYY
    const rawDate = invoiceState.invoiceDate;
    let formattedDate = "-";
    if (rawDate) {
        const dateParts = rawDate.split("-");
        if (dateParts.length === 3) {
            formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        }
    }
    setInnerTextSafe("preview-inv-date", formattedDate);

    // Header Tags
    toggleTag("preview-tag-tax", invoiceState.showTaxInvoice);
    toggleTag("preview-tag-debit", invoiceState.showDebitMemo);
    toggleTag("preview-tag-original", invoiceState.showOriginal);

    setInnerTextSafe("preview-vehicle-no", invoiceState.vehicleNo ? `NO - ${invoiceState.vehicleNo}` : "-");
    setInnerTextSafe("preview-bank-name", invoiceState.bankName || "");
    setInnerTextSafe("preview-bank-ac-no", invoiceState.bankAcNo || "");
    setInnerTextSafe("preview-bank-ifsc", invoiceState.bankIfsc || "");
    setInnerTextSafe("preview-bank-branch", invoiceState.bankBranch || "");
    setInnerTextSafe("preview-bank-ac-type", invoiceState.bankAcType || "");
    setInnerTextSafe("preview-jurisdiction", invoiceState.jurisdiction || "");
    setInnerTextSafe("preview-sig-label", invoiceState.companySignatureLabel || "");
    setInnerTextSafe("preview-eoe-label", invoiceState.eoeLabel || "");

    // 2. Compute Numbers & Items
    const subtotalAmt = calculateSubtotal();
    const subtotalQty = calculateTotalQuantity();

    // Render Preview Table Body
    if (!skipTableRebuild) {
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
                <td class="col-desc bold" contenteditable="true" data-index="${index}" data-field="description">${item.description || ""}</td>
                <td class="col-hsn" contenteditable="true" data-index="${index}" data-field="hsn">${item.hsn || ""}</td>
                <td class="col-qty" contenteditable="true" data-index="${index}" data-field="quantity">${qty > 0 ? qty.toFixed(2) : ""}</td>
                <td class="col-unit" contenteditable="true" data-index="${index}" data-field="unit">${qty > 0 ? (item.unit || "KGS") : ""}</td>
                <td class="col-rate" contenteditable="true" data-index="${index}" data-field="rate">${rate > 0 ? rate.toFixed(2) : ""}</td>
                <td class="col-disc" contenteditable="true" data-index="${index}" data-field="discount">${disc > 0 ? disc.toFixed(2) : ""}</td>
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
    }

    // Populate Table subtotal row values
    document.getElementById("preview-total-qty").innerText = subtotalQty > 0 ? subtotalQty.toFixed(2) : "";
    document.getElementById("preview-total-unit").innerText = invoiceState.items.length > 0 ? (invoiceState.items[0].unit || "KGS") : "";
    document.getElementById("preview-subtotal-amount").innerText = subtotalAmt.toFixed(2);

    // 3. Tax Calculations
    const cgstAmt = Math.round(subtotalAmt * (invoiceState.cgstRate / 100));
    const sgstAmt = Math.round(subtotalAmt * (invoiceState.sgstRate / 100));
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
    if (num === 0 || isNaN(num)) return 'Zero';

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

    let finalWords = words.trim();
    if (finalWords) {
        finalWords = finalWords.toLowerCase();
        // Capitalize the first letter
        finalWords = finalWords.charAt(0).toUpperCase() + finalWords.slice(1);
    }

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

// ==========================================================================
// 7. INLINE EDITING LOGIC (DIRECT PREVIEW INTERACTIVITY)
// ==========================================================================
function setInnerTextSafe(id, val) {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) {
        el.innerText = val;
    }
}

function setupInlineEditing() {
    const elementsToSync = {
        "preview-comp-name": "company-name",
        "preview-comp-address": "company-address",
        "preview-comp-gstin": "company-gstin",
        "preview-comp-state": "company-state",
        "preview-comp-state-code": "company-state-code",
        "preview-recv-name": "receiver-name",
        "preview-recv-address": "receiver-address",
        "preview-recv-gstin": "receiver-gstin",
        "preview-recv-state": "receiver-state",
        "preview-recv-state-code": "receiver-state-code",
        "preview-inv-no": "invoice-no",
        "preview-inv-date": "invoice-date",
        "preview-vehicle-no": "vehicle-no",
        "preview-jurisdiction": "jurisdiction",
        "preview-sig-label": "company-signature-label",
        "preview-eoe-label": "eoe-label",
        "preview-cgst-rate-val": "cgst-rate",
        "preview-sgst-rate-val": "sgst-rate",
        "preview-bank-name": "bank-name",
        "preview-bank-ac-no": "bank-ac-no",
        "preview-bank-ifsc": "bank-ifsc",
        "preview-bank-branch": "bank-branch",
        "preview-bank-ac-type": "bank-ac-type",
    };

    Object.entries(elementsToSync).forEach(([previewId, formId]) => {
        const previewEl = document.getElementById(previewId);
        const formEl = document.getElementById(formId);
        if (!previewEl || !formEl) return;

        // Enable contenteditable for this cell/text span
        previewEl.setAttribute("contenteditable", "true");
        previewEl.setAttribute("title", "Click to edit directly inside bill");

        previewEl.addEventListener("input", () => {
            let text = previewEl.innerText;

            // Format overrides cleanup
            if (previewId === "preview-vehicle-no" && text.startsWith("NO - ")) {
                text = text.substring(5);
            }

            // Special date formats conversion: DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD
            if (previewId === "preview-inv-date") {
                const parts = text.split(/[\/\-]/);
                if (parts.length === 3) {
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    const year = parts[2];
                    if (year.length === 4 && !isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        formEl.value = `${year}-${month}-${day}`;
                    }
                }
            } else {
                formEl.value = text;
            }

            // Fire standard event to keep everything synced (state, calculations, storage)
            const event = new Event("input", { bubbles: true });
            formEl.dispatchEvent(event);
        });

        previewEl.addEventListener("blur", () => {
            // Recalculate fully on focus out to apply standard text formats and fallbacks
            recalculateInvoice();
        });
    });

    // 2. Table Event Delegation for Dynamically Rendered Table Cells
    const tbody = document.getElementById("preview-table-body");
    if (tbody) {
        tbody.addEventListener("input", (e) => {
            const cell = e.target;
            if (!cell.hasAttribute("contenteditable")) return;

            const index = parseInt(cell.getAttribute("data-index"));
            const field = cell.getAttribute("data-field");
            let textVal = cell.innerText;

            if (isNaN(index)) return;

            // Sync numerical inputs vs string inputs
            if (["quantity", "rate", "discount"].includes(field)) {
                invoiceState.items[index][field] = parseFloat(textVal) || 0;
            } else {
                invoiceState.items[index][field] = textVal;
            }

            // Sync visual fields back to the sidebar editor form dynamically without full rebuild
            renderItemsList();
            recalculateInvoice(true); // Recalculate totals but skip rebuilding the A4 table body so focus is maintained
            saveStateToStorage();
        });

        tbody.addEventListener("blur", (e) => {
            // Full rebuild on blur to format numbers correctly (e.g. adding decimals/fixed points)
            recalculateInvoice();
        }, true);
    }
}

// ==========================================================================
// 8. PASSWORD GATEWAY CONTROL
// ==========================================================================
function setupPasswordGate() {
    const gate = document.getElementById("password-gate");
    const input = document.getElementById("app-password-input");
    const unlockBtn = document.getElementById("btn-unlock-app");
    const toggleEye = document.getElementById("toggle-password-visibility");
    const errorMsg = document.getElementById("password-error-msg");

    if (!gate || !input || !unlockBtn) return;

    // Auto-focus input on load
    setTimeout(() => input.focus(), 150);

    // Toggle Eye Visibility
    if (toggleEye) {
        toggleEye.addEventListener("click", () => {
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            const icon = toggleEye.querySelector("i");
            if (icon) {
                icon.className = isPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
            }
        });
    }

    const verifyAndUnlock = async () => {
        const value = input.value.trim();
        
        // Compute SHA-256 hash of the input value securely using Web Crypto API
        let hashedInput = "";
        try {
            const msgBuffer = new TextEncoder().encode(value);
            const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            hashedInput = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        } catch (e) {
            console.error("Crypto API error", e);
        }

        if (hashedInput === APP_PASSWORD_HASH) {
            // Correct password - Decode and populate pre-filled state model
            try {
                const decodedJSON = atob(ENCODED_TEMPLATE);
                invoiceState = JSON.parse(decodedJSON);
                SAMPLE_STATE = JSON.parse(decodedJSON);

                // Run initialization routines with the decoded data
                initFormValues();
                renderItemsList();
                recalculateInvoice();
            } catch (err) {
                console.error("Template decoding error", err);
            }

            gate.classList.add("fade-out");
            errorMsg.classList.add("hidden");
        } else {
            // Incorrect password
            errorMsg.classList.remove("hidden");
            
            // Re-trigger shake/vibration animation
            errorMsg.style.animation = 'none';
            errorMsg.offsetHeight; /* trigger reflow */
            errorMsg.style.animation = null;
            
            input.value = "";
            input.focus();
        }
    };

    unlockBtn.addEventListener("click", verifyAndUnlock);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            verifyAndUnlock();
        }
    });
}

// ==========================================================================
// 9. ANTI-INSPECT / DEVELOPER TOOLS PROTECTION
// ==========================================================================
function setupAntiInspect() {
    // 1. Disable Right-Click Context Menu
    document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U)
    document.addEventListener("keydown", (e) => {
        // Block F12
        if (e.key === "F12") {
            e.preventDefault();
            return false;
        }

        // Block Ctrl+Shift+I (Inspect Elements), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element Selector)
        if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
            e.preventDefault();
            return false;
        }

        // Block Ctrl+U (View Page Source)
        if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
            e.preventDefault();
            return false;
        }
    });

    // 3. Block Text Selection and Drag Events on password screen
    document.addEventListener("selectstart", (e) => {
        const gate = document.getElementById("password-gate");
        if (gate && gate.contains(e.target)) {
            e.preventDefault();
        }
    });

    document.addEventListener("dragstart", (e) => {
        const gate = document.getElementById("password-gate");
        if (gate && gate.contains(e.target)) {
            e.preventDefault();
        }
    });

    // 4. Continuous console clearer (prevents inspect users from viewing console outputs)
    setInterval(() => {
        console.clear();
    }, 200);

    // 5. Infinite debugger loop (Paralyses DevTools if opened from browser menu)
    setInterval(() => {
        (function() {
            try {
                (function a(i) {
                    if (("" + i / i).length !== 1 || i % 20 === 0) {
                        (function() {}).constructor("debugger")();
                    } else {
                        debugger;
                    }
                    a(++i);
                })(0);
            } catch (e) {}
        })();
    }, 100);
}
