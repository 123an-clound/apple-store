import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Phone, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { getAllProductCards, getProductCardBySlug } from '@/lib/products';
import { SITE_URL } from '@/lib/constants';
import { getContact } from '@/lib/settings';
import LeadForm from '@/components/LeadForm';
import Footer from '@/components/Footer';
import { formatPrice } from '@/lib/helpers';

export const revalidate = 60;

export async function generateStaticParams() {
  const cards = await getAllProductCards();
  return cards.map((card) => ({ slug: card.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const card = await getProductCardBySlug(slug);
  if (!card) return {};

  // lowestPrice, not variants[0]: the first variant isn't necessarily the cheapest.
  const title = `${card.name} — Giá từ ${formatPrice(card.lowestPrice)} | Apple Store`;
  const description =
    card.description || `${card.name} chính hãng, giá tốt, bảo hành uy tín tại Apple Store.`;
  const url = `${SITE_URL}/san-pham/${slug}`;
  const image = card.images[0];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: image ? [{ url: image, width: 1200, height: 1200, alt: card.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const card = await getProductCardBySlug(slug);
  if (!card) notFound();
  const { telUrl, zaloUrl } = await getContact();

  const url = `${SITE_URL}/san-pham/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: card.name,
    description: card.description || undefined,
    image: card.images.length > 0 ? card.images : undefined,
    offers: card.variants.map((v) => ({
      '@type': 'Offer',
      url,
      priceCurrency: 'VND',
      price: Number.isFinite(v.price) ? v.price : undefined,
      availability: v.soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      name: v.spec,
    })),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: card.name, item: url },
    ],
  };

  return (
    <>
    {/* id="products": target of the layout's "Bỏ qua đến sản phẩm" skip link on this page too. */}
    <main id="products" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbLd]).replace(/</g, '\\u003c') }}
      />
      <div className="section-shell section-padding py-6 sm:py-10">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-caption">
            <li><Link href="/" className="hover:text-[var(--text-primary)] hover:underline focus-ring rounded">Trang chủ</Link></li>
            <li aria-hidden="true"><ChevronRight size={14} /></li>
            <li><Link href="/#products" className="hover:text-[var(--text-primary)] hover:underline focus-ring rounded">{card.series}</Link></li>
            <li aria-hidden="true"><ChevronRight size={14} /></li>
            <li aria-current="page" className="font-medium text-[var(--text-primary)]">{card.name}</li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            {card.images.length > 0 ? (
              <div className="ui-card overflow-hidden" style={{ position: 'relative', aspectRatio: '1 / 1' }}>
                <Image
                  src={card.images[0]}
                  alt={card.name}
                  fill
                  priority
                  className="object-contain"
                  style={{ padding: '8%' }}
                  sizes="(max-width: 1023px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div
                className="ui-card flex items-center justify-center text-[var(--text-muted)]"
                style={{ aspectRatio: '1 / 1' }}
              >
                Chưa có ảnh
              </div>
            )}

            {card.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
                {card.images.slice(1).map((src, i) => (
                  <div
                    key={src}
                    className="ui-card overflow-hidden"
                    style={{ position: 'relative', aspectRatio: '1 / 1' }}
                  >
                    <Image
                      src={src}
                      alt={`${card.name} - ảnh ${i + 2}`}
                      fill
                      className="object-contain"
                      style={{ padding: '8%' }}
                      sizes="120px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="badge badge-primary">
                  <Sparkles size={11} style={{ marginRight: 4 }} />
                  {card.series}
                </span>
                <span className="badge" style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={11} style={{ marginRight: 4 }} />
                  Chính hãng
                </span>
              </div>
              <h1 className="text-display text-[var(--text-primary)]">{card.name}</h1>
              <p className="text-body mt-2">Chọn phiên bản phù hợp với bạn</p>
            </div>

            <div>
              <p className="text-caption uppercase tracking-widest mb-2">Dung lượng / RAM &amp; giá</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {card.variants.map((v, i) => (
                  <div
                    key={`${v.spec}-${v.price}-${i}`}
                    className="ui-card"
                    style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span className="font-semibold text-[var(--text-primary)]">{v.spec}</span>
                    <span style={{ textAlign: 'right' }}>
                      <span className="product-card-price-value">{v.priceFormatted}</span>
                      {v.originalPriceFormatted && <s className="text-caption" style={{ display: 'block' }}>{v.originalPriceFormatted}</s>}
                      {v.soldOut && <span className="text-caption" style={{ display: 'block', color: 'var(--color-error)' }}>Tạm hết hàng</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {card.description && (
              <div className="ui-card" style={{ padding: '16px 20px' }}>
                <p className="text-caption uppercase tracking-widest mb-2">Mô tả</p>
                <p className="text-body">{card.description}</p>
              </div>
            )}

            <LeadForm product={card.name} />

            <div className="flex gap-3">
              <a href={telUrl} className="btn-primary flex-1 gap-3">
                <Phone size={17} />
                Gọi mua ngay
              </a>
              <a href={zaloUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 gap-3">
                <MessageCircle size={17} />
                Tư vấn Zalo
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}
