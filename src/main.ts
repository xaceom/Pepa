import { Plugin, Notice } from 'obsidian';
import {
  TelegramEmojiSettings,
  DEFAULT_SETTINGS,
  TelegramEmojiSettingTab
} from './ui/SettingsTab';

export default class TelegramEmojiPlugin extends Plugin {
  settings: TelegramEmojiSettings;

  async onload() {
    console.log('Loading Telegram Emoji plugin v' + this.manifest.version);

    // Загрузить настройки
    await this.loadSettings();

    // Добавить ribbon icon
    this.addRibbonIcon('smile', 'Open Telegram Emoji', () => {
      new Notice('Telegram Emoji picker (coming soon)');
      // TODO: Открыть emoji picker modal
    });

    // Добавить command для открытия picker
    this.addCommand({
      id: 'open-emoji-picker',
      name: 'Open Emoji Picker',
      callback: () => {
        new Notice('Opening emoji picker...');
        // TODO: Открыть emoji picker modal
      },
      hotkeys: [{ modifiers: ['Ctrl'], key: 'e' }]
    });

    // Добавить settings tab
    this.addSettingTab(new TelegramEmojiSettingTab(this.app, this));

    // Проверить наличие Bot Token
    if (!this.settings.botToken) {
      new Notice(
        'Telegram Emoji: Please configure your Bot Token in settings',
        5000
      );
    }
  }

  onunload() {
    console.log('Unloading Telegram Emoji plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async clearCache() {
    // TODO: Implement cache clearing
    new Notice('Cache cleared!');
  }
}
