import {
  DendronConfig,
  DEngineClientV2,
  DuplicateNoteAction,
  DVault,
  WorkspaceOpts,
} from "@dendronhq/common-all";
import { AssertUtils, TestPresetEntryV4 } from "@dendronhq/common-test-utils";
import {
  DendronASTData,
  DendronASTDest,
  MDUtilsV4,
  Processor,
  VFile,
} from "@dendronhq/engine-server";
import fs from "fs-extra";
import _ from "lodash";
import path from "path";

export async function checkVFile(resp: VFile, ...match: string[]) {
  expect(resp).toMatchSnapshot();
  expect(
    await AssertUtils.assertInString({
      body: resp.toString(),
      match,
    })
  ).toBeTruthy();
}

export async function checkNotInVFile(resp: VFile, ...nomatch: string[]) {
  expect(resp).toMatchSnapshot();
  expect(
    await AssertUtils.assertInString({
      body: resp.toString(),
      nomatch,
    })
  ).toBeTruthy();
}

export const createProcForTest = (opts: {
  engine: DEngineClientV2;
  dest: DendronASTDest;
  vault: DVault;
  useIdAsLink?: boolean;
}) => {
  const { engine, dest, vault } = opts;
  const proc2 = MDUtilsV4.procFull({
    engine,
    dest,
    fname: "root",
    vault,
    wikiLinksOpts: {
      useId: opts.useIdAsLink,
    },
    publishOpts: {
      wikiLinkOpts: {
        useId: opts.useIdAsLink,
      },
    },
  });
  if (dest === DendronASTDest.HTML) {
    return MDUtilsV4.procRehype({ proc: proc2 });
  } else {
    return proc2;
  }
};

export type ProcTests = {
  name: string;
  dest: DendronASTDest;
  testCase: TestPresetEntryV4;
};

/**
 * Generator for processor tests
 *
 * @param name name of test
 * @param setupFunc function {@link SetupTestFunctionV4} with `extra` param of {dest: {@link DendronASTDest}}
 * @param verifyFuncDict hash of various test functions
 */
export const createProcTests = (opts: {
  name: string;
  setupFunc: TestPresetEntryV4["testFunc"];
  verifyFuncDict?: {
    [key in DendronASTDest]?: TestPresetEntryV4["testFunc"] | DendronASTDest;
  };
  preSetupHook?: TestPresetEntryV4["preSetupHook"];
}): ProcTests[] => {
  const { name, setupFunc, verifyFuncDict } = opts;
  let allTests: ProcTests[] = [];
  if (verifyFuncDict) {
    allTests = Object.values(DendronASTDest)
      .map((dest) => {
        let funcOrKey = verifyFuncDict[dest];
        let verifyFunc: TestPresetEntryV4["testFunc"];
        if (_.isUndefined(funcOrKey)) {
          return;
        }
        if (_.isString(funcOrKey)) {
          verifyFunc = verifyFuncDict[
            funcOrKey
          ] as TestPresetEntryV4["testFunc"];
        } else {
          verifyFunc = funcOrKey;
        }
        return {
          name,
          dest,
          testCase: new TestPresetEntryV4(
            async (presetOpts) => {
              const extra = await setupFunc({
                ...presetOpts,
                extra: { dest },
              });
              return await verifyFunc({ ...presetOpts, extra });
            },
            { preSetupHook: opts.preSetupHook }
          ),
        };
      })
      .filter((ent) => !_.isUndefined(ent)) as ProcTests[];
  }
  return allTests;
};

export const dupNote = (payload: DVault | string[]) => {
  const out: any = {
    duplicateNoteBehavior: {
      action: DuplicateNoteAction.USE_VAULT,
    },
  };
  if (_.isArray(payload)) {
    out.duplicateNoteBehavior.payload = payload;
  } else {
    out.duplicateNoteBehavior.payload = {
      vault: payload,
    };
  }
  return out;
};

export function genDendronData(
  opts?: Partial<DendronASTData>
): DendronASTData & { fname: string } {
  return { ...opts } as any;
}

export const generateVerifyFunction = (opts: {
  target: DendronASTDest;
  exclude?: DendronASTDest[];
}) => {
  const { target, exclude } = _.defaults(opts, { exclude: [] });
  const out: any = {};
  const excludeList = exclude.concat(target);
  Object.values(DendronASTDest)
    .filter((ent) => !_.includes(excludeList, ent))
    .forEach((ent) => {
      out[ent] = target;
    });
  return out;
};

export const processText = (opts: { text: string; proc: Processor }) => {
  const { text, proc } = opts;
  const respParse = proc.parse(text);
  const respProcess = proc.processSync(text);
  const respRehype = MDUtilsV4.procRehype({ proc: proc() }).processSync(text);
  return { proc, respParse, respProcess, respRehype };
};

export const processTextV2 = async (opts: {
  text: string;
  dest: DendronASTDest.HTML;
  engine: DEngineClientV2;
  fname: string;
  vault: DVault;
  configOverride?: DendronConfig;
}) => {
  const { engine, text, fname, vault, configOverride } = opts;
  if (opts.dest !== DendronASTDest.HTML) {
    const proc = MDUtilsV4.procDendron({
      engine,
      configOverride,
      fname,
      dest: opts.dest,
      vault,
    });
    const resp = await proc.process(text);
    return { resp };
  } else {
    const proc = MDUtilsV4.procDendronForPublish({
      engine,
      configOverride,
      fname,
      noteIndex: engine.notes["foo"],
      vault,
    });
    const resp = await proc.process(text);
    return { resp };
  }
};

export const processNote = (opts: {
  fname: string;
  proc: Processor;
  wopts: WorkspaceOpts;
}) => {
  const { fname, wopts, proc } = opts;
  const npath = path.join(wopts.wsRoot, wopts.vaults[0].fsPath, fname + ".md");
  const text = fs.readFileSync(npath, { encoding: "utf8" });
  return processText({ text, proc });
};
