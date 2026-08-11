import type { Metadata, Viewport } from "next";
import "./globals.css";

const [repositoryOwner = "", repositoryName = ""] =
  process.env.GITHUB_REPOSITORY?.split("/") ?? [];
const githubPagesUrl = repositoryName.endsWith(".github.io")
  ? `https://${repositoryName}/`
  : repositoryOwner && repositoryName
    ? `https://${repositoryOwner}.github.io/${repositoryName}/`
    : "http://localhost:3000/";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? githubPagesUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Retraites, autrement — La doctrine expliquée",
  description:
    "Comprendre et explorer une proposition de réforme des retraites fondée sur la solidarité, les comptes notionnels et la capitalisation.",
  applicationName: "Retraites, autrement",
  authors: [{ name: "Doctrine retraites" }],
  keywords: [
    "retraites",
    "comptes notionnels",
    "garantie vieillesse",
    "capitalisation",
    "réforme",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "Retraites, autrement",
    description: "Garantir. Contribuer. Posséder. La doctrine retraites expliquée point par point.",
    siteName: "Retraites, autrement",
    images: [
      {
        url: "og.png",
        width: 1734,
        height: 907,
        alt: "Retraites, autrement — Garantir. Contribuer. Posséder. 1 050 €, 18 %, 5 %.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Retraites, autrement",
    description: "Garantir. Contribuer. Posséder. La doctrine retraites expliquée point par point.",
    images: ["og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#132235",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
