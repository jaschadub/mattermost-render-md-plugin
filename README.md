# Markdown File Preview for Mattermost

Webapp-only plugin. Clicking a `.md` attachment opens it rendered as markdown instead of as highlighted source. A Rendered / Source toggle at the top of the preview switches back to the highlighted source view.

## Install

```sh
make
```

Upload `dist/render-md-0.1.0.tar.gz` in System Console > Plugins > Plugin Management, or:

```sh
mmctl plugin add dist/render-md-0.1.0.tar.gz
mmctl plugin enable render-md
```

## How it works

- `registry.registerFilePreviewComponent` overrides the preview for `md`, `markdown`, `mkd` and `mkdown` attachments.
- The component fetches the file from `/api/v4/files/{id}` and renders it with the webapp's own `formatText` and `messageHtmlToComponent`, so sanitizing, emoji and mentions behave like a normal post.
- Source view wraps the file in a fenced `markdown` code block and sends it through the same renderer, so highlighting matches the built-in code previewer.
- Files over 1 MiB are not rendered. Download them instead.

There is no build step. `webapp/main.js` is plain JavaScript against the React instance the webapp exposes.

## Test

```sh
make test
make lint
```

## Limitations

Only the click-to-preview modal changes. Posts still show the attachment as a file card.
