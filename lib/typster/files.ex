defmodule Typster.Files do
  @moduledoc """
  The Files context.
  """

  import Ecto.Query, warn: false
  alias Typster.Repo
  alias Typster.Projects.File

  def get_file!(id), do: Repo.get!(File, id)

  def get_file(id), do: Repo.get(File, id)

  def create_file(project_id, attrs \\ %{}) do
    attrs = Map.put(attrs, :project_id, project_id)

    %File{}
    |> File.changeset(attrs)
    |> Repo.insert()
  end

  def update_file_content(%File{} = file, content) do
    file
    |> File.changeset(%{content: content})
    |> Repo.update()
  end

  def update_file(%File{} = file, attrs) do
    file
    |> File.changeset(attrs)
    |> Repo.update()
  end

  def delete_file(%File{} = file) do
    Repo.delete(file)
  end

  def get_file_tree(project_id) do
    from(f in File,
      where: f.project_id == ^project_id,
      preload: [:parent],
      order_by: [asc: f.path]
    )
    |> Repo.all()
  end

  def change_file(%File{} = file, attrs \\ %{}) do
    File.changeset(file, attrs)
  end
end
