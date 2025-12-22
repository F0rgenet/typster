defmodule Typster.Assets do
  @moduledoc """
  The Assets context.
  """

  import Ecto.Query, warn: false
  alias Typster.Repo
  alias Typster.Assets.Asset

  def get_asset!(id), do: Repo.get!(Asset, id)

  def get_asset(id), do: Repo.get(Asset, id)

  def upload_asset(project_id, object_key, attrs) do
    %Asset{}
    |> Asset.changeset(
      Map.merge(attrs, %{
        project_id: project_id,
        object_key: object_key,
        inserted_at: DateTime.utc_now()
      })
    )
    |> Repo.insert()
  end

  def get_asset_url(%Asset{} = asset) do
    config = ExAws.Config.new(:s3)
    bucket = Application.get_env(:typster, :s3_bucket, "typster-assets")

    ExAws.S3.presigned_url(
      config,
      :get,
      bucket,
      asset.object_key,
      expires_in: 3600
    )
  end

  def delete_asset(%Asset{} = asset) do
    bucket = Application.get_env(:typster, :s3_bucket, "typster-assets")

    ExAws.S3.delete_object(bucket, asset.object_key)
    |> ExAws.request()

    Repo.delete(asset)
  end

  def list_assets(project_id) do
    from(a in Asset,
      where: a.project_id == ^project_id,
      order_by: [desc: a.inserted_at]
    )
    |> Repo.all()
  end

  def change_asset(%Asset{} = asset, attrs \\ %{}) do
    Asset.changeset(asset, attrs)
  end
end
