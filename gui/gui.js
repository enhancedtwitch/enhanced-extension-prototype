var menuElement;

function addIconToNav () {
    let navIcon = document.getElementsByClassName("tw-align-items-center tw-flex tw-flex-grow-1 tw-flex-shrink-1 tw-full-width tw-justify-content-end");
    if (navIcon[0]) {
        let icon = document.createElement("div");
        icon.innerHTML = `<img src="https://i.imgur.com/AfKsPDz.png" style="filter: invert(1);" height="17px" alt="enhanced twitch icon">`;
        icon.onclick = openMenu;

        icon.style.cursor = "pointer";
        icon.style.padding = "5px";

        navIcon[0].insertBefore(icon, navIcon[0].childNodes[navIcon[0].childNodes.length - 1]);
    }
}

function onOptionChanged (option, value) {
    if (option == "fixFFZWideEmotes") {
        if (value) {
            document.body.classList.add("ffz-fix");
        } else {
            document.body.classList.remove("ffz-fix");
        }
    }

    else if (option == "showChatInFullscreen") {
        if (value) {
            document.body.classList.add("fsp-enabled");
        } else {
            document.body.classList.remove("fsp-enabled");
        }
    }

    else if (option == "backgroundImageUrl") {
        let body = document.body;
        body.style.backgroundImage = `url('${value}')`;
    }

    else if (option == "removeCarousel") {
        if (value) {
            document.body.classList.add("rm-carousel-module");

            setTimeout(() => {
                let carousels = document.getElementsByClassName("front-page-carousel");
                for (let carousel of carousels) {
                    carousel.innerHTML = "";
                }
            }, 2000);
        } else {
            document.body.classList.remove("rm-carousel-module");
        }
    }
}

function createOption (name, description) {
    let elem = document.createElement("div");
    elem.classList.add("toggleable-option");

    let optionInfo = document.createElement("div");
    optionInfo.classList.add("option-info");
    optionInfo.innerHTML = ` <b class="option-name">${name}</b> <span class="option-desc">${description}</span>`;
    elem.appendChild(optionInfo);

    let optionToggler = document.createElement("div");
    optionToggler.classList.add("option-toggler");
    elem.appendChild(optionToggler);

    return { rootElement: elem, optionElement: optionToggler };
}

function createStringOption (name, description, key) {
    let option = createOption(name, description);
    let elem = option.rootElement;
    let optionToggler = option.optionElement;

    let input = document.createElement("input");
    input.type = "text";
    input.classList.add("eh-text-input");
    input.placeholder = "...";
    input.value = Eh.settings.get(key);

    input.onchange = () => {
        changeSetting(key, input.value);
    }

    optionToggler.appendChild(input);

    return elem;
}

function createToggleOption (name, description, key) {
    let option = createOption(name, description);
    let elem = option.rootElement;
    let optionToggler = option.optionElement;
    
    let switchLabel = document.createElement("label");
    switchLabel.classList.add("switch");
    optionToggler.appendChild(switchLabel);

    let switchInput = document.createElement("input");
    switchInput.type = "checkbox";
    switchLabel.appendChild(switchInput);
    switchInput.onclick = () => {
        toggleSetting(key);
    }

    switchInput.checked = Eh.settings.get(key);

    let slider = document.createElement("span");
    slider.classList.add("slider", "round");
    switchLabel.appendChild(slider);

    return elem;
}

function populateMenu (items) {
    items.appendChild(createStringOption("Custom background", "Set your own background for the Website", "backgroundImageUrl"))
    items.appendChild(createToggleOption("Fix FFZ emote size", "Correct the size of the new Frankerfacez emote Wide and regain its old style.", "fixFFZWideEmotes"));
    items.appendChild(createToggleOption("Fullscreen Chat", "Show chat in full screen.", "showChatInFullscreen"));
    items.appendChild(createToggleOption("Preview streams", "Show a preview of the stream when you hover over the list of followed channels.", "showStreamPreviews"));
    items.appendChild(createToggleOption("Remove frontpage carousel", "Remove the recommended carousel on the main Twitch page", "removeCarousel"))
    items.appendChild(createToggleOption("Show ban message.", "Show message that stream is banned instead of time machine message.", "showBanAlert"));
}

function closeMenu () {
    menuElement.style.display = "none";
}

function openMenu () {
    menuElement.style.display = "block";
}

function createMenu () {
    menuElement = document.createElement("div");

    menuElement.style.position = "absolute";
    menuElement.style.zIndex = 99999999;
    menuElement.style.top = "15%";
    menuElement.style.left = "25%";
    menuElement.style.width = "50%";
    menuElement.style.height = "60%";
    menuElement.style.backgroundColor = "#444";
    menuElement.style.display = "none";
    
    let headerElement = document.createElement("div");
    headerElement.style.width = "100%";
    headerElement.style.height = "10%";
    headerElement.style.textAlign = "center";
    headerElement.style.backgroundColor = "#67f";
    headerElement.style.color = "white";
    headerElement.classList.add("eh-m-top");
    headerElement.innerHTML = `<b style="font-size: 300%; width: 100%;">EnhancedTwitch<b/>`;
    menuElement.appendChild(headerElement);
    
    let closeButton = document.createElement("button");
    closeButton.style.height = "100%";
    closeButton.style.width = "auto";
    closeButton.style.paddingRight = "20px";
    closeButton.style.fontSize = "22px";
    closeButton.style.color = "red";
    closeButton.style.fontWeight = "bold";
    closeButton.style.float = "right";
    closeButton.innerHTML = "X";
    closeButton.onclick = closeMenu;
    headerElement.appendChild(closeButton);

    let itemElement = document.createElement("div");
    itemElement.innerHTML = `
    <span style="position: absolute; font-size: 16px; width: 100%; padding-top 3px; bottom: 100%;">
        Created by <a href="https://twitter.com/sammwy">@Sammwy</a> - 
    </span>
    `;
    populateMenu(itemElement);
    menuElement.appendChild(itemElement);
    
    document.body.insertBefore(menuElement, document.body.firstChild);
}

function openMenu () {
    menuElement.style.display = "block";
}