/*
 * Media URL Timestamper
 * Chromium Web Extension (Manifest V3)
 * Copyright (C) 2017 Kestrel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";

// Import defaults
importScripts('../options/defaults.js');

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch (message.action) {
    case ("historyDeleteUrl"):
      // History API is removed in MV3 - this is now a no-op
      // Chromium doesn't provide this functionality in MV3
      break;
    case ("updatePageAction"):
      updatePageAction(sender.tab.id, message.show, message.automatic);
      break;
  }
});

chrome.action.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, {action: "doTimestamp"});
});

chrome.contextMenus.create({
  id: "updateTimestamp",
  title: chrome.i18n.getMessage("menu_updateTimestamp"),
  contexts: ["action"]
});

chrome.contextMenus.create({
  id: "clearTimestamp",
  title: chrome.i18n.getMessage("menu_clearTimestamp"),
  contexts: ["action"]
});

chrome.contextMenus.create({
  id: "toggleAuto",
  title: chrome.i18n.getMessage("menu_toggleAuto"),
  type: "checkbox",
  contexts: ["action"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "updateTimestamp":
      chrome.tabs.sendMessage(tab.id, {action: "doTimestamp"});
      break;
    case "clearTimestamp":
      chrome.tabs.sendMessage(tab.id, {action: "clearTimestamp"});
      break;
    case "toggleAuto":
      chrome.tabs.sendMessage(tab.id, {action: "toggleAuto"});
      break;
  }
});

// In MV3, we need to handle this differently since onShown doesn't work well with async
// We'll update the menu state when the action is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, {action: "getAutoMode"}, (automatic) => {
    chrome.contextMenus.update("toggleAuto", {checked: automatic});
  });
});

function updatePageAction(tabId, show, enabled) {
  let disabledSuffix = (enabled ? "" : "disabled");
  chrome.action.setIcon({
    tabId: tabId,
    path: "icons/icon" + disabledSuffix + ".svg"
  });
  let title = chrome.i18n.getMessage("extensionName") + " (" +
              (enabled ? chrome.i18n.getMessage("tooltip_automaticMode") :
                         chrome.i18n.getMessage("tooltip_manualMode")) + ")";
  chrome.action.setTitle({
    tabId: tabId,
    title
  });
  // In MV3, action is always visible by default
  // We can enable/disable it instead of show/hide
  if (show) {
    chrome.action.enable(tabId);
  } else {
    chrome.action.disable(tabId);
  }
}


