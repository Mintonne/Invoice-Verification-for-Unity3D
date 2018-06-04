//Input section elements
const mainTitle = document.querySelector("#main-title span"),
  inputSection = document.getElementById("input-section"),
  invoiceInput = document.getElementById("invoice-input"),
  settingsButton = document.getElementById("settings-button"),
  verifyButton = document.getElementById("verify-button"),
  spinner = document.getElementById("spinner");

//Settings section elements
const settingsSection = document.getElementById("settings-section"),
  apiInput = document.getElementById("api-input"),
  saveButton = document.getElementById("save-button"),
  backButton = document.getElementById("back-button");

//Results section elements
const resultsSection = document.getElementById("results-section"),
  packageName = document.getElementById("package-name"),
  packageCost = document.getElementById("package-cost"),
  packageCurency = document.getElementById("package-currency"),
  packageQuantity = document.getElementById("package-quantity"),
  packageDate = document.getElementById("package-date"),
  packageStatus = document.getElementById("package-status");

//Error section elements
const errorSection = document.getElementById("error-section"),
  errorTitle = document.getElementById("error-title"),
  errorMessage = document.getElementById("error-message");

//Focus the invoice input field on launch
invoiceInput.focus();

verifyButton.addEventListener("click", () => {
  if (invoiceInput.value.length <= 5) {
    invoiceInput.focus();
    return;
  }

  resultsSection.style.display = errorSection.style.display = verifyButton.style.display =
    "none";
  spinner.style.display = "inline-block";

  //Using Chrome API
  // chrome.storage.sync.get(["apiKey"], function(result) {
  //     getJson(result.apiKey);
  // });

  //Using Local Storage
  getJson(localStorage.getItem("apiKey"));
});

settingsButton.addEventListener("click", () => {
  inputSection.style.display = resultsSection.style.display = errorSection.style.display =
    "none";
  settingsSection.style.display = "inline-block";
  settingsButton.style.visibility = "hidden";

  mainTitle.textContent = "Settings";

  if (localStorage.getItem("apiKey") !== null)
    apiInput.value = localStorage.getItem("apiKey");

  apiInput.focus();
});

//Save button listener
saveButton.addEventListener("click", () => {
  if (apiInput.value.length <= 10) {
    apiInput.focus();
    return;
  }

  //Using Chrome API
  // chrome.storage.sync.set({
  //     apiKey: apiInput.value
  // });

  //Local storage option
  localStorage.setItem("apiKey", apiInput.value);
  goMainMenu();
});

//Back button listener
backButton.addEventListener("click", () => {
  goMainMenu();
});

//Show main menu
function goMainMenu() {
  settingsSection.style.display = resultsSection.style.display = errorSection.style.display =
    "none";
  inputSection.style.display = "inline-block";
  settingsButton.style.visibility = "visible";

  mainTitle.textContent = "Unity 3D Invoice Verification";

  invoiceInput.focus();
}

//API fetch
function getJson(apiKey) {
    let url = `http://api.assetstore.unity3d.com/publisher/v1/invoice/verify.json?key=${apiKey}&invoice=${invoiceInput.value}`;
//   let url = "sample.json";

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.invoices.length > 0) {
        packageName.textContent = data.invoices[0].package;
        packageDate.textContent = moment(data.invoices[0].date).format(
          "dddd, MMMM Do, YYYY"
        );
        packageCost.textContent = data.invoices[0].price_exvat;
        packageCurency.textContent = data.invoices[0].currency;
        if (data.invoices[0].quantity == 1) {
          packageQuantity.textContent = "Single License";
        } else {
          packageQuantity.textContent = data.invoices[0].quantity + " Licenses";
        }
        if (data.invoices[0].refunded === "Yes") {
          packageStatus.textContent = "Refunded";
          packageStatus.style.color = "red";
          packageStatus.title = "The purchase has been refunded.";
        } else if (data.invoices[0].other_license === "Yes") {
          packageStatus.textContent = "Another License";
          packageStatus.style.color = "red";
          packageStatus.title =
            "The customer has at least one license from another purchase. Refund required if requested within 14 days of purchase.";
        } else if (data.invoices[0].downloaded === "Yes") {
          packageStatus.textContent = "Downloaded";
          packageStatus.title =
            "The purchase has already been downloaded. Refund not required.";
        } else if (data.invoices[0].downloaded === "No") {
          packageStatus.textContent = "Not Downloaded";
          packageStatus.title =
            "The purchase has not been downloaded yet. Refund required if requested within 14 days of purchase.";
        }
        resultsSection.style.display = "block";
        spinner.style.display = "none";
        verifyButton.style.display = "inline-block";
      } else {
        errorTitle.textContent = "Shucks!";
        errorMessage.textContent = "No Record Found";

        errorSection.style.display = "block";
        spinner.style.display = "none";
        verifyButton.style.display = "inline-block";
      }
    })
    .catch(err => {
      errorTitle.textContent = "Unauthorized!";
      errorMessage.textContent = "Verify your API Key is entered correctly.";

      errorSection.style.display = "block";
      spinner.style.display = "none";
      verifyButton.style.display = "inline-block";
    });
}
