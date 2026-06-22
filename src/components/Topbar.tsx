type TopbarProps = {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
};

export default function Topbar({ title, subtitle, action }: TopbarProps) {
  return (
    <header className="flex items-start justify-between gap-4 mb-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[32px] sm:text-[50px] leading-[1.18] tracking-[-2px] font-light text-ink-black">
          {title}
        </h1>
        <p className="text-[16px] text-graphite">{subtitle}</p>
      </div>
      {action && <div className="shrink-0 mt-2">{action}</div>}
    </header>
  );
}
