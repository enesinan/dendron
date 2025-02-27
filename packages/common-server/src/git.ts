import {
  CONSTANTS,
  DendronConfig,
  DendronError,
  DVault,
  NoteProps,
  RESERVED_KEYS,
  VaultUtils,
} from "@dendronhq/common-all";
import execa from "execa";
import fs from "fs-extra";
import _ from "lodash";
import path from "path";
import simpleGit, { SimpleGit } from "simple-git";
import { parse } from "url";
import { readYAML } from "./files";
import { vault2Path } from "./filesv2";
export { simpleGit, SimpleGit };

const formatString = (opts: { txt: string; note: NoteProps }) => {
  const { txt, note } = opts;
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
  const noteHiearchy = note.fname.replace(/\./g, "/");
  return _.template(txt)({ noteHiearchy });
};

/**
 *  NOTICE: Lots of the Git code is obtained from https://github.com/KnisterPeter/vscode-github, licened under MIT
 */

/**
 * Utilities for working with git urls
 */
export class GitUtils {
  static canShowGitLink(opts: { config: DendronConfig; note: NoteProps }) {
    const { config, note } = opts;

    if (
      _.isBoolean((note.custom || {})[RESERVED_KEYS.GIT_NO_LINK]) &&
      note.custom[RESERVED_KEYS.GIT_NO_LINK]
    ) {
      return false;
    }
    return _.every([
      config.site.gh_edit_link,
      config.site.gh_edit_link_text,
      config.site.gh_edit_repository,
      config.site.gh_edit_branch,
      config.site.gh_edit_view_mode,
    ]);
  }
  /**
   * Convert a github repo orul to access token format
   */
  static getGithubAccessTokenUrl(opts: {
    remotePath: string;
    accessToken: string;
  }) {
    const { remotePath, accessToken } = opts;
    let repoPath: string;
    debugger;
    if (remotePath.startsWith("https://")) {
      repoPath = remotePath.split("/").slice(-2).join("/");
    } else {
      repoPath = opts.remotePath.split(":").slice(-1)[0];
    }
    return `https://${accessToken}:x-oauth-basic@github.com/${repoPath}`;
  }

  static git2Github(gitUrl: string) {
    // 'git@github.com:kevinslin/dendron-vault.git'
    // @ts-ignore
    const [_, userAndRepo] = gitUrl.split(":");
    const [user, repo] = userAndRepo.split("/");
    return `https://github.com/${user}/${path.basename(repo, ".git")}`;
  }

  static getGithubEditUrl(opts: {
    note: NoteProps;
    config: DendronConfig;
    wsRoot: string;
  }) {
    const { note, config, wsRoot } = opts;
    const vault = note.vault;
    const vaults = config.vaults;
    const mvault = VaultUtils.matchVault({ wsRoot, vault, vaults });
    const vaultUrl = _.get(mvault, "remote.url", false);
    const gitRepoUrl = config.site.gh_edit_repository;
    // if we have a vault, we don't need to include the vault name as an offset
    if (mvault && vaultUrl) {
      return _.join(
        [
          this.git2Github(vaultUrl),
          config.site.gh_edit_view_mode,
          config.site.gh_edit_branch,
          note.fname + ".md",
        ],
        "/"
      );
    }

    let gitNotePath = _.join(
      [path.basename(vault.fsPath), note.fname + ".md"],
      "/"
    );
    if (_.has(note?.custom, RESERVED_KEYS.GIT_NOTE_PATH)) {
      gitNotePath = formatString({
        txt: note.custom[RESERVED_KEYS.GIT_NOTE_PATH],
        note,
      });
    }
    // this assumes we have a workspace url
    return _.join(
      [
        gitRepoUrl,
        config.site.gh_edit_view_mode,
        config.site.gh_edit_branch,
        gitNotePath,
      ],
      "/"
    );
  }

  static getOwnerAndRepoFromURL(url: string) {
    const [owner, repo] = url.split("/").slice(-2);
    return { owner, repo };
  }

  static getRepoNameFromURL(url: string): string {
    return path.basename(url, ".git");
  }

  static getVaultFromRepo(opts: {
    repoPath: string;
    repoUrl: string;
    wsRoot: string;
  }): DVault {
    const { repoPath, wsRoot } = opts;
    return {
      fsPath: path.relative(wsRoot, repoPath),
      remote: { type: "git", url: opts.repoUrl },
    };
  }

  static getVaultsFromRepo(opts: {
    repoPath: string;
    repoUrl: string;
    wsRoot: string;
  }): { vaults: DVault[] } {
    const { repoPath, wsRoot } = opts;
    // is workspace root
    if (fs.existsSync(path.join(repoPath, CONSTANTS.DENDRON_CONFIG_FILE))) {
      const config = readYAML(
        path.join(repoPath, CONSTANTS.DENDRON_CONFIG_FILE)
      ) as DendronConfig;
      const vaults = config.vaults.map((ent) => {
        const vpath = vault2Path({ vault: ent, wsRoot: repoPath });
        return {
          ...ent,
          fsPath: path.relative(wsRoot, vpath),
        };
      });
      return {
        vaults,
      };
    } else {
      return {
        vaults: [
          {
            fsPath: path.relative(wsRoot, repoPath),
            remote: { type: "git", url: opts.repoUrl },
          },
        ],
      };
    }
  }

