var domList = {}
var buttonContainer;
var settingItems = {}
var settings = {
    ready: false,
    bgTheme: '218,216,222',
    currentAlpha: '1',
    currentOpacity: '1',
    currentFontSize: '12',
    twitchDark: false
}
var savedSettings = {};
var mainChatPanel = '.right-column';
var chatLine = '.chat-shell'
var chatText;
var mainHeader = '.stream-chat-header';
var rightCol;
//generate setting items with the params given
function createSettingsItem(type, label, val1, val2) {
    var inputEl = document.createElement('div');
    inputEl.classList.add('input_pair');

    if (type === 'range') {
        inputEl.innerHTML = "<div class='input_label'>" + label + "</div>" +
            "<input id='CS_" + label + "' type='range' min='" + val1 + "' max='" + val2 + "'></input>"

    } else if (type === 'checkbox') {
        inputEl.innerHTML = "<div class='input_label'>" + label + "</div>" +
            "<div class='checkbox_container'>" +
            "<input id='CS_" + label + "' type='checkbox'></input>" +
            "<label for='CS_" + label + "'></label>" +
            "</div>"
    }
    settingItems[label] = inputEl;
}
//check if dom element exists and run a function returning the element searched
function checkDomEl(el, action, time) {
    var maxRetries = 15;
    var retries = 0;

    if (!(el in domList) || !settings.ready) {

        var interval = setInterval(function() {
            var element = document.querySelector(el);
            if (element) {
                // domList[el] = element;
                clearInterval(interval);
                action(element);
            } else {
                retries += 1;
                console.log('element', el, 'is not ready');
                if (retries >= maxRetries) {
                    clearInterval(interval);
                    console.log('Somthing is wrong');
                }

            }
        }, time);
    } else {
        action(domList[el]);
    }
}

// STORAGE 
function saveChanges() {
    settings.screenWidth = window.screen.availWidth;
    // Check that there's some code there.

    savedSettings.currentOpacity = settings.currentOpacity;
    savedSettings.currentAlpha = settings.currentAlpha;
    savedSettings.currentFontSize = settings.currentFontSize;
    savedSettings.chatPosition = settings.chatPosition;
    savedSettings.chatSize = settings.chatSize;
    savedSettings.slimMode = settings.slimMode;
    savedSettings.hideSticky = settings.hideSticky;
    savedSettings.dark = settings.dark;
    savedSettings.screenWidth = settings.screenWidth;
    // savedSettings.windowWidth = settings.windowWidth;
    // Save it using the Chrome extension storage API.
    chrome.storage.local.set({
        'savedSettings': savedSettings
    });
}

function loadChanges(element) {
    var chatContainer = element;

    // Load it using the Chrome extension storage API.
    chrome.storage.local.get('savedSettings', function(items) {
        if (!chrome.runtime.error) {

            var elSet = items.savedSettings;

            // if saved window size is bigger then the available one, reset position and size
            if (elSet.screenWidth > (window.screen.availWidth + 50)) {
                elSet.chatPosition = {
                    top: '',
                    left: ''
                };
                elSet.chatSize = {
                    height: '',
                    width: ''
                };
            }

            settings.currentOpacity = elSet.currentOpacity || elSet.currentOpacity === 0 ? elSet.currentOpacity : 1;
            settings.currentAlpha = elSet.currentAlpha || elSet.currentAlpha === 0 ? elSet.currentAlpha : 1;
            settings.currentFontSize = elSet.currentFontSize || 12;
            settings.chatPosition = elSet.chatPosition || {
                top: '',
                left: ''
            }
        };
        settings.chatSize = elSet.chatSize || {
            height: '',
            width: ''
        };
        settings.slimMode = elSet.slimMode || false;
        settings.hideSticky = elSet.hideSticky || false;
        settings.dark = elSet.dark || false;

        settings.screenWidth = window.screen.availWidth;
        if (settings.prevScreenWidth > (settings.screenWidth + 50)) {
            elSet.chatPosition = {
                top: '',
                left: ''
            }
        }
    });
}

