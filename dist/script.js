function detectOperator(phone) {
    const prefix = phone.substring(0, 2);

    const ops = {
        "91": "Mobicom",
        "94": "Skytel",
        "95": "Unitel",
        "85": "G-Mobile",
        "88": "Unitel",
        "89": "Skytel"
    };

    return ops[prefix] || "Үл мэдэгдэх оператор";
}

function showCallCode() {
    const phone = document.getElementById("phone").value;
    const amount = document.getElementById("amount").value;

    if (phone.length !== 8) return show("Дугаар буруу.");
    if (!amount || amount <= 0) return show("Нэгжийн хэмжээ оруул.");

    const op = detectOperator(phone);
    document.getElementById("operator").textContent = "Оператор: " + op;

    if (op === "Үл мэдэгдэх оператор")
        return show("Энэ дугаар дээр нэгж шилжүүлэх боломжгүй.");

    // Example format: *123*AMOUNT*PHONE#
    const callCode = `*123*${amount}*${phone}#`;

    show("Call код:\n" + callCode);
}

function showSMSCode() {
    const phone = document.getElementById("phone").value;
    const amount = document.getElementById("amount").value;

    if (phone.length !== 8) return show("Дугаар буруу.");
    if (!amount || amount <= 0) return show("Нэгжийн хэмжээ оруул.");

    const op = detectOperator(phone);
    document.getElementById("operator").textContent = "Оператор: " + op;

    if (op === "Үл мэдэгдэх оператор")
        return show("Энэ дугаар дээр нэгж шилжүүлэх боломжгүй.");

    // Example SMS format: "PHONE AMOUNT"
    const smsFormat = `${phone} ${amount}`;

    show("SMS код:\n" + smsFormat);
}

function show(text) {
    document.getElementById("output").textContent = text;
}

// Live operator detection
document.getElementById("phone").addEventListener("input", () => {
    const phone = document.getElementById("phone").value;
    if (phone.length >= 2) {
        document.getElementById("operator").textContent =
            "Оператор: " + detectOperator(phone);
    }
});
