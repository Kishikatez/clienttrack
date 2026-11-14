import LoginWrapper from "./LoginWrapper";

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string }>;
}) {
  const params = await searchParams;
  const notice =
    params.registered === "1"
      ? "registration_success"
      : params.error === "verification"
        ? "verification"
        : undefined;

  return <LoginWrapper notice={notice} />;
}
