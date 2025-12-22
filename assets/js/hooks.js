import { initEditor, updateEditorContent, destroyEditor } from "./editor"
import { initTypstWorker, destroyTypstWorker } from "./typst_worker"
import { updatePreview } from "./preview"

export const CodeMirror = {
  mounted() {
    const container = this.el
    const content = this.el.dataset.content || ""
    const fileId = this.el.dataset.fileId || null

    if (!container) return

    this.editorInstance = initEditor(
      container,
      content,
      this.liveSocket || window.liveSocket,
      fileId
    )

    this.handleEvent("content_updated", ({ content }) => {
      if (this.editorInstance) {
        updateEditorContent(this.editorInstance, content)
      }
    })
  },

  updated() {
    const newContent = this.el.dataset.content || ""
    const newFileId = this.el.dataset.fileId || null

    if (this.editorInstance) {
      const currentFileId = this.el.dataset.fileId || null
      if (currentFileId !== newFileId) {
        destroyEditor(this.editorInstance)
        this.mounted()
      } else {
        updateEditorContent(this.editorInstance, newContent)
      }
    } else if (newFileId) {
      this.mounted()
    }
  },

  destroyed() {
    if (this.editorInstance) {
      destroyEditor(this.editorInstance)
      this.editorInstance = null
    }
  }
}

export const Preview = {
  mounted() {
    initTypstWorker()

    this.handleEvent("preview_updated", ({ svg }) => {
      updatePreview(this.el, svg)
    })
  },

  destroyed() {
    destroyTypstWorker()
  }
}

export const SaveStatus = {
  updated() {
    const status = this.el.textContent.trim()
    if (status === "saved") {
      this.el.classList.remove("text-error")
      this.el.classList.add("text-success")
    } else if (status === "error") {
      this.el.classList.remove("text-success")
      this.el.classList.add("text-error")
    }
  }
}
