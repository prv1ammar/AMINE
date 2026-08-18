import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminAuthProvider } from "@/features/admin/AdminAuthContext";
import { HomePage } from "@/pages/HomePage";
import { CollectionPage } from "@/pages/CollectionPage";
import { ProductPage } from "@/pages/ProductPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { LookbookPage } from "@/pages/LookbookPage";
import { TarifsPage } from "@/pages/TarifsPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminCollectionsPage } from "@/pages/admin/AdminCollectionsPage";
import { AdminInquiriesPage } from "@/pages/admin/AdminInquiriesPage";
import { AdminNewsletterPage } from "@/pages/admin/AdminNewsletterPage";
import { AdminSocialImagesPage } from "@/pages/admin/AdminSocialImagesPage";
import { AdminLookbookPage } from "@/pages/admin/AdminLookbookPage";

export default function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="collection" element={<CollectionPage />} />
          <Route path="produit/:slug" element={<ProductPage />} />
          <Route path="commande" element={<CheckoutPage />} />
          <Route path="lookbook" element={<LookbookPage />} />
          <Route path="tarifs" element={<TarifsPage />} />
          <Route path="a-propos" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route element={<RequireAdmin />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminProductsPage />} />
            <Route path="produits" element={<AdminProductsPage />} />
            <Route path="collections" element={<AdminCollectionsPage />} />
            <Route path="demandes" element={<AdminInquiriesPage />} />
            <Route path="newsletter" element={<AdminNewsletterPage />} />
            <Route path="instagram" element={<AdminSocialImagesPage />} />
            <Route path="lookbook" element={<AdminLookbookPage />} />
          </Route>
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
