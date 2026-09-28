import { GoogleButton } from "@/components/GoogleButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="screen screen--ink">
      <div className="login">
        <div className="lead" />
        <div>
          <h1 className="wordmark">One&nbsp;Tap</h1>
          <p className="tagline">Know your month in one look.</p>
        </div>
        <div className="spacer" />
        <GoogleButton />
        {error ? (
          <p className="login-error">
            That sign-in did not go through. Try once more.
          </p>
        ) : (
          <p className="fineprint">One login. Nothing to set up.</p>
        )}
      </div>
    </main>
  );
}
