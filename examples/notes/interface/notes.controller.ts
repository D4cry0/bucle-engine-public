import type { CallContext, ToyCommandBus } from '../../kit/bus.ts';
import { notesUnitManifest } from './notes.manifest.ts';

// Shapes of the notes page: only what the page shows, in camelCase.
export interface NoteCard {
  id: number;
  title: string;
  createdAt: string;
}

export interface NotesBoard {
  notes: NoteCard[];
  total: number;
}

/** Thin handlers of the notes page. Each starts with the verb of its route's action type. */
export class NotesBoardController {
  private readonly bus: ToyCommandBus;

  constructor(bus: ToyCommandBus) {
    this.bus = bus;
  }

  /** GET /workspace/notes */
  async readBoard(context: CallContext): Promise<NotesBoard> {
    const rows = await this.bus.dispatch<any[]>(notesUnitManifest, 'application.notes.list', {}, context);
    const notes = rows.map((row) => ({ id: row.id, title: row.title, createdAt: row.createdAt }));
    return { notes, total: notes.length };
  }

  /** POST /workspace/notes */
  async writeNote(body: { title: string; body?: string }, context: CallContext): Promise<NoteCard> {
    const row = await this.bus.dispatch<any>(notesUnitManifest, 'application.notes.create', body, context);
    return { id: row.id, title: row.title, createdAt: row.createdAt };
  }
}
