import { initEditor, updateEditorContent, destroyEditor } from "./editor"
import { initTypstWorker, destroyTypstWorker, compileTypst } from "./typst_worker"
import { updatePreview } from "./preview"

function parseContent(content) {
  if (!content) return ""
  return content.replace(/\\n/g, "\n")
}

export const CodeMirror = {
  mounted() {
    const container = this.el
    const rawContent = this.el.dataset.content || ""
    const content = parseContent(rawContent)
    const fileId = this.el.dataset.fileId || null

    if (!container) return

    this.previousFileId = fileId

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

    this.handleEvent("file_changed", ({ file_id, content }) => {
      const newFileId = file_id || null
      const newContent = parseContent(content || "")

      if (this.previousFileId !== newFileId) {
        this.previousFileId = newFileId
        this.cleanupThemeHandlers()
        if (this.editorInstance) {
          destroyEditor(this.editorInstance)
        }
        this.editorInstance = initEditor(
          container,
          newContent,
          this.liveSocket || window.liveSocket,
          newFileId
        )
        this.setupThemeHandlers()
      } else if (this.editorInstance) {
        updateEditorContent(this.editorInstance, newContent)
      }
    })

    this.themeChangeHandler = () => {
      if (this.editorInstance && this.editorInstance.updateTheme) {
        this.editorInstance.updateTheme()
      }
    }

    window.addEventListener("phx:set-theme", this.themeChangeHandler)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          if (this.editorInstance && this.editorInstance.updateTheme) {
            this.editorInstance.updateTheme()
          }
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    })

    this.themeObserver = observer
  },

  setupThemeHandlers() {
    this.themeChangeHandler = () => {
      if (this.editorInstance && this.editorInstance.updateTheme) {
        this.editorInstance.updateTheme()
      }
    }

    window.addEventListener("phx:set-theme", this.themeChangeHandler)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          if (this.editorInstance && this.editorInstance.updateTheme) {
            this.editorInstance.updateTheme()
          }
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    })

    this.themeObserver = observer
  },

  cleanupThemeHandlers() {
    if (this.themeChangeHandler) {
      window.removeEventListener("phx:set-theme", this.themeChangeHandler)
      this.themeChangeHandler = null
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect()
      this.themeObserver = null
    }
  },

  updated() {
    const rawContent = this.el.dataset.content || ""
    const newContent = parseContent(rawContent)
    const newFileId = this.el.dataset.fileId || null

    if (this.previousFileId === undefined) {
      this.previousFileId = newFileId
    }

    if (this.editorInstance) {
      if (this.previousFileId !== newFileId) {
        this.previousFileId = newFileId
        this.cleanupThemeHandlers()
        destroyEditor(this.editorInstance)
        const container = this.el
        this.editorInstance = initEditor(
          container,
          newContent,
          this.liveSocket || window.liveSocket,
          newFileId
        )
        this.setupThemeHandlers()
      } else {
        updateEditorContent(this.editorInstance, newContent)
      }
    } else if (newFileId) {
      this.previousFileId = newFileId
      this.cleanupThemeHandlers()
      const container = this.el
      this.editorInstance = initEditor(
        container,
        newContent,
        this.liveSocket || window.liveSocket,
        newFileId
      )
      this.setupThemeHandlers()
    }
  },

  destroyed() {
    this.cleanupThemeHandlers()
    if (this.editorInstance) {
      destroyEditor(this.editorInstance)
      this.editorInstance = null
    }
  }
}

export const Preview = {
  mounted() {
    initTypstWorker(this)

    this.handleEvent("update_preview", ({ svg }) => {
      updatePreview(this.el, svg)
    })

    const editorContainer = document.getElementById("editor-container")
    if (editorContainer) {
      const rawContent = editorContainer.dataset.content || ""
      const content = rawContent.replace(/\\n/g, "\n")
      if (content) {
        setTimeout(() => compileTypst(content), 100)
      }
    }
  },

  updated() {
    if (this.pushEvent) {
      initTypstWorker(this)
    }
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
