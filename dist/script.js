const logos = {
    mobicom: "img/mobicom.png",
    unitel: "img/unitel.png",
    skytel: "img/skytel.png",
    gmobile: "img/gmobile.svg"
};


const operatorMins = {
    unitel: 100,
    mobicom: 100,
    skytel: 100,
    gmobile: 500
};

function ensureAmountDefault(op) {
    const amountInput = document.getElementById('amount');
    if (!amountInput) return;
    const min = (op && operatorMins[op]) ? operatorMins[op] : 10;
    amountInput.min = min;
    const cur = Number(amountInput.value);
    if (!cur || Number.isNaN(cur) || cur < min) {
        amountInput.value = min;
    }
}

function detectOperator(num) {
    num = num.replace("-", "");

    const prefix = num.substring(0, 2);

    if (["88", "80", "89", "86"].includes(prefix)) return "unitel";
    if (["85", "94", "95", "99"].includes(prefix)) return "mobicom";
    if (["69", "90", "91", "92", "96"].includes(prefix)) return "skytel";
    if (["98", "97", "93", "83"].includes(prefix)) return "gmobile";

    return null;
}

// AUTO FORMAT PHONE XXXX-XXXX
document.getElementById("phone").addEventListener("input", () => {
    let v = document.getElementById("phone").value.replace(/\D/g, "");

    if (v.length > 4) v = v.slice(0,4) + "-" + v.slice(4,8);
    document.getElementById("phone").value = v;

    validatePhone();
});

function validatePhone() {
    const phone = document.getElementById("phone").value.replace("-", "");
    const error = document.getElementById("phoneError");
    const logo = document.getElementById("opLogo");

    if (phone.length !== 8) {
        error.textContent = "8 оронтой дугаар оруул.";
        logo.style.opacity = 0;
        return false;
    }

    const op = detectOperator(phone);
    if (!op) {
        error.textContent = "Оператор танигдсангүй.";
        logo.style.opacity = 0;
        return false;
    }

    error.textContent = "";
    logo.src = logos[op];
    logo.style.opacity = 1;
    // apply operator theme class to body
    document.body.classList.remove('operator-unitel','operator-mobicom','operator-skytel','operator-gmobile');
    document.body.classList.add('operator-' + op);
    updateThemeColorMeta();
    ensureAmountDefault(op);

    return true;
}

function validateAmount() {
    const amountInput = document.getElementById("amount");
    const amount = Number(amountInput.value);
    const error = document.getElementById("amountError");

    // Determine operator from query param first, then from phone input
    const params = new URLSearchParams(location.search);
    const opParam = params.get('operator');
    const phone = document.getElementById("phone").value.replace("-", "");
    const detectedOp = detectOperator(phone);
    const op = opParam && ['unitel','mobicom','skytel','gmobile'].includes(opParam) ? opParam : detectedOp;

    const min = (op && operatorMins[op]) ? operatorMins[op] : 10;
    // keep input `min` attribute in sync for UX
    amountInput.min = min;

    if (Number.isNaN(amount) || amount < min) {
        error.textContent = `${min}₮ дээш оруул.`;
        return false;
    }

    error.textContent = "";
    return true;
}


function showSMSCode() {
    if (!validatePhone() || !validateAmount()) return;

    const phone = document.getElementById("phone").value.replace("-", "");
    const amount = document.getElementById("amount").value;
    const { href } = buildSmsHref(phone, amount);
    window.location.href = href;
}

function buildSmsHref(phone, amount) {
    const op = detectOperator(phone);
    const templates = {
        gmobile: { number: '305', body: (p, a) => `T ${a} ${p}` },
        unitel:  { number: '1444', body: (p, a) => `${p} ${a}` },
        mobicom: { number: '596',  body: (p, a) => `${p} ${a}` },
        skytel:  { number: '1525', body: (p, a) => `+${p} ${a}` }
    };

    let smsNumber = '';
    let smsBody = `${phone} ${amount}`;

    if (op && templates[op]) {
        smsNumber = templates[op].number;
        smsBody = templates[op].body(phone, amount);
    }

    const encodedBody = encodeURIComponent(smsBody);
    const href = smsNumber ? `sms:${smsNumber}?body=${encodedBody}` : `sms:?body=${encodedBody}`;
    return { href, smsNumber, smsBody };
}

function showCallCode() {
    if (!validatePhone() || !validateAmount()) return;
    const phone = document.getElementById("phone").value.replace("-", "");
    const amount = document.getElementById("amount").value;
    const callCode = `*123*${amount}*${phone}#`;
    alert('📞 Call код:\n' + callCode);
}

// DARK MODE
document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

// update theme-color meta tag based on --accent
function updateThemeColorMeta() {
    try {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;
        const color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#007bff';
        meta.setAttribute('content', color);
    } catch (e) { }
}

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Respect operator query param to force theme (e.g., ?operator=tmobile)
(function applyOperatorFromQuery() {
    const params = new URLSearchParams(location.search);
    const op = params.get('operator');
    if (op && ['unitel','mobicom','skytel','gmobile'].includes(op)) {
        const logo = document.getElementById('opLogo');
        if (logos[op]) {
            logo.src = logos[op];
            logo.style.opacity = 1;
        }
        document.body.classList.add('operator-' + op);
        updateThemeColorMeta();
    }
})();
