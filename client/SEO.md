# BabyCure search indexing

Run `npm run build` and `npm run verify:seo` from `client`. The build reads every page of the public product API once, then uses that same catalog for the sitemap and product HTML. A failed or incomplete catalog stops the build so an incomplete product catalog cannot silently replace the current deployment.

Set `SEO_API_URL` to an absolute public backend API URL when it differs from `VITE_API_BASE_URL`. Local relative `/api` configuration uses the existing production backend for SEO generation. Rebuild and deploy after adding or removing products or changing names, prices, stock, images or descriptions; static HTML reflects the catalog at build time.

The `/products` directory links to every active product. Each product has its own canonical URL, title, description, image, Product and BreadcrumbList markup, and readable HTML before JavaScript runs. The sitemap includes product image URLs and actual product update times. Vercel routes public pages to their generated HTML.

After deployment:

1. Verify ownership of `babycureindia.com` in Google Search Console using the owner's account. Submit `https://www.babycureindia.com/sitemap.xml`.
2. Inspect the homepage, `/products` and representative product URLs using URL Inspection, run the live test, and request indexing. Confirm the returned HTML and canonical URL match the product rather than the homepage.
3. Test a product URL in Google's Rich Results Test. Review Product snippets / Merchant listings reports after Google crawls the deployment.
4. Set up Google Merchant Center, verify the website and enable free listings. Supply current product data and the actual shipping and return policies. Add GTINs only when assigned to the real products; never invent identifiers or reviews.
5. Monitor indexing exclusions, crawl failures and branded/product queries. A sitemap helps discovery but does not guarantee indexing or rankings.

Search Console and Merchant Center setup require access to the owner's Google accounts and have not been performed by these code changes. Public deployment has not been performed.

Google references: https://developers.google.com/search/docs/appearance/structured-data/product and https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
