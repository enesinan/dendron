import { CodeConfigKeys } from "./types";

export const DENDRON_WS_NAME = "dendron.code-workspace";
export const extensionQualifiedId = `dendron.dendron`;
export const DEFAULT_LEGACY_VAULT_NAME = "vault";

type KeyBinding = {
  key?: string;
  mac?: string;
  windows?: string;
  when?: string;
  args?: any;
};

type ConfigEntry = {
  key: string;
  description: string;
  type: "string" | "boolean" | "number";
  default?: any;
  enum?: string[];
  scope?: CommandEntry;
};

type Entry = {
  name: string;
  description: string;
  data: any;
};

type CommandEntry = {
  key: string;
  title: string;
  keybindings?: KeyBinding;
  shortcut?: boolean;
  group:
    | "notes"
    | "lookup"
    | "workspace"
    | "pods"
    | "dev"
    | "hierarchies"
    | "navigation"
    | "publishing";
  /**
   * Skip doc generation
   */
  skipDocs?: boolean;
  desc: string;
  docs?: string;
  docLink?: string;
  docAnchor?: string;
  docPreview?: string;
};

const CMD_PREFIX = "Dendron:";
export const ICONS = {
  STUB: "gist-new",
  SCHEMA: "repo",
};
export const DENDRON_WORKSPACE_FILE = "dendron.code-workspace";

export const DENDRON_REMOTE_VAULTS: Entry[] = [
  {
    name: "dendron",
    description: "dendron.so notes",
    data: "https://github.com/dendronhq/dendron-site.git",
  },
  {
    name: "aws",
    description: "aws notes",
    data: "https://github.com/dendronhq/dendron-aws-vault.git",
  },
  {
    name: "tldr",
    description: "cli tld",
    data: "https://github.com/kevinslin/seed-tldr.git",
  },
  {
    name: "xkcd",
    description: "all xkcd comics",
    data: "https://github.com/kevinslin/seed-xkcd.git",
  },
];