// create the fullscreen Btn
function createPlayerBtn() {
    buttonContainer = document.createElement('div');
    buttonContainer.classList.add('tw-inline-flex', 'tw-relative');

    var fsPlayerBtn = document.createElement('button');
    fsPlayerBtn.classList.add('TFP-PlayerBtn', 'player-button', 'pl-button__fullscreen--tooltip-left');
    fsPlayerBtn.addEventListener('click', clickFullscreen);
    fsPlayerBtn.innerHTML = '<div class="tw-tooltip tw-tooltip--align-right tw-tooltip--up" data-a-target="tw-tooltip-label" role="tooltip" id="552698bbeaa65f019ad525603120d39f">Fullscreen with chat (alt + S)</div>' +
        '<svg xmlns="http://www.w3.org/2000/svg"	viewBox="0 0 30 30">' +
        '<polygon points="8.2,8.2 13.5,8.2 13.5,6 6,6 6,13.5 8.2,13.5 "/>' +
        '<polygon points="21.8,8.2 21.8,13.5 24,13.5 24,6 16.5,6 16.5,8.2 "/>' +
        '<polygon points="21.8,21.9 16.5,21.9 16.5,24 24,24 24,16.6 21.8,16.6 "/>' +
        '<polygon points="8.2,21.9 8.2,16.6 6,16.6 6,24 13.5,24 13.5,21.9 "/>' +
        '<rect x="10.7" y="14.2" width="8.6" height="1.7"/>' +
        '<rect x="10.7" y="17" width="6.3" height="1.7"/>' +
        '<rect x="10.7" y="11.4" width="8.6" height="1.7"/>' +
        '</svg>'

    buttonContainer.append(fsPlayerBtn);
    //append playerBtn to button list
    document.arrive('.player-controls__right-control-group', {
        existing: true
    }, function() {
        const playerControls = document.querySelector('.player-controls__right-control-group')
        appendPlayerBtn(playerControls)
    });
}

//append the button to the button List
function appendPlayerBtn(element) {
    element.append(buttonContainer);

    document.onkeyup = function(e) {
        if (e.altKey && e.which == 83) {
            clickFullscreen()
        }
    }
}

//check when fullscreen change
if (document.addEventListener) {
    document.addEventListener('webkitfullscreenchange', changedFullscreen, false);
    document.addEventListener('fullscreenchange', changedFullscreen, false);
}

//if fullscreen event changed
function changedFullscreen() {

    var fullscreenHandlerTimeout = setTimeout(function() {
        //if we exit fullscreen restore default chat
        if (!(window.innerHeight === screen.height)) {
            checkDomEl(mainChatPanel, onExitFullscreen, 0);
        }
    }, 300);
}

//click on the twitch fullscreen button
function clickFullscreen() {
    var videoFSBtn = document.querySelector('[data-a-target="player-fullscreen-button"]');

    //if we enter fullscreen add the chat

    if (window.innerHeight === screen.height) {
        checkDomEl(mainChatPanel, addChat, 300);

        if (document.body.classList.contains('TFP_isFullscreen')) {
            videoFSBtn.click();
        }
    } else if (!(window.innerHeight === screen.height)) {
        videoFSBtn.click();
        checkDomEl(mainChatPanel, addChat, 300);
    }
}

function onExitFullscreen(element) {
    var chatContainer = $(element);
    chatContainer.draggable({
        disabled: true
    });
    chatContainer.resizable({
        disabled: true
    });
    document.body.classList.remove('TFP_settingsOpen', 'TFP_isFullscreen', 'TFP_darkTheme', 'TFP_slimMode', 'TFP_hideSticky');
    chatContainer.removeAttr("style");
    chatText ? chatText.removeAttribute("style") : null;
    if (document.body.classList.contains('tw-theme--dark')) {
        rightCol.setAttribute('class', rightColClasses)
    }
    rightCol.classList.add('tw-full-height', 'tw-top-0');

    // rightCol.classList.add('tw-full-height');
    var main = document.querySelector('main');
    main.nextSibling.appendChild(rightCol);
}

