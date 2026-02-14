export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      <div className="mx-auto w-full max-w-6xl flex-1 flex flex-col bg-white">
        {children}
      </div>
    </div>
  );
}
