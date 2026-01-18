import { App, PluginSettingTab, Setting } from 'obsidian';
import type TelegramEmojiPlugin from '../main';

/**
 * Настройки плагина
 */
export interface TelegramEmojiSettings {
  botToken: string;
  cacheSizeMB: number;
  autoUpdate: boolean;
  enableAnimations: boolean;
  preferredFormat: 'tgs' | 'webm' | 'png' | 'auto';
}

/**
 * Дефолтные настройки
 */
export const DEFAULT_SETTINGS: TelegramEmojiSettings = {
  botToken: '',
  cacheSizeMB: 100,
  autoUpdate: true,
  enableAnimations: true,
  preferredFormat: 'auto'
};

/**
 * Settings Tab для плагина
 */
export class TelegramEmojiSettingTab extends PluginSettingTab {
  plugin: TelegramEmojiPlugin;

  constructor(app: App, plugin: TelegramEmojiPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Заголовок
    containerEl.createEl('h2', { text: 'Telegram Emoji Settings' });

    // Описание
    containerEl.createEl('p', {
      text: 'Configure your Telegram Bot Token to enable emoji integration.'
    });

    // Bot Token
    new Setting(containerEl)
      .setName('Telegram Bot Token')
      .setDesc(
        'Get your token from @BotFather in Telegram. Create a new bot with /newbot command.'
      )
      .addText(text =>
        text
          .setPlaceholder('Enter your bot token')
          .setValue(this.plugin.settings.botToken)
          .onChange(async value => {
            this.plugin.settings.botToken = value;
            await this.plugin.saveSettings();
          })
      );

    // Cache Size
    new Setting(containerEl)
      .setName('Cache Size (MB)')
      .setDesc('Maximum disk space for emoji cache (10-500 MB)')
      .addSlider(slider =>
        slider
          .setLimits(10, 500, 10)
          .setValue(this.plugin.settings.cacheSizeMB)
          .setDynamicTooltip()
          .onChange(async value => {
            this.plugin.settings.cacheSizeMB = value;
            await this.plugin.saveSettings();
          })
      )
      .addExtraButton(button =>
        button.setIcon('reset').setTooltip('Reset to default (100 MB)').onClick(async () => {
          this.plugin.settings.cacheSizeMB = DEFAULT_SETTINGS.cacheSizeMB;
          await this.plugin.saveSettings();
          this.display();
        })
      );

    // Auto Update
    new Setting(containerEl)
      .setName('Auto Update Cache')
      .setDesc('Automatically fetch new emoji in background')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.autoUpdate).onChange(async value => {
          this.plugin.settings.autoUpdate = value;
          await this.plugin.saveSettings();
        })
      );

    // Enable Animations
    new Setting(containerEl)
      .setName('Enable Animations')
      .setDesc('Show animated emoji (TGS/WEBM). Disable for better performance.')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.enableAnimations).onChange(async value => {
          this.plugin.settings.enableAnimations = value;
          await this.plugin.saveSettings();
        })
      );

    // Preferred Format
    new Setting(containerEl)
      .setName('Preferred Format')
      .setDesc('Choose which format to use for emoji rendering')
      .addDropdown(dropdown =>
        dropdown
          .addOption('auto', 'Auto (recommended)')
          .addOption('tgs', 'TGS (Lottie, animated)')
          .addOption('webm', 'WEBM (Video, animated)')
          .addOption('png', 'PNG (Static)')
          .setValue(this.plugin.settings.preferredFormat)
          .onChange(async value => {
            this.plugin.settings.preferredFormat = value as any;
            await this.plugin.saveSettings();
          })
      );

    // Divider
    containerEl.createEl('hr');

    // Cache Management Section
    containerEl.createEl('h3', { text: 'Cache Management' });

    // Clear Cache Button
    new Setting(containerEl)
      .setName('Clear Cache')
      .setDesc('Delete all cached emoji files to free up disk space')
      .addButton(button =>
        button
          .setButtonText('Clear Cache')
          .setWarning()
          .onClick(async () => {
            await this.plugin.clearCache();
          })
      );

    // Statistics (placeholder for future implementation)
    containerEl.createEl('p', {
      text: 'Cache statistics: Not yet implemented',
      cls: 'setting-item-description'
    });

    // Divider
    containerEl.createEl('hr');

    // Help Section
    containerEl.createEl('h3', { text: 'Help & Support' });

    containerEl.createEl('p', {
      text: 'For help and documentation, visit the plugin repository on GitHub.'
    });

    new Setting(containerEl)
      .setName('Documentation')
      .setDesc('View the plugin documentation and guides')
      .addButton(button =>
        button.setButtonText('Open Docs').onClick(() => {
          window.open('https://github.com/yourusername/obsidian-telegram-emoji', '_blank');
        })
      );

    new Setting(containerEl)
      .setName('Report Issues')
      .setDesc('Found a bug? Report it on GitHub')
      .addButton(button =>
        button.setButtonText('Report Bug').onClick(() => {
          window.open(
            'https://github.com/yourusername/obsidian-telegram-emoji/issues',
            '_blank'
          );
        })
      );
  }
}
