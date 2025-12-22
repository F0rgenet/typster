defmodule Typster.Jobs.PeriodicSnapshot do
  use Oban.Worker, queue: :default, max_attempts: 3

  @impl Oban.Worker
  def perform(_job) do
    alias Typster.Revisions

    files = Typster.Repo.all(Typster.Projects.File)

    Enum.each(files, fn file ->
      revisions = Revisions.list_revisions(file.id)

      if length(revisions) > 0 do
        latest_revision = List.first(revisions)

        if latest_revision.content != file.content do
          Revisions.create_revision(file.id, file.content)
        end
      end
    end)

    :ok
  end
end