export const DENDRON_COMMANDS: { [key: string]: CommandEntry } = {
  // --- Notes
  BROWSE_NOTE: {
    key: "dendron.browseNote",
    // no prefix, we don't want to show this command
    title: `${CMD_PREFIX} Browse Note`,
    group: "notes",
    desc: "Browse note on github",
    skipDocs: false,
  },
  CONTRIBUTE: {
    key: "dendron.contributeToCause",
    // no prefix, we don't want to show this command
    title: `${CMD_PREFIX} Contribute`,
    group: "lookup",
    desc: "Become an environmentalist and keep Dendron sustainable",
    docs: [
      "This command takes you to Dendron's [Environmentalist](https://accounts.dendron.so/account/subscribe) plans.",
      "Environmentalists are users that can support Dendron financially through a monthly contribution. Environmentalist get access to insider builds, priority support, and access to exclusive dev channels.",
    ].join("\n"),
    skipDocs: false,
  },
  GOTO_NOTE: {
    key: "dendron.gotoNote",
    // no prefix, we don't want to show this command
    title: `${CMD_PREFIX} Goto Note`,
    group: "notes",
    desc: "Go to a note",
    skipDocs: true,
    keybindings: {
      key: "ctrl+enter",
      when: "editorFocus",
    },
  },
  CREATE_DAILY_JOURNAL_NOTE: {
    key: "dendron.createDailyJournalNote",
    title: `${CMD_PREFIX} Create Daily Journal Note`,
    group: "notes",
    keybindings: {
      key: "ctrl+shift+i",
      mac: "cmd+shift+i",
      when: "editorFocus",
    },
    desc: "Create a global journal note",
    docLink: "dendron.topic.special-notes.md",
    docPreview:
      "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/notes.daily.gif)",
  },
  COPY_NOTE_LINK: {
    key: "dendron.copyNoteLink",
    title: `${CMD_PREFIX} Copy Note Link`,
    group: "notes",
    desc: "Copy wiki link to note",
    docLink: "dendron.topic.commands.md",
    docPreview:
      "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/command.copy-link.gif)",
    keybindings: {
      key: "ctrl+shift+c",
      mac: "cmd+shift+c",
      when: "editorFocus",
    },
  },
  COPY_NOTE_REF: {
    key: "dendron.copyNoteRef",
    title: `${CMD_PREFIX} Copy Note Ref`,
    group: "notes",
    desc: "Copies a reference to the current open document",
    docLink: "dendron.topic.commands.md",
    docs: [
      "Lets you quickly create a [[note reference| dendron.topic.refs]] to the current note.",
      "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/ref-note.gif)",
      "",
      "If you have a header selected while running this command, it will copy the note ref with the selected header to the next note ref",
      "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/refs.copy-selection.gif)",
    ].join("\n"),
    docPreview: "",
    keybindings: {
      key: "ctrl+shift+r",
      mac: "cmd+shift+r",
      when: "editorFocus",
    },
  },
  DELETE_NODE: {
    key: "dendron.deleteNode",
    title: `${CMD_PREFIX} Delete Node`,
    group: "notes",
    keybindings: {
      key: "ctrl+shift+d",
      mac: "cmd+shift+d",
    },
    desc: "Delete a note or schema",
    docLink: "dendron.topic.lookup.md",
    docPreview: "",
  },
  MOVE_NOTE: {
    key: "dendron.moveNote",
    title: `${CMD_PREFIX} Move Note`,
    group: "notes",
    desc: "Move a note",
  },
  RENAME_NOTE: {
    key: "dendron.renameNote",
    title: `${CMD_PREFIX} Rename Note`,
    group: "notes",
    desc: "Rename a note and all backlinks",
    docLink: "dendron.topic.commands.md",
    docPreview:
      "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/command-rename.gif)",
  },
  // --- Lookup
  LOOKUP: {
    key: "dendron.lookup",
    title: `${CMD_PREFIX} Lookup`,
    group: "navigation",
    keybindings: {
      mac: "cmd+L",
      key: "ctrl+l",
    },
    desc: "Initiate note lookup",
    docLink: "dendron.topic.lookup.md",
    docPreview: "",
  },
  LOOKUP_JOURNAL: {
    key: "dendron.lookup",
    shortcut: true,
    title: `${CMD_PREFIX} Lookup (Journal Note)`,
    group: "navigation",
    keybindings: {
      key: "ctrl+shift+j",
      mac: "cmd+shift+j",
      args: {
        noteType: "journal",
      },
    },
    desc: "Initiate note lookup with journal note pre-selected",
    docLink: "dendron.topic.lookup.md",
    docPreview: "",
  },
  // LOOKUP_JOURNAL_GLOBAL: {
  //   key: "dendron.lookup",
  //   shortcut: true,
  //   title: `${CMD_PREFIX} Lookup (Daily Journal Note)`,
  //   group: "navigation",
  //   keybindings: {
  //     key: "ctrl+shift+i",
  //     mac: "cmd+shift+i",
  //     args: {
  //       noteType: "journal",
  //       noConfirm: true,
  //     },
  //   },
  //   desc: "Create daily journal note",
  //   docLink: "dendron.topic.special-notes.md",
  //   docPreview:
  //     "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/notes.daily.gif)",
  // },
  LOOKUP_SCRATCH: {
    key: "dendron.lookup",
    shortcut: true,
    title: `${CMD_PREFIX} Lookup (Scratch Note)`,
    group: "navigation",
    keybindings: {
      key: "ctrl+shift+s",
      mac: "cmd+shift+s",
      args: {
        noteType: "scratch",
        selectionType: "selection2link",
      },
    },
    desc: "Initiate note lookup with scratch note pre-selected",
    docLink: "dendron.topic.lookup.md",
    docPreview: "",
  },
  LOOKUP_SCHEMA: {
    key: "dendron.lookupSchema",
    title: `${CMD_PREFIX} Lookup Schema`,
    group: "navigation",
    keybindings: {
      mac: "cmd+shift+L",
      key: "ctrl+shift+l",
    },
    desc: "Initiate schema lookup",
    docLink: "dendron.topic.lookup.md",
    docPreview:
      "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/schema-lookup.gif)",
  },
  RELOAD_INDEX: {
    key: "dendron.reloadIndex",
    title: `${CMD_PREFIX} Reload Index`,
    group: "hierarchies",
    desc:
      "Reload the index. Necessary for Dendron to pick up on schema changes.",
    docLink: "dendron.topic.commands.md",
    docPreview: "",
  },
  // --- Hierarchies
  ARCHIVE_HIERARCHY: {
    key: "dendron.archiveHierarchy",
    title: `${CMD_PREFIX} Archive Hierarchy`,
    group: "hierarchies",
    desc: "Move current note and all children under the `archive` hierarchy",
    docs: [
      "This is a convenience method around `Refactor Hierarchy` for the case of archiving hierarchies you are no longer using. For example, if you were currently at `pro.foo`, running `Archive Hierarchy` would be equivalent to running `Refactor Hierarchy` with the following arguments:",
      "- matcher: `pro.foo`",
      "- replacement:  `archive.pro.foo`",
    ].join("\n"),
    docLink: "dendron.topic.commands.md",
    docPreview: `<a href="https://www.loom.com/share/9698d5a4451b49d8b107f3ff67d97877">  <img style="" src="https://cdn.loom.com/sessions/thumbnails/9698d5a4451b49d8b107f3ff67d97877-with-play.gif"> </a>`,
  },
  REFACTOR_HIERARCHY: {
    key: "dendron.refactorHierarchy",
    title: `${CMD_PREFIX} Refactor Hierarchy`,
    group: "hierarchies",
    desc: "Update hierarchy using regex",
    docs: [
      "Like `Rename Note` but works on an entire hierarchy of notes. This command takes two arguments: ",
      "- matcher: regex that matches text you want to capture for replacement",
      "- replacer: regex that represents text you want to use as replacement",
      "",
      "After running the command, you will be taken to a preview that shows all files that will be affected. You will be given an option in a dropdown to either proceed with the refactor or cancel the operation. ",
      "",
      "- NOTE: Dendron will warn you if refactoring will overwrite existing files. You will need to either change your `replacer` or move the affected files before Dendron will perform a refactor",
      "",
      "Refactor Hierarchy is ",
      "https://discordapp.com/channels/717965437182410783/743194856788328497/743195382795993291",
    ].join("\n"),
    docLink: "dendron.topic.commands.md",
    docPreview: `<a href="https://www.loom.com/share/11d90a86fd1348a5a504406b52d79f85"> <img style="" src="https://cdn.loom.com/sessions/thumbnails/11d90a86fd1348a5a504406b52d79f85-with-play.gif"> </a>`,
  },
  GO_UP_HIERARCHY: {
    key: "dendron.goUpHierarchy",
    title: `${CMD_PREFIX} Go Up`,
    group: "hierarchies",
    keybindings: {
      mac: "cmd+shift+up",
      key: "ctrl+shift+up",
      when: "editorFocus",
    },
    desc: "Go to closet non-stub parent of the currently open note",
    docLink: "dendron.topic.commands.md",
    docPreview:
      "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/hierarchy.go-up.gif)",
  },
  GO_NEXT_HIERARCHY: {
    key: "dendron.goNextHierarchy",
    title: `${CMD_PREFIX} Go Next Sibling`,
    group: "hierarchies",
    keybindings: {
      key: "ctrl+shift+]",
      when: "editorFocus",
    },
    desc: "Go to the next sibling",
    docLink: "dendron.topic.commands.md",
    docPreview:
      "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/hierarchy.go-sibling.gif)",
  },
  GO_PREV_HIERARCHY: {
    key: "dendron.goPrevHierarchy",
    title: `${CMD_PREFIX} Go Previous Sibling`,
    group: "hierarchies",
    keybindings: {
      key: "ctrl+shift+[",
      when: "editorFocus",
    },
    desc: "Go to the previous sibling",
    docLink: "dendron.topic.commands.md",
    docPreview:
      "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/hierarchy.go-sibling.gif)",
  },
  GO_DOWN_HIERARCHY: {
    key: "dendron.goDownHierarchy",
    title: `${CMD_PREFIX} Go Down`,
    group: "hierarchies",
    keybindings: {
      mac: "cmd+shift+down",
      key: "ctrl+shift+down",
      when: "editorFocus",
    },
    desc: "Go down the hierarchy",
    docLink: "dendron.topic.commands.md",
    docPreview:
      "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/hierarchy.go-down.gif)",
  },
  // --- Workspace
  ADD_AND_COMMIT: {
    key: "dendron.addAndCommit",
    title: `${CMD_PREFIX} Workspace: Add and Commit`,
    group: "workspace",
    desc: "add and commit all files",
  },
  VAULT_ADD: {
    key: "dendron.vaultAdd",
    title: `${CMD_PREFIX} Vault Add`,
    group: "workspace",
    desc: "Add a new vault",
    docPreview: `<div style="position: relative; padding-bottom: 62.5%; height: 0;"><iframe src="https://www.loom.com/embed/b4171372f9794dd7be609c043f343fa3" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>`,
    docs: [
      "When you add a vault, you can choose between adding a local vault or a remote vault.",
    ].join("\n"),
    docLink: "",
  },
  VAULT_REMOVE: {
    key: "dendron.vaultRemove",
    title: `${CMD_PREFIX} Vault Remove`,
    group: "workspace",
    desc: "Remove a vault",
    docLink: "",
    docPreview: [
      `Remove a vault from your workspace. Note that the underlying files wil **not** be deleted - the vault will lose its association with your workspace.`,
      `<div style="position: relative; padding-bottom: 62.5%; height: 0;"><iframe src="https://www.loom.com/embed/307effc22b8d4c59a32933529a8393e1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>`,
    ].join("\n"),
  },
  INIT_WS: {
    key: "dendron.initWS",
    title: `${CMD_PREFIX} Initialize Workspace`,
    group: "workspace",
    desc: "Create a new workspace",
    docLink: "dendron.topic.commands.md",
    docPreview:
      "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/workspace-init.gif)",
  },
  // INIT_WS_V2: {
  //   key: "dendron.initWSV2",
  //   title: `${CMD_PREFIX} Initialize Workspace V2`,
  //   group: "workspace",
  //   desc: "Create a new workspace",
  //   docLink: "dendron.topic.commands.md",
  //   docPreview:
  //     "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/workspace-init.gif)",
  // },
  CHANGE_WS: {
    key: "dendron.changeWS",
    title: `${CMD_PREFIX} Change Workspace`,
    group: "workspace",
    desc: "Change into existing workspace",
    docLink: "dendron.topic.commands.md",
    docPreview: "",
  },
  UPGRADE_SETTINGS: {
    key: "dendron.upgradeSettings",
    title: `${CMD_PREFIX} Upgrade Settings`,
    group: "workspace",
    desc:
      "Upgrade to the latest Dendron settings. You shouldn't need to run this manually. Its run everytime you get a Dendron update.",
    docLink: "dendron.topic.commands.md",
    docPreview: "",
    skipDocs: true,
  },
  // --- Pods
  CONFIGURE_POD: {
    key: "dendron.configurePod",
    title: `${CMD_PREFIX} Configure Pod`,
    group: "pods",
    desc: "Update your pod configuration",
    docLink: "dendron.topic.pod.md",
    docPreview:
      "![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/pods.configure.gif)",
  },
  IMPORT_POD: {
    key: "dendron.importPod",
    title: `${CMD_PREFIX} Import Pod`,
    group: "pods",
    desc:
      "Import notes from an external data source. Currently, only the local file system is supported",
    docLink: "dendron.topic.pod.md",
    docPreview: "",
  },
  EXPORT_POD: {
    key: "dendron.exportPod",
    title: `${CMD_PREFIX} Export Pod`,
    group: "pods",
    desc:
      "Export notes to an external data source. Currently only JSON is supported. ",
    docLink: "dendron.topic.pod.md",
    docPreview: `<a href="https://www.loom.com/share/d49e5f4155af485cadc9cd810b6cab28"> <img src="https://cdn.loom.com/sessions/thumbnails/d49e5f4155af485cadc9cd810b6cab28-with-play.gif"> </a>`,
  },
  PUBLISH_POD: {
    key: "dendron.publishPod",
    title: `${CMD_PREFIX} Publish Pod`,
    group: "pods",
    desc: "Publish your note to a different format/location",
    docLink: "dendron.topic.pod.md",
    docPreview: ``,
  },
  SNAPSHOT_VAULT: {
    key: "dendron.snapshotVault",
    title: `${CMD_PREFIX} Snapshot Vault`,
    group: "workspace",
    desc: "Create a snapshot of your vault",
    docs: [
      "Takes a snapshot of your entire vault, including assets. This command will ignore version control folders like .git when making a snapshot.",
      "Snapshots are saved under {workspace}/snapshots/{timestamp}",
    ].join("\n"),
    docLink: "",
    docPreview: ``,
  },
  RESTORE_VAULT: {
    key: "dendron.restoreVault",
    title: `${CMD_PREFIX} Restore Vault`,
    group: "workspace",
    desc: "Restore your vault from a snapshot",
    docs: [
      "Restores your vault based on a snapshot. When restoring, it will over-write any notes that have the same name as notes in the snapshot. It will ignore version control directories like .git when restoring your vault",
    ].join("\n"),
    docLink: "",
    docPreview: ``,
  },
  COPY_NOTE_URL: {
    key: "dendron.copyNoteURL",
    title: `${CMD_PREFIX} Copy Note URL`,
    group: "pods",
    desc: "Get URL of current note from published site",
    docs:
      "If you highlight a header, will copy the url with the header set as the anchor",
    docLink: "",
    docPreview: `![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/notes.copy-url.gif)`,
    keybindings: {
      mac: "cmd+shift+u",
      windows: "ctrl+shift+u",
    },
  },
  // --- Publishing
  SITE_BUILD: {
    key: "dendron.siteBuild",
    title: `${CMD_PREFIX} Site Build`,
    group: "publishing",
    desc: "Build your notes using publishing v2",
    docs: [
      "This command works by running `dendron-cli` in the background.",
    ].join("\n"),
    docLink: "",
    docPreview: ``,
  },
  SITE_PREVIEW: {
    key: "dendron.sitePreview",
    title: `${CMD_PREFIX} Site Preview`,
    group: "publishing",
    desc: "Preview your notes on localhost using publishing v2",
    docs: [
      "This command works by running `dendron-cli` in the background.",
    ].join("\n"),
    docLink: "",
    docPreview: ``,
  },
  // --- Accounts
  SIGNUP: {
    key: "dendron.signUp",
    title: `${CMD_PREFIX} Sign Up`,
    group: "workspace",
    desc: "sign up for a Dendron account",
  },
  SIGNIN: {
    key: "dendron.signIn",
    title: `${CMD_PREFIX} Sign In`,
    group: "workspace",
    desc: "sign in to a Dendron account",
  },
  // --- Misc
  OPEN_LINK: {
    key: "dendron.openLink",
    title: `${CMD_PREFIX} Open Link`,
    group: "navigation",
    desc: "Open link to external file (eg. pdf, .mov, etc) use system default",
    docLink: "dendron.topic.links.md",
    docPreview: `<a href="https://www.loom.com/share/01250485e20a4cdca2a053dd6047ac68"><img src="https://cdn.loom.com/sessions/thumbnails/01250485e20a4cdca2a053dd6047ac68-with-play.gif"> </a>`,
  },
  PASTE_LINK: {
    key: "dendron.pasteLink",
    title: `${CMD_PREFIX} Paste Link`,
    group: "workspace",
    desc: "Fetch metadata for a web link and format as markdown",
  },
  SHOW_HELP: {
    key: "dendron.showHelp",
    title: `${CMD_PREFIX} Show Help`,
    group: "workspace",
    desc:
      "Dendron will open your current browser to the [[cheatsheet|dendron.cheatsheet]] page. ",
    docLink: "dendron.topic.commands.md",
    docPreview: `![](https://foundation-prod-assetspublic53c57cce-8cpvgjldwysl.s3-us-west-2.amazonaws.com/assets/images/workbench.help.gif)`,
  },
  SHOW_PREVIEW: {
    key: "dendron.showPreview",
    title: `${CMD_PREFIX} Show Preview`,
    group: "notes",
    keybindings: {
      windows: "windows+ctrl+p",
      mac: "cmd+ctrl+p",
    },
    desc: "Show Markdown Preview",
    docLink: "dendron.topic.commands.md",
    docPreview: "",
  },
  // -- Workbench
  CONFIGURE_RAW: {
    key: "dendron.configureRaw",
    title: `${CMD_PREFIX} Configure (yaml)`,
    group: "workspace",
    desc: "Modify Dendron Config as raw YAML",
    docs: [""].join("\n"),
    docLink: "",
    docPreview: ``,
  },
  CONFIGURE_UI: {
    key: "dendron.configureUI",
    title: `${CMD_PREFIX} Configure`,
    group: "workspace",
    desc: "Modify Dendron Config using Dendron UI",
    docs: [
      `<div style="position: relative; padding-bottom: 62.5%; height: 0;"><iframe src="https://www.loom.com/embed/5b6689eb76344fbb814a3d4405ef62b8" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>`,
    ].join("\n"),
    docLink: "",
    docPreview: ``,
  },
  // --- Dev
  DOCTOR: {
    key: "dendron.dev.doctor",
    title: `${CMD_PREFIX} Doctor`,
    group: "dev",
    desc: "Auto fix issues with frontmatter",
    docs: [
      "This makes sure your workspace is up to date. It will execute the following actions:",
      "- add ids and titles to the frontmatter of all notes that are missing it",
      "- setup a `docs` folder if it doesn't exist. Required if you want to [[publish | dendron.topic.publishing]] your notes",
    ].join("\n"),
    docLink: "dendron.topic.commands.md",
    docPreview: `<a href="https://www.loom.com/share/bd045f708f8e474193de8e3de0dc820f"> <img style="" src="https://cdn.loom.com/sessions/thumbnails/bd045f708f8e474193de8e3de0dc820f-with-play.gif"> </a>`,
  },
  DUMP_STATE: {
    key: "dendron.dev.dumpState",
    title: `${CMD_PREFIX} Dump State`,
    group: "dev",
    desc: "Dump internal state of Dendron inside logs",
    docs: "This is useful when diagnosing issues in Dendron",
  },
  RESET_CONFIG: {
    key: "dendron.dev.resetConfig",
    title: `${CMD_PREFIX}Dev: Reset Config`,
    desc: "Reset the config",
    group: "dev",
    skipDocs: true,
  },
  OPEN_LOGS: {
    key: "dendron.dev.openLogs",
    title: `${CMD_PREFIX}Dev: Open Logs`,
    group: "dev",
    desc: "Open Dendron logs for current session",
    docLink: "dendron.topic.commands.md",
    docPreview: "",
  },
  DEV_DIAGNOSTICS_REPORT: {
    key: "dendron.diagnosticsReport",
    title: `${CMD_PREFIX}Dev: Diagnostics Report`,
    group: "dev",
    desc: "Generate diagnostics report",
    docLink: "dendron.topic.commands.md",
    docPreview: "",
  },
};

