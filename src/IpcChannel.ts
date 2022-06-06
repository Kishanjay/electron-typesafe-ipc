/* eslint-disable @typescript-eslint/no-explicit-any */
import { IpcMainInvokeEvent } from "electron";

/**
 * The blueprint of what an IpcChannel should look like to be compatible with the
 * invokeIpcChannel and registerIpcChannel functions
 */
export interface IpcChannel<P extends any[] = any[], R = void> {
  name: string;
  handler: (event: IpcMainInvokeEvent, ...args: P) => PromiseLike<R> | R;
}
