var currentVersion = '2.7';

var aliases = {
    '2.7': 'current',
    '3.0': 'master'
};

var versions = [
    {name: '2.0', title: '2.0'},
    {name: '2.1', title: '2.1'},
    {name: '2.2', title: '2.2'},
    {name: '2.3', title: '2.3'},
    {name: '2.4', title: '2.4'},
    {name: '2.5', title: '2.5'},
    {name: '2.6', title: '2.6'},
    {name: '2.7', title: '2.7 LTS (current)'},
    {name: '3.0', title: '3.0 (master)'}
];

var domain = 'http://symfony.com/';
var regex = new RegExp("^http://symfony.com(?:/[a-z]{2})?/doc/[^/]+/(.*)");
var config = {enabled: true, version: 'current'};

var setEnabled = function(enabled) {
    config.enabled = enabled;
    chrome.storage.local.set({enabled: enabled});
};

var setVersion = function(version) {
    config.version = version;
    chrome.storage.local.set({version: version});
};

var getDocUrl = function (append) {
    var version = aliases[config.version] || config.version;
    return domain + 'doc/' + version + '/' + (append || '');
};

var addVersionToContextMenu = function (parentId, version, title) {

    chrome.contextMenus.create(
        {
            type: 'radio',
            title: title,
            checked: version === config.version,
            contexts: ['page_action'],
            parentId: parentId,
            onclick: function () {
                setVersion(version);
            }
        }
    );
};

var createContextMenus = function () {

    /**
     * Create "Enabled" context menu
     */
    chrome.contextMenus.create(
        {
            type: 'checkbox',
            checked: config.enabled,
            title: chrome.i18n.getMessage('enabled'),
            contexts: ['page_action'],
            onclick: function (info) {
                setEnabled(info.checked);
            }
        }
    );

    /**
     * Create "Version" context menu
     */
    var parentId = chrome.contextMenus.create(
        {
            title: chrome.i18n.getMessage('version'),
            contexts: ['page_action']
        }
    );

    /**
     * Create Version sub-menus
     */
    versions.forEach(function (version) {
        addVersionToContextMenu(parentId, version.name, version.title);
    });
};

var registerTabListener = function () {
    chrome.tabs.onUpdated.addListener(
        function (tabId, changes, tab) {

            var url = tab.url;

            // If there is no URL or we are not on the Symfony website, stop here
            if (!url || -1 === url.indexOf(domain)) {
                return;
            }

            if(!config.enabled) {
                chrome.pageAction.show(tabId);
                return;
            }

            // If we are on the correct doc, show page action icon and stop
            if (0 === url.indexOf(getDocUrl())) {
                chrome.pageAction.show(tabId);
                return;
            }

            console.log(url, getDocUrl());

            var match = url.match(regex);

            chrome.tabs.update(
                tabId,
                {url: getDocUrl(match[1])}
            );
        }
    );
};

/**
 * INIT EXTENSION
 */
chrome.storage.local.get(['enabled', 'version'], function (items) {
    config.enabled = items.enabled || items.enabled === undefined;
    config.version = items.version || currentVersion;

    createContextMenus();
    registerTabListener();
});
