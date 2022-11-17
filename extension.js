const { Meta, Shell, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

class Extension {
  constructor() {
    this._shortcutsBindingIds = [];
  }

  enable () {
    log(`enabling ${Me.metadata.name}`);

    this.settings = ExtensionUtils.getSettings(
      'org.gnome.shell.extensions.app-sound-volume.danielsoares');

    this._bindShortcut('app-lower-volume', () => {
      const app = Shell.AppSystem.get_default().get_running()[0]
      // const label = new St.Label({
      //   label: app.get_name(),
      //   visible: true,
      // })
      Main.osdWindowManager.show(-1, app.get_icon(), null, 1, 1);
    });
  }

  disable () {
    log(`disabling ${Me.metadata.name}`);

    this._unbindShortcuts();
  }

  _bindShortcut (name, cb) {
    Main.wm.addKeybinding(
      name,
      this.settings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
      cb.bind(this)
    );

    this._shortcutsBindingIds.push(name);
  }

  _unbindShortcuts () {
    this._shortcutsBindingIds.forEach((id) => Main.wm.removeKeybinding(id));
    this._shortcutsBindingIds = [];
  }
}


function init () {
  log(`initializing ${Me.metadata.name}`);

  return new Extension();
}