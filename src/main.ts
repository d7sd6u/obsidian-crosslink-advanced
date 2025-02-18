/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-deprecated */
import {
	App,
	FileView,
	FuzzyMatch,
	FuzzySuggestModal,
	Notice,
	TFile,
	TFolder,
	View,
	setIcon,
} from "obsidian";

import {
	forceFile,
	isIndexFile,
	forceFolder,
	movableFile,
	folderPrefix,
} from "../obsidian-reusables/src/indexFiles";
import {
	getFileParentIndexes,
	getFileIsTargetFileTagFilter,
} from "../obsidian-reusables/src/ftags";
import PluginWithSettings from "../obsidian-reusables/src/PluginWithSettings";
import { DEFAULT_SETTINGS, MainPluginSettingsTab } from "./settings";

const allFilesFilter = (file: TFile): boolean =>
	file.extension === "md" || file.extension === "dir";

export default class Main extends PluginWithSettings(DEFAULT_SETTINGS) {
	override async onload() {
		await this.initSettings(MainPluginSettingsTab);
		this.addCommand({
			id: "add-ftag",
			name: "Add ftag to the note",
			icon: "folder-symlink",
			callback: this.openAddFtagModal.bind(this),
		});

		this.addCommand({
			id: "open-random-inbox-item",
			name: "Open random inbox item",
			icon: "dices",
			callback: this.openRandomInboxItem.bind(this),
		});

		this.addCommand({
			id: "rename-and-keep-as-alias",
			name: "Rename swapping for alias",
			icon: "edit",
			callback: this.renameAndKeepAsAlias.bind(this),
		});

		this.addCommand({
			id: "remove-inbox-tag",
			name: "Remove inbox tag",
			icon: "combine",
			callback: this.removeInboxTag.bind(this),
		});

		this.addCommand({
			id: "create-note-as-child",
			name: "Create new note as child",
			icon: "corner-down-right",
			callback: this.createNoteAsChild.bind(this),
		});

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (file instanceof TFile && file.extension === "md") {
					menu.addItem((item) => {
						item.setTitle("Rename swapping for alias")
							.setIcon("edit")
							.onClick(async () => {
								await this.renameAndKeepAsAlias(file);
							});
					});
				}
			}),
		);

		this.addRibbonIcon(
			"dices",
			"Open random inbox item",
			this.openRandomInboxItem.bind(this),
		);
	}

	private async renameAndKeepAsAlias(file = this.getCurrentFile()) {
		if (!file || file.extension !== "md") return;

		const currentName = file.getShortName();

		await this.app.fileManager.promptForFileRename(file);

		function isObj(v: unknown) {
			return typeof v === "object" && !!v;
		}
		function hasAliases(v: unknown): v is { aliases?: string[] } {
			return (
				isObj(v) &&
				(("aliases" in v && Array.isArray(v.aliases)) ||
					!("aliases" in v))
			);
		}
		await this.app.fileManager.processFrontMatter(file, (v) => {
			if (!hasAliases(v)) return;
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			v.aliases ||= [];
			v.aliases.push(currentName);
		});
	}

	public async removeInboxTag() {
		const indexFile = this.app.workspace.getActiveFile();
		const currentFile = movableFile(indexFile);
		if (!currentFile || !indexFile) return;

		if (currentFile.parent?.path !== this.settings.inbox) return;

		const tags = this.app.vault
			.getFiles()
			.filter(getFileIsTargetFileTagFilter(currentFile, this.app));

		const nonInboxTag = tags.find(
			(v) => movableFile(v).path !== this.settings.inbox,
		);

		if (nonInboxTag) {
			await this.removeFileSymlinkTo(indexFile, nonInboxTag);
			const { folder } = await forceFolder(nonInboxTag, this.app);
			await this.app.fileManager.renameFile(
				currentFile,
				folderPrefix(folder) + currentFile.name,
			);
		}
	}

	public openRandomInboxItem() {
		const res = this.app.vault.getAbstractFileByPath(this.settings.inbox);
		const currentFile = this.app.workspace.getActiveFile();
		if (res instanceof TFolder) {
			const children = res.children.flatMap((child) => {
				if (child instanceof TFile && child.extension !== "dir")
					return child;
				if (child instanceof TFolder)
					return child.children.filter(isIndexFile).slice(0, 1);
				return [];
			});
			const chosen = children
				.filter((v) => v !== currentFile)
				.shuffle()[0];
			if (chosen) {
				void this.app.workspace.openLinkText(chosen.path, "/");
			}
		}
	}
	private getCurrentFile() {
		const view = this.app.workspace.activeLeaf?.view;
		const isFileView = (v: View): v is FileView => "file" in v;
		if (!view || !isFileView(view)) return null;

		return view.file;
	}
	public openAddFtagModal() {
		const editedFile = this.getCurrentFile();
		if (!editedFile) return;
		const getDefaultPlaceholder = () =>
			`Choose tags from all files for "${editedFile.basename}"`;

		const parents = new Set(getFileParentIndexes(editedFile, this.app));
		const allFilesExceptParents = (v: TFile) =>
			allFilesFilter(v) && !parents.has(v) && v !== editedFile;
		const modal = new FileAndDirChooser(this.app, {
			filter: allFilesExceptParents,
			inbox: this.settings.inbox,
			onSelect: (file) => void this.addFtag(editedFile, file),
			customFileActions: [
				{
					icon: "tags",
					text: "Show this file's tags",
					cb: (_, selectedFile) => {
						modal.setPlaceholder(
							`Choose tags from "${selectedFile.basename}" for "${editedFile.basename}"`,
						);
						modal.setFilter(
							getFileIsTargetFileTagFilter(
								selectedFile,
								this.app,
							),
						);
						modal.clearQuery();
					},
				},
			],
			customActions: [
				{
					icon: "rotate-ccw",
					text: "Reset filters and target file",
					cb: () => {
						modal.setPlaceholder(getDefaultPlaceholder());
						modal.setFilter(allFilesExceptParents);
					},
				},
			],
		});
		modal.setPlaceholder(getDefaultPlaceholder());
		modal.open();
	}

	private addFtag = async (file: TFile, ftag: TFile) => {
		if (movableFile(file).parent?.path === this.settings.inbox) {
			const movedFile = isIndexFile(file) ? file.parent! : file;
			const { folder } = await forceFolder(ftag, this.app);

			await this.app.fileManager.renameFile(
				movedFile,
				`${folder.path}/${movedFile.name}`,
			);

			new Notice(`Added ftag ${ftag.basename} by moving`);
		} else {
			const { index } = await forceFolder(ftag, this.app);
			const forcedIndex = await forceFile(index, this.app);

			await this.addFileSymlinkTo(file, forcedIndex);
			new Notice(`Added ftag ${ftag.basename} via link`);
		}
	};

	public async createNoteAsChild() {
		const currentFile = this.app.workspace.getActiveFile();
		if (!currentFile) return;
		const { folder } = await forceFolder(currentFile, this.app);
		const note = await this.app.fileManager.createNewMarkdownFile(
			folder,
			"Untitled",
			"",
		);
		await this.app.workspace.openLinkText(note.path, "/", "tab", {
			active: true,
			eState: { rename: "all" },
		});
	}

	private async removeFileSymlinkTo(file: TFile, forcedIndex: TFile) {
		await this.app.fileManager.processFrontMatter(
			forcedIndex,
			(frontmatter: { symlinks?: unknown }) => {
				if (Array.isArray(frontmatter.symlinks)) {
					frontmatter.symlinks = frontmatter.symlinks.filter(
						(v: string) =>
							this.app.metadataCache.getFirstLinkpathDest(
								v.slice(2, -2),
								forcedIndex.path,
							) !== file,
					);
				}
			},
		);
	}
	private async addFileSymlinkTo(file: TFile, forcedIndex: TFile) {
		const fileLink = this.app.fileManager
			.generateMarkdownLink(file, file.path)
			.replace(/^!/, "");
		await this.app.fileManager.processFrontMatter(
			forcedIndex,
			(frontmatter: { symlinks?: unknown }) => {
				if (!frontmatter.symlinks) {
					frontmatter.symlinks = [fileLink];
				} else if (Array.isArray(frontmatter.symlinks)) {
					frontmatter.symlinks = [
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
						...frontmatter.symlinks.filter((v) => v !== fileLink),
						fileLink,
					];
				}
			},
		);
	}
}