//move chat to overlay
function addChat(element) {

    var rightBar = document.querySelectorAll('[data-a-target="right-column-chat-bar"]');
    rightBar[0].classList.add('right-column');
    rightCol = document.querySelector('.right-column');
    rightColClasses = rightCol.getAttribute("class");

    var playerVideoContainer = document.querySelector('.video-player__container');
    var playerVideo = playerVideoContainer.querySelector('video');
    console.log(typeof playerVideoContainer)
    playerVideoContainer.insertBefore(rightCol, playerVideo.nextSibling);

    // setTimeout(function(){
    document.body.classList.add('TFP_isFullscreen');
    element.classList.remove('tw-full-height', 'tw-full-width', 'tw-c-background-alt-2', 'tw-top-0');
    var chatContainer = $(element);
    chatContainer.draggable({
        disabled: false,
        handle: mainHeader,
        containment: "document"
    });

    chatContainer.resizable({
        disabled: false,
        containment: "document"
    });

    chatContainer.on('resizestop', function() {
        settings.chatSize = {
            width: element.style.width,
            height: element.style.height
        }
        saveChanges()
    });

    chatContainer.on('dragstop', function() {
        settings.chatPosition = {
            top: element.style.top,
            left: element.style.left
        }
        saveChanges()
    });

    loadChanges(element);
    setChatProperties(element);
    addChatSettings(element);
    if (document.body.classList.contains('tw-theme--dark')) {
        rightCol.setAttribute('class', '');
    }
    // },100);
}

function setChatProperties(element) {
    setTimeout(function() {
        element.style.top = settings.chatPosition.top;
        element.style.left = settings.chatPosition.left;
        element.style.width = settings.chatSize.width;
        element.style.height = settings.chatSize.height;
    }, 0);
}

//START SETTINGS
function initSettings(element) {
    createSettingsItem('range', 'opacity', 25, 100);
    createSettingsItem('range', 'alpha', 0, 100);
    createSettingsItem('range', 'fontSize', 10, 24);
    createSettingsItem('checkbox', 'darkTheme');
    createSettingsItem('checkbox', 'slimMode');
    createSettingsItem('checkbox', 'hideSticky');

    if (!element.hasChildNodes()) {
        //add the setting Items to the DOM
        Object.keys(settingItems)
            .map(function(objectKey, index) {
                var value = settingItems[objectKey];
                element.appendChild(value)
            });
    }
    var chatPane = document.querySelector(mainChatPanel);
    chatText = document.querySelector(chatLine);

    // //add input handlers
    rangeOnChangeOpacity(chatPane);
    rangeOnChangeAlpha(chatPane);
    chatText ? rangeOnChangefontSize(chatText) : null;
    onChangeDarkTheme(chatPane);
    onChangeSlimMode(chatPane);
    onChangeHideSticky(chatPane);
}

function toggleSettingsClass() {
    document.body.classList.toggle('TFP_settingsOpen');
}

function addChatSettings(element) {
    var chatContainer = element;
    if (!settings.ready) {
        //create and append chat settings button
        var chatSettings = document.createElement('div');
        chatSettings.classList.add('TFP_chatSettings', 'TFP_chatButton');
        chatContainer.appendChild(chatSettings);
        chatSettings.addEventListener('click', toggleSettingsClass);

        //create and append chat settings div
        var chatSettingsBox = document.createElement('div');
        chatSettingsBox.classList.add('CS_box');
        chatSettingsBox.innerHTML = "<div class='CS_box_content'></div>";
        chatContainer.appendChild(chatSettingsBox);

        settings.ready = true;
    }

    checkDomEl('.CS_box_content', initSettings, 0);
}

function rangeOnChangeOpacity(element) {

    $('#CS_opacity')
        .val(settings.currentOpacity * 100);
    element.style.opacity = settings.currentOpacity;

    $(document)
        .on('input change', '#CS_opacity', function() {
            settings.currentOpacity = this.value / 100;
            element.style.opacity = settings.currentOpacity;
            saveChanges();
        });
}

