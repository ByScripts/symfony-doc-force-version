var version = 'current';
var enabled = true;
var domainRegex = new RegExp('^http://symfony.com/');
var wantedBase = 'http://symfony.com/doc/' + version + '/';
var wantedRegex = new RegExp('^' + wantedBase);
var requestRegex = new RegExp("^http://symfony.com(?:/[a-z]{2})?/doc/[^/]+/(.*)");

chrome.storage.sync.get('enabled', function (items) {
  if (items.enabled) {
    enabled = items.enabled;
  }
});

chrome.storage.sync.get('version', function (items) {
  if (items.version) {
    version = items.version;
  }
});

chrome.storage.onChanged.addListener(
    function (changes) {
      if (changes.version) {
        version = changes.version.newValue;
      }

      if (changes.enabled != undefined) {
        enabled = changes.enabled.newValue;
      }
    });

chrome.tabs.onUpdated.addListener(
    function (tabId, changes, tab) {

      var url = tab.url;

      if (url.match(wantedRegex)) {
        chrome.pageAction.show(tabId);
        return;
      }

      if (!url || !url.match(domainRegex)) {
        return;
      }

      var match = url.match(requestRegex);
      var newUrl = wantedBase + match[1];

      chrome.tabs.update(tabId, {url: newUrl});
    });
