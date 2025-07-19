import { createContext, useReducer, useEffect } from 'react'

// Load accessibility preferences from localStorage
const loadAccessibilityPreferences = () => {
  try {
    const saved = localStorage.getItem('accessibility-preferences')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.warn('Failed to load accessibility preferences:', error)
  }
  return {}
}

// Save accessibility preferences to localStorage
const saveAccessibilityPreferences = (preferences) => {
  try {
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences))
  } catch (error) {
    console.warn('Failed to save accessibility preferences:', error)
  }
}

const initialState = {
  theme: 'light',
  user: {},
  accessibility: {
    highContrast: false,
    fontSize: 'medium', // 'small', 'medium', 'large', 'extra-large'
    ...loadAccessibilityPreferences()
  }
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'switchTheme':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' }
    case 'setUser':
      return { ...state, user: action.payload }
    case 'toggleHighContrast':
      const newHighContrast = !state.accessibility.highContrast
      const updatedAccessibility = { ...state.accessibility, highContrast: newHighContrast }
      saveAccessibilityPreferences(updatedAccessibility)
      return { ...state, accessibility: updatedAccessibility }
    case 'setFontSize':
      const updatedFontSize = { ...state.accessibility, fontSize: action.payload }
      saveAccessibilityPreferences(updatedFontSize)
      return { ...state, accessibility: updatedFontSize }
    case 'resetAccessibility':
      const defaultAccessibility = {
        highContrast: false,
        fontSize: 'medium'
      }
      saveAccessibilityPreferences(defaultAccessibility)
      return { ...state, accessibility: defaultAccessibility }
    default:
      throw Error('Unknown action in context reducer.')
  }
}

const Context = createContext({ context: initialState, dispatch: () => null })

const ContextProvider = ({ children }) => {
  const [context, dispatch] = useReducer(reducer, initialState)

  // Apply accessibility settings to document
  useEffect(() => {
    const { accessibility } = context
    const root = document.documentElement

    // Apply high contrast mode
    if (accessibility.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large')
    root.classList.add(`font-${accessibility.fontSize}`)
  }, [context.accessibility])

  return (
    <Context.Provider value={{ context, dispatch }}>
      {children}
    </Context.Provider>
  )
}

export { Context, ContextProvider }
