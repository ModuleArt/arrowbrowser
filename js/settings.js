/*
.##.....##....###....####.##....##
.###...###...##.##....##..###...##
.####.####..##...##...##..####..##
.##.###.##.##.....##..##..##.##.##
.##.....##.#########..##..##..####
.##.....##.##.....##..##..##...###
.##.....##.##.....##.####.##....##
*/

const { ipcRenderer } = require('electron');
const ppath = require('persist-path')('Ferny');
const fs = require("fs");

/*
.########.##.....##.##....##..######..########.####..#######..##....##..######.
.##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
.##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
.######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
.##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
.##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
.##........#######..##....##..######.....##....####..#######..##....##..######.
*/

function toggleBookmarksBar() {
  try {
    var bookmarksBar = fs.readFileSync(ppath + "\\json\\bookmarksbar.json");
    if(bookmarksBar == 1) {
      ipcRenderer.send('request-set-bookmarks-bar', 0);
      notif("Bookmarks bar turned off", "info");
    } else {
      ipcRenderer.send('request-set-bookmarks-bar', 1);
      notif("Bookmarks bar turned on", "success");
    }
  } catch (e) {

  }
}

function scrollToId(id) {
  document.getElementById(id).scrollIntoView({
	  	behavior: 'smooth'
	});
}

function requestSearchEngine(engine) {
  ipcRenderer.send('request-set-search-engine', engine);

  notif("Search engine changed: " + engine, "success");
}

function requestTheme(color) {
  ipcRenderer.send('request-change-theme', color);
}

function requestBorderRadius(size) {
  ipcRenderer.send('request-change-border-radius', size);
}

function changeBorderRadius(size) {
  document.documentElement.style.setProperty('--px-radius', size + 'px');
}

function changeTheme(color) {
  if(checkIfDark(color)) {
    setIconsStyle('light');

    document.documentElement.style.setProperty('--color-top', 'white');
    document.documentElement.style.setProperty('--color-over', 'rgba(0, 0, 0, 0.3)');
  } else {
    setIconsStyle('dark');

    document.documentElement.style.setProperty('--color-top', 'black');
    document.documentElement.style.setProperty('--color-over', 'rgba(0, 0, 0, 0.1)');
  }
}

function setIconsStyle(str) {
  var icons = document.getElementsByClassName('theme-icon');

  for(var i = 0; i < icons.length; i++) {
    icons[i].src = "../themes/" + str + "/icons/" + icons[i].name + ".png";
  }
}

function checkIfDark(color) {
    var r, g, b, hsp;
    if (String(color).match(/^rgb/)) {
        color = String(color).match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

        r = color[1];
        g = color[2];
        b = color[3];
    } else {
        color = +("0x" + color.slice(1).replace(
        color.length < 5 && /./g, '$&$&'));

        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }

    hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

    if (hsp > 127.5) {
        return false;
    } else {
        return true;
    }
}

function loadTheme() {
  try {
    var themeColor = fs.readFileSync(ppath + "\\json\\theme.json");
    changeTheme(themeColor);
  } catch (e) {

  }
}

function loadStartPage() {
  try {
    var startPage = fs.readFileSync(ppath + "\\json\\startpage.json");
    document.getElementById('start-page-input').value = startPage;
  } catch (e) {

  }
}

function loadSearchEngine() {
  try {
    var searchEngine = fs.readFileSync(ppath + "\\json\\searchengine.json");

    var radios = document.getElementsByName("search-engine");
    for(var i = 0; i < radios.length; i++) {
      if(radios[i].value == searchEngine) {
        radios[i].checked = true;
        break;
      }
    }
  } catch (e) {

  }
}

function loadBorderRadius() {
  try {
    var borderRadius = fs.readFileSync(ppath + "\\json\\radius.json");
    changeBorderRadius(borderRadius);

    var radios = document.getElementsByName("border-radius");
    for(var i = 0; i < radios.length; i++) {
      if(radios[i].value == borderRadius) {
        radios[i].checked = true;
        break;
      }
    }
  } catch (e) {

  }
}

function showWelcomeScreen() {
  fs.writeFileSync(ppath + "\\json\\welcome.json", 1);

  ipcRenderer.send("request-show-welcome-screen");
}

function saveStartPage() {
  var url = document.getElementById('start-page-input').value;

  fs.writeFileSync(ppath + "\\json\\startPage.json", url);

  notif("Start page saved: " + url, "success");
}

function notif(text, type) {
  let Data = {
    text: text,
    type: type
  };
  ipcRenderer.send('request-notif', Data)
}

function moreInfo(btn) {
  btn.classList.toggle('active');
  btn.nextElementSibling.classList.toggle('active');
}

/*
.####.########...######.....########..########.##....##.########..########.########..########.########.
..##..##.....##.##....##....##.....##.##.......###...##.##.....##.##.......##.....##.##.......##.....##
..##..##.....##.##..........##.....##.##.......####..##.##.....##.##.......##.....##.##.......##.....##
..##..########..##..........########..######...##.##.##.##.....##.######...########..######...########.
..##..##........##..........##...##...##.......##..####.##.....##.##.......##...##...##.......##...##..
..##..##........##....##....##....##..##.......##...###.##.....##.##.......##....##..##.......##....##.
.####.##.........######.....##.....##.########.##....##.########..########.##.....##.########.##.....##
*/

ipcRenderer.on('action-load-theme', (event, arg) => {
  loadTheme();
});

ipcRenderer.on('action-load-border-radius', (event, arg) => {
  loadBorderRadius();
});

/*
.####.##....##.####.########
..##..###...##..##.....##...
..##..####..##..##.....##...
..##..##.##.##..##.....##...
..##..##..####..##.....##...
..##..##...###..##.....##...
.####.##....##.####....##...
*/

function init() {
  loadTheme();
  loadBorderRadius();
  loadStartPage();
  loadSearchEngine();
}

document.onreadystatechange = () => {
  if (document.readyState == "complete") {
      init();
  }
}

/*
.########.##.....##.########....########.##....##.########.
....##....##.....##.##..........##.......###...##.##.....##
....##....##.....##.##..........##.......####..##.##.....##
....##....#########.######......######...##.##.##.##.....##
....##....##.....##.##..........##.......##..####.##.....##
....##....##.....##.##..........##.......##...###.##.....##
....##....##.....##.########....########.##....##.########.
*/