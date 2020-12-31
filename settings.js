function loadSetting (key, defaultValue) {
    chrome.storage.sync.get(key, function(result) {
        let option = result[key];
        Eh.settings.set(key, option || defaultValue);
        onOptionChanged(key, option);
    });
}

function changeSetting (key, value) {
    Eh.settings.set(key, value);
    saveSetting(key, value);
    return value;
}

function toggleSetting (key) {
    let value = Eh.settings.get(key) || false;
    Eh.settings.set(key, !value);
    saveSetting(key, !value);
    return !value;
}

function saveSetting (key, value) {
    let auxObject = {};
    auxObject[key] = value;
    chrome.storage.sync.set(auxObject, () => {});
    onOptionChanged(key, value);
}

function loadAllSettings () {
    loadSetting("fixFFZWideEmotes", false);
    loadSetting("showBanAlert", false);
    loadSetting("showStreamPreviews", false);
    loadSetting("showChatInFullscreen", false);
    loadSetting("removeCarousel", false);
    loadSetting("backgroundImageUrl", "");
}