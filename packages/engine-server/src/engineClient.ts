import {
  BulkAddNoteOpts,
  ConfigGetPayload,
  ConfigWriteOpts,
  DendronConfig,
  DendronError,
  DEngineClientV2,
  DEngineDeleteSchemaRespV2,
  DEngineInitRespV2,
  DEngineV2,
  DLink,
  DNodeProps,
  DVault,
  EngineDeleteNoteResp,
  EngineDeleteOptsV2,
  EngineInfoResp,
  EngineUpdateNodesOptsV2,
  EngineWriteOptsV2,
  ERROR_CODES,
  GetNoteOptsV2,
  GetNotePayloadV2,
  NoteChangeEntry,
  NotePropsDictV2,
  NoteProps,
  NoteUtils,
  QueryNotesOpts,
  RenameNoteOptsV2,
  RenameNotePayload,
  RespRequiredV2,
  RespV2,
  SchemaModuleDictV2,
  SchemaModulePropsV2,
  SchemaQueryResp,
  SchemaUtils,
  VaultUtils,
  WriteNoteResp,
} from "@dendronhq/common-all";
import {
  createLogger,
  DendronAPI,
  DLogger,
  readYAML,
} from "@dendronhq/common-server";
import fs from "fs-extra";
import _ from "lodash";
import { DConfig } from "./config";
import { FileStorageV2 } from "./drivers/file/storev2";
import { FuseEngine } from "./fuseEngine";
import { HistoryService } from "./history";
import { getPortFilePath } from "./utils";

type DendronEngineClientOpts = {
  vaults: DVault[];
  ws: string;
};
export class DendronEngineClient implements DEngineClientV2 {
  public notes: NotePropsDictV2;
  public wsRoot: string;
  public schemas: SchemaModuleDictV2;
  public links: DLink[];
  public ws: string;
  public fuseEngine: FuseEngine;
  public api: DendronAPI;
  public vaultsv3: DVault[];
  public configRoot: string;
  public history?: HistoryService;
  public logger: DLogger;
  public store: FileStorageV2;
  public config: DendronConfig;

  static create({
    port,
    vaults,
    ws,
    history,
    logger,
  }: {
    port: number | string;
    history?: HistoryService;
    logger?: DLogger;
  } & DendronEngineClientOpts) {
    const api = new DendronAPI({
      endpoint: `http://localhost:${port}`,
      apiPath: "api",
      logger,
    });
    return new DendronEngineClient({ api, vaults, ws, history });
  }

  static getPort({ wsRoot }: { wsRoot: string }): number {
    const portFile = getPortFilePath({ wsRoot });
    if (!fs.pathExistsSync(portFile)) {
      throw new DendronError({ msg: "no port file" });
    }
    return _.toInteger(_.trim(fs.readFileSync(portFile, { encoding: "utf8" })));
  }

  constructor({
    api,
    vaults,
    ws,
    history,
    logger,
  }: {
    api: DendronAPI;
    history?: HistoryService;
    logger?: DLogger;
  } & DendronEngineClientOpts) {
    this.api = api;
    this.notes = {};
    this.schemas = {};
    this.links = [];
    this.fuseEngine = new FuseEngine({});
    this.vaultsv3 = vaults;
    this.wsRoot = ws;
    this.ws = ws;
    this.configRoot = this.wsRoot;
    this.history = history;
    this.logger = logger || createLogger();
    const cpath = DConfig.configPath(ws);
    this.config = readYAML(cpath) as DendronConfig;
    this.store = new FileStorageV2({
      engine: this,
      logger: this.logger,
    });
  }

  /**
   * Load all nodes
   */
  async init(): Promise<DEngineInitRespV2> {
    const resp = await this.api.workspaceInit({
      uri: this.ws,
      config: { vaults: this.vaultsv3 },
    });

    if (resp.error && resp.error.code !== ERROR_CODES.MINOR) {
      return {
        error: resp.error,
        data: { notes: {}, schemas: {} },
      };
    }
    if (!resp.data) {
      throw new DendronError({ msg: "no data" });
    }
    const { notes, schemas } = resp.data;
    this.notes = notes;
    this.schemas = schemas;
    await this.fuseEngine.updateNotesIndex(notes);
    await this.fuseEngine.updateSchemaIndex(schemas);
    this.store.notes = notes;
    this.store.schemas = schemas;
    return {
      error: resp.error,
      data: { notes, schemas },
    };
  }

  async bulkAddNotes(opts: BulkAddNoteOpts) {
    const resp = await this.api.engineBulkAdd({ opts, ws: this.ws });
    let changed = resp.data;
    await this.refreshNotesV2(changed);
    return resp;
  }

  async deleteNote(
    id: string,
    opts?: EngineDeleteOptsV2
  ): Promise<EngineDeleteNoteResp> {
    const ws = this.ws;
    const resp = await this.api.engineDelete({ id, opts, ws });
    if (!resp.data) {
      throw new DendronError({ msg: "no data" });
    }
    await this.refreshNotesV2(resp.data);
    return {
      error: null,
      data: resp.data,
    };
  }

  async deleteSchema(
    id: string,
    opts?: EngineDeleteOptsV2
  ): Promise<DEngineDeleteSchemaRespV2> {
    const ws = this.ws;
    const resp = await this.api.schemaDelete({ id, opts, ws });
    delete this.schemas[id];
    if (!resp?.data?.notes || !resp?.data?.schemas) {
      throw new DendronError({ msg: "bad delete operation" });
    }
    const { notes, schemas } = resp.data;
    this.notes = notes;
    this.schemas = schemas;
    this.fuseEngine.updateNotesIndex(notes);
    this.fuseEngine.updateSchemaIndex(schemas);
    return {
      error: null,
      data: resp.data,
    };
  }

