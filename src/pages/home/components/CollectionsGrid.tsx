import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface CollectionCard {
  slug: string;
  to: string;
  name: string;
  subtitle: string;
  image: string;
  badge: string;
}

const COLLECTIONS: CollectionCard[] = [
  {
    slug: 'nine-collection',
    to: '/collections/9pm',
    name: 'The 9 Collection',
    subtitle: 'Afnan 9PM Rebel, Elixir, Classic, 9AM Dive & Pour Femme',
    image: '/images/9pm_rebel.jpg',
    badge: 'Fragrances',
  },
  {
    slug: 'hawas',
    to: '/collections/hawas',
    name: 'Rasasi Hawas Collection',
    subtitle: 'Hawas for Him, Ice, Black, Fire & Pink',
    image: '/images/hawas_for_him.jpg',
    badge: 'Fragrances',
  },
  {
    slug: 'cerave',
    to: '/collections/cerave',
    name: 'CeraVe Skincare Collection',
    subtitle: 'Cleansers, toner, moisturizers & retinol serum',
    image: '/images/cerave_foaming_cleanser.jpg',
    badge: 'Skincare',
  },
  {
    slug: 'badee-al-oud',
    to: '/collections/badee-al-oud',
    name: "Bade'e Al Oud Collection",
    subtitle: 'Lattafa Black, Amethyst, Sublime, Noble Blush & White',
    image: '/images/oud_black.png',
    badge: 'Fragrances',
  },
  {
    slug: 'medix',
    to: '/collections/medix',
    name: 'Medix 5.5 Body Care Collection',
    subtitle: 'Vitamin C, Argan Oil, Retinol & Hyaluronic Body Lotions',
    image: '/images/medix_placeholder.svg',
    badge: 'Body Care',
  },
  {
    slug: 'nivea-face-wash',
    to: '/collections/nivea-face-wash',
    name: 'Nivea Men Face Wash',
    subtitle: 'Dark Spot Reduction, Deep Impact & All-In-1 Charcoal',
    image: '/images/nivea_face_wash_placeholder.svg',
    badge: 'Face Care',
  },
  {
    slug: 'dove-soap',
    to: '/collections/dove-beauty-bars',
    name: 'Dove Beauty Bar Collection',
    subtitle: 'Original, Pink, Serum & Cocoa Butter Beauty Bars',
    image: '/images/dove_soap_placeholder.svg',
    badge: 'Bath & Body',
  },
  {
    slug: 'head-shoulders',
    to: '/collections/head-shoulders',
    name: 'Head & Shoulders Collection',
    subtitle: 'Anti-dandruff care for smooth, clean and fuller-looking hair',
    image: '/images/head_shoulders_placeholder.svg',
    badge: 'Hair Care',
  },
  {
    slug: 'nivea-shower-gel',
    to: '/collections/nivea-shower-gel',
    name: 'Nivea Men Shower Gels',
    subtitle: 'Seven refreshing formulas for total body care',
    image: '/images/nivea_shower_gel_placeholder.svg',
    badge: 'Men’s Grooming',
  },
  {
    slug: 'khamrah',
    to: '/collections/khamrah',
    name: 'Lattafa Khamrah Collection',
    subtitle: 'Khamrah, Qahwa and Dukhan signature fragrances',
    image: '/images/khamrah_placeholder.svg',
    badge: 'Fragrances',
  },
  {
    slug: 'signature-women',
    to: '/collections/signature-women',
    name: 'Signature Fragrances for Women',
    subtitle: 'A wide collection of feminine Lattafa signatures',
    image: '/images/signature_women_placeholder.svg',
    badge: 'Women’s Fragrances',
  },
  {
    slug: 'signature-men',
    to: '/collections/signature-men',
    name: 'Signature Fragrances for Men',
    subtitle: 'Bold, fresh, spicy and oud signatures for men',
    image: '/images/signature_men_placeholder.svg',
    badge: 'Men’s Fragrances',
  },
];

export const CollectionsGrid: React.FC = () => {
  const [liveImages, setLiveImages] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/products')
      .then((response) => (response.ok ? response.json() : []))
      .then((products: Array<{ collectionSlug?: string; image?: string; isBestSeller?: boolean; sortOrder?: number }>) => {
        if (!Array.isArray(products)) return;
        const images: Record<string, string> = {};
        const sorted = [...products].sort((a, b) => {
          if (Boolean(a.isBestSeller) !== Boolean(b.isBestSeller)) return a.isBestSeller ? -1 : 1;
          return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
        });
        for (const product of sorted) {
          if (
            product.collectionSlug
            && product.image
            && !product.image.includes('placeholder')
            && !images[product.collectionSlug]
          ) {
            images[product.collectionSlug] = product.image;
          }
        }
        setLiveImages(images);
      })
      .catch(() => {});
  }, []);

  const collections = useMemo(() => COLLECTIONS.map((collection) => ({
    ...collection,
    image: liveImages[collection.slug] || collection.image,
  })), [liveImages]);

  return (
    <section id="collections" className="py-16 sm:py-20 bg-[#FAF8FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#B24BF3] text-xs font-bold uppercase tracking-widest mb-3">
            Shop by Collection
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
            Pick Your Collection
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {collections.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-purple-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-white to-purple-50 flex items-center justify-center p-3 sm:p-5">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="absolute top-1.5 left-1.5 sm:top-4 sm:left-4 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/90 text-[#B24BF3] text-[8px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                {c.badge}
              </div>

              <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                <h3 className="text-xs sm:text-lg font-black mb-0.5 sm:mb-1 line-clamp-2">{c.name}</h3>
                <p className="hidden sm:block text-xs text-white/85 mb-3 leading-relaxed">{c.subtitle}</p>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-white group-hover:gap-2 transition-all">
                  Shop Now
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
