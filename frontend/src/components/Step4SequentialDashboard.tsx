import React, { useEffect, useState } from 'react';
import {
  Clock,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { getSessionStatus } from '../services/api';
import { AgentExecutionStatus, AgentState, SessionStatusResponse } from '../types';

interface Step4SequentialDashboardProps {
  sessionId: string;
  onAuditCompleted: () => void;
}

const AGENT_METADATA: Record<
  string,
  { order: number; roleDescription: string; iconColor: string }
> = {
  'ATS Rejection Agent': {
    order: 1,
    roleDescription: 'Parses resume layout, text columns, tables, headers, and keyword compliance.',
    iconColor: 'from-blue-500 to-indigo-600',
  },
  'Recruiter Rejection Agent': {
    order: 2,
    roleDescription: 'Simulates the critical 6-second recruiter glance for career trajectory and immediate impact.',
    iconColor: 'from-purple-500 to-indigo-600',
  },
  'Technical Rejection Agent': {
    order: 3,
    roleDescription: 'Validates engineering rigor, architectural depth, stack realism, and technical claims.',
    iconColor: 'from-cyan-500 to-blue-600',
  },
  'Experience Rejection Agent': {
    order: 4,
    roleDescription: 'Scrutinizes bullet strength, replacing passive duty lists with Action + Context + Results.',
    iconColor: 'from-emerald-500 to-teal-600',
  },
  'Formatting Rejection Agent': {
    order: 5,
    roleDescription: 'Checks typographic hierarchy, date consistency, bullet punctuation, and visual symmetry.',
    iconColor: 'from-amber-500 to-orange-600',
  },
  'Credibility Rejection Agent': {
    order: 6,
    roleDescription: 'Examines employment date chronology, ownership inflation, and suspicious metrics.',
    iconColor: 'from-rose-500 to-pink-600',
  },
  'Job Match Rejection Agent': {
    order: 7,
    roleDescription: 'Assesses rigorous alignment with mandatory vs preferred employer job requirements.',
    iconColor: 'from-indigo-500 to-purple-600',
  },
};

export const Step4SequentialDashboard: React.FC<Step4SequentialDashboardProps> = ({
  sessionId,
  onAuditCompleted,
}) => {
  const [sessionData, setSessionData] = useState<SessionStatusResponse | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const data = await getSessionStatus(sessionId);
        if (!isMounted) return;
        setSessionData(data);
        if (data.status === 'completed') {
          clearInterval(interval);
          setTimeout(() => {
            onAuditCompleted();
          }, 1500);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setPollError(err instanceof Error ? err.message : 'Polling failed');
      }
    }, 1200);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sessionId, onAuditCompleted]);

  // Render Status Badge
  const renderStatusBadge = (status: AgentExecutionStatus, attemptCount: number, _retryReason?: string | null) => {
    switch (status) {
      case 'queued':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 text-xs font-medium">
            <Clock className="w-3 h-3" />
            <span>Queued</span>
          </span>
        );
      case 'running':
        return (
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-semibold animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
            <span>Evaluating...</span>
          </span>
        );
      case 'retrying':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Backing Off (Try {attemptCount})</span>
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Completed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Failed (Isolated)</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-500 text-xs">
            {status}
          </span>
        );
    }
  };

  const ORDERED_AGENT_NAMES = [
    'ATS Rejection Agent',
    'Recruiter Rejection Agent',
    'Technical Rejection Agent',
    'Experience Rejection Agent',
    'Formatting Rejection Agent',
    'Credibility Rejection Agent',
    'Job Match Rejection Agent',
  ];

  const getAgentsList = (): AgentState[] => {
    if (!sessionData?.agents) {
      return ORDERED_AGENT_NAMES.map((name) => ({
        agent_name: name,
        status: 'queued',
        attempt_count: 0,
        max_retries: 3,
        findings_count: 0,
      }));
    }

    // If sessionData.agents is already an Array
    if (Array.isArray(sessionData.agents)) {
      return sessionData.agents;
    }

    // If sessionData.agents is a Dictionary / Object
    const dict = sessionData.agents as Record<string, any>;
    return ORDERED_AGENT_NAMES.map((name) => {
      const raw = dict[name];
      if (raw) {
        return {
          agent_name: name,
          status: (raw.status?.toLowerCase() || 'queued') as AgentExecutionStatus,
          attempt_count: raw.attempt_count || 0,
          max_retries: 3,
          retry_reason: raw.retry_reason || null,
          findings_count: raw.findings_count || 0,
          error_message: raw.error_msg || raw.error_message || null,
          started_at: raw.started_at,
          completed_at: raw.completed_at,
        };
      }
      return {
        agent_name: name,
        status: 'queued',
        attempt_count: 0,
        max_retries: 3,
        findings_count: 0,
      };
    });
  };

  const agents: AgentState[] = getAgentsList();
  const completedCount = agents.filter((a) => a.status === 'completed').length;
  const progressPercent = Math.round((completedCount / 7) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Step 4 of 6 • Sequential Adversarial Audit</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Live Agent Execution Dashboard
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Seven specialized hiring agents are evaluating your resume sequentially. Each agent acts independently to identify concrete reasons to reject the candidate.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold uppercase tracking-wider text-slate-400">
            Pipeline Progress: {completedCount} of 7 Agents Completed
          </span>
          <span className="font-bold text-indigo-400">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {pollError && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
          Reconnecting to backend status stream... ({pollError})
        </div>
      )}

      {/* Agent Cards Grid */}
      <div className="space-y-3">
        {agents.map((agent, index) => {
          const meta = AGENT_METADATA[agent.agent_name] || {
            order: index + 1,
            roleDescription: 'Adversarial evaluation agent.',
            iconColor: 'from-slate-500 to-slate-700',
          };

          const isCurrentRunning = agent.status === 'running';

          return (
            <div
              key={agent.agent_name}
              className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${
                isCurrentRunning
                  ? 'bg-slate-900/90 border-indigo-500/50 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30 scale-[1.01]'
                  : agent.status === 'completed'
                  ? 'bg-slate-900/40 border-slate-800/80'
                  : 'bg-slate-900/20 border-slate-850 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${meta.iconColor} flex items-center justify-center text-white text-xs font-black shadow-md flex-shrink-0 mt-0.5`}
                  >
                    #{meta.order}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {agent.agent_name}
                      </h3>
                      {agent.findings_count > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-semibold">
                          {agent.findings_count} objections identified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 max-w-xl">
                      {meta.roleDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  {renderStatusBadge(agent.status, agent.attempt_count, agent.retry_reason)}
                </div>
              </div>

              {agent.error_message && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  <span className="font-semibold">Notice:</span> {agent.error_message} (Pipeline continued safely via fault isolation).
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sessionData?.status === 'completed' && (
        <div className="pt-4 text-center">
          <button
            onClick={onAuditCompleted}
            className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
          >
            <span>View Aggregated Rejection Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
