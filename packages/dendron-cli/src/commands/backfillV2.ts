import { DEngineClientV2, NoteUtils } from "@dendronhq/common-all";
import _ from "lodash";
import { BaseCommand } from "./base";

type CommandOpts = { engine: DEngineClientV2 } & CommonOpts;

type CommonOpts = {
  overwriteFields?: string[];
};

type CommandOutput = void;

export class BackfillV2Command extends BaseCommand<CommandOpts, CommandOutput> {
  async execute(opts: CommandOpts) {
    const { engine, overwriteFields } = _.defaults(opts, {
      overwriteFields: [],
    });
    const notes = await Promise.all(
      _.values(engine.notes)
        .filter((n) => !n.stub)
        .map(async (n) => {
          overwriteFields.forEach((f) => {
            if (f === "title") {
              n.title = NoteUtils.genTitle(n.fname);
            } else {
              throw Error(`unknown overwrite field: ${f}`);
            }
          });
          return n;
        })
    );
    // @ts-ignore
    await engine.store.bulkAddNotes({ notes });
    return;
  }
}
