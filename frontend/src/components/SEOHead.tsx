import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  lang?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: string;
}

const BASE_URL = "https://app-bit.vercel.app";
const DEFAULT_OG_IMAGE = "/landing-bg3.webp";
const BRAND = "App BiT";

export default function SEOHead({
  title,
  description,
  lang,
  canonicalPath,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
}: SEOHeadProps) {
  const fullTitle = title.includes(BRAND) ? title : `${title} | ${BRAND}`;
  const canonicalUrl = canonicalPath ? `${BASE_URL}${canonicalPath}` : undefined;

  return (
    <Helmet>
      {lang && <html lang={lang} />}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="robots" content="index, follow" />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
}
