# Email login and account flow

Customers enter only their email, then verify a six-digit code. New accounts are created only after verification. Existing accounts, orders and carts retain the same user ID. The old login/register API paths now request a code; use /api/auth/otp/verify to complete authentication.

Codes last five minutes, allow five attempts and can be used once. Resend has a 60-second email cooldown plus IP limits. The backend must have working email delivery configuration (the existing SMTP or email-provider configuration). It never treats skipped email delivery as success and does not return codes to the client.

Sessions use random HttpOnly cookie credentials; only hashes are stored in MongoDB. They survive browser restarts, renew on authenticated requests and are revoked on logout. The cookie and server session have a rolling 400-day lifetime. Browser storage deletion, browser privacy restrictions, account blocking or inactivity beyond that lifetime can require verification again; an unlimited browser cookie cannot be guaranteed. Valid old JWT cookies migrate to this session format. Expired old tokens require one new login.

Default delivery-address name and phone populate the account profile. The account page supports adding, editing, removing and selecting a default address without needing items in the cart. The verified email cannot be changed through profile editing.

Signed-out carts show Login, Continue shopping and live catalog recommendations. Login returns customers to their saved bag. Account navigation opens the account dashboard on desktop and mobile. Toasts are dismissible, show at most three at once and no longer show unsolicited welcome promotions.

Validation: run `npm run test --prefix backend`, `npm run build --prefix client`, and ESLint on the changed client files. Authentication tests use isolated model and email doubles, so they do not modify customer data or send mail. Before deployment, verify actual email receipt and login in a browser against the intended environment. Deploy client and backend together. Backend startup initializes the OTP and session indexes before accepting traffic.
