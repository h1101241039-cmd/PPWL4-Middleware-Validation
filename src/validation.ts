import { Elysia, t } from "elysia";
import { openapi } from "@elysiajs/openapi";

const app = new Elysia()

  .use(openapi())
  .onRequest(({ request, set }) => {
    console.log("📥", request.method, request.url);
    console.log("🕒", new Date().toISOString());

    // SHORT-CIRCUIT
    if (request.headers.get("x-block") === "true") {
      set.status = 403;
      return {
        message: "Blocked by middleware"
      };
    }
  })

  // PRAKTIKUM 1 - VALIDASI BODY
  .post(
    "/request",
    ({ body }) => {
      return {
        message: "Success",
        data: body
      };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 3 }),
        email: t.String({ format: "email" }),
        age: t.Number({ minimum: 18 })
      }),
      response: t.Object({
        message: t.String(),
        data: t.Object({
          name: t.String(),
          email: t.String(),
          age: t.Number()
        })
      })
    }
  )

  // PRAKTIKUM 2 - VALIDASI PARAMS & QUERY
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
      }),
      response: t.Object({
        productId: t.Number(),
        sort: t.String()
      })
    }
  )

  // PRAKTIKUM 3 - VALIDASI RESPONSE

  .get(
    "/stats",
    () => {
      return {
        total: 150,
        active: 120
      };
    },
    {
      response: t.Object({
        total: t.Number(),
        active: t.Number()
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

  
  .get(
    "/dashboard",
    () => ({
      message: "Welcome to Dashboard"
    }),
    {
      beforeHandle({ headers, set }) {
        if (!headers.authorization) {
          set.status = 401;
          return {
            success: false,
            message: "Unauthorized"
          };
        }
      }
    }
  )

  .listen(3000);

console.log("🦊 Server running at http://localhost:3000");