# AliothDigital website

## Deploying the canonical URL fix on Hostinger

The preferred homepage is `https://aliothdigital.com/`. The root `.htaccess`
permanently redirects explicit `/index.html` requests and the production `www`
hostname to that address. Other pages keep their paths, query strings are
preserved, and HTTP requests are upgraded to HTTPS. Localhost and the test
subdomain are excluded from these redirects.

1. In Hostinger hPanel, open the production website's **File Manager**, then
   its `public_html` directory.
2. Download a copy of the existing hosted `.htaccess`. If it contains other
   hosting rules, retain those and put this checkout's rewrite rules above them.
   Remove the old rule that returns 404 for homepage query strings.
3. Upload the updated root HTML files and the three HTML files in `blog/`,
   keeping their directory structure. Their homepage links now point to `/`.
4. Save the `.htaccess` changes and purge the website/CDN cache if enabled.
5. Verify the responses below, then rerun the SEO audit. Google Search Console's
   URL Inspection can be used to request a fresh crawl of the preferred homepage.

| Request | Expected response |
| --- | --- |
| `https://aliothdigital.com/` | 200, with its existing self-referencing canonical |
| `https://aliothdigital.com/index.html` | 301 to `https://aliothdigital.com/` |
| `https://www.aliothdigital.com/` | 301 to `https://aliothdigital.com/` |
| `https://www.aliothdigital.com/index.html` | 301 to `https://aliothdigital.com/` |
| `https://www.aliothdigital.com/services.html` | 301 to `https://aliothdigital.com/services.html` |
| `https://aliothdigital.com/index.html?utm_source=test` | 301 to `https://aliothdigital.com/?utm_source=test` |
| `https://aliothdigital.com/?utm_source=test` | 200 |

Check redirects in browser developer tools under **Network**, with caching
disabled, or with `curl -I URL`. A plain Python static preview server does not
execute `.htaccess`; actual redirect responses must be checked on Apache or
Hostinger after deployment. Keep the existing canonical tags and sitemap URLs.