export const DENDRON_CHANNEL_NAME = "Dendron";

export const WORKSPACE_STATE = {
  WS_VERSION: "dendron.wsVersion",
};

export enum GLOBAL_STATE {
  VERSION = "dendron.version",
  VERSION_PREV = "dendron.versionPrev",
  /**
   * Set the first time a dendron workspace is activated
   */
  DENDRON_FIRST_WS = "dendron.first_ws",
  DENDRON_FIRST_WS_TUTORIAL_STEP = "dendron.first_ws.tutorial_step",
  /**
   * Extension is being debugged
   */
  VSCODE_DEBUGGING_EXTENSION = "dendron.vscode_debugging_extension",
}
// export const GLOBAL_STATE = {
//   VERSION: "dendron.version",
//   VERSION_PREV: "dendron.versionPrev",
//   /**
//    * Set the first time a dendron workspace is activated
//    */
//   DENDRON_FIRST_WS: "dendron.first_ws",
//   DENDRON_FIRST_WS_TUTORIAL_STEP: "dendron.first_ws.tutorial_step",
//   /**
//    * Extension is being debugged
//    */
//   VSCODE_DEBUGGING_EXTENSION: "dendron.vscode_debugging_extension",
// };

// type ConfigEntry = {
//   key: string;
//   default?: any;
// };
// type ConfigDict = { [k: keyof typeof CONFIG]: ConfigEntry};

