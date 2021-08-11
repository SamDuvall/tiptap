import { getMarkType } from '@tiptap/core'
import { EditorState, Transaction } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { AnnotationsMark } from './mark'
import { AnnotationsPluginKey } from './plugin'
import {
  AnnotationsAction,
  AnnotationsAttributes,
  AnnotationSelectorType
} from './types'

export interface AnnotationStateOptions {
  activeIds?: string[]
  prefix?: string
}

export class AnnotationsState {
  prefix: string

  activeIds?: string[]
  newAnnotationType?: string
  selectors = new Map<AnnotationSelectorType, string>()
  selectedIds: string[] = []

  decorations = DecorationSet.empty

  constructor ({
    activeIds,
    prefix = 'annotation'
  }: AnnotationStateOptions = {}) {
    this.activeIds = activeIds
    this.prefix = prefix
  }

  getSelectedIds (state: EditorState) {
    const { ranges } = state.selection
    const type = getMarkType(AnnotationsMark.name, state.schema)

    let selectedIds: string[] | undefined = undefined
    ranges.forEach(range => {
      const from = range.$from.pos
      const to = range.$to.pos

      state.doc.nodesBetween(from, to, (node) => {
        if (!node.isText) return
        const mark = node.marks.find(mark => mark.type === type)
        if (!mark) {
          selectedIds = []
        } else {
          const { ids } = mark.attrs as AnnotationsAttributes
          selectedIds = selectedIds ? selectedIds.filter(id => ids.includes(id)) : ids
        }
      })
    })

    selectedIds ||= []
    return selectedIds
  }

  updateFocusId (state: EditorState) {
    this.selectedIds = this.getSelectedIds(state)
  }

  updateDecorations (state: EditorState) {
    const decorations: Decoration[] = []

    if (this.newAnnotationType) {
      const { selection } = state
      const { from, to } = selection
      decorations.push(
        Decoration.inline(from, to, {
          class: `${this.prefix}-new`
        }, {
          inclusiveEnd: true
        })
      )
    }

    state.doc.descendants((node, pos) => {
      const mark = node.marks.find(m => m.type.name === 'annotations')
      if (!mark) return
  
      const { ids } = mark.attrs as AnnotationsAttributes
      const from = pos
      const to = pos + node.nodeSize

      // Add states to each id
      for (const id of ids) {
        const states: string[] = []

        // Check for selectors
        for (const [selector, selectorId] of this.selectors.entries()) {
          if (id === selectorId) states.push(selector)
        }

        // Check for selected
        if (this.selectedIds.includes(id)) states.push('selected')
  
        // Check for active
        if (this.activeIds?.includes(id)) states.push('active')
  
        // Add all the states
        if (states.length > 0) {
          decorations.push(
            Decoration.inline(from, to, {
              class: states.map(s => `${this.prefix}-${s}`).join(' ')
            }, {
              id,
              inclusiveEnd: true
            })
          )
        }  
      }
    })

    this.decorations = DecorationSet.create(state.doc, decorations)
  }

  apply (tr: Transaction, state: EditorState) {
    // Perform any metadata actions
    const action = tr.getMeta(AnnotationsPluginKey) as AnnotationsAction | undefined
    switch(action?.type) {
      case 'setActiveAnnotations': {
        this.activeIds = action.activeIds
        break
      }
      case 'setAnnotationSelector': {
        const { id, selector } = action
        this.selectors.set(selector, id)
        break
      }
      case 'setNewAnnotationType': {
        this.newAnnotationType = action.newAnnotationType
        break
      }
      case 'unsetAnnotationSelector': {
        const { id, selector } = action
        if (id === this.selectors.get(selector)) {
          this.selectors.delete(selector)
        }
        break
      }
    }

    // Update focus/decorations
    this.updateFocusId(state)
    this.updateDecorations(state)
    
    return this
  }
}
