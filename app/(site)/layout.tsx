import { Cursor } from "@/components/motion/Cursor";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

/** 一般公開ページ共通レイアウト。/admin・/api配下はこのグループに含めない。 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cursor />
      <Nav />
      {children}
      <Footer />
    </>
  );
}
