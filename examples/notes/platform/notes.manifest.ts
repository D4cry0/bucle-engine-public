import { field, requiredField } from '../../kit/manifest.ts';

// Platform layer: owns the notes data and its rules. No Authorization section: the core has no routes.
export const notesManifest = {
  Metadata: {
    code: requiredField('application.notes', 'capability-code', { unique: true, editable: false }),
    moduleAbbreviation: requiredField('NOT', 'string', { editable: false }),
    name: requiredField('Notes', 'string', { editable: false }),
    description: field('Short notes a user keeps inside a workspace.', 'text', { editable: false }),
    layer: requiredField('platform', 'list', { editable: false }),
    type: requiredField('capability', 'list', { editable: false }),
    launchVersion: requiredField('1.0.0', 'string', { editable: false }),
    schemaRevision: requiredField(1, 'number', { editable: false }),
  },
  PublicCommands: {
    items: [
      {
        commandId: requiredField('application.notes.create', 'command-id', { editable: false }),
        actionType: requiredField('write', 'list', { editable: false }),
        dispatch: { mode: requiredField('bus', 'list', { editable: false }) },
        eventName: field(null, 'string', { editable: false }),
        description: field('Creates a note for the calling user.', 'text', { editable: false }),
      },
      {
        commandId: requiredField('application.notes.list', 'command-id', { editable: false }),
        actionType: requiredField('readAll', 'list', { editable: false }),
        dispatch: { mode: requiredField('bus', 'list', { editable: false }) },
        eventName: field(null, 'string', { editable: false }),
        description: field('Lists the notes of the calling user, newest first.', 'text', { editable: false }),
      },
    ],
  },
  TenantConfiguration: {
    fields: [
      {
        key: requiredField('maxNotesPerUser', 'string', { editable: false }),
        value: requiredField(50, 'number', { editable: true }),
        description: field('How many notes one user may keep.', 'text', { editable: false }),
      },
    ],
  },
  FeatureFlags: {
    items: [
      {
        key: requiredField('pinnedNotes', 'string', { editable: false }),
        enabled: requiredField(false, 'boolean', { editable: true }),
        description: field('Lets a user pin a note to the top of the list.', 'text', { editable: false }),
      },
    ],
  },
  SystemRules: { items: [] },
  BusinessRules: { items: [] },
  TenantAwareOperations: { items: [] },
  I18n: {
    locales: {
      en: {
        'application.notes.error.notesService.titleRequired': requiredField('A note needs a title', 'text', { editable: true }),
        'application.notes.error.notesService.limitReached': requiredField('You have reached the note limit', 'text', { editable: true }),
      },
      es: {
        'application.notes.error.notesService.titleRequired': requiredField('La nota necesita un título', 'text', { editable: true }),
        'application.notes.error.notesService.limitReached': requiredField('Llegaste al límite de notas', 'text', { editable: true }),
      },
    },
  },
};
