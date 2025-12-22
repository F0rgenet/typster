import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { markdown } from "@codemirror/lang-markdown"

export function initEditor(container, initialContent, socket, fileId) {
  let autosaveTimer = null

  const state = EditorState.create({
    doc: initialContent || "",
    extensions: [
      basicSetup,
      markdown(),
      EditorView.updateListener.of((update) => {
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

          if (window.typstWorker) {
            window.typstWorker.postMessage({
              type: "compile",
              content: content
            })
          }
        }
      })
    ]
  })

  const editor = new EditorView({
    state: state,
    parent: container
  })

  return { editor, destroy: () => {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer)
    }
    editor.destroy()
  }}
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
