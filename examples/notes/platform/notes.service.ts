import { ToyError } from '../../kit/errors.ts';
import type { CallContext } from '../../kit/bus.ts';

export interface Note {
  id: number;
  tenantId: number;
  userId: number;
  title: string;
  body: string;
  createdAt: string;
}

export interface WriteNoteInput {
  title: string;
  body?: string;
}

export const NOTES_ERRORS = {
  titleRequired: 'application.notes.error.notesService.titleRequired|A note needs a title',
  limitReached: 'application.notes.error.notesService.limitReached|You have reached the note limit',
} as const;

/** Owns the notes and their rules. An array stands in for the module's own table. */
export class NotesService {
  private readonly rows: Note[] = [];
  private nextId = 1;
  private readonly readMaxNotesPerUser: (tenantId: number) => number;
  private readonly now: () => Date;

  constructor(readMaxNotesPerUser: (tenantId: number) => number, now: () => Date = () => new Date()) {
    this.readMaxNotesPerUser = readMaxNotesPerUser;
    this.now = now;
  }

  async writeNote(input: WriteNoteInput, context: CallContext): Promise<Note> {
    const title = (input.title ?? '').trim();
    if (!title) throw new ToyError(NOTES_ERRORS.titleRequired);
    const owned = this.rows.filter((n) => n.tenantId === context.tenantId && n.userId === context.userId);
    if (owned.length >= this.readMaxNotesPerUser(context.tenantId)) throw new ToyError(NOTES_ERRORS.limitReached);
    const note: Note = {
      id: this.nextId++,
      tenantId: context.tenantId,
      userId: context.userId,
      title,
      body: input.body ?? '',
      createdAt: this.now().toISOString(),
    };
    this.rows.push(note);
    return note;
  }

  /** Every read is scoped by tenant and user; the order is deterministic (newest first, then id). */
  async readAllNotes(_input: unknown, context: CallContext): Promise<Note[]> {
    return this.rows
      .filter((n) => n.tenantId === context.tenantId && n.userId === context.userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
  }
}
