import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJobs, fetchTasks, toggleTask } from '../lib/api';
import { Job, Task } from '../types';
import { Kanban, Calendar, Clock, DollarSign, CheckCircle2, User, AlertCircle } from 'lucide-react';

export const JobsKanbanPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  const toggleTaskMutation = useMutation({
    mutationFn: toggleTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const columns: Array<{ title: string; status: Job['status']; color: string }> = [
    { title: 'Scheduled & Dispatched', status: 'SCHEDULED', color: 'border-blue-500/40 text-blue-400' },
    { title: 'In Progress / On-Site', status: 'IN_PROGRESS', color: 'border-amber-500/40 text-amber-400' },
    { title: 'Completed & Billed', status: 'COMPLETED', color: 'border-emerald-500/40 text-emerald-400' },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Field Jobs & Action Tasks</h1>
          <p className="text-xs text-slate-400">
            Kanban pipeline automatically updated as technicians record on-site voice debriefs
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colJobs = jobs.filter((j) => j.status === col.status);

          return (
            <div key={col.status} className="space-y-4 flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.status === 'COMPLETED' ? 'bg-emerald-400' : col.status === 'IN_PROGRESS' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                  <h2 className="text-sm font-bold text-slate-200">{col.title}</h2>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {colJobs.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-3.5 p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 min-h-[480px]">
                {jobsLoading ? (
                  <p className="text-xs text-slate-500 text-center py-10">Loading jobs...</p>
                ) : colJobs.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 text-xs">
                    No jobs in {col.title}
                  </div>
                ) : (
                  colJobs.map((job) => (
                    <div
                      key={job.id}
                      className="glass-panel p-4 rounded-xl border border-slate-800/90 bg-slate-900/80 hover:border-slate-700 transition shadow-md space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-white leading-snug">{job.title}</h3>
                        {job.quotedAmount && (
                          <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                            ${job.quotedAmount.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {job.description && (
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 font-medium text-slate-300">
                          <User className="w-3 h-3 text-emerald-400" />
                          <span>{job.customer?.name || 'Client'}</span>
                        </div>

                        {job.laborHours && (
                          <span className="font-mono text-slate-400">
                            {job.laborHours}h labor
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Tasks Checklist */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 mt-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Extracted Action Tasks & Follow-ups</h2>
            <p className="text-xs text-slate-400">Check off tasks as completed in the field or office</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">
            {tasks.filter((t) => t.status === 'DONE').length}/{tasks.length} Completed
          </span>
        </div>

        {tasks.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No action tasks pending.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tasks.map((task) => {
              const isDone = task.status === 'DONE';
              return (
                <div
                  key={task.id}
                  onClick={() => toggleTaskMutation.mutate(task.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                    isDone
                      ? 'bg-slate-950/60 border-slate-800/40 text-slate-500'
                      : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40 text-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                    {task.priority}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
