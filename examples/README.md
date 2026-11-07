# Examples

Toy modules written for this showcase. They show the pattern of a Bucle Engine module across its
three layers; they do not compile against the Engine and use none of its code.

```text
examples/
├── kit/                       a stand-in for the manifest contract and the command bus
│   ├── manifest.ts            field / requiredField, the layer matrix, command lists
│   ├── bus.ts                 an in-process bus that refuses undeclared commands
│   └── errors.ts              an error that carries 'key|English fallback'
└── notes/
    ├── platform/              owns the notes: manifest, service, command registration
    ├── interface/             the unit that serves the notes page: manifest, controller
    ├── screen/                the notes page's manifest
    └── notes.test.ts          the pattern, checked
```

Run the tests with Node 22.18 or newer, from the repository root:

```bash
node --test 'examples/**/*.test.ts'
```

What the tests check:

| Test | The rule it shows |
|---|---|
| sections per layer | a manifest holds every section its layer allows, and no other |
| pair by name | the unit's code is the screens module's code with `screens` → `interface` |
| consumed ⊆ offered | the unit dispatches only commands the platform module declares |
| no platform import | the interface layer reaches the core by commands, never by import |
| flags born false | every feature flag starts switched off |
| keys in every locale | every error the service throws has a text in each locale |
| page shape | the unit returns what the page shows, nothing more |
| tenant scoping | one tenant never reads another's rows |
| governed keys | a domain rule answers with a key, not with prose |
| undeclared command | dispatching a command the caller did not declare fails |

Licensed under Apache-2.0 ([LICENSE](LICENSE)).
