import { Elysia, t } from "elysia";
import { openapi } from "@elysiajs/openapi";

const app = new Elysia()

  // OpenAPI
  .use(openapi())

  // Global Middleware
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
      response: {
        200: t.Object({
          message: t.String(),
          data: t.Object({
            name: t.String(),
            email: t.String(),
            age: t.Number()
          })
        })
      }
    }
  )

  // PRAKTIKUM 2 - VALIDASI PARAM & QUERY
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
      response: {
        200: t.Object({
          productId: t.Number(),
          sort: t.String()
        })
      }
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
      response: {
        200: t.Object({
          total: t.Number(),
          active: t.Number()
        })
      }
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
      response: {
        200: t.Object({
          success: t.Boolean(),
          message: t.String()
        })
      }
    }
  )

  // DASHBOARD (AUTH SIMPLE)
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
      },
      response: {
        200: t.Object({
          message: t.String()
        }),
        401: t.Object({
          success: t.Boolean(),
          message: t.String()
        })
      }
    }
  )

  // PRAKTIKUM 4 - BEFORE HANDLE
  .get(
    "/admin",
    () => {
      return {
        stats: 99
      };
    },
    {
      beforeHandle({ headers, set }) {
        if (headers.authorization !== "Bearer 123") {
          set.status = 401;
          return {
            success: false,
            message: "Unauthorized"
          };
        }
      },
      response: {
        200: t.Object({
          stats: t.Number()
        }),
        401: t.Object({
          success: t.Boolean(),
          message: t.String()
        })
      }
    }
  )

  // PRAKTIKUM 5 - afterHandle

  .get("/product", () => {
    return { id: 1, name: "Laptop" };
  })

  .onAfterHandle(({ response }) => {
    return {
      success: true,
      message: "data tersedia",
      data: response
    };
  })

  // 2.6 onError - GLOBAL ERROR HANDLER

  .onError(({ code, error, set }) => {

    if (code === "VALIDATION") {
      set.status = 400;
      return {
        success: false,
        message: "Validation Error",
        detail: error.message
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        success: false,
        message: "Route not found"
      };
    }

    if (code === "PARSE") {
      set.status = 400;
      return {
        success: false,
        message: "Body parsing error"
      };
    }

    set.status = 500;
    return {
      success: false,
      message: "Internal Server Error"
    };
  })

  // PRAKTIKUM 6 - LOGIN
  .post(
    "/login",
    ({ body }) => {
      return {
        message: "Login Success",
        user: body.email
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 })
      })
    }
  )

  // GLOBAL ERROR HANDLER
  .onError(({ code, set }) => {

    if (code === "VALIDATION") {
      set.status = 400;
      return {
        success: false,
        error: "Validation Error"
      };
    }

    set.status = 500;
    return {
      success: false,
      error: "Internal Server Error"
    };
  })

  .listen(3000);

console.log("🦊 Server running at http://localhost:3000");