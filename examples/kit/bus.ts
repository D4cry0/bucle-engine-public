// A toy in-process command bus: handlers are registered by the owner of a command,
// and a caller may dispatch only what its manifest declares it consumes.

import { consumedCommands, offeredCommands } from './manifest.ts';
import { ToyError } from './errors.ts';

export interface CallContext {
  tenantId: number;
  userId: number;
}

type Handler = (payload: any, context: CallContext) => Promise<any>;

export class ToyCommandBus {
  private readonly handlers = new Map<string, Handler>();

  /** The owner registers a handler; it must be one of the commands its manifest offers. */
  register(owner: Record<string, any>, commandId: string, handler: Handler): void {
    if (!offeredCommands(owner).includes(commandId)) {
      throw new ToyError(`kit.error.toyCommandBus.notOffered|${commandId} is not in PublicCommands`);
    }
    this.handlers.set(commandId, handler);
  }

  /** A caller dispatches a command it declared in its SystemRules. */
  async dispatch<T>(caller: Record<string, any>, commandId: string, payload: unknown, context: CallContext): Promise<T> {
    if (!consumedCommands(caller).includes(commandId)) {
      throw new ToyError(`kit.error.toyCommandBus.undeclared|${commandId} is not declared by the caller`);
    }
    const handler = this.handlers.get(commandId);
    if (!handler) {
      throw new ToyError(`kit.error.toyCommandBus.unregistered|${commandId} has no handler`);
    }
    return handler(payload, context);
  }
}
