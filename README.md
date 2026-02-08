# TypeScript Mask Library

A simple library to define and infer types for object fields using "masks" in TypeScript. This library allows you to specify which fields of an object should be selected, while automatically inferring the corresponding types.

## Installation

Install via npm:

```bash
npm install ts-mask
```

## Usage

Comprehensive example:

```ts
import { createMask, MaskInfer } from "ts-mask";

interface IDocument {
  id: number;
  number: string;
  author: {
    id: number;
    fullname: string;
  };
  items: {
    name: string;
    description: string;
  }[];
}

const productMask = createMask((p: MaskProvider<IDocument>) => [
  p.id,
  p.author,
  p.items.mask((i) => [i.name]),
]);

productMask.toObject();

// {
//   id: Symbol(MARKED),
//   author: Symbol(MARKED),
//   items: {
//     name: Symbol(MARKED),
//   }
// }

type PartialProduct = MaskInfer<typeof productMask>;
// type PartialProduct = {
//   id: number;
//   author: {
//     id: number;
//     fullname: string;
//   };
//   items: {
//     name: string;
//   }[];
// };
```

## API

### createMask function

Creates a mask for a given object type. It accepts a builder function that defines which fields should be included in the mask.

The created mask has a `toObject` method that returns the object representation of the mask, where each field is marked with a `markedSymbol`.

#### Example:

```
const mask = createMask((p: MaskProvider<MyObject>) => [p.field1, p.field2]);
mask.toObject();
```

### MaskInfer type

This utility type is used to infer the partial type of the object based on the mask created by `createMask`.

#### Example:

```
type MyObjectPartial = MaskInfer<typeof mask>;
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
