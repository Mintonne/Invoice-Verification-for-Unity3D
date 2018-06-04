chrome.contextMenus.create({
    id: "verifyinvoice",
    title: "Verify Invoice",
    contexts: ["selection"]
});

chrome.contextMenus.onClicked.addListener((clickedData) => {
    if (clickedData.menuItemId == "verifyinvoice") {
        callback(clickedData.selectionText);
    }
});

function callback(selection) {
    //Using Chrome API
    // chrome.storage.sync.get(["apiKey"], function(result) {
    //     getJson(result.apiKey, selection);
    // });

    //Using Local Storage
    getJson(localStorage.getItem("apiKey"), selection);
}

function getJson(apiKey, selection) {
    let url = `http://api.assetstore.unity3d.com/publisher/v1/invoice/verify.json?key=${apiKey}&invoice=${selection}`;
    var x = screen.width / 2 - 700 / 2 + FindLeftWindowBoundry();
    var y = screen.height / 2 - 450 / 2 + FindTopWindowBoundry();
    let showWindow;

    fetch(url)
        .then((res) => res.json())
        .then((data) => {


            if (data.invoices.length > 0) {
                showWindow = window.open("", "", `height=400,width=500,left=${x},top=${y}`);
                showWindow.document.write(`
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Unity3D Invoice Verification</title>
                    <link rel="stylesheet" type="text/css" href="../vendor/css/materialize.min.css">
                    <link rel="stylesheet" type="text/css" href="../css/style.css">
                </head>

                <body>
                    <h5>${data.invoices[0].package}</h5>
                    <p>Purchased on</p>
                    <span>${data.invoices[0].date}</span>
                    <br>
                    <p>Total Price (Excl. VAT)</p>
                    <span>${data.invoices[0].price_exvat}</span> <span>${data.invoices[0].currency}</span>
                    <br>
                    <p>Quantity </p>
                    <span id="package-quantity">${data.invoices[0].quantity}</span>
                    <br>
                    <p>Status</p>
                    <span title="Tooltip Text" id="package-status">Text Here</span>
                    <br><br>
                    <a id="close-button" class="waves-effect waves-light btn light-blue">Close Window</a>
                </body>`);

                const packageStatus = showWindow.document.getElementById("package-status"),
                    packageQuantity = showWindow.document.getElementById("package-quantity"),
                    closeButton = showWindow.document.getElementById("close-button");

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
                    packageStatus.title = "The customer has at least one license from another purchase. Refund required if requested within 14 days of purchase.";
                } else if (data.invoices[0].downloaded === "Yes") {
                    packageStatus.textContent = "Downloaded";
                    packageStatus.title = "The purchase has already been downloaded. Refund not required.";
                } else if (data.invoices[0].downloaded === "No") {
                    packageStatus.textContent = "Not Downloaded";
                    packageStatus.title = "The purchase has not been downloaded yet. Refund required if requested within 14 days of purchase.";
                }

                closeButton.addEventListener("click", () => {
                    showWindow.close();
                });

            } else {
                showWindow = window.open("", "", `height=250,width=500,left=${x},top=${y}`);
                showWindow.document.write(`
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Unity3D Invoice Verification</title>
                    <link rel="stylesheet" type="text/css" href="../vendor/css/materialize.min.css">
                    <link rel="stylesheet" type="text/css" href="../css/style.css">
                </head>

                <body>
                    <h5>Shucks!</h5>
                    <p>No Record Found.</p>
                    <br>
                    <a id="close-button" class="waves-effect waves-light btn light-blue">Close Window</a>
                    <br><br>
                    <a id="pub-button" href="https://publisher.assetstore.unity3d.com/verify-invoice.html" target="_blank" class="waves-effect waves-light btn light-blue" rel="noopener">Publisher Dashboard</a>
                </body>`);

                const closeButton = showWindow.document.getElementById("close-button"),
                    pubButton = showWindow.document.getElementById("pub-button");

                closeButton.addEventListener("click", () => {
                    showWindow.close();
                });

                pubButton.addEventListener("click", () => {
                    showWindow.close();
                });
            }
        })
        .catch((err) => {
            showWindow = window.open("", "", `height=250,width=500,left=${x},top=${y}`);
            showWindow.document.write(`
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Unity3D Invoice Verification</title>
                <link rel="stylesheet" type="text/css" href="../vendor/css/materialize.min.css">
                <link rel="stylesheet" type="text/css" href="../css/style.css">
            </head>

            <body>
                <h5>Unauthorized!</h5>
                <p>Verify your API Key is entered correctly.</p>
                <br>
                <a id="close-button" class="waves-effect waves-light btn light-blue">Close Window</a>
                <br><br>
                <a id="pub-button" href="https://publisher.assetstore.unity3d.com/verify-invoice.html" target="_blank" class="waves-effect waves-light btn light-blue" rel="noopener">Publisher Dashboard</a>
            </body>`);

            const closeButton = showWindow.document.getElementById("close-button"),
                pubButton = showWindow.document.getElementById("pub-button");

            closeButton.addEventListener("click", () => {
                showWindow.close();
            });

            pubButton.addEventListener("click", () => {
                showWindow.close();
            });
        });
}

// Find Left Boundry of current Window
function FindLeftWindowBoundry() {
    // In Internet Explorer window.screenLeft is the window's left boundry
    if (window.screenLeft) {
        return window.screenLeft;
    }

    // In Firefox window.screenX is the window's left boundry
    if (window.screenX)
        return window.screenX;

    return 0;
}

// Find Left Boundry of current Window
function FindTopWindowBoundry() {
    // In Internet Explorer window.screenLeft is the window's left boundry
    if (window.screenTop) {
        return window.screenTop;
    }

    // In Firefox window.screenY is the window's left boundry
    if (window.screenY)
        return window.screenY;

    return 0;
}