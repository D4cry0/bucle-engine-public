import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ToyCommandBus } from '../kit/bus.ts';
import { ToyError } from '../kit/errors.ts';
import { checkLayerShape, consumedCommands, offeredCommands } from '../kit/manifest.ts';
import { notesManifest } from './platform/notes.manifest.ts';
import { NOTES_ERRORS, NotesService } from './platform/notes.service.ts';
import { registerNotesCommands } from './platform/notes.commands.ts';
import { notesUnitManifest } from './interface/notes.manifest.ts';
import { NotesBoardController } from './interface/notes.controller.ts';
import { notesScreenManifest } from './screen/notes.manifest.ts';

const alice = { tenantId: 1, userId: 10 };
const bruno = { tenantId: 2, userId: 10 };

// Tenant 2 changed maxNotesPerUser to 1; every other tenant keeps the manifest's default.
const tenantOverrides = new Map<number, number>([[2, 1]]);

function readTenantLimit(tenantId: number): number {
  return tenantOverrides.get(tenantId) ?? notesManifest.TenantConfiguration.fields[0].value.value;
}

function buildBoard(): NotesBoardController {
  let tick = 0;
  const clock = () => new Date(Date.UTC(2030, 0, 1, 0, 0, tick++));
  const bus = new ToyCommandBus();
  registerNotesCommands(bus, new NotesService(readTenantLimit, clock));
  return new NotesBoardController(bus);
}

async function rejectsWithKey(promise: Promise<unknown>, key: string): Promise<void> {
  await assert.rejects(promise, (error: unknown) => error instanceof ToyError && error.key === key);
}

test('every manifest holds the sections its layer allows, and no other', () => {
  for (const manifest of [notesManifest, notesUnitManifest, notesScreenManifest]) {
    assert.deepEqual(checkLayerShape(manifest), [], manifest.Metadata.code.value);
  }
});

test('the screens module and its unit pair by name alone', () => {
  const screenCode = notesScreenManifest.Metadata.code.value;
  assert.equal(notesUnitManifest.Metadata.code.value, screenCode.replace('.screens.', '.interface.'));
  assert.equal(notesUnitManifest.Metadata.serves.screen.value, screenCode);
});

test('the unit consumes only commands the platform module offers', () => {
  const offered = offeredCommands(notesManifest);
  for (const commandId of consumedCommands(notesUnitManifest)) assert.ok(offered.includes(commandId), commandId);
  for (const rule of notesUnitManifest.SystemRules.items) {
    assert.equal(rule.owner.value, notesManifest.Metadata.code.value);
  }
});

test('the interface layer imports nothing from the platform layer', () => {
  const dir = join(import.meta.dirname, 'interface');
  for (const file of readdirSync(dir)) {
    const source = readFileSync(join(dir, file), 'utf8');
    assert.doesNotMatch(source, /from\s+['"][^'"]*\/platform\//, file);
  }
});

test('feature flags are born false', () => {
  for (const flag of notesManifest.FeatureFlags.items) assert.equal(flag.enabled.value, false, flag.key.value);
});

test('every error key the service throws is declared in every locale', () => {
  const locales = notesManifest.I18n.locales as Record<string, Record<string, unknown>>;
  for (const keyWithFallback of Object.values(NOTES_ERRORS)) {
    const key = keyWithFallback.split('|')[0];
    for (const [locale, entries] of Object.entries(locales)) assert.ok(key in entries, `${locale}: ${key}`);
  }
});

test('the page writes and reads through its unit, in the shape it shows', async () => {
  const board = buildBoard();
  await board.writeNote({ title: 'First', body: 'hidden from the card' }, alice);
  await board.writeNote({ title: 'Second' }, alice);
  const result = await board.readBoard(alice);
  assert.equal(result.total, 2);
  assert.deepEqual(result.notes.map((n) => n.title), ['Second', 'First']);
  assert.deepEqual(Object.keys(result.notes[0]).sort(), ['createdAt', 'id', 'title']);
});

test('one tenant never sees another tenant\'s notes', async () => {
  const board = buildBoard();
  await board.writeNote({ title: 'Only for tenant 1' }, alice);
  assert.deepEqual((await board.readBoard(bruno)).notes, []);
});

test('domain rules answer with governed keys', async () => {
  const board = buildBoard();
  await rejectsWithKey(board.writeNote({ title: '   ' }, alice), 'application.notes.error.notesService.titleRequired');
  await board.writeNote({ title: 'One' }, bruno);
  await rejectsWithKey(board.writeNote({ title: 'Two' }, bruno), 'application.notes.error.notesService.limitReached');
});

test('a command the caller did not declare is refused', async () => {
  const bus = new ToyCommandBus();
  registerNotesCommands(bus, new NotesService(readTenantLimit));
  await rejectsWithKey(bus.dispatch(notesScreenManifest, 'application.notes.list', {}, alice), 'kit.error.toyCommandBus.undeclared');
});