  static isRepo(src: string) {
    return fs.existsSync(src) && fs.existsSync(path.join(src, ".git"));
  }

  static async getGitRoot(uri: string): Promise<string> {
    const response = await this.execute("git rev-parse --show-toplevel", uri);
    return response.stdout.trim();
  }

  static async getGithubFileUrl(
    uri: string,
    file: string,
    line = 0,
    endLine = 0
  ): Promise<string> {
    const hostname = await this.getGitHostname(uri);
    const [owner, repo] = await this.getGitProviderOwnerAndRepository(uri);
    const branch = await this.getCurrentBranch(uri);
    const currentFile = file.replace(/^\//, "");
    return `https://${hostname}/${owner}/${repo}/blob/${branch}/${currentFile}#L${
      line + 1
    }:L${endLine + 1}`;
  }

  static async getGitHostname(uri: string): Promise<string> {
    return (await this.getGitProviderOwnerAndRepositoryFromGitConfig(uri))[1];
  }

  static async getGitProviderOwnerAndRepositoryFromGitConfig(
    uri: string
  ): Promise<string[]> {
    const remoteName = await this.getRemoteName(uri);
    try {
      const remote = (
        await this.execute(
          `git config --local --get remote.${remoteName}.url`,
          uri
        )
      ).stdout.trim();
      if (!remote.length) {
        throw new Error("Git remote is empty!");
      }
      return this.parseGitUrl(remote);
    } catch (e) {
      const remotes = await this.getRemoteNames(uri);
      if (!remotes.includes(remoteName)) {
        throw new DendronError({
          msg: `Your configuration contains an invalid remoteName. You should probably use one of these:\n ${remotes.join(
            "\n"
          )}`,
        });
      }
      throw e;
    }
  }

  static async getRemoteName(uri: string): Promise<string> {
    const remoteName = await this.calculateRemoteName(uri);
    if (remoteName) {
      return remoteName;
    }
    // fallback to origin which is a sane default
    return "origin";
  }

  static async calculateRemoteName(uri: string): Promise<string | undefined> {
    const ref = (
      await this.execute(`git symbolic-ref -q HEAD`, uri)
    ).stdout.trim();
    const upstreamName = (
      await this.execute(
        `git for-each-ref --format='%(upstream)' '${ref}'`,
        uri
      )
    ).stdout.trim();
    const match = upstreamName.match(/refs\/remotes\/([^/]+)\/.*/);
    if (match) {
      return match[1];
    }
    return undefined;
  }

  static parseGitUrl(remote: string): string[] {
    // git protocol remotes, may be git@github:username/repo.git
    // or git://github/user/repo.git, domain names are not case-sensetive
    if (remote.startsWith("git@") || remote.startsWith("git://")) {
      return this.parseGitProviderUrl(remote);
    }

    return this.getGitProviderOwnerAndRepositoryFromHttpUrl(remote);
  }

  static parseGitProviderUrl(remote: string): string[] {
    const match = new RegExp(
      "^git(?:@|://)([^:/]+)(?::|:/|/)([^/]+)/(.+?)(?:.git)?$",
      "i"
    ).exec(remote);
    if (!match) {
      throw new Error(
        `'${remote}' does not seem to be a valid git provider url.`
      );
    }
    return ["git:", ...match.slice(1, 4)];
  }

  static getGitProviderOwnerAndRepositoryFromHttpUrl(remote: string): string[] {
    // it must be http or https based remote
    const { protocol = "https:", hostname, pathname } = parse(remote);
    if (!protocol) {
      throw Error("impossible");
    }
    // domain names are not case-sensetive
    if (!hostname || !pathname) {
      throw new Error("Not a Provider remote!");
    }
    const match = pathname.match(/\/(.*?)\/(.*?)(?:.git)?$/);
    if (!match) {
      throw new Error("Not a Provider remote!");
    }
    return [protocol, hostname, ...match.slice(1, 3)];
  }

  static async getRemoteNames(uri: string): Promise<string[]> {
    const remotes = (
      await this.execute(`git config --local --get-regexp "^remote.*.url"`, uri)
    ).stdout.trim();
    return remotes
      .split("\n")
      .map((line) => new RegExp("^remote.([^.]+).url.*").exec(line))
      .map((match) => match && match[1])
      .filter((name) => Boolean(name)) as string[];
  }

  static async getGitProviderOwnerAndRepository(
    uri: string
  ): Promise<string[]> {
    return (
      await this.getGitProviderOwnerAndRepositoryFromGitConfig(uri)
    ).slice(2, 4);
  }

  static async getCurrentBranch(uri: string): Promise<string | undefined> {
    const stdout = (await this.execute("git branch", uri)).stdout;
    const match = stdout.match(/^\* (.*)$/m);
    return match ? match[1] : undefined;
  }

  static async execute(
    cmd: string,
    uri: string
  ): Promise<{ stdout: string; stderr: string }> {
    const [git, ...args] = cmd.split(" ");
    return execa(git, args, { cwd: uri });
  }
}
