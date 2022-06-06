/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcMain, IpcMainInvokeEvent } from "electron";
import { IpcChannel } from "./IpcChannel";

/**
 * TypeSafe ipcMain.handle<P, R> P being the arguments as an array and R being the ReturnType.
 *   Note: P is an array of the arguments of the function excluding the first 'event: IpcMainInvokeEvent'
 *   which is always present.
 *
 * @param channel The channel for which a handler should be added
 * @param handler The handler function that should deal with the incomning messages
 *
 * @example handle<[string, string], boolean>("equals", (_ev, str1, str2) => str1 === str2)
 */
export function handle<P extends any[] = [], R = void>(
  channel: string,
  handler: (event: IpcMainInvokeEvent, ...args: P) => PromiseLike<R> | R
): void {
  ipcMain.handle(channel, (event: IpcMainInvokeEvent, ...args: any[]) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    handler!(event, ...(args as P))
  );
}

/**
 * Adds a handler to a channel based on the ipcChannel object.
 *
 * @param ipcChannel Object that contains the name of the channel to be handled and the handler function.
 *
 * @example
 * ```js
 * registerIpcChannel({
 *   name: 'equals',
 *   handler: (_ev, str1: string, str2: string) => str1 === str2
 * })
 * ```
 */
export function registerIpcChannel<P extends any[], R>(ipcChannel: IpcChannel<P, R>): void {
  ipcMain.handle(ipcChannel.name, (event: IpcMainInvokeEvent, ...args: any[]) =>
    ipcChannel.handler(event, ...(args as P))
  );
}