interface Options {
	filter: (file: TFile) => boolean;
	onSelect: (file: TFile) => void;
	inbox: string;
	customFileActions?: {
		icon: string;
		text: string;
		cb: (e: MouseEvent, file: TFile) => void;
	}[];
	customActions?: {
		icon: string;
		text: string;
		cb: (e: MouseEvent, query: string) => void;
	}[];
}
export class FileAndDirChooser extends FuzzySuggestModal<TFile> {
	public setFilter(filter: Options["filter"]) {
		this.filter = filter;
		this.recalculateSuggestions();
	}
	private inbox: string;
	constructor(app: App, opts: Options) {
		super(app);
		this.inbox = opts.inbox;
		this.filter = opts.filter;
		this.onSelect = opts.onSelect;
		this.customFileActions = opts.customFileActions ?? [];
		this.customActions = opts.customActions ?? [];

		this.setInstructions([
			{ command: "↑↓", purpose: "to navigate" },
			{
				command: "shift ↵",
				purpose: "to create new note and use as new tag",
			},
			{ command: "ctrl ↵", purpose: "to use selected file as new tag" },
			{
				command: "alt ↵",
				purpose: "to use selected file as new tag and clear",
			},
			{ command: "↵", purpose: "to use file as new tag and close" },
			{ command: "esc", purpose: "to dismiss" },
		]);

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this.inputEl.addEventListener("keydown", async (evt) => {
			if (evt.key === "Enter") {
				if (
					(evt.shiftKey || this.isWithoutShownSuggestions) &&
					!this.isEmptyQuery
				) {
					await this.createNoteFromQuery({
						close: !evt.ctrlKey,
						clear: evt.altKey,
					});
				} else if (evt.ctrlKey || evt.altKey) {
					this.selectHighlightedFile({ clear: evt.altKey });
				}
			}
		});

		const cta =
			this.inputEl.parentElement!.querySelector(".prompt-input-cta");

		const addButton = (
			icon: string,
			text: string,
			cb: (e: MouseEvent) => void,
			phoneOnly?: boolean,
		) => {
			const button = createEl(
				"button",
				"clickable-icon " + (phoneOnly ? "only-phone" : ""),
				(e) => {
					setIcon(e, icon);
					e.setAttribute("aria-label", text);
					e.onclick = (e) => {
						e.stopPropagation();
						cb(e);
					};
				},
			);
			cta?.appendChild(button);
		};

		addButton("file-plus", "Create note with given name", (e) => {
			void this.createNoteFromQuery({
				close: !e.ctrlKey && !e.altKey,
				clear: e.altKey,
			});
		});

		addButton(
			"file-stack",
			"Create note and clear input",
			() => {
				void this.createNoteFromQuery({
					close: false,
					clear: true,
				});
			},
			true,
		);

		for (const conf of this.customActions) {
			addButton(conf.icon, conf.text, (e) => {
				conf.cb(e, this.inputEl.value);
			});
		}
	}
	private onSelect: Options["onSelect"];
	private filter: Options["filter"];
	private customFileActions: NonNullable<Options["customFileActions"]>;
	private customActions: NonNullable<Options["customActions"]>;

