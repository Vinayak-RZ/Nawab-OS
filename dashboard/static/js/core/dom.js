/** DOM query helpers */
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];

export function registerDom(ctx) {
  ctx.$ = $;
  ctx.$$ = $$;
}
