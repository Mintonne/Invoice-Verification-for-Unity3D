'use strict';

let curWindow,
  lastLink;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "inv-verify-menu",
    title: "Verify Invoice",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((callback) => {
  VerifyInvoice(callback);
});

function VerifyInvoice(data) {
  let selectedText = data.selectionText.replace(/[^\w\s]/gi, "").replace(/ /g, "");
  OpenWindow(`../index.html?inv=${selectedText}&resize`);
}

function OpenWindow(link) {
  let width,
    height,
    top,
    left;

  width = localStorage[popupWindowWidthKey] != null ? Number(localStorage[popupWindowWidthKey]) : 450;
  height = localStorage[popupWindowHeightKey] != null ? Number(localStorage[popupWindowHeightKey]) : 570;

  top = localStorage[popupWindowTopPosKey] != null ? Number(localStorage[popupWindowTopPosKey]) : null;
  left = localStorage[popupWindowLeftPosKey] != null ? Number(localStorage[popupWindowLeftPosKey]) : null;

  if (curWindow == null) {
    chrome.windows.create({
      url: link,
      type: "popup",
      width: width,
      height: height,
      top: top,
      left: left,
      focused: true
    }, (window) => {
      lastLink = link;
      curWindow = window;
    });
  } else {
    if (lastLink != link) {
      lastLink = link;

      chrome.tabs.update(curWindow.tabs[0].id, {
        url: link
      });
    }

    chrome.windows.update(curWindow.id, {
      focused: true
    });
  }
}

chrome.windows.onRemoved.addListener((windowId) => {
  if (curWindow == null)
    return;

  if (windowId == curWindow.id)
    curWindow = null;
});