	private async createNoteFromQuery({
		close,
		clear,
	}: {
		close?: boolean;
		clear?: boolean;
	}) {
		const newNote =
			await this.app.fileManager.createNewMarkdownFileFromLinktext(
				this.currentQuery,
				this.inbox,
			);
		this.onSelect(newNote);
		if (close) {
			this.close();
		}
		if (clear) {
			this.clearQuery();
		}
	}
	private selectHighlightedFile({ clear }: { clear: boolean }) {
		const file = this.highlightedFile;
		if (file) {
			this.onSelect(file);
			if (clear) {
				this.clearQuery();
			}
		}
	}

	private get highlightedFile() {
		if (
			this.hiddenChooser.selectedItem != null &&
			this.hiddenChooser.values
		) {
			return this.hiddenChooser.values[this.hiddenChooser.selectedItem]!
				.item;
		}
		return undefined;
	}
	private get isEmptyQuery() {
		return this.inputEl.value.trim().length === 0;
	}
	private get isWithoutShownSuggestions() {
		return this.hiddenChooser.suggestions.length === 0;
	}
	private get currentQuery() {
		return this.inputEl.value;
	}
	private get hiddenChooser() {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
		const chooser = (this as any).chooser as {
			selectedItem: number | null;
			values: { item: TFile }[] | null;
			suggestions: unknown[];
		};
		return chooser;
	}

