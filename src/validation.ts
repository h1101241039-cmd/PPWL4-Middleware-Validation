import { Elysia, t } from "elysia";
import { openapi } from "@elysiajs/openapi";

const app = new Elysia()
  .use(openapi())
  .post("/request",
    ({ body }) => {
      return {
        message: "Success",
        data: body
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 3 }),
        email: t.String({ format: "email" }),
        age: t.Number({ minimum: 18 })
      })
    }
  )


  
    .get(
    "/products/:id",
    ({ params, query }) => {
      return {
        productId: params.id,
        sort: query.sort ?? "asc"
      };
    },
    {
      params: t.Object({
        id: t.Number()
      }),
      query: t.Object({
        sort: t.Optional(
          t.Union([
            t.Literal("asc"),
            t.Literal("desc")
          ])
        )
      })
    }
  )
    .get(
    "/ping",
    () => {
      return {
        success: true,
        message: "Server OK"
      };
    },
    {
      response: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
    }
  )

  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);