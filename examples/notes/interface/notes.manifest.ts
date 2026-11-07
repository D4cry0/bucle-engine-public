import { field, requiredField } from '../../kit/manifest.ts';

// Interface layer: the unit that serves the notes screens module. It owns no data; it reaches
// the platform module only through the commands it declares in SystemRules.
export const notesUnitManifest = {
  Metadata: {
    code: requiredField('application.workspace.interface.notes', 'capability-code', { unique: true, editable: false }),
    moduleAbbreviation: requiredField('WNO', 'string', { editable: false }),
    name: requiredField('Workspace notes', 'string', { editable: false }),
    description: field('Endpoints of the notes page of the workspace front.', 'text', { editable: false }),
    layer: requiredField('interface', 'list', { editable: false }),
    type: requiredField('capability', 'list', { editable: false }),
    launchVersion: requiredField('1.0.0', 'string', { editable: false }),
    schemaRevision: requiredField(1, 'number', { editable: false }),
    serves: {
      screen: requiredField('application.workspace.screens.notes', 'capability-code', { editable: false }),
      surface: requiredField('workspace', 'string', { editable: false }),
    },
  },
  PublicCommands: { items: [] },
  Authorization: {
    routes: {
      items: [
        {
          authId: requiredField('application.workspace.notes.board.read', 'auth-id', { editable: false }),
          httpMethod: requiredField('GET', 'list', { editable: false }),
          route: requiredField('/workspace/notes', 'string', { editable: false }),
          actionType: requiredField('read', 'list', { editable: false }),
          enabled: field(true, 'boolean', { editable: true }),
        },
        {
          authId: requiredField('application.workspace.notes.note.write', 'auth-id', { editable: false }),
          httpMethod: requiredField('POST', 'list', { editable: false }),
          route: requiredField('/workspace/notes', 'string', { editable: false }),
          actionType: requiredField('write', 'list', { editable: false }),
          enabled: field(true, 'boolean', { editable: true }),
        },
      ],
    },
    controls: { items: [] },
  },
  TenantConfiguration: { fields: [] },
  FeatureFlags: { items: [] },
  SystemRules: {
    items: [
      {
        code: requiredField('application.workspace.interface.notes.consumes.notes.list', 'string', { editable: false }),
        owner: requiredField('application.notes', 'capability-code', { editable: false }),
        commandId: requiredField('application.notes.list', 'command-id', { editable: false }),
      },
      {
        code: requiredField('application.workspace.interface.notes.consumes.notes.create', 'string', { editable: false }),
        owner: requiredField('application.notes', 'capability-code', { editable: false }),
        commandId: requiredField('application.notes.create', 'command-id', { editable: false }),
      },
    ],
  },
  BusinessRules: { items: [] },
  TenantAwareOperations: { items: [] },
  I18n: { locales: { en: {}, es: {} } },
};
