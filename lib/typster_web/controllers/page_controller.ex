defmodule TypsterWeb.PageController do
  use TypsterWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
