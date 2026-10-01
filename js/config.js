/* ------------------------------------------------------------------
   SITE CONFIG — everything you'll want to edit lives here.
   Plain script (no modules) so index.html also works from file://.
------------------------------------------------------------------- */
window.SITE = {
  artist: 'WOP WATSON',            // placeholder — change to the real stylization
  year: new Date().getFullYear(),

  /* MEDIA ----------------------------------------------------------
     Drop files in /assets and they replace the placeholders on their own.
     Naming convention (change a path here if yours differ, e.g. .webp / .mov):
       assets/video/video-01.mp4 … video-05.mp4
       assets/images/image-01.jpg … image-10.jpg
     Missing file = placeholder stays. Nothing breaks.

     Where each slot lives on the page:
       video-01  hero background loop (full-bleed, muted)
       video-02…05  "Films" horizontal reel
       image-01  hero poster (shows while video-01 loads)
       image-02  about — tall portrait        image-03  about — small inset
       image-04…09  gallery (also the hover previews in the track list)
       image-10  footer backdrop
  -------------------------------------------------------------------*/
  media: {
    video: {
      1: { src: 'assets/video/video-01.mp4' },
      2: { src: 'assets/video/video-02.mp4' },
      3: { src: 'assets/video/video-03.mp4' },
      4: { src: 'assets/video/video-04.mp4' },
      5: { src: 'assets/video/video-05.mp4' }
      // optional per-video poster:  poster: 'assets/images/video-02-poster.jpg'
    },
    image: {
      1: { src: 'assets/images/image-01.jpg' },
      2: { src: 'assets/images/image-02.jpg' },
      3: { src: 'assets/images/image-03.jpg' },
      4: { src: 'assets/images/image-04.jpg' },
      5: { src: 'assets/images/image-05.jpg' },
      6: { src: 'assets/images/image-06.jpg' },
      7: { src: 'assets/images/image-07.jpg' },
      8: { src: 'assets/images/image-08.jpg' },
      9: { src: 'assets/images/image-09.jpg' },
      10: { src: 'assets/images/image-10.jpg' }
    }
  },

  /* MUSIC list (hover a row → image follows the cursor) ---------------*/
  tracks: [
    { title: 'Track Title One',   meta: 'Single · 2026', img: 4, href: '#' },
    { title: 'Track Title Two',   meta: 'ft. Guest Name', img: 5, href: '#' },
    { title: 'Track Title Three', meta: 'Single · 2025', img: 6, href: '#' },
    { title: 'Track Title Four',  meta: 'Mixtape · 2025', img: 7, href: '#' },
    { title: 'Track Title Five',  meta: 'ft. Guest Name', img: 8, href: '#' }
  ],

  /* SHOP -----------------------------------------------------------
     Static placeholders for now. When the store decision is made,
     replace loadProducts() — the rest of the page only needs an array
     of { title, price, tag, url, image?, tone }.

     Printify note: Printify products sync INTO Shopify (Printify's
     Shopify app), so the site only ever needs to talk to Shopify.
     Shopify route = Storefront API (headless, full design control) or
     Buy Button (embed, less control).
  -------------------------------------------------------------------*/
  products: [
    { title: 'Logo Tee — Black',   price: '$35', tag: 'New',      url: '#', tone: 1 },
    { title: 'Heavyweight Hoodie', price: '$75', tag: 'Limited',  url: '#', tone: 2 },
    { title: 'Dad Cap',            price: '$30', tag: '',         url: '#', tone: 3 },
    { title: 'Tour Poster',        price: '$25', tag: 'Pre-order', url: '#', tone: 4 }
  ],

  async loadProducts() {
    return this.products;

    /* Shopify Storefront API sketch — fill in your shop + public token:
    const res = await fetch('https://YOUR-SHOP.myshopify.com/api/2025-10/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': 'YOUR_PUBLIC_STOREFRONT_TOKEN'
      },
      body: JSON.stringify({ query: `{
        products(first: 8) { nodes {
          title onlineStoreUrl
          featuredImage { url altText }
          priceRange { minVariantPrice { amount currencyCode } }
        } }
      }` })
    });
    const { data } = await res.json();
    return data.products.nodes.map((p, i) => ({
      title: p.title,
      price: '$' + Math.round(p.priceRange.minVariantPrice.amount),
      url: p.onlineStoreUrl,
      image: p.featuredImage && p.featuredImage.url,
      tone: (i % 4) + 1
    }));
    */
  },

  socials: [
    { label: 'Instagram', href: '#' },
    { label: 'YouTube',   href: '#' },
    { label: 'Spotify',   href: '#' },
    { label: 'TikTok',    href: '#' }
  ]
};
