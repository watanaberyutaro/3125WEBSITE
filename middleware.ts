import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

const LEGACY_QUERY_REDIRECT_PATHS = new Set(["/work-detail.php", "/news-detail.php"]);

/**
 * work-detail.php?id=... / news-detail.php?id=... のようにクエリ文字列で
 * 対象が変わる旧URLをSupabaseの redirects テーブルから解決する。
 * from_pathは「パス+クエリ文字列」の完全一致で保存されている
 * （scripts/migrate-from-php.ts参照）。対象パスのみに絞って呼び出すため
 * 通常ページの表示速度には影響しない。
 */
async function resolveLegacyRedirect(request: NextRequest): Promise<NextResponse | null> {
  const { pathname, search } = request.nextUrl;
  if (!LEGACY_QUERY_REDIRECT_PATHS.has(pathname)) return null;

  const fromPath = `${pathname}${search}`;
  const supabase = createPublicClient();
  const { data } = await supabase.from("redirects").select("to_path, status_code").eq("from_path", fromPath).maybeSingle();
  if (!data) return null;

  const url = request.nextUrl.clone();
  url.pathname = data.to_path;
  url.search = "";
  return NextResponse.redirect(url, data.status_code);
}

/**
 * /admin配下の認可ガード。
 * Supabaseのセッションcookieをリクエスト毎に検証・更新し、未認証なら
 * /admin/login へリダイレクトする。ログイン済みで/admin/loginへ来た場合は
 * ダッシュボードへ戻す。
 *
 * ここでの判定はセッションの有無のみ（=ログイン済みか）。
 * profiles.role のチェック(admin/editor)は各Server Componentでも
 * 再確認する多層防御構成にしている(app/admin/layout.tsx参照)。
 */
export async function middleware(request: NextRequest) {
  const legacyRedirect = await resolveLegacyRedirect(request);
  if (legacyRedirect) return legacyRedirect;

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/work-detail.php", "/news-detail.php"],
};
