export type AnnotationStatusMap = Map<string, string>

export type AnnotationsAttributes = {
  ids: string[]
}

export type AnnotationSelectorType = 'focus' | 'hover'

export type SetActiveAnnotationsAction = {
  type: 'setActiveAnnotations'
  activeIds?: string[]
}

export type SetAnnotationSelectorAction = {
  type: 'setAnnotationSelector'
  selector: AnnotationSelectorType
  id: string
}

export type SetNewAnnotationTypeAction = {
  type: 'setNewAnnotationType'
  newAnnotationType: string | undefined
}

export type UnsetAnnotationSelectorAction = {
  type: 'unsetAnnotationSelector'
  selector: AnnotationSelectorType
  id: string
}

export type AnnotationsAction = 
  SetActiveAnnotationsAction |
  SetAnnotationSelectorAction |
  SetNewAnnotationTypeAction | 
  UnsetAnnotationSelectorAction