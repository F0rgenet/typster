defmodule Typster.Projects.File do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "files" do
    field :path, :string
    field :content, :string
    belongs_to :project, Typster.Projects.Project
    belongs_to :parent, Typster.Projects.File
    has_many :children, Typster.Projects.File, foreign_key: :parent_id
    has_many :revisions, Typster.Projects.FileRevision
    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(file, attrs) do
    file
    |> cast(attrs, [:path, :content, :project_id, :parent_id])
    |> validate_required([:path, :project_id])
  end
end
