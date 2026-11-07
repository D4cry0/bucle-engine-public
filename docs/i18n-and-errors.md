# Texts and errors

No text is hard-coded. Every label, message and error a user can see is a key declared in the
`I18n` section of the manifest that owns it, with one entry per locale. Operators can then edit a
text per tenant without a release, and a missing translation is visible as a missing key rather than
as English leaking into another language.

## Key shapes

Dots are the path; camelCase joins the words inside one segment.

```txt
UI text      <scope>.<module>.<uiType>.<name>          workspace.notes.button.create
Error        <module>.error.<className>.<errorName>     application.notes.error.notesService.titleRequired
Validation   <module>.validation.<property>.<rule>      application.notes.validation.title.maxLength
```

`<uiType>` names the component: `title`, `header` (a table column), `label`, `button`, `link`,
`menu`, `placeholder`, `tooltip`, `message`, `error`, `option`, `status`, `hint`.

## A thrown error carries its key

Code throws the key with an English fallback after a `|`. The response carries the key; the front
resolves it with its translation function, and the fallback is what a person sees when no
translation exists yet.

```ts
throw new ToyError('application.notes.error.notesService.titleRequired|A note needs a title');
```

```ts
I18n: {
  locales: {
    en: {
      'application.notes.error.notesService.titleRequired': requiredField('A note needs a title', 'text', { editable: true }),
    },
    es: {
      'application.notes.error.notesService.titleRequired': requiredField('La nota necesita un título', 'text', { editable: true }),
    },
  },
},
```

The example test checks that every key the notes service can throw is declared in both locales of
its manifest.
