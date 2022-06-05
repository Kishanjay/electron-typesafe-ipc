# @kjn/electron-typesafe-ipc

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

This package contains a library that includes type safe versions of the existing electron IPC methods.

Note: Since this is a library, the functionality is opt-in and doesn't change the behaviour in any form. Rather this library focusses on SOLELY adding TypeScript support to the existing electron IPC methods.

**Regular Electron IPC (unsafe)**

```ts
// Type of r is Promise<any>
const r = await ipcRenderer.invoke("substract", 1, 1);

// No warning. Potential cause for run-time errors
const r = await ipcRenderer.invoke("substract", 1, "hello");
```

**With @kjn/electron-typesafe-ipc (safe, better)**

The user can explicitly state the types of both the parameters and the return type.

```ts
// Type of r is Promise<number>
const r = await invoke<[number, number], number>("substract", 1, 1);

// Displays an error because "hello" isn't a number
const r = await invoke<[number, number], number>("substract", 1, "hello");
```

**With Dedicated IpcChannels (safe, clean, BEST)**

Link the handler function to the invoke method by adding structure to the channels. This requires users to use a predefined and specific structure to keep their channels and handlers in.

Dedicated IpcChannel will however improve the [Separation of Concern](https://en.wikipedia.org/wiki/Single-responsibility_principle) and it complies with the [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle). Therefore in terms of Architecture its often the right choice.

```ts
// [Can be defined anywhere] Should implement the IpcChannel interface
const substractIpcChannel = {
  name: "SUBSTRACT_CHANNEL",
  handler: (ev: IpcMainInvokeEvent, n1: number, n2: number): number => n1 - n2,
};

// [@main.ts] this will add the handler to the 'SUBSTRACT_CHANNEL` as defined in the object.
handleIpcChannel(substractIpcChannel);

// [@preload.ts]  this will call the substractIpcChannel handler with the parameters 10 and 5
//  additionally both the return type and the parameters are strongly typed.
const r = invokeIpcChannel(substractIpcChannel, 10, 5); // == Promise<number>
```

# Table of content

- [Usage](#usage)
  - [Installation](#installation)
  - [Recommended usage](#recommended-usage)
  - [Alternative usage](#alternative-usage)
- [API](#api)
  - [handle<P, R>](#handle)
    - [handle P generic](#handle-p-generic)
    - [handle R generic](#handle-r-generic)
  - [invoke<P, R>](#invoke)
    - [invoke P generic](#invoke-p-generic)
    - [invoke R generic](#invoke-r-generic)
  - [handleIpcChannel](#handleipcchannel)
  - [invokeIpcChannel](#invokeipcchannel)
  - [IpcChannel<P, R> Interface](#ipcchannel-interface)
    - [IpcChannel P generic](#ipcchannel-p-generic)
    - [IpcChannel R generic](#ipcchannel-r-generic)

# Usage

## Installation

Install the package with npm or yarn (or just copy the files whatever works)

```sh
npm install --save-dev @kjn/electron-typesafe-ipc

yarn add -D @kjn/electron-typesafe-ipc
```

Import the desired method where relevant

```ts
import { invoke, handle, invokeIpcChannel, handleIpcChannel } from "@kjn/electron-typesafe-ipc";

// For more details on the API interface check the docs below
```

Use the typesafe methods according to your needs.

## Recommended Usage

Use the `invokeIpcChannel` and `handleIpcChannel` methods instead of the original `invoke` and `handle` calls. This will work the best for large scale projects and forces you to adapt to good architecture practices.

```ts
import { IpcChannel } from "@kjn/electron-typesafe-ipc";

const substractIpcChannel: IpcChannel<[number, number], number> = {
  name: "SUBSTRACT_CHANNEL",
  handler: (ev, n1: number, n2: number) => n1 + n2,
};

// handle invokations to the ipcChannel
handleIpcChannel(substractIpcChannel);

// invoke the handler of the ipcChannel AND benefit from the typehints that it provides
const r = await invokeIpcChannel(substractIpcChannel, 10, 4);
```

## Alternative Usage

The `invoke` and `handle` calls are cross compatible replacements for the `ipcRenderer.invoke` and `ipcMain.handle` calls respectively. Therefore they can be swapped in and out without any implications to the logic of the code.

```ts
type SubstractParamsType = [number, number];
type SubstractReturnType = number;

// e.g. add a handler, the generics force the handler to accept 2 numbers as input and return a number as output
handle<SubstractParamsType, SubstractReturnType>("substract", (ev, n1, n2) => n1 + n2);

// e.g. invoke a handler AND benefit from the typehints that it provides
const result = invoke<SubstractParamsType, SubstractReturnType>("substract", 10, 30);
```

_The first generic in the `handle` and `invoke` calls represents the parameters of the handler as an array. The second generic represents the return type._

# API

## Handle

```js
import { handle } from "@kjn/electron-typesafe-ipc";
```

The handle function contains 2 generics that can be passed to it: `P` and `R` to represent the parameters and return type of the handler function respectively.

```ts
handle<P, R>(<channelName>, <handlerFunction>)
```

### Handle P Generic

`P` (generic handle<P, \_>), indicates the array of the parameter types of the handler, a few examples:

```ts
// TypeHint to use: 2 numbers as paremeters for the handler
handle<[number, number]>("SUBSTRACT_CHANNEL", (ev, n1, n2) => n1 + n2);

// TypeHint to use: no parameters for the handler
const trueChannelHandler = (ev) => !!ev;
handle<[]>("TRUE_CHANNEL", trueChannelHandler);

// TypeHint to use: a string, number and boolean as parameters for the handler
function randomChannelHandler(ev, str, num, bool) {
  if (str === "hello" || num < 1 || bool === true) {
    throw Error("Error");
  }
}
handle<[string, number, boolean]>("RANDOM_CHANNEL", (ev, str, num, bool) =>
  randomChannelHandler(ev, str, num + 2, bool)
);
```

_Note: P doesn't include the first (and always present) `IpcMainInvokeEvent` parameter_

### Handle R Generic

`R` (generic handle<\_, R>), indicates the return type of the handler function, a few examples:

```ts
// Expect a number as the return type of the handler
handle<[], number>("SUBSTRACT_CHANNEL", (ev, n1: number, n2: number) => n1 + n2);

// Expect null as the return type of the handler
handle<[], null>("LOG_CHANNEL", (ev) => {
  console.log("log");
  return null;
});

// Expect a boolean OR string as the return type of the handler
handle<[num], boolean | string>("IS_PIE_CHANNEL", (ev, n1) => {
  if (n1 === 314) {
    return "pie?";
  }
  return n1 > 100;
});
```

## Invoke

```js
import { invoke } from "@kjn/electron-typesafe-ipc";
```

The invoke function contains 2 generics that can be passed to it: `P` and `R`, which represent the parameters type and return type of the handler call respectively.

```ts
invoke<P, R>(<channelName>, <param1: P[0]>, <param2: P[1]>, ..., <paramX: P[X]>): R
```

### Invoke P Generic

`P` (generic invoke<P, \_>), indicates the array of the parameter types, a few examples:

```ts
// Indicates that there are 2 parameters, both numbers
const r1 = invoke<[number, number]>("SUBSTRACT_CHANNEL", 100, 10); // == Promise<any>

// Indicates that there are no parameters
const r2 = invoke<[]>("TRUE_CHANNEL"); // == Promise<any>

// Indicates that there is a string, number and boolean as parameters
const r3 = invoke<[string, number, boolean]>("RANDOM_CHANNEL", "Hello world", 10, false); // == Promise<any>
```

### Invoke R Generic

`R` (generic invoke<\_, R>), indicates the return type, a few examples:

```ts
// Indicates that the return type is number
const r1 = invoke<[number, number], number>("SUBSTRACT_CHANNEL", 100, 10); // == Promise<number>

// Indicates that the return type is null
const r2 = invoke<[], null>("LOG_CHANNEL"); // Promise<null>

// Indicates that the return type is either boolean OR string
const r3 = invoke<[string], boolean | string>("RANDOM_CHANNEL", "str as input"); // Promise<boolean | string>
```

_Note: since invoke is a asynchronous call, the return types are wrapped in Promises_

## HandleIpcChannel

```js
import { handleIpcChannel } from "@kjn/electron-typesafe-ipc";
```

Add a handler for an ipc channel, requires an object that implements the [IpcChannel interface](#ipcchannel-interface). Typechecking will be handled automatically.

```ts
import { IpcChannel } from "@kjn/electron-typesafe-ipc";

const substractIpcChannel: IpcChannel<[number, number], number> = {
  name: "SUBSTRACT_CHANNEL",
  handler: (ev, n1: number, n2: number) => n1 - n2,
};

handleIpcChannel(substractIpcChannel);
```

## InvokeIpcChannel

```js
import { invokeIpcChannel } from "@kjn/electron-typesafe-ipc";
```

Invoke the handler of an ipc channel, requires an object that implements the [IpcChannel interface](#ipcchannel-interface). Typechecking will be handled automatically.

Also relies on the handler existing for that ipcChannel.

```ts
import { IpcChannel } from "@kjn/electron-typesafe-ipc";

const substractIpcChannel: IpcChannel<[number, number], number> = {
  name: "SUBSTRACT_CHANNEL",
  handler: (ev, n1: number, n2: number) => n1 - n2,
};

const result = await invokeIpcChannel(substractIpcChannel, 10, 100);
```

## IpcChannel Interface

The IpcChannel interface defines the simplest blueprint to which an object should adhere to be used with the `handleIpcChannel` and `invokeIpcChannel` calls.

The IpcChannel interface contains 2 generics that can be passed to it: `P` and `R` to represent the parameters and return type of the handler respectively.

```ts
IpcChannel<P, R>
```

### IpcChannel P Generic

`P` (generic IpcChannel<P, \_>), indicates the array of the parameter types of the handler, a few examples:

```ts
// 2 numbers as parameters for the handler
const substractIpcChannel: IpcChannel<[number, number]> = {
  name: "SUBSTRACT_CHANNEL",
  handler: (ev, n1, n2) => n1 - n2, // TypeScript will treath n1 and n2 as numbers
};

// no parameters for the handler
const printLogIpcChannel: IpcChannel<[]> = {
  name: "PRINT_LOG_CHANNEL",
  handler: (ev) => {
    console.log("log");
  },
};

// a number and boolean as parameters for the handler
const ageCheckIpcChannel: IpcChannel<[number, boolean]> = {
  name: "AGE_CHECK_CHANNEL",
  handler: (ev, age, adultRequired) => {
    if (age < 18 && adultRequired) {
      return false;
    }
    return true;
  },
};
```

### IpcChannel R Generic

`R` (generic IpcChannel<\_, R>), indicates the return type of the handler, a few examples:

```ts
// number as a return type for the handler
const getMsIpcChannel: IpcChannel<[], number> = {
  name: "GET_MS_CHANNEL",
  handler: (ev) => {
    return new Date().getMilliseconds();
  },
};

// CustomType as return type for the handler
const customTypeIpcChannel: IpcChannel<[], CustomType> = {
  name: "CUSTOM_TYPE_CHANNEL",
  handler: (ev) => {
    return { x: 1, y: 92 } as CustomType;
  },
};
type CustomType = {
  x: number;
  y: number;
};
```
