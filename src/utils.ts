import { MarkedSymbol } from "./constants.js";
import { MaskProvider, MaskTree, MaskBuilderFunc, IMask } from "./types.js";

type MaskProxy = {
  key: string | number;
  mask: (
    maskBuilderFn: (proxy: MaskProvider<any>) => Array<MaskProxy | MaskBranch>,
  ) => MaskBranch;
};

class MaskBranch {
  constructor(
    public key: string | number,
    public subtree: MaskTree,
  ) {}
}

export function createMask<ObjectT, FieldTupleT extends readonly any[]>(
  maskBuilderFn: MaskBuilderFunc<ObjectT, FieldTupleT>,
): IMask<ObjectT, FieldTupleT> {
  const proxy = createMaskProxy<ObjectT>();

  // Trick: public types are designed to trick the user and make inference work
  const pickedTerms = maskBuilderFn(proxy) as any satisfies Array<
    MaskProxy | MaskBranch
  >;

  const branchSubtree = compileBranchSubtree(pickedTerms as any);

  return {
    toObject() {
      return branchSubtree;
    },
  };
}

function compileBranchSubtree(pickedTerms: Array<MaskProxy | MaskBranch>) {
  const subtree: MaskTree = {};

  for (const field of pickedTerms) {
    subtree[field.key] =
      field instanceof MaskBranch ? field.subtree : MarkedSymbol;
  }

  return subtree;
}

function createMaskProxy<ObjectT>() {
  return new Proxy(new Object(), {
    get(_, propName: string) {
      return {
        key: propName,
        mask: (maskBuilderFn: MaskBuilderFunc<any, any>) => {
          const proxy = createMaskProxy();
          const pickedTerms = maskBuilderFn(proxy);
          const branchSubtree = compileBranchSubtree(pickedTerms);

          return new MaskBranch(propName, branchSubtree);
        },
      };
    },
  }) as MaskProvider<ObjectT>;
}
