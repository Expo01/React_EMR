function MinimalLayout({ children }) {
  return (
    <main className="min-h-screen w-full bg-emr-background">
      {children}
    </main>
  );
}

export default MinimalLayout;