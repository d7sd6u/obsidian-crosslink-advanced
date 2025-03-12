import { App, PluginSettingTab, Setting } from "obsidian";
import Main from "./main";
import { FolderSuggest } from "../obsidian-reusables/src/FolderSuggest";

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

	suggest?: FolderSuggest;

	display() {
		const { containerEl } = this;
		containerEl.empty();
		const options = Object.fromEntries(
			this.app.vault.getAllFolders().map((v) => [v.path, v.path]),
		);
		options["/"] = "/";

		const setInbox = async (v: string) => {
			this.plugin.settings.inbox = v;
			await this.plugin.saveSettings();
		};

		new Setting(containerEl)
			.setName("Inbox folder")
			.setDesc("Folder where notes without explicit ftags are stored")
			.addSearch((search) => {
				search.setValue(this.plugin.settings.inbox).onChange(setInbox);
				this.suggest = new FolderSuggest(this.app, search.inputEl);
				this.suggest.onSelect((v) => setInbox(v.path));
			});
	}
}
