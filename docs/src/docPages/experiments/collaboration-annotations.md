# CollaborationAnnotations
<!-- [![Version](https://img.shields.io/npm/v/@tiptap/extension-collaboration-annotations.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-collaboration-annotations)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-collaboration-annotations.svg)](https://npmcharts.com/compare/@tiptap/extension-collaboration-annotations?minimal=true) -->

⚠️ Experiment

:::warning Don’t use this in production
This is still a work-in-progress.
:::

Annotations can be used to add additional information to the content, for example comments. They live on a different level than the actual editor content.

<!-- :::pro Pro Extension
We kindly ask you to [sponsor our work](/sponsor) when using this extension in production.
::: -->

## Installation
```bash
# with npm
npm install @tiptap/extension-collaboration-annotations

# with Yarn
yarn add @tiptap/extension-collaboration-annotations
```

This extension requires the [`Collaboration`](/api/extensions/collaboration) extension.

## Settings
| Option       | Type     | Default     | Description                                                                        |
| ------------ | -------- | ----------- | ---------------------------------------------------------------------------------- |
| activeIds    | `Array`  | `[]`        | The list of annotation id which are still "active" (aka not resolved)              |

## Commands
| Command          | Parameters | Description                                                               |
| ---------------- | ---------- | ------------------------------------------------------------------------- |
| addAnnotation    | data       | Adds an annotation to the current selection, takes a string or an object. |

<!-- ## Source code
[packages/extension-collaboration-annotations/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-collaboration-annotations/) -->

## Usage
<demo name="Experiments/CollaborationAnnotations" />
