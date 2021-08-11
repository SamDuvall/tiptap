<template>
  <div>
    <div v-if="editor">
      <h2>
        Original Editor
      </h2>
      <button @click="addComment" :disabled="!editor.can().showNewAnnotation('comment')">
        comment
      </button>
      <editor-content :editor="editor" />
      <div
        class="comment-thread"
        v-for="commentThread in commentThreads" :key="commentThread.id"
        v-bind:style="{ marginTop: '1rem' }"
      >
        <div
          @mouseover="onMouseoverCommentThread(commentThread.id)"
          @mouseleave="onMouseleaveCommentThread(commentThread.id)"
          v-bind:style="{ display: 'flex', alignItems: 'center', background: '#f3f3f3', padding: '.5rem 1rem' }"
        >
          Comment Thread: {{ commentThread.id }}

          <button
            @click="resolveCommentThread(commentThread.id)"
            v-bind:style="{ marginLeft: '1rem' }"
            v-if="!commentThread.resolved"
          >
            resolve
          </button>

          <button
            @click="deleteCommentThread(commentThread.id)"
            v-bind:style="{ marginLeft: '1rem' }"
          >
            remove
          </button>
        </div>

        <div
          class="comment"
          v-for="comment in commentThread.comments" :key="comment.id"
          v-bind:style="{ padding: '.5rem 1rem' }"
        >
          {{ comment.createdAt.toISOString() }}: {{ comment.message }}
        </div>

      </div>

      <h2>
        Another Editor
      </h2>
      <button @click="addAnotherComment" :disabled="!anotherEditor.can().showNewAnnotation('comment')">
        comment
      </button>
      <editor-content :editor="anotherEditor" />
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Collaboration from '@tiptap/extension-collaboration'
import Bold from '@tiptap/extension-bold'
import Heading from '@tiptap/extension-heading'
import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'
import { AnnotationsMark } from './extension'

const createCommentThread = () => {
  const message = prompt('Comment', '')
  return {
    id: uuid(),
    createdAt: new Date(),
    resolved: false,
    comments: [
      {
        id: uuid(),
        createdAt: new Date(),
        message
      }
    ]
  }
}

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      anotherEditor: null,
      commentThreads: [],
      ydoc: null,
    }
  },

  mounted() {
    this.ydoc = new Y.Doc()

    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Heading,
        AnnotationsMark.configure(),
        Collaboration.configure({
          document: this.ydoc,
        })
      ],
      content: `
        <p>
          Annotations can be used to add additional information to the content, for example comments. They live on a different level than the actual editor content.
        </p>
        <p>
          This example allows you to add plain text, but you’re free to add more complex data, for example JSON from another tiptap instance. :-)
        </p>
      `,
    })

    this.anotherEditor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Heading,
        AnnotationsMark.configure(),
        Collaboration.configure({
          document: this.ydoc,
        })
      ],
    })
  },

  methods: {
    addComment() {
      const commentThread = createCommentThread()
      this.commentThreads.push(commentThread)
      this.editor.commands.addAnnotationId(commentThread.id)
      this.updateActiveAnnotationIds()
    },
    addAnotherComment() {
      const commentThread = createCommentThread()
      this.commentThreads.push(commentThread)
      this.anotherEditor.commands.addAnnotationId(commentThread.id)
      this.updateActiveAnnotationIds()
    },
    resolveCommentThread(threadId) {
      const commentThread = this.commentThreads.find(ct => ct.id === threadId)
      commentThread.resolved = true
      this.updateActiveAnnotationIds()
    },
    onMouseoverCommentThread (threadId) {
      this.editor.commands.setAnnotationSelector('hover', threadId)
    },
    onMouseleaveCommentThread (threadId) {
      this.editor.commands.unsetAnnotationSelector('hover', threadId)
    },
    deleteCommentThread(threadId) {
      this.commentThreads = this.commentThreads.filter(ct => ct.id !== threadId)
      this.editor.commands.removeAnnotationId(threadId)
      this.updateActiveAnnotationIds()
    },
    updateActiveAnnotationIds() {
      const activeIds = this.commentThreads.filter(ct => !ct.resolved).map(ct => ct.id)
      this.editor.commands.setActiveAnnotationIds(activeIds)
      this.anotherEditor.commands.setActiveAnnotationIds(activeIds)
    }
  },

  beforeDestroy() {
    this.editor.destroy()
    this.anotherEditor.destroy()
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
  /* Basic editor styles */
  .ProseMirror {
    > * + * {
      margin-top: 0.75em;
    }
  }

  .annotation {
    background: #9DEF8F;
  }

  .annotation-new {
    background: transparentize(#9DEF8F, 0.5);
  }
  .annotation-active {
    border-bottom: 3px solid #9DEF8F;
    &:hover {
      background: transparentize(#9DEF8F, 0.75);
    }
    &.annotation-hover {
      background: transparentize(#9DEF8F, 0.75);
    }
    &.annotation-focus {
      background: transparentize(#9DEF8F, 0.5);
    }  
  }
  .ProseMirror-focused {
    .annotation-active {
      &.annotation-selected {
        background: transparentize(#9DEF8F, 0.5);
      }  
    }  
  }

  .comment-thread {
    border: 1px solid black;
  }
}
</style>
