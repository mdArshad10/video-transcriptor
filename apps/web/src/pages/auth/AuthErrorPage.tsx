const AuthErrorPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Authentication Failed</h1>
        <p className="text-muted-foreground">
          Your session could not be established. Please request a new login token.
        </p>
      </div>
    </div>
  );
};

export default AuthErrorPage;
