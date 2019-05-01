const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const PopupMenu = imports.ui.popupMenu;

// TODO:
// 1. Preferences: set themes
// 2. Translations

const SCHEMA_KEY = "org.gnome.desktop.interface";
const THEME_KEY = "gtk-theme";

function init() {}

let switcher, separator, settings;
let switchConnection, settingsConnection;

function isDarkTheme(themeName) {
  return themeName.indexOf('-dark') !== -1;
}

function makeLightThemeName(themeName) {
  return themeName.replace("-dark", "")
}

function makeDarkThemeName(themeName) {
  return isDarkTheme(themeName) ? themeName : themeName + "-dark";
}

function switchTheme(settings, state, darkTheme, lightTheme) {
  const newTheme = state ? darkTheme : lightTheme;
  settings.set_string(THEME_KEY, newTheme);
}

function enable() {

  settings = new Gio.Settings({ schema: SCHEMA_KEY });

  let lightTheme = makeLightThemeName(settings.get_string(THEME_KEY));
  let darkTheme = makeDarkThemeName(settings.get_string(THEME_KEY));

  const aggregateMenu = Main.panel.statusArea.aggregateMenu;

  switcher = new PopupMenu.PopupSwitchMenuItem("Dark Theme");
  switcher.actor.add_style_class_name("dark-theme-toggle");
  switcher.actor.track_hover = false;
  switchConnection = switcher.connect("toggled", () => {
    switchTheme(settings, switcher._switch.state, darkTheme, lightTheme);
  });
  switcher.setToggleState(isDarkTheme(settings.get_string(THEME_KEY)));
  const switcherPosition = 0;

  settingsConnection = settings.connect(`changed::${THEME_KEY}`, () => {
    const themeName = settings.get_string(THEME_KEY);
    lightTheme = makeLightThemeName(themeName);
    darkTheme = makeDarkThemeName(themeName);
    switcher.setToggleState(isDarkTheme(themeName));
  });

  if (aggregateMenu && switcher) {
    aggregateMenu.menu.addMenuItem(switcher, switcherPosition);
    aggregateMenu.menu.addMenuItem(separator, switcherPosition + 1);
  }
}

function disable() {
  switcher.disconnect(switchConnection);
  settings.disconnect(settingsConnection);
  switcher.destroy();
  separator.destroy()
  separator = null;
  switcher = null;
  settings = null;
  switchConnection = null;
  settingsConnection = null;
}
