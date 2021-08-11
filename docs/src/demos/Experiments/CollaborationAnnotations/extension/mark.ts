import { Mark, getMarkType } from '@tiptap/core'
import { AnnotationsPlugin, AnnotationsPluginKey } from './plugin'
import {
  AnnotationSelectorType,
  AnnotationsAttributes,
  SetActiveAnnotationsAction,
  SetAnnotationSelectorAction,
  SetNewAnnotationTypeAction,
  UnsetAnnotationSelectorAction
} from './types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    annotations: {
      // Instruct the UI to show the new annotation form
      showNewAnnotation: (newAnnotationType: string) => ReturnType,

      // Instruct the UI to hide the new annotation form
      hideNewAnnotation: () => ReturnType,

      // Add this annotation id to the current selection
      addAnnotationId: (id: string) => ReturnType,

      // Remove this annotation id from the current selection
      removeAnnotationId: (id: string) => ReturnType,

      // Add the active class to these annotation ids
      setActiveAnnotationIds: (ids?: string[]) => ReturnType

      // Set the selector state of this annotation id
      setAnnotationSelector: (
        selector: AnnotationSelectorType,
        id: string
      ) => ReturnType

      // Unset the selector state of this annotation id
      unsetAnnotationSelector: (
        selector: AnnotationSelectorType,
        id: string
      ) => ReturnType
    }
  }
}

export const AnnotationsMark = Mark.create({
  name: 'annotations',

  addAttributes() {
    return {
      ids: {
        default: null,
        renderHTML: ({ ids }) => {
          if (!ids) {
            return null
          }

          return {
            'data-annotations': ids.join(','),
          }
        }
      }
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      showNewAnnotation: (newAnnotationType) => ({ dispatch, state }) => {
        if (dispatch) {
          state.tr.setMeta(AnnotationsPluginKey, <SetNewAnnotationTypeAction>{
            type: 'setNewAnnotationType',
            newAnnotationType
          })  
        }

        return true
      },

      hideNewAnnotation: () => ({ dispatch, state }) => {
        if (dispatch) {
          state.tr.setMeta(AnnotationsPluginKey, <SetNewAnnotationTypeAction>{
            type: 'setNewAnnotationType',
            newAnnotationType: undefined
          })  
        }

        return true
      },

      addAnnotationId: (id) => ({ dispatch, state, tr }) => {
        const { selection } = state
        const { empty, ranges } = selection
        const type = getMarkType(this.name, state.schema)

        if (empty || !dispatch) return false

        ranges.forEach(range => {
          const from = range.$from.pos
          const to = range.$to.pos
  
          state.doc.nodesBetween(from, to, (node, pos) => {
            const trimmedFrom = Math.max(pos, from)
            const trimmedTo = Math.min(pos + node.nodeSize, to)
            const mark = node.marks.find(mark => mark.type === type)

            // Add the annotation id to the existing list of annotations
            const existingIds = mark ? mark.attrs.ids : []
            const ids = [...existingIds, id]

            tr.addMark(trimmedFrom, trimmedTo, type.create({ ids }))
          })
        })

        return true
      },

      removeAnnotationId: (id) => ({ dispatch, state, tr }) => {
        const type = getMarkType(this.name, state.schema)
        if (!dispatch) return false
 
        state.doc.descendants((node, pos) => {
          const mark = node.marks.find(mark => mark.type === type)
          if (!mark) return

          // Determine if this id is on the node
          const { ids } = mark.attrs as AnnotationsAttributes
          if (!ids.includes(id)) return

          // Calculate the new annotation ids
          const newIds = ids.filter(newId => newId !== id)
          const from = pos
          const to = pos + node.nodeSize
          if (newIds.length > 0) {
            tr.addMark(from, to, type.create({ ids: newIds }))  
          } else {
            tr.removeMark(from, to, type)
          }
        })

        return true
      },

      setActiveAnnotationIds: (activeIds) => ({ dispatch, state }) => {
        if (dispatch) {
          state.tr.setMeta(AnnotationsPluginKey, <SetActiveAnnotationsAction>{
            type: 'setActiveAnnotations',
            activeIds
          })  
        }

        return true
      },

      setAnnotationSelector: (selector, id) => ({ dispatch, state }) => {
        if (dispatch) {
          state.tr.setMeta(AnnotationsPluginKey, <SetAnnotationSelectorAction>{
            type: 'setAnnotationSelector',
            selector,
            id
          })
        }

        return true
      },

      unsetAnnotationSelector: (selector, id) => ({ dispatch, state }) => {
        if (dispatch) {
          state.tr.setMeta(AnnotationsPluginKey, <UnsetAnnotationSelectorAction>{
            type: 'unsetAnnotationSelector',
            selector,
            id
          })  
        }

        return true
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      AnnotationsPlugin()
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-m': () => this.editor.commands.showNewAnnotation('comment')
    }
  }
})
