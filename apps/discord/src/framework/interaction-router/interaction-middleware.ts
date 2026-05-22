import { RealmError } from "@realm/common";

/**
 * Simple, Koa-style middleware composition for Discord interaction routing.
 */
export type InteractionMiddleware<TContext> = (
  ctx: TContext,
  next: () => Promise<void>
) => Promise<void>;

/**
 * Compose a list of middlewares into a single runner.
 *
 * Middlewares execute in array order and may mutate/enrich the context.
 */
export function composeMiddleware<TContext>(
  middlewares: readonly InteractionMiddleware<TContext>[]
): (ctx: TContext, terminal: () => Promise<void>) => Promise<void> {
  return async (ctx, terminal) => {
    let index = -1;

    async function dispatch(i: number): Promise<void> {
      if (i <= index) {
        throw new RealmError("Middleware next() called multiple times");
      }
      index = i;

      const middleware = middlewares[i];
      if (!middleware) {
        await terminal();
        return;
      }

      await middleware(ctx, async () => dispatch(i + 1));
    }

    await dispatch(0);
  };
}
