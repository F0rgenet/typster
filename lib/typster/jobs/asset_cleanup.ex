defmodule Typster.Jobs.AssetCleanup do
  use Oban.Worker, queue: :default, max_attempts: 3

  @impl Oban.Worker
  def perform(_job) do
    alias Typster.Assets
    alias Typster.Repo

    import Ecto.Query

    all_assets = Repo.all(Typster.Assets.Asset)

    all_project_ids =
      Repo.all(
        from p in Typster.Projects.Project,
          select: p.id
      )
      |> Enum.map(& &1.id)

    orphaned_assets =
      Enum.filter(all_assets, fn asset ->
        not Enum.member?(all_project_ids, asset.project_id)
      end)

    Enum.each(orphaned_assets, fn asset ->
      Assets.delete_asset(asset)
    end)

    :ok
  end
end
