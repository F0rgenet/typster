import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { Compartment } from "@codemirror/state"
import { typst } from "./typst_syntax"
import { compileTypst } from "./typst_worker"

function getCurrentTheme() {
  const html = document.documentElement
  const theme = html.getAttribute("data-theme")
  if (theme === "dark") return "dark"
  if (theme === "light") return "light"
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  return prefersDark ? "dark" : "light"
}

const lightTheme = EditorView.theme({
  "&": {
    backgroundColor: "#ffffff",
    color: "#1f2937",
    fontSize: "14px",
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"
  },
  ".cm-content": {
    padding: "16px",
    minHeight: "100%",
    lineHeight: "1.6"
  },
  ".cm-focused": {
    outline: "none"
  },
  ".cm-editor": {
    height: "100%"
  },
  ".cm-scroller": {
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"
  },
  ".cm-gutters": {
    backgroundColor: "#f9fafb",
    color: "#6b7280",
    border: "none",
    borderRight: "1px solid #e5e7eb"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    minWidth: "3ch",
    padding: "0 8px 0 16px"
  },
  ".cm-activeLine": {
    backgroundColor: "#f3f4f6"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#f3f4f6",
    color: "#1f2937"
  },
  ".cm-selectionMatch": {
    backgroundColor: "#dbeafe"
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "#dbeafe"
  },
  ".cm-cursor": {
    borderLeftColor: "#1f2937"
  },
  ".cm-selectionBackground": {
    backgroundColor: "#dbeafe"
  }
})

const darkTheme = EditorView.theme({
  "&": {
    backgroundColor: "#272822",
    color: "#f8f8f2",
    fontSize: "14px",
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"
  },
  ".cm-content": {
    padding: "16px",
    minHeight: "100%",
    lineHeight: "1.6"
  },
  ".cm-focused": {
    outline: "none"
  },
  ".cm-editor": {
    height: "100%"
  },
  ".cm-scroller": {
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"
  },
  ".cm-gutters": {
    backgroundColor: "#272822",
    color: "#75715e",
    border: "none"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    minWidth: "3ch",
    padding: "0 8px 0 16px"
  },
  ".cm-activeLine": {
    backgroundColor: "#3e3d32"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#3e3d32",
    color: "#f8f8f2"
  },
  ".cm-selectionMatch": {
    backgroundColor: "#49483e"
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "#49483e"
  },
  ".cm-cursor": {
    borderLeftColor: "#f8f8f2"
  },
  ".cm-selectionBackground": {
    backgroundColor: "#49483e"
  }
})

function getThemeExtension() {
  return getCurrentTheme() === "dark" ? darkTheme : lightTheme
}

export function initEditor(container, initialContent, socket, fileId) {
  let autosaveTimer = null
  const themeCompartment = new Compartment()

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      clearTimeout(autosaveTimer)

      const content = update.state.doc.toString()

      if (fileId && socket) {
        autosaveTimer = setTimeout(() => {
          socket.pushEvent("autosave", {
            file_id: fileId,
            content: content
          })
        }, 500)
      }

      compileTypst(content)
    }
  })

  const state = EditorState.create({
    doc: initialContent || "",
    extensions: [
      basicSetup,
      themeCompartment.of(getThemeExtension()),
      typst(),
      updateListener
    ]
  })

  const editor = new EditorView({
    state: state,
    parent: container
  })

  if (initialContent) {
    compileTypst(initialContent)
  }

  const updateTheme = () => {
    const newTheme = getThemeExtension()
    editor.dispatch({
      effects: themeCompartment.reconfigure(newTheme)
    })
  }

  return {
    editor,
    updateTheme,
    destroy: () => {
      if (autosaveTimer) {
        clearTimeout(autosaveTimer)
      }
      editor.destroy()
    }
  }
}

export function updateEditorContent(editorInstance, content) {
  if (editorInstance && editorInstance.editor) {
    const currentContent = editorInstance.editor.state.doc.toString()
    if (currentContent !== content) {
      const transaction = editorInstance.editor.state.update({
        changes: {
          from: 0,
          to: editorInstance.editor.state.doc.length,
          insert: content
        }
      })
      editorInstance.editor.dispatch(transaction)
    }
  }
}

export function destroyEditor(editorInstance) {
  if (editorInstance && editorInstance.destroy) {
    editorInstance.destroy()
  }
}
