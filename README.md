# Crosslink Advanced

_Do you know what ftags (clones, symlinks) are? If not, you should definitely check [this](https://github.com/d7sd6u/obsidian-lazy-cached-vault-load?tab=readme-ov-file#wait-a-minute-what-are-folderindex-notes-what-are-ftags-what-do-you-mean-annexed) out._

Adds several commands to manipulate ftags.

## Commands

- `Remove inbox tag` - remove inbox tag (e.g. `Uncategorized`) from the file
- `Add ftag to note` - add ftag to the note. Removes inbox tag automatically
- `Open random inbox item` - open random note that has inbox tag
- `Create new note as child` - create new note that has current file as ftag. Converts current file to folder note automatically
- `Rename swapping for alias` - rename current file and make its former name its alias

## Other plugins

- [lazy-cached-vault-load](https://github.com/d7sd6u/obsidian-lazy-cached-vault-load) - Reduces startup time on mobile to 2-3 seconds, even with a vault containing 30k+ notes.
- [reveal-folded](https://github.com/d7sd6u/obsidian-reveal-folded) - Adds a command that reveals the current file in the file explorer while collapsing all other items.
- [auto-folder-note-paste](https://github.com/d7sd6u/obsidian-auto-folder-note-paste) - Ensures your attachments are placed inside your note when pasting or using drag-and-drop by converting your note into a folder note.
- [folders-graph](https://github.com/d7sd6u/obsidian-folders-graph) - Adds folders as nodes in graph views.
- [hide-index-files](https://github.com/d7sd6u/obsidian-hide-index-files) - Hides folder notes (index files) from the file explorer.
- [crosslink-advanced](https://github.com/d7sd6u/obsidian-crosslink-advanced) - Adds commands for managing [ftags](https://github.com/d7sd6u/obsidian-lazy-cached-vault-load?tab=readme-ov-file#wait-a-minute-what-are-folderindex-notes-what-are-ftags-what-do-you-mean-annexed)-oriented vaults: adding ftags, creating child notes, opening random unftagged file, etc.
- [virtual-dirs](https://github.com/d7sd6u/obsidian-virtual-dirs) - Adds 'virtual' folder files or folder indexes. You can open and search for them, but they do not take up space and 'materialize' whenever you need a real folder note.
- [viewer-ftags](https://github.com/d7sd6u/obsidian-viewer-ftags) - add ftags as chips on top of markdown/file editors/previews. And children as differently styled chips too!
- [git-annex-autofetch](https://github.com/d7sd6u/obsidian-git-annex-autofetch) - Allows you to open annexed files that are not locally present as if they were on your device (essentially, an NFS/overlay-fs hybrid in Obsidian).

## Disclamer / Safety

This plugin uses certain file system APIs that can modify files, such as writing and moving them. However, it should not make any irreversible changes, as it only moves files and modifies symlinks in notes' frontmatter. That said, always [back up](https://en.wikipedia.org/wiki/Backup#:~:text=3-2-1%20rule) your vault whether you use this plugin or not.

## Contributing

Issues and patches are welcome. This plugin is designed to work alongside other plugins, and I will do my best to support such use cases. However, I retain the right to refuse support for any given plugin at my discretion.
