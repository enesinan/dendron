import {
  DendronConfig,
  DNoteRefLink,
  DVault,
  NoteProps,
} from "@dendronhq/common-all";
import { Parent, Root } from "mdast";
import { Processor } from "unified";
import { LinkFilter } from "../topics/markdown/plugins/types";
import { DendronPubOpts } from "./remark/dendronPub";
import { WikiLinksOpts } from "./remark/wikiLinks";
export { Node as UnistNode } from "unist";
export { VFile } from "vfile";
export { Processor };

export type DendronASTRoot = Root & {
  children: DendronASTNode;
};

export type DendronASTNode = Parent & {
  notes?: NoteProps[];
  children?: Parent["children"] | DendronASTNode[];
};

export enum DendronASTTypes {
  WIKI_LINK = "wikiLink",
  REF_LINK = "refLink",
  REF_LINK_V2 = "refLinkV2",
  PARAGRAPH = "paragraph",
}

export enum DendronASTDest {
  MD_ENHANCED_PREVIEW = "MD_ENHANCED_PREVIEW",
  MD_REGULAR = "MD_REGULAR",
  MD_DENDRON = "MD_DENDRON",
  HTML = "HTML",
}

export enum VaultMissingBehavior {
  FALLBACK_TO_ORIGINAL_VAULT,
  THROW_ERROR,
}

export type DendronASTData = {
  dest: DendronASTDest;
  vault: DVault;
  fname?: string;
  wikiLinkOpts?: WikiLinksOpts;
  config: DendronConfig;
  overrides?: Partial<DendronPubOpts>;
  shouldApplyPublishRules?: boolean;
  /**
   * Inidicate that we are currently inside a note ref
   */
  insideNoteRef?: boolean;
};

// NODES

export type WikiLinkNoteV4 = DendronASTNode & {
  type: DendronASTTypes.WIKI_LINK;
  value: string;
  data: WikiLinkDataV4;
};

export type WikiLinkDataV4 = {
  alias: string;
  anchorHeader?: string;
  prefix?: string;
  vaultName?: string;
  filters?: LinkFilter[];
};

export type NoteRefNoteV4_LEGACY = DendronASTNode & {
  type: DendronASTTypes.REF_LINK;
  value: string;
  data: NoteRefDataV4_LEGACY;
};

export type NoteRefNoteV4 = Omit<DendronASTNode, "children"> & {
  type: DendronASTTypes.REF_LINK_V2;
  value: string;
  data: NoteRefDataV4;
};

export type NoteRefDataV4 = {
  link: DNoteRefLink;
  vaultName?: string;
};

export type NoteRefDataV4_LEGACY = {
  link: DNoteRefLink;
};
