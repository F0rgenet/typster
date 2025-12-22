defmodule TypsterWeb.ProjectLive.Show do
  use TypsterWeb, :live_view

  alias Typster.Projects
  alias Typster.Files

  @impl true
  def mount(%{"id" => id}, _session, socket) do
    project = Projects.get_project!(id)
    file_tree = Files.get_file_tree(id)

    {:ok,
     socket
     |> assign(:project, project)
     |> assign(:file_tree, file_tree)}
  end

  @impl true
  def handle_params(%{"id" => id}, _url, socket) do
    {:noreply,
     socket
     |> assign(:page_title, socket.assigns.project.name)
     |> assign(:project, Projects.get_project!(id))}
  end

  @impl true
  def handle_event("delete_file", %{"id" => file_id}, socket) do
    file = Files.get_file!(file_id)
    {:ok, _} = Files.delete_file(file)

    file_tree = Files.get_file_tree(socket.assigns.project.id)

    {:noreply, assign(socket, :file_tree, file_tree)}
  end
end
