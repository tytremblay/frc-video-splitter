export function MatchesTableHeader() {
  return (
    <thead>
      <tr>
        <th scope="col" className="sticky top-0 border-b border-border/60 bg-card/95 py-2.5 pl-4 pr-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 backdrop-blur sm:pl-6">
          Match
        </th>
        <th scope="col" className="sticky top-0 hidden border-b border-border/60 bg-card/95 px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 backdrop-blur sm:table-cell">
          Description
        </th>
        <th scope="col" className="sticky top-0 border-b border-border/60 bg-card/95 px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 backdrop-blur">
          In
        </th>
        <th scope="col" className="sticky top-0 border-b border-border/60 bg-card/95 px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 backdrop-blur">
          Out
        </th>
        <th scope="col" className="sticky top-0 border-b border-border/60 bg-card/95 px-3 py-2.5 backdrop-blur w-16">
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
  );
}
