# Corpus

Source material the LLM ingestion pipeline embeds and retrieves over.
Drop files into the right subdirectory, then add a matching entry to
`manifest.json` so the pipeline picks them up.

## Layout

```
corpus/
  writings/
    essays/        long-form pieces (.md)
    notes/         informal notes  (.md or .txt)
    posts/         blog-style posts (.md)
  conversations/
    transcripts/   normalized chat transcripts (.json)
  project_notes/
    hivemind/
    purposeless-efficiency/
    theseus/
  manifest.json    per-file metadata (see below)
```

## Accepted formats

- `.md`, `.txt` for prose.
- `.json` for chat transcripts in a normalized shape.
- `.pdf` and `.docx` are **not** ingested. Convert to `.md` first.
  Native binary support is future work.

## Manifest

`manifest.json` is the only thing the ingestion pipeline reads to decide
what to embed. Files not listed there are ignored, even if they sit in
the right folder. Each entry:

| field         | meaning                                                      |
| ------------- | ------------------------------------------------------------ |
| `path`        | path relative to `corpus/`                                   |
| `title`       | human-readable title                                         |
| `kind`        | one of `essay`, `note`, `post`, `transcript`, `project-note` |
| `date`        | ISO 8601 calendar date (`YYYY-MM-DD`)                        |
| `topics`      | string tags used by retrieval                                |
| `private`     | when `true`, the file is skipped entirely                    |
| `citeOkay`    | when `false`, embed for background only — never quote        |
| `voiceWeight` | `0.0`–`2.0`, nudges retrieval toward voice-rich material     |

`citeOkay: false` lets you give the model background flavor (taste,
mannerism, framing) without ever surfacing the underlying text in a
chat response. `private: true` is stricter — the file is never read at
all.

The schema lives at `manifest.schema.json` and is **generated** from
`scripts/llm/manifestTypes.ts`. After editing the TypeScript source,
regenerate with:

```sh
npx tsx scripts/llm/genManifestSchema.ts
```

## Keeping drafts out of git

`corpus/.gitignore` excludes:

- anything under `corpus/private/`
- any file ending in `.private.md` or `.private.txt`

Use either pattern for material you don't want in version control.
Files excluded by `.gitignore` can still be ingested locally if listed
in the manifest, but they won't ship with the repo.

## Seed

`writings/notes/seed.md` is a one-paragraph placeholder so the
ingestion pipeline (P02) has something to run against out of the box.
Replace or remove once real material is in.
