const Eh = {
    _events: new Map(),
    settings: new Map()
};

Eh.ENDPOINT_EH_API = "https://api.enhancedtwitch.com/v1";
Eh.VERSION = 0.1;

Eh.emit = (eventName, event) => {
    let listeners = Eh._events.get(eventName) || [];
    for (let callback of listeners) {
        callback (event);
    }
}

Eh.on = (eventName, callback) => {
    let listeners = Eh._events.get(eventName) || [];
    listeners.push(callback);
    Eh._events.set(eventName, listeners);
}

Eh.GET = (url) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                resolve(xhr.responseText);
            }
        }
        xhr.open("GET", url);
        xhr.send();
    })
}

Eh.JSON = async (url) => {
    let text = await Eh.GET(url);
    return JSON.parse(text);
}

Eh.isBanned = async (username) => {
    let res = await Eh.JSON(`${Eh.ENDPOINT_EH_API}/ban?username=${username}`);
    let { exists, is_banned } = res.result;
    return exists && is_banned;
}

setInterval(() => {
    Eh.emit("tick");
}, 50);


window.addEventListener("load", () => {
    createMenu();
    addIconToNav();
});

loadAllSettings();