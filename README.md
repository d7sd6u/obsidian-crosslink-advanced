# Crosslink Advanced

_Do you know what ftags (clones, symlinks) are? If not, you should definitely check [this](https://github.com/d7sd6u/obsidian-lazy-cached-vault-load?tab=readme-ov-file#wait-a-minute-what-are-folderindex-notes-what-are-ftags-what-do-you-mean-annexed) out._

Adds several commands to manipulate file's ftags.

## Commands

- `Remove inbox tag` - removes inbox tag (e.g. `Uncategorized`) from the file
- `Add ftag to note` - add ftag to the note. Removes inbox tag automatically
- `Open random inbox item` - open random note that has inbox tag
- `Create new note as child` - create new note that has current file as ftag. Converts current file to folder note automatically
- `Rename swapping for alias` - rename current file and make its former name its alias

## Other plugins

- [lazy-cached-vault-load](https://github.com/d7sd6u/obsidian-lazy-cached-vault-load) - reduce startup time on mobile to 2-3s even with 30k+ notes vault
- [auto-folder-note-paste](https://github.com/d7sd6u/obsidian-auto-folder-note-paste) - makes sure your attachments are "inside" your note on paste and drag'n'drop by making your note a folder note
- [folders-graph](https://github.com/d7sd6u/obsidian-folders-graph) - adds folders as nodes to graph views
- [reveal-folded](https://github.com/d7sd6u/obsidian-reveal-folded) - reveal current file in file explorer while collapsing everything else
- [hide-index-files](https://github.com/d7sd6u/obsidian-hide-index-files) - hide folder notes (index files) from file explorer
- [virtual-dirs](https://github.com/d7sd6u/obsidian-virtual-dirs) - adds "virtual" folder files / folder indexes. You can open them, you can search for them, but they do not take space and "materialise" whenever you want a _real_ folder note
- [viewer-ftags](https://github.com/d7sd6u/obsidian-viewer-ftags) - add ftags as chips on top of markdown/file editors/previews. And children as differently styled chips too!
- [git-annex-autofetch](https://github.com/d7sd6u/obsidian-git-annex-autofetch) - lets you open annexed but not present files as if they were right on your device (basically, NFS/overlay-fs hybrid in your Obsidian)

## Disclamer / Safety

This plugin calls some of the destructive file system APIs (write, move). However it should not make any irreversible changes (only moving files and changing `.symlinks` in notes' frontmatter). That said, always [backup](https://en.wikipedia.org/wiki/Backup#:~:text=3-2-1%20rule) your vault whether you use this plugin or not.

## Contributing

Issues and patches are welcome. This plugin is intended to be used with other plugins and I would try to do my best to support this use case, but I retain the right to refuse supporting any given plugin for arbitrary reasons.
