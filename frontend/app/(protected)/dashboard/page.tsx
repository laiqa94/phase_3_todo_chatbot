"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Task } from "@/types/task";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use mock data for now
    const mockTasks: Task[] = [
      {
        id: 1,
        title: "Sample Task 1",
        description: "This is a sample task",
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 1
      },
      {
        id: 2,
        title: "Sample Task 2",
        description: "This is another sample task",
        completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 1
      }
    ];
    
    setTasks(mockTasks);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:gap-6 p-4 sm:p-0">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;

  return (
    <div className="grid gap-4 sm:gap-6 p-4 sm:p-0">
      <div className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">Overview of your tasks.</p>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <StatCard label="Total" value={total} href="/tasks?status=all" />
        <StatCard label="Active" value={active} href="/tasks?status=pending" />
        <StatCard label="Completed" value={completed} href="/tasks?status=completed" />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <h2 className="font-medium text-zinc-900 text-center sm:text-left">Quick actions</h2>
        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link
            href="/tasks"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 text-center transition-colors"
          >
            View tasks
          </Link>
          <Link
            href="/tasks?compose=1"
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 text-center transition-colors"
          >
            Add task
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 hover:bg-zinc-50 transition-colors shadow-sm hover:shadow-md">
      <div className="text-center">
        <div className="text-sm text-zinc-600">{label}</div>
        <div className="mt-1 text-2xl sm:text-3xl font-semibold text-zinc-900">{value}</div>
      </div>
    </Link>
  );
}
