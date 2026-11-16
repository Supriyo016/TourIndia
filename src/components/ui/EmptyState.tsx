/** Kept apart from primitives.tsx so client components can use it without pulling in the image manifest. */
export function EmptyState({
  title,
  children,
  art,
}: {
  title: string;
  children?: React.ReactNode;
  art?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 p-8 text-center">
      {art}
      <h3>{title}</h3>
      {children && <div className="max-w-md text-ink-2">{children}</div>}
    </div>
  );
}
