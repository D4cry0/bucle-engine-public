import type { ToyCommandBus } from '../../kit/bus.ts';
import { notesManifest } from './notes.manifest.ts';
import type { NotesService } from './notes.service.ts';

/** The owner registers its public commands on the bus; nobody else calls the service. */
export function registerNotesCommands(bus: ToyCommandBus, service: NotesService): void {
  bus.register(notesManifest, 'application.notes.create', (payload, context) => service.writeNote(payload, context));
  bus.register(notesManifest, 'application.notes.list', (payload, context) => service.readAllNotes(payload, context));
}