	public clearQuery() {
		this.inputEl.value = "";
		this.recalculateSuggestions();
	}
	private recalculateSuggestions() {
		this.inputEl.dispatchEvent(new InputEvent("input"));
	}

	getItems(): TFile[] {
		const lastOpenedFiles =
			this.app.workspace.recentFileTracker.lastOpenFiles;
		const set = new Set(lastOpenedFiles);
		const files = this.app.vault.getFiles();
		return files.filter(this.filter).sort((b, a) => {
			if (set.has(a.path) && !set.has(b.path)) return 1;
			if (!set.has(a.path) && set.has(b.path)) return -1;
			if (!set.has(a.path) && !set.has(b.path))
				return a.stat.mtime - b.stat.mtime;
			return -(
				lastOpenedFiles.indexOf(a.path) -
				lastOpenedFiles.indexOf(b.path)
			);
		});
	}
	override renderSuggestion(item: FuzzyMatch<TFile>, el: HTMLElement): void {
		(FuzzySuggestModal<TFile>).prototype.renderSuggestion.apply(this, [
			item,
			el,
		]);
		const content = el.createDiv("suggestion-content");
		const title = content.createDiv("suggestion-title");
		for (const child of Array.from(el.childNodes)) {
			if (child === content) continue;
			title.appendChild(child);
		}
		el.classList.add("mod-complex");
		const aux = el.createDiv("suggestion-aux");
		const createAuxButton = (
			icon: string,
			text: string,
			cb: (e: MouseEvent) => void,
		) => {
			const flair = aux.createSpan("suggestion-flair");
			flair.setAttribute("aria-label", text);
			flair.onclick = (evt) => {
				evt.stopPropagation();
				evt.preventDefault();
				cb(evt);
			};
			setIcon(flair, icon);
		};
		createAuxButton(
			"mouse-pointer-click",
			"Choose note without closing modal",
			() => {
				this.selectHighlightedFile({ clear: false });
			},
		);
		createAuxButton("search-slash", "Choose note and clear query", () => {
			this.selectHighlightedFile({ clear: true });
		});
		for (const opts of this.customFileActions) {
			createAuxButton(opts.icon, opts.text, (e) => {
				opts.cb(e, item.item);
			});
		}
	}

	getItemText(file: TFile): string {
		const isIndex = file.basename === file.parent?.name;
		if (isIndex) return file.parent?.path ?? file.path;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const aliases = this.app.metadataCache.getCache(file.path)
			?.frontmatter?.["aliases"];
		if (Array.isArray(aliases))
			return file.path + "\n" + aliases.join(", ");
		return file.path;
	}

	onChooseItem(file: TFile) {
		this.onSelect(file);
	}
}
