defmodule Typster.Revisions do
  @moduledoc """
  The Revisions context.
  """

  import Ecto.Query, warn: false
  alias Typster.Repo
  alias Typster.Projects.FileRevision

  def get_revision!(id), do: Repo.get!(FileRevision, id)

  def get_revision(id), do: Repo.get(FileRevision, id)

  def create_revision(file_id, content) do
    sequence = get_next_sequence(file_id)

    %FileRevision{}
    |> FileRevision.changeset(%{
      file_id: file_id,
      content: content,
      sequence: sequence,
      inserted_at: DateTime.utc_now()
    })
    |> Repo.insert()
  end

  def list_revisions(file_id) do
    from(r in FileRevision,
      where: r.file_id == ^file_id,
      order_by: [desc: r.sequence]
    )
    |> Repo.all()
  end

  def restore_revision(revision_id) do
    revision = get_revision!(revision_id)
    file = Typster.Files.get_file!(revision.file_id)

    Typster.Files.update_file_content(file, revision.content)
  end

  defp get_next_sequence(file_id) do
    from(r in FileRevision,
      where: r.file_id == ^file_id,
      select: max(r.sequence)
    )
    |> Repo.one()
    |> case do
      nil -> 1
      max_seq -> max_seq + 1
    end
  end

  def change_revision(%FileRevision{} = revision, attrs \\ %{}) do
    FileRevision.changeset(revision, attrs)
  end
end
