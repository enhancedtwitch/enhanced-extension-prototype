var ___Module_BanScreen_IsExecuted = false;

async function __Init__Module_BanScreen () {
    let url = window.location;
    let host = url.hostname;
    let path = url.pathname;

    if (host == "www.twitch.tv" || host == "twitch.tv") {
        if (path.split("/")[2] == null) {
            let channelName = path.split("/")[1];
            let obj = document.querySelector('p[data-a-target="core-error-message"]');
            if (obj) {
                ___Module_BanScreen_IsExecuted = true;
                let isBanned = await Eh.isBanned(channelName);
                if (isBanned == true) {
                    obj.innerHTML = `This streamer is banned.<br/>View on <a target="_blank" href="https://streamerbans.com/user/${channelName}">Streamerbans.com</a>`;
                }
            }
        }
    }
}

Eh.on("tick", () => {
    if (!___Module_BanScreen_IsExecuted && Eh.settings.get("showBanAlert") == true) {
        __Init__Module_BanScreen();
    }
});