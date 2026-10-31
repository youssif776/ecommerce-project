# ecommerce-project

## Running locally

Serve this folder with a local web server and open `index.html`. The product
catalog and cart work with the included sample data and browser local storage.

To use live products and account authentication, set `SUPABASE_ANON_KEY` in
`js/app.js` to the project's Supabase **anon/public** key. The key must never
be a service-role key. Without a configured key, the site intentionally uses
sample products and displays a status message; authentication is unavailable.
