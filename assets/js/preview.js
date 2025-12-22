export function updatePreview(container, svg) {
  if (container) {
    container.innerHTML = svg || "Preview will appear here"
  }
}

export function clearPreview(container) {
  if (container) {
    container.innerHTML = "Preview will appear here"
  }
}
