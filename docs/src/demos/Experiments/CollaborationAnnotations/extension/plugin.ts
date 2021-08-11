import { Plugin, PluginKey } from 'prosemirror-state'
import { AnnotationsState, AnnotationStateOptions } from './state'

export const AnnotationsPluginKey = new PluginKey('annotations')

export const AnnotationsPlugin = (options?: AnnotationStateOptions) => new Plugin({
  key: AnnotationsPluginKey,

  state: {
    init() {
      return new AnnotationsState(options)
    },
    
    apply(transaction, pluginState, oldState, newState) {
      return pluginState.apply(transaction, newState)
    },
  },

  props: {
    decorations(state) {
      const { decorations } = this.getState(state)
      return decorations
    }
  }
})
