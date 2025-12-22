let worker = null

export function initTypstWorker() {
  if (typeof Worker !== "undefined") {
    const workerPath = "/assets/js/typst_worker_impl.js"
    worker = new Worker(workerPath, { type: "module" })

    worker.onmessage = (event) => {
      const { type, data } = event.data

      if (type === "render") {
        if (window.liveSocket) {
          window.liveSocket.pushEvent("update_preview", {
            svg: data.svg
          })
        }
      } else if (type === "error") {
        console.error("Typst compilation error:", data)
      }
    }

    worker.onerror = (error) => {
      console.error("Typst worker error:", error)
    }

    window.typstWorker = worker
    return worker
  } else {
    console.warn("Web Workers are not supported in this browser")
    return null
  }
}

export function compileTypst(content) {
  if (worker) {
    worker.postMessage({
      type: "compile",
      content: content
    })
  }
}

export function destroyTypstWorker() {
  if (worker) {
    worker.terminate()
    worker = null
    window.typstWorker = null
  }
}
