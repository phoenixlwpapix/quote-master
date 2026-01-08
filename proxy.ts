import { neonAuthMiddleware } from "@neondatabase/auth/next/server";

export default neonAuthMiddleware({
    // Redirects unauthenticated users to sign-in page
    loginUrl: "/auth/sign-in",
});

export const config = {
    matcher: [
        // Protected routes requiring authentication
        "/",
        "/quotes/:path*",
        "/orders/:path*",
        "/products/:path*",
        "/customers/:path*",
        "/settings/:path*",
        "/account/:path*",
    ],
};
