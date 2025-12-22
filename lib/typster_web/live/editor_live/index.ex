defmodule TypsterWeb.EditorLive.Index do
  use TypsterWeb, :live_view

  alias Typster.Projects
  alias Typster.Files
  alias Typster.Revisions

  @impl true
  def mount(%{"id" => project_id}, _session, socket) do
    project = Projects.get_project!(project_id)
    file_tree = Files.get_file_tree(project_id)

    main_file =
      case file_tree do
        [file | _] -> file
        [] -> nil
      end

    {:ok,
     socket
     |> assign(:project, project)
     |> assign(:file_tree, file_tree)
     |> assign(:current_file, main_file)
     |> assign(:content, if(main_file, do: main_file.content || "", else: ""))
     |> assign(:save_status, "saved")
     |> assign(:preview_svg, nil)
     |> assign(:page_title, project.name)}
  end

  @impl true
  def handle_params(_params, _url, socket) do
    {:noreply,
     socket
     |> assign(:page_title, socket.assigns.project.name)}
  end

  @impl true
  def handle_event("autosave", %{"file_id" => file_id, "content" => content}, socket) do
    file = Files.get_file!(file_id)

    case Files.update_file_content(file, content) do
      {:ok, updated_file} ->
        Revisions.create_revision(file_id, content)

        {:noreply,
         socket
         |> assign(:current_file, updated_file)
         |> assign(:content, content)
         |> assign(:save_status, "saved")}

      {:error, _changeset} ->
        {:noreply, assign(socket, :save_status, "error")}
    end
  end

  @impl true
  def handle_event("update_preview", %{"svg" => svg}, socket) do
    {:noreply, assign(socket, :preview_svg, svg)}
  end

  @impl true
  def handle_event("select_file", %{"file_id" => file_id}, socket) do
    file = Files.get_file!(file_id)

    {:noreply,
     socket
     |> assign(:current_file, file)
     |> assign(:content, file.content || "")
     |> push_event("file_changed", %{file_id: file_id, content: file.content || ""})
     |> push_event("content_updated", %{content: file.content || ""})}
  end

  @impl true
  def handle_event("create_file", %{"path" => path, "content" => content}, socket) do
    case Files.create_file(socket.assigns.project.id, %{path: path, content: content}) do
      {:ok, file} ->
        file_tree = Files.get_file_tree(socket.assigns.project.id)

        {:noreply,
         socket
         |> assign(:file_tree, file_tree)
         |> assign(:current_file, file)
         |> assign(:content, content)
         |> push_event("file_changed", %{file_id: file.id, content: content})
         |> push_event("content_updated", %{content: content})}

      {:error, _changeset} ->
        {:noreply, socket}
    end
  end
end
