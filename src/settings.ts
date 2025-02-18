import { App, PluginSettingTab, Setting } from "obsidian";
import Main from "./main";

export const DEFAULT_SETTINGS = {
	inbox: "Uncategorized",
};
export class MainPluginSettingsTab extends PluginSettingTab {
	constructor(
		app: App,
		override plugin: Main,
	) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();
		const options = Object.fromEntries(
			this.app.vault.getAllFolders().map((v) => [v.path, v.path]),
		);
		options["/"] = "/";
		new Setting(containerEl)
			.setName("Inbox folder")
			.setDesc("Folder where notes without explicit ftags are stored")
			.addDropdown((textArea) => {
				textArea
					.addOptions(options)
					.setValue(this.plugin.settings.inbox)
					.onChange(async (v) => {
						this.plugin.settings.inbox = v;
						await this.plugin.saveSettings();
					});
			});
	}
}
