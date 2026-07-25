import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-green-700 shadow-sm">
        <Icon className="h-7 w-7" />
      </div>

      <h2 className="mt-6 text-xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
        {description}
      </p>

      {actionLabel && actionHref ? (
        <Button
          asChild
          className="mt-7 bg-green-700 hover:bg-green-800"
        >
          <Link href={actionHref}>
            {actionLabel}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}