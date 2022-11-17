const { Meta, Shell, St } = imports.gi;
const { MixerSinkInput } = imports.gi.Gvc;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const Volume = imports.ui.status.volume;

class Extension {
  constructor() {
    this._shortcutsBindingIds = [];
    this._currentIndex = 0;
  }

  enable () {
    log(`enabling ${Me.metadata.name}`);

    this.settings = ExtensionUtils.getSettings(
      'org.gnome.shell.extensions.app-sound-volume.danielsoares');

    this._bindShortcut('app-lower-volume', () => {
      const stream = this.getCurrentStream()

      const piece = Math.floor(Volume.getMixerControl().get_vol_max_norm() / 18)

      let volume = stream.get_volume() - piece
      if (volume < 0) {
        volume = 0
      }

      stream.set_volume(volume)
      stream.push_volume()

      // log(`down ${stream.get_name()} volume to ${stream.get_volume()}`)

      Main.osdWindowManager.show(-1, stream.get_gicon(), stream.get_name(), stream.get_volume() / Volume.getMixerControl().get_vol_max_norm());
    });

    this._bindShortcut('app-raise-volume', () => {
      const stream = this.getCurrentStream()

      const piece = Math.floor(Volume.getMixerControl().get_vol_max_norm() / 18)

      let volume = stream.get_volume() + piece
      if (volume > Volume.getMixerControl().get_vol_max_norm()) {
        volume = Volume.getMixerControl().get_vol_max_norm();
      }

      stream.set_volume(volume)
      stream.push_volume()

      // log(`up ${stream.get_name()} volume to ${stream.get_volume()}`)

      Main.osdWindowManager.show(-1, stream.get_gicon(), stream.get_name(), stream.get_volume() / Volume.getMixerControl().get_vol_max_norm());
    });

    this._bindShortcut('previous-app-volume', () => {
      this.changeCurrentIndex(-1)
      const stream = this.getCurrentStream()

      log(`change current stream ${stream.get_name()}`)

      Main.osdWindowManager.show(-1, stream.get_gicon(), stream.get_name(), stream.get_volume() / Volume.getMixerControl().get_vol_max_norm());
    })

    this._bindShortcut('next-app-volume', () => {
      this.changeCurrentIndex(1)
      const stream = this.getCurrentStream()

      log(`change current stream ${stream.get_name()}`)

      Main.osdWindowManager.show(-1, stream.get_gicon(), stream.get_name(), stream.get_volume() / Volume.getMixerControl().get_vol_max_norm());
    })
  }

  disable () {
    log(`disabling ${Me.metadata.name}`);

    this._unbindShortcuts();
  }

  _getStreams () {
    return Volume.getMixerControl().get_sink_inputs()
  }

  changeCurrentIndex (index) {
    const maxIndex = this._getStreams().length - 1
    this._currentIndex += index

    this._currentIndex = this._currentIndex < 0 ? 0 : maxIndex < this._currentIndex ? maxIndex : this._currentIndex
  }

  getCurrentStream () {
    const streams = this._getStreams();
    return streams[this._currentIndex] || streams[0]
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
    log(`binded ${name}`)
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