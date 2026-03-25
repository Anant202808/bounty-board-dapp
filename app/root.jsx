import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { WalletProvider } from "./context/WalletContext";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import stylesheet from "./index.css?url";

export function links() {
  return [
    { rel: "stylesheet", href: stylesheet },
    { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  ];
}

export function meta() {
  return [
    { title: "BountyBoard — Decentralized Bounty Platform" },
    { name: "description", content: "Post and hunt bounties on Avalanche" },
  ];
}

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <WalletProvider>
          <ToastProvider>
            <div className="app-bg" />
            <div className="app-content">
              <Navbar />
              <main style={{ flex: 1, paddingBottom: "60px" }}>
                <Outlet />
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </WalletProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