  async getConfig(): Promise<RespV2<ConfigGetPayload>> {
    const resp = await this.api.configGet({
      ws: this.ws,
    });
    return resp;
  }

  async getNoteByPath(opts: GetNoteOptsV2): Promise<RespV2<GetNotePayloadV2>> {
    const resp = await this.api.engineGetNoteByPath({
      ...opts,
      ws: this.ws,
    });
    if (!_.isUndefined(resp.data)) {
      await this.refreshNotesV2(resp.data.changed);
    }
    return resp;
  }

  async info(): Promise<RespRequiredV2<EngineInfoResp>> {
    const resp = await this.api.engineInfo();
    return resp;
  }

  async queryNote(
    opts: Parameters<DEngineClientV2["queryNotes"]>[0]
  ): Promise<NoteProps[]> {
    const { qs, vault } = opts;
    let noteIndexProps = await this.fuseEngine.queryNote({ qs });
    // TODO: hack
    if (!_.isUndefined(vault)) {
      noteIndexProps = noteIndexProps.filter((ent) =>
        VaultUtils.isEqual(vault, ent.vault, this.wsRoot)
      );
    }
    return noteIndexProps.map((ent) => this.notes[ent.id]);
  }

  async queryNotes(opts: QueryNotesOpts) {
    const items = await this.queryNote(opts);
    return {
      data: items,
      error: null,
    };
  }

  async buildNotes() {}

  queryNotesSync({ qs, vault }: { qs: string; vault?: DVault }) {
    let items = this.fuseEngine.queryNote({ qs });
    if (vault) {
      items = items.filter((ent) => {
        return VaultUtils.isEqual(ent.vault, vault, this.wsRoot);
      });
    }
    return {
      error: null,
      data: items.map((ent) => this.notes[ent.id]),
    };
  }

  async refreshNotes(notes: NoteProps[]) {
    notes.forEach((node: DNodeProps) => {
      const { id } = node;
      this.notes[id] = node;
    });
    this.fuseEngine.updateNotesIndex(this.notes);
  }

  async refreshNotesV2(notes: NoteChangeEntry[]) {
    notes.forEach((ent: NoteChangeEntry) => {
      const { id } = ent.note;
      const uri = NoteUtils.getURI({ note: ent.note, wsRoot: this.wsRoot });
      if (ent.status === "delete") {
        delete this.notes[id];
        this.history &&
          this.history.add({ source: "engine", action: "delete", uri });
      } else {
        if (ent.status === "create") {
          this.history &&
            this.history.add({ source: "engine", action: "create", uri });
        }
        this.notes[id] = ent.note;
      }
    });
    this.fuseEngine.updateNotesIndex(this.notes);
  }

  async refreshSchemas(smods: SchemaModulePropsV2[]) {
    smods.forEach((smod) => {
      const id = SchemaUtils.getModuleRoot(smod).id;
      this.schemas[id] = smod;
    });
  }

  async renameNote(opts: RenameNoteOptsV2): Promise<RespV2<RenameNotePayload>> {
    const resp = await this.api.engineRenameNote({ ...opts, ws: this.ws });
    await this.refreshNotesV2(resp.data as NoteChangeEntry[]);
    return resp;
  }

  async sync(): Promise<DEngineInitRespV2> {
    const resp = await this.api.workspaceSync({ ws: this.ws });
    if (!resp.data) {
      throw new DendronError({ msg: "no data", payload: resp });
    }
    const { notes, schemas } = resp.data;
    this.notes = notes;
    this.schemas = schemas;
    await this.fuseEngine.updateNotesIndex(notes);
    await this.fuseEngine.updateSchemaIndex(schemas);
    return {
      error: resp.error,
      data: { notes, schemas },
    };
  }

  async updateNote(
    note: NoteProps,
    opts?: EngineUpdateNodesOptsV2
  ): Promise<void> {
    await this.api.engineUpdateNote({ ws: this.ws, note, opts });
    const maybeNote = this.notes[note.id];
    if (maybeNote) {
      note = { ...maybeNote, ...note };
    }
    await this.refreshNotes([note]);
    return;
  }

  async writeNote(
    note: NoteProps,
    opts?: EngineWriteOptsV2
  ): Promise<WriteNoteResp> {
    const resp = await this.api.engineWrite({
      node: note,
      opts,
      ws: this.ws,
    });
    let changed = resp.data;
    // we are updating in place, remove deletes
    if (opts?.updateExisting) {
      changed = _.reject(changed, (ent) => ent.status === "delete");
    }
    await this.refreshNotesV2(changed);
    return resp;
  }

  // ~~~ schemas
  async getSchema(_qs: string): Promise<RespV2<SchemaModulePropsV2>> {
    throw Error("not implemetned");
  }

  async querySchema(qs: string): Promise<SchemaQueryResp> {
    const out = await this.api.schemaQuery({ qs, ws: this.ws });
    return _.defaults(out, { data: [] });
  }

  async updateSchema(schema: SchemaModulePropsV2): Promise<void> {
    await this.api.schemaUpdate({ schema, ws: this.ws });
    await this.refreshSchemas([schema]);
    return;
  }

  async writeConfig(
    opts: ConfigWriteOpts
  ): ReturnType<DEngineV2["writeConfig"]> {
    await this.api.configWrite({ ...opts, ws: this.ws });
    return {
      error: null,
    };
  }

  async writeSchema(schema: SchemaModulePropsV2): Promise<void> {
    await this.api.schemaWrite({ schema, ws: this.ws });
    await this.refreshSchemas([schema]);
    return;
  }
}
