'use strict';

const doc = document;

const title = doc.getElementById("title"),
  backBtn = doc.getElementById("back-button"),
  settingsBtn = doc.getElementById("settings-button"),
  homepage = doc.getElementById("homepage"),
  settingsPage = doc.getElementById("settings"),
  invoiceInput = doc.getElementById("invoice-input"),
  apiKeyInput = doc.getElementById("apikey-input"),
  verifyBtn = doc.getElementById("verify-button"),
  saveBtn = doc.getElementById("save-button"),
  invoiceResult = doc.getElementById("invoice-result");

const packageName = doc.getElementById("package-name"),
  purchaseDate = doc.getElementById("purchase-date"),
  purchasePrice = doc.getElementById("purchase-price"),
  purchaseLicenses = doc.getElementById("purchase-licenses"),
  purchaseStatus = doc.getElementById("purchase-status");

const dateOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

let windowURL = new URL(window.location.href);

if (windowURL.searchParams.has("resize")) {
  window.addEventListener("resize", () => {
    localStorage[popupWindowHeightKey] = window.outerHeight;
    localStorage[popupWindowWidthKey] = window.outerWidth;
    localStorage[popupWindowTopPosKey] = window.screenTop;
    localStorage[popupWindowLeftPosKey] = window.screenLeft;
  });
}

let apiKey = localStorage[apiKeyIdentifier];

backBtn.addEventListener("click", () => {
  OpenHomepage();
});

settingsBtn.addEventListener("click", () => {
  OpenSettings();
});

verifyBtn.addEventListener("click", () => {
  if (!CheckAPIKeyStatus() || verifyBtn.classList.contains("loading"))
    return;

  let myInvoice = invoiceInput.value.trim();

  if (myInvoice == null || myInvoice.length < 5) {
    invoiceInput.focus();
    return;
  }

  SendRequest();

  verifyBtn.classList.add("loading");
  invoiceResult.classList.remove("active");
});

saveBtn.addEventListener("click", () => {
  let myKey = apiKeyInput.value.trim();

  if (myKey == null || myKey.length < 8) {
    apiKeyInput.focus();
    return;
  }

  localStorage[apiKeyIdentifier] = myKey;
  apiKey = myKey;

  OpenHomepage(true);
});

Init();

function Init() {
  if (windowURL.searchParams.has("inv")) {
    let paramValue = windowURL.searchParams.get("inv");
    invoiceInput.value = paramValue;
    verifyBtn.click();
  } else
    OpenHomepage(true);
}

function CheckAPIKeyStatus() {
  if (apiKey == null) {
    OpenSettings(true);
    return false;
  } else
    return true;
}

function OpenHomepage(focus = false) {
  if (!CheckAPIKeyStatus())
    return;

  title.textContent = "Invoice Verification";

  homepage.classList.add("active");
  settingsPage.classList.remove("active");

  settingsBtn.classList.add("active");
  backBtn.classList.remove("active");

  if (focus)
    invoiceInput.focus();
}

function OpenSettings(focus = false) {
  apiKey == null ? apiKeyInput.value = "" : apiKeyInput.value = apiKey;

  title.textContent = "Settings";

  homepage.classList.remove("active");
  settingsPage.classList.add("active");

  settingsBtn.classList.remove("active");
  backBtn.classList.add("active");

  if (focus)
    apiKeyInput.focus();
}

function SendRequest() {
  invoiceResult.classList.remove("active");
  packageName.classList.remove("error");

  let xhr = new XMLHttpRequest();
  let invoiceNumber = invoiceInput.value.replace(/[^\w\s]/gi, "").replace(/ /g, "").trim();
  let link = `https://api.assetstore.unity3d.com/publisher/v1/invoice/verify.json?key=${apiKey}&invoice=${invoiceNumber}`;

  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4) {

      if (xhr.status == 200) {
        let data = JSON.parse(xhr.responseText);

        PopulateResults(data);
        ReactivateInput();
      } else if (xhr.status == 403) {
        packageName.classList.add("error");
        packageName.innerHTML = "FORBIDDEN!<br><h6 class='font-weight-normal'>Your API Key might be invalid.</h6>";

        invoiceResult.classList.add("active");

        ReactivateInput();
      } else {
        packageName.classList.add("error");
        packageName.innerText = "Request Failed!";

        invoiceResult.classList.add("active");

        ReactivateInput();
      }
    }
  }

  xhr.open("GET", link, true);
  xhr.timeout = 15000;
  xhr.send();
}

function PopulateResults(data) {
  if (data.invoices.length > 0) {
    packageName.innerText = data.invoices[0].package;
    purchaseDate.innerText = new Date(data.invoices[0].date).toLocaleDateString(navigator.language, dateOptions);
    purchasePrice.innerText = `${data.invoices[0].price_exvat} ${data.invoices[0].currency}`;
    purchaseLicenses.innerText = FormatLicenseValue(data.invoices[0].quantity);
    GetStatus(data.invoices[0]);
  } else {
    packageName.classList.add("error");
    packageName.innerText = "No Record Found!";
  }

  invoiceResult.classList.add("active");
}

function FormatLicenseValue(value) {
  value = Number(value);

  if (value > 1)
    return value + " Licenses"
  else
    return "1 License";
}

function GetStatus(data) {
  if (data.refunded.toLowerCase() === "yes") {
    purchaseStatus.textContent = "Refunded or Chargedback";
    purchaseStatus.classList.add("text-danger");
    purchaseStatus.title = "This purchase has been refunded or chargedback.";
  } else if (data.other_license.toLowerCase() === "yes") {
    purchaseStatus.textContent = "Another License";
    purchaseStatus.classList.add("text-danger");
    purchaseStatus.title = "The customer has at least one license from another purchase. Refund required if requested within 14 days of purchase.";
  } else if (data.downloaded.toLowerCase() === "yes") {
    purchaseStatus.textContent = "Downloaded";
    purchaseStatus.classList.remove("text-danger");
    purchaseStatus.title = "This purchase has already been downloaded. Refund not required.";
  } else if (data.downloaded.toLowerCase() === "no") {
    purchaseStatus.textContent = "Not Downloaded";
    purchaseStatus.classList.add("text-danger");
    purchaseStatus.title = "This purchase has not been downloaded yet. Refund required if requested within 14 days of purchase.";
  }
}

function ReactivateInput() {
  verifyBtn.classList.remove("loading");
}