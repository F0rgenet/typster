defmodule Typster.Repo do
  use Ecto.Repo,
    otp_app: :typster,
    adapter: Ecto.Adapters.Postgres
end
