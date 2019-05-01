/*
  Dark Theme Switch Gnome Shell Extension
  Developed by Aleksey Pozharov sorrow.about.alice@pm.me

  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  as published by the Free Software Foundation; either version 2
  of the License, or (at your option) any later version.
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with this program. If not, see
  < https://www.gnu.org/licenses/gpl-2.0.html >.
  This program is a derived work of Gnome Shell.
*/

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
