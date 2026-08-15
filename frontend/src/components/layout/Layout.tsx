import { Outlet } from "react-router-dom";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
