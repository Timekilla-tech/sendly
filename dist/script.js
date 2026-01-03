const logos = {
    mobicom: "img/mobicom.png",
    unitel: "img/unitel.png",
    skytel: "img/skytel.png",
    gmobile: "img/gmobile.png"
};

function detectOperator(num) {
    num = num.replace("-", "");

    const prefix = num.substring(0, 2);

    if (["95", "85", "88"].includes(prefix)) return "unitel";
    if (["91"].includes(prefix)) return "mobicom";
    if (["94", "89"].includes(prefix)) return "skytel";
    if (["98"].includes(prefix)) return "gmobile";

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

    return true;
}

function validateAmount() {
    const amount = document.getElementById("amount").value;
    const error = document.getElementById("amountError");

    if (amount < 10) {
        error.textContent = "10₮ дээш оруул.";
        return false;
    }

    error.textContent = "";
    return true;
}

function showCallCode() {
    if (!validatePhone() || !validateAmount()) return;

    const phone = document.getElementById("phone").value.replace("-", "");
    const amount = document.getElementById("amount").value;

    const callCode = `*123*${amount}*${phone}#`;
    document.getElementById("output").textContent = "📞 Call код:\n" + callCode;
}

function showSMSCode() {
    if (!validatePhone() || !validateAmount()) return;

    const phone = document.getElementById("phone").value.replace("-", "");
    const amount = document.getElementById("amount").value;

    const smsCode = `${phone} ${amount}`;
    document.getElementById("output").textContent = "✉️ SMS код:\n" + smsCode;
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
