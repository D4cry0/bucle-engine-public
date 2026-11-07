# The module manifest

Every module carries one manifest, `<module>.manifest.ts`. It is the declarative source of truth of
the module: the runtime reads it to decide what runs, who may run it, which texts are shown and what
the module depends on. This page walks through the manifest of an invented module, **notes**, a
small notebook a tenant's users keep. The full files are in
[`examples/notes`](../examples/notes).

## Authoring form

A manifest is written whole, as one literal, so that any entry can be read where it is used:

- **Every leaf is a field.** A scalar is written through one of two leaf helpers,
  `field(value, type, options)` or `requiredField(value, type, options)`. They only wrap one value in
  its envelope (`{ value, type, required, editable, … }`); nothing else may build structure.
- **No construction.** No spread of another manifest, no loop, no shared constant that resolves to
  an object, no computed condition. Repeated data is written repeated.
- **Every section the layer allows is present**, empty when unused. An empty `BusinessRules` says
  "this module has no tenant decisions"; a missing one would say nothing.
- **`editable`** marks what an operator may change per tenant at runtime. Identity (codes, layer,
  command ids) is never editable.

## The sections, for the platform module

```ts
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
  PublicCommands: { items: [ /* notes.create, notes.list — below */ ] },
  TenantConfiguration: { fields: [ /* maxNotesPerUser — below */ ] },
  FeatureFlags: { items: [ /* pinnedNotes, born false */ ] },
  SystemRules: { items: [] },
  BusinessRules: { items: [] },
  TenantAwareOperations: { items: [] },
  I18n: { locales: { en: { /* … */ }, es: { /* … */ } } },
};
```

| Section | What it declares | In notes |
|---|---|---|
| `Metadata` | identity: code, layer, type, versions | `application.notes`, layer `platform` |
| `PublicCommands` | the operations the module offers, each with its `commandId`, action type and dispatch mode | `create` (write, bus), `list` (readAll, bus) |
| `TenantConfiguration` | settings a tenant may change, typed | `maxNotesPerUser`, a number, editable |
| `FeatureFlags` | switches inside the module, always born `false` | `pinnedNotes` |
| `SystemRules` | the commands of other modules this one depends on | none |
| `BusinessRules` | per-tenant decisions, each executed as a command | none |
| `TenantAwareOperations` | the logs and metrics the module emits per tenant | none |
| `I18n` | every text and error key the module owns, per locale | errors of `create` |

A platform manifest has no `Authorization` section: the layer is sealed, so a route cannot be
declared there at all.

## The sections, for the interface unit

The unit that serves the notes page adds what the outside needs — `serves` and its routes — and
lists in `SystemRules` the platform commands it dispatches:

```ts
Metadata: {
  code: requiredField('application.workspace.interface.notes', 'capability-code', { unique: true, editable: false }),
  layer: requiredField('interface', 'list', { editable: false }),
  serves: {
    screen: requiredField('application.workspace.screens.notes', 'capability-code', { editable: false }),
    surface: requiredField('workspace', 'string', { editable: false }),
  },
  // name, type, versions as above
},
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
    ],
  },
  controls: { items: [] },
},
SystemRules: {
  items: [
    {
      code: requiredField('application.workspace.interface.notes.consumes.notes.list', 'string', { editable: false }),
      owner: requiredField('application.notes', 'capability-code', { editable: false }),
      commandId: requiredField('application.notes.list', 'command-id', { editable: false }),
    },
  ],
},
```

The unit's code is the screens module's code with `screens` replaced by `interface`. That shared name
is the whole pairing: no list elsewhere says which page goes with which unit.

## The screen manifest

The screen layer keeps only three sections — `Metadata`, `Authorization` (its controls) and `I18n` —
because a page owns no commands, rules or settings of its own.

## Layer matrix

| Section | platform | interface | screen |
|---|---|---|---|
| `PublicCommands` | yes | yes | — |
| `Authorization` | — | yes | yes |
| `FeatureFlags` | yes | yes | — |
| `SystemRules` | yes | yes | — |
| `BusinessRules` | yes | open | — |
| `TenantConfiguration` | yes | yes | — |
| `TenantAwareOperations` | yes | yes | — |
| `I18n` | yes | yes | yes |

In the Engine the matrix is enforced by types: authoring a section the layer does not allow does
not compile. The toy kit in this repository checks it at test time instead.
