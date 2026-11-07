import { field, requiredField } from '../../kit/manifest.ts';

// Screen layer: the notes page of the workspace front. Only Metadata, Authorization and I18n.
export const notesScreenManifest = {
  Metadata: {
    code: requiredField('application.workspace.screens.notes', 'capability-code', { unique: true, editable: false }),
    moduleAbbreviation: requiredField('WNS', 'string', { editable: false }),
    name: requiredField('Notes page', 'string', { editable: false }),
    description: field('The notes board of the workspace front.', 'text', { editable: false }),
    layer: requiredField('screen', 'list', { editable: false }),
    type: requiredField('capability', 'list', { editable: false }),
    launchVersion: requiredField('1.0.0', 'string', { editable: false }),
    schemaRevision: requiredField(1, 'number', { editable: false }),
  },
  Authorization: {
    routes: { items: [] },
    controls: {
      items: [
        {
          authId: requiredField('application.workspace.notes.board.create_button', 'auth-id', { editable: false }),
          componentName: requiredField('NotesCreateButton', 'string', { editable: false }),
          enabled: field(true, 'boolean', { editable: true }),
        },
      ],
    },
  },
  I18n: {
    locales: {
      en: {
        'workspace.notes.title.main': requiredField('Notes', 'text', { editable: true }),
        'workspace.notes.button.create': requiredField('New note', 'text', { editable: true }),
        'workspace.notes.label.title': requiredField('Title', 'text', { editable: true }),
      },
      es: {
        'workspace.notes.title.main': requiredField('Notas', 'text', { editable: true }),
        'workspace.notes.button.create': requiredField('Nueva nota', 'text', { editable: true }),
        'workspace.notes.label.title': requiredField('Título', 'text', { editable: true }),
      },
    },
  },
};
