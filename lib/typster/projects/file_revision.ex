defmodule Typster.Projects.FileRevision do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "file_revisions" do
    field :content, :string
    field :sequence, :integer
    belongs_to :file, Typster.Projects.File
    field :inserted_at, :utc_datetime
  end

  @doc false
  def changeset(file_revision, attrs) do
    file_revision
    |> cast(attrs, [:content, :sequence, :file_id, :inserted_at])
    |> validate_required([:content, :sequence, :file_id, :inserted_at])
  end
end
