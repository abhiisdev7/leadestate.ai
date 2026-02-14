export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh flex justify-center bg-muted/30 p-4 overflow-hidden">
      <div className="w-full max-w-2xl flex flex-col h-full bg-background rounded-xl border shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}
