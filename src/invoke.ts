/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcRenderer } from "electron";
import { IpcChannel } from "./IpcChannel";

/**
 * TypeSafe ipcRenderer.invoke<P, R> P being the arguments as an array and R being the ReturnType.
 *   Note: P is an array of the arguments of the function excluding the first 'event: IpcMainInvokeEvent'
 *   which is always present.
 *
 * @param channel The channel that should be invoked
 * @param args {P} The arguments that should be passed on to the handler
 *
 * @returns {R} ReturnValue of the handler
 */
export function invoke<P extends any[], R = void>(channel: string, ...args: P): Promise<R> {
  return ipcRenderer.invoke(channel, ...args) as Promise<R>;
}

/**
 * Sends arguments to the ipcChannel.name
 *
 * @param ipcChannel Channel to send the arguments to
 *
 * @example
 * ```js
 * invokeIpcChannel(equalsChannel, 1, 2)
 *
 * // Given this definition
 * const equalsChannel = {
 *   name: 'equals',
 *   handler: (_ev, str1: string, str2: string) => str1 === str2
 * }
 * ```
 */
export function invokeIpcChannel<P extends any[], R>(
  channel: IpcChannel<P, R>,
  ...args: P
): Promise<R> {
  return ipcRenderer.invoke(channel.name, ...args) as Promise<R>;
}
