defmodule TypsterWeb.ProjectLive.Index do
  use TypsterWeb, :live_view

  alias Typster.Projects
  alias Typster.Projects.Project

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:page_title, "Projects")
     |> stream(:projects, Projects.list_projects())}
  end

  @impl true
  def handle_params(params, _url, socket) do
    live_action = socket.assigns[:live_action] || :index
    {:noreply, apply_action(socket, live_action, params)}
  end

  defp apply_action(socket, :edit, %{"id" => id}) do
    socket
    |> assign(:page_title, "Edit Project")
    |> assign(:project, Projects.get_project!(id))
  end

  defp apply_action(socket, :new, _params) do
    socket
    |> assign(:page_title, "New Project")
    |> assign(:project, %Project{})
  end

  defp apply_action(socket, :index, _params) do
    socket
    |> assign(:page_title, "Projects")
    |> assign(:project, nil)
  end

  @impl true
  def handle_event("delete", %{"id" => id}, socket) do
    project = Projects.get_project!(id)
    {:ok, _} = Projects.delete_project(project)

    {:noreply, stream_delete(socket, :projects, project)}
  end

  @impl true
  def handle_event("create_project", params, socket) do
    name = Map.get(params, "name", "New Project")

    case Projects.create_project(%{name: name}) do
      {:ok, project} ->
        {:noreply, stream_insert(socket, :projects, project, at: -1)}

      {:error, _changeset} ->
        {:noreply, socket}
    end
  end
end