function rangeOnChangeAlpha(element) {
    $('#CS_alpha')
        .val(settings.currentAlpha * 100);
    element.style.backgroundColor = "rgba(" + settings.bgTheme + "," + settings.currentAlpha + ")", "important";

    $(document)
        .on('input change', '#CS_alpha', function() {
            settings.currentAlpha = this.value / 100;
            element.style.backgroundColor = "rgba(" + settings.bgTheme + "," + settings.currentAlpha + ")", "important";
            saveChanges();
        });
}

function rangeOnChangefontSize(element) {
    $('#CS_fontSize')
        .val(settings.currentFontSize);
    element.style.setProperty('font-size', settings.currentFontSize + 'px', 'important');

    $(document)
        .on('input change', '#CS_fontSize', function() {
            settings.currentFontSize = this.value;
            element.style.setProperty('font-size', settings.currentFontSize + 'px', 'important');
            saveChanges();
        });
}

function onChangeDarkTheme(element) {
    if (settings.dark && !($('input#CS_darkTheme')
            .is(':checked'))) {
        $('input#CS_darkTheme')
            .siblings('label')
            .click();
    }
    setDarkTheme(element);
    $(document)
        .on('input change', '#CS_darkTheme', function() {
            setDarkTheme(element);
        });
}

function onChangeSlimMode() {
    if (settings.slimMode && !($('input#CS_slimMode')
            .is(':checked'))) {
        $('input#CS_slimMode')
            .siblings('label')
            .click();
    }
    setSlimMode();
    $(document)
        .on('input change', '#CS_slimMode', function() {
            setSlimMode();
        });
}

function onChangeHideSticky() {
    if (settings.hideSticky && !($('input#CS_hideSticky')
            .is(':checked'))) {
        $('input#CS_hideSticky')
            .siblings('label')
            .click();
    }
    setHideSticky();
    $(document)
        .on('input change', '#CS_hideSticky', function() {
            setHideSticky();
        });
}

function setDarkTheme(element) {
    if ($('input#CS_darkTheme')
        .is(':checked')) {
        document.body.classList.add('TFP_darkTheme');
        settings.dark = true;
        settings.bgTheme = '24,24,27';
        element.style.backgroundColor = "rgba(" + settings.bgTheme + "," + settings.currentAlpha + ")", "important"
    } else {
        document.body.classList.remove('TFP_darkTheme');
        settings.dark = false;
        settings.bgTheme = '250, 250, 250';
        element.style.backgroundColor = "rgba(" + settings.bgTheme + "," + settings.currentAlpha + ")", "important";
    }
    saveChanges();
}

function setSlimMode() {
    if ($('input#CS_slimMode')
        .is(':checked')) {
        settings.slimMode = true;
        document.body.classList.add('TFP_slimMode');
    } else {
        settings.slimMode = false;
        document.body.classList.remove('TFP_slimMode');
    }
    saveChanges();
}

function setHideSticky() {
    if ($('input#CS_hideSticky')
        .is(':checked')) {
        document.body.classList.add('TFP_hideSticky');
        settings.hideSticky = true;
    } else {
        document.body.classList.remove('TFP_hideSticky');
        settings.hideSticky = false;
    }
    saveChanges();
}

function switchToVOD() {
    var currentAddress = window.location.pathname.split('/')[1];
    if (currentAddress === 'videos') {
        mainChatPanel = '.right-column';
        mainHeader = '.video-chat__header';
    } else {
        mainChatPanel = '.right-column';
        mainHeader = '.stream-chat-header';
    }
}
//END SETTINGS

$(document)
    .ready(function() {
        //appent fullscreen btn
        createPlayerBtn();

        // store url on load
        var currentPage = window.location.href;
        switchToVOD();
        // listen for changes
        setInterval(function() {
            if (currentPage != window.location.href) {
                switchToVOD();
                currentPage = window.location.href;
                if ($(document)
                    .find('.TFP-PlayerBtn')
                    .length === 0) {
                    createPlayerBtn();
                    settings.ready = false;
                }
            }
        }, 500);

        chrome.storage.onChanged.addListener(function(obj) {})
    });