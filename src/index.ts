import { Elysia, t } from "elysia"
import { openapi } from "@elysiajs/openapi"

const app = new Elysia()
  .use(openapi())

  .get("/ping", () => ({
    success: true,
    message: "Server OK"
  }), {
    response: t.Object({
      success: t.Boolean(),
      message: t.String()
    })
  })

  .get(
    "/products/:id",
    ({ params, query }) => ({
      success: true,
      productId: params.id,
      sort: query.sort
    }),
    {
      params: t.Object({
        id: t.Numeric()
      }),
      query: t.Object({
        sort: t.Union([t.Literal("asc"), t.Literal("desc")])
      }),
      response: t.Object({
        success: t.Boolean(),
        productId: t.Number(),
        sort: t.String()
      })
    }
  )

  .listen(3000)

console.log("Server running at http://localhost:3000")