export type ConfigKey = keyof typeof CONFIG;

const _noteDateDesc = (type: "journal" | "scratch") =>
  `date format used for ${type} notes`;
const _noteNameDesc = (type: "journal" | "scratch") =>
  `name used for ${type} notes`;
const _noteAddBehaviorDesc = (type: "journal" | "scratch") =>
  `strategy for adding new ${type} notes`;

export const _noteAddBehaviorEnum = [
  "childOfDomain",
  "childOfDomainNamespace",
  "childOfCurrent",
  "asOwnDomain",
];

export const CONFIG: { [key: string]: ConfigEntry } = {
  // --- journals
  DAILY_JOURNAL_DOMAIN: {
    key: "dendron.dailyJournalDomain",
    type: "string",
    default: "daily",
    description: "domain where daily journals are kept",
  },
  DEFAULT_JOURNAL_NAME: {
    key: CodeConfigKeys.DEFAULT_JOURNAL_NAME,
    type: "string",
    default: "journal",
    description: _noteNameDesc("journal"),
  },
  DEFAULT_JOURNAL_DATE_FORMAT: {
    key: CodeConfigKeys.DEFAULT_JOURNAL_DATE_FORMAT,
    type: "string",
    default: "y.MM.dd",
    description: _noteDateDesc("journal"),
  },
  DEFAULT_JOURNAL_ADD_BEHAVIOR: {
    key: "dendron.defaultJournalAddBehavior",
    default: "childOfDomain",
    type: "string",
    description: _noteAddBehaviorDesc("journal"),
    enum: _noteAddBehaviorEnum,
  },
  DEFAULT_SCRATCH_NAME: {
    key: "dendron.defaultScratchName",
    type: "string",
    default: "scratch",
    description: _noteNameDesc("scratch"),
  },
  DEFAULT_SCRATCH_DATE_FORMAT: {
    key: "dendron.defaultScratchDateFormat",
    type: "string",
    default: "y.MM.dd.HHmmss",
    description: _noteDateDesc("scratch"),
  },
  DEFAULT_SCRATCH_ADD_BEHAVIOR: {
    key: "dendron.defaultScratchAddBehavior",
    default: "asOwnDomain",
    type: "string",
    description: _noteAddBehaviorDesc("scratch"),
    enum: _noteAddBehaviorEnum,
  },
  COPY_NOTE_URL_ROOT: {
    key: "dendron.copyNoteUrlRoot",
    type: "string",
    description: "override root url when getting note url",
  },
  LINK_SELECT_AUTO_TITLE_BEHAVIOR: {
    key: "dendron.linkSelectAutoTitleBehavior",
    type: "string",
    description: "Control title behavior when using selection2link with lookup",
    enum: ["none", "slug"],
    default: "slug",
  },
  DEFAULT_LOOKUP_CREATE_BEHAVIOR: {
    key: "dendron.defaultLookupCreateBehavior",
    default: "selectionExtract",
    type: "string",
    description:
      "when creating a new note with selected text, define behavior for selected text",
    enum: ["selection2link", "selectionExtract"],
  },
  // --- timestamp decoration
  DEFAULT_TIMESTAMP_DECORATION_FORMAT: {
    key: CodeConfigKeys.DEFAULT_TIMESTAMP_DECORATION_FORMAT,
    default: "DATETIME_MED",
    type: "string",
    description: "Decide how human readable timestamp decoration is displayed",
    enum: [
      "DATETIME_FULL",
      "DATETIME_FULL_WITH_SECONDS",
      "DATETIME_HUGE",
      "DATETIME_HUGE_WITH_SECONDS",
      "DATETIME_MED",
      "DATETIME_MED_WITH_SECONDS",
      "DATETIME_SHORT",
      "DATETIME_SHORT_WITH_SECONDS",
      "DATE_FULL",
      "DATE_HUGE",
      "DATE_MED",
      "DATE_MED_WITH_WEEKDAY",
      "DATE_SHORT",
      "TIME_24_SIMPLE",
      "TIME_24_WITH_LONG_OFFSET",
      "TIME_24_WITH_SECONDS",
      "TIME_24_WITH_SHORT_OFFSET",
      "TIME_SIMPLE",
      "TIME_WITH_LONG_OFFSET",
      "TIME_WITH_SECONDS",
      "TIME_WITH_SHORT_OFFSET",
    ],
  },
  // --- root dir
  ROOT_DIR: {
    key: "dendron.rootDir",
    type: "string",
    default: "",
    description: "location of dendron workspace",
  },
  DENDRON_DIR: {
    key: "dendron.dendronDir",
    type: "string",
    default: "",
    description: "location of dendron configuration",
  },
  // --- other
  LOG_LEVEL: {
    key: "dendron.logLevel",
    type: "string",
    default: "info",
    description: "control verbosity of dendron logs",
    enum: ["debug", "info", "error"],
  },
  LSP_LOG_LVL: {
    key: "dendron.trace.server",
    enum: ["off", "messages", "verbose"],
    type: "string",
    default: "messages",
    description: "LSP log level",
  },
  SERVER_PORT: {
    key: "dendron.serverPort",
    type: "number",
    description:
      "port for server. If not set, will be randomly generated at startup.",
  },
};
