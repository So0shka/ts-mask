import { MarkedSymbolType } from "./constants.js";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

type ValidKeys<ObjectT> = Extract<
  keyof NonFunctionProperties<ObjectT>,
  string | number
>;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

export type MaskTree = {
  [key: string]: MaskTree | MarkedSymbolType;
};

export interface IMask<
  ObjectT,
  FieldTupleT extends readonly MaskAnyTerm<ObjectT>[],
> {
  toObject: () => MaskTree;
}

export type MaskBuilderFunc<ItemT, FieldTupleT extends readonly any[]> = (
  provider: MaskProvider<ItemT>,
) => FieldTupleT;

export class MaskPlainTerm<ObjectT, KeyT extends ValidKeys<ObjectT>> {
  constructor(public readonly key: KeyT) {}
}

export class MaskCompositeTerm<
  ObjectT,
  KeyT extends ValidKeys<ObjectT>,
  ItemT,
> {
  constructor(public readonly key: KeyT) {}

  mask<FieldTupleT extends readonly any[]>(
    builderFn: MaskBuilderFunc<ItemT, FieldTupleT>,
  ): MaskCompiledTerm<ObjectT, KeyT, MaskDef<ItemT, FieldTupleT>> {
    return null as any;
  }
}

export type MaskProvider<ObjectT> = {
  [KeyT in ValidKeys<ObjectT>]: ObjectT[KeyT] extends readonly (infer ItemT)[]
    ? MaskCompositeTerm<ObjectT, KeyT, ItemT>
    : ObjectT[KeyT] extends object
      ? MaskCompositeTerm<ObjectT, KeyT, ObjectT[KeyT]>
      : MaskPlainTerm<ObjectT, KeyT>;
};

export class MaskDef<
  ObjectT,
  FieldTupleT extends readonly MaskAnyTerm<ObjectT>[],
> {}

export class MaskCompiledTerm<
  ObjectT,
  KeyT extends ValidKeys<ObjectT>,
  MaskDefT extends MaskDef<ObjectT[KeyT], any>,
> {
  constructor(public readonly key: KeyT) {}
}

export type MaskAnyTerm<ObjectT> =
  | MaskPlainTerm<ObjectT, any>
  | MaskCompositeTerm<ObjectT, any, any>
  | MaskCompiledTerm<ObjectT, any, any>;

export type MaskDefInfer<T> =
  T extends MaskDef<infer ObjectT, infer FieldTupleT> //
    ? FieldTupleT extends readonly MaskAnyTerm<ObjectT>[]
      ? Prettify<FieldsTupleToObject<ObjectT, FieldTupleT>>
      : never
    : never;

type MaskAnyTermToObject<TermT extends MaskAnyTerm<any>> = TermT extends
  | MaskPlainTerm<infer ObjectT, infer KeyT>
  | MaskCompositeTerm<infer ObjectT, infer KeyT, any>
  ? { [K in KeyT]: ObjectT[K] }
  : TermT extends MaskCompiledTerm<infer ObjectT, infer KeyT, infer MaskDefT>
    ? ObjectT[KeyT] extends readonly any[]
      ? { [K in KeyT]: MaskDefInfer<MaskDefT>[] }
      : { [K in KeyT]: MaskDefInfer<MaskDefT> }
    : never;

type FieldsTupleToObject<
  ObjectT,
  TupleT extends readonly MaskAnyTerm<ObjectT>[],
> = UnionToIntersection<MaskAnyTermToObject<TupleT[number]>>;

export type MaskInfer<T> =
  T extends IMask<infer ObjectT, infer FieldTupleT> //
    ? MaskDefInfer<MaskDef<ObjectT, FieldTupleT>>
    : never;
