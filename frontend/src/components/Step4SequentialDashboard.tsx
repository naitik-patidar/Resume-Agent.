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
  { order: number; roleDescription: string; bgColor: string }
> = {
  'ATS Rejection Agent': {
    order: 1,
    roleDescription: 'Parses resume layout, text columns, tables, headers, and keyword compliance.',
    bgColor: 'bg-[#FFE2C8]',
  },
  'Recruiter Rejection Agent': {
    order: 2,
    roleDescription: 'Simulates the critical 6-second recruiter glance for career trajectory and immediate impact.',
    bgColor: 'bg-[#C9B7F5]',
  },
  'Technical Rejection Agent': {
    order: 3,
    roleDescription: 'Validates engineering rigor, architectural depth, stack realism, and technical claims.',
    bgColor: 'bg-[#FFCCD5]',
  },
  'Experience Rejection Agent': {
    order: 4,
    roleDescription: 'Scrutinizes bullet strength, replacing passive duty lists with Action + Context + Results.',
    bgColor: 'bg-[#DDF282]',
  },
  'Formatting Rejection Agent': {
    order: 5,
    roleDescription: 'Checks typographic hierarchy, date consistency, bullet punctuation, and visual symmetry.',
    bgColor: 'bg-[#BAE6FD]',
  },
  'Credibility Rejection Agent': {
    order: 6,
    roleDescription: 'Examines employment date chronology, ownership inflation, and suspicious metrics.',
    bgColor: 'bg-[#FEF08A]',
  },
  'Job Match Rejection Agent': {
    order: 7,
    roleDescription: 'Assesses rigorous alignment with mandatory vs preferred employer job requirements.',
    bgColor: 'bg-[#A7F3D0]',
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
          <span className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-white text-slate-700 border-2 border-black/40 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Queued</span>
          </span>
        );
      case 'running':
        return (
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#FEF08A] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
            <span>Evaluating...</span>
          </span>
        );
      case 'retrying':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-[#FFE2C8] text-amber-950 border-2 border-black text-xs font-bold shadow-[1px_1px_0px_0px_#000]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>Retry {attemptCount}/3</span>
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-[#DDF282] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
            <span>Completed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-[#FFCCD5] text-rose-950 border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-black/30 text-xs font-bold">
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

    if (Array.isArray(sessionData.agents)) {
      return sessionData.agents;
    }

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
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#FEF08A] border-2 border-black text-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Step 4 of 6 • Sequential Adversarial Audit</span>
        </div>

        <div>
          <div className="inline-block bg-[#C9B7F5] border-2 border-black rounded-xl px-5 py-2 shadow-[3px_3px_0px_0px_#000]">
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Live Agent Execution Dashboard
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-xl mx-auto">
          Seven specialized hiring agents are evaluating your resume sequentially. Each agent acts independently to identify concrete reasons to reject the candidate.
        </p>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-black uppercase tracking-wider text-black">
            Pipeline Progress: {completedCount} of 7 Agents Completed
          </span>
          <span className="font-mono font-black text-sm text-black">{progressPercent}%</span>
        </div>
        <div className="w-full h-3.5 bg-[#FAF6F0] rounded-full overflow-hidden border-2 border-black">
          <div
            className="h-full bg-black transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {pollError && (
        <div className="p-4 rounded-xl bg-[#FFCCD5] border-2 border-black text-rose-950 text-xs sm:text-sm font-bold flex items-center justify-between shadow-[2px_2px_0px_0px_#000]">
          <span>{pollError}</span>
        </div>
      )}

      {/* Agent Cards Stack */}
      <div className="space-y-3">
        {agents.map((agent, idx) => {
          const meta = AGENT_METADATA[agent.agent_name] || {
            order: idx + 1,
            roleDescription: 'Specialized evaluator examining candidate claims.',
            bgColor: 'bg-white',
          };
          const isCurrent = agent.status === 'running';

          return (
            <div
              key={agent.agent_name}
              className={`border-2 border-black rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isCurrent
                  ? 'bg-[#FEF08A] shadow-[4px_4px_0px_0px_#000] scale-[1.01]'
                  : agent.status === 'completed'
                  ? 'bg-white shadow-[3px_3px_0px_0px_#000]'
                  : 'bg-white/70 shadow-[2px_2px_0px_0px_#000] opacity-80'
              }`}
            >
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-black font-black text-sm flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                  {meta.order}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-black text-black">
                      {agent.agent_name}
                    </h3>
                    {agent.findings_count > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-[#FFCCD5] border border-black text-[10px] font-black text-rose-950">
                        {agent.findings_count} objections
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-0.5 max-w-xl">
                    {meta.roleDescription}
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                {renderStatusBadge(agent.status, agent.attempt_count, agent.retry_reason)}
              </div>
            </div>
          );
        })}
      </div>

      {sessionData?.status === 'completed' && (
        <div className="text-center pt-2">
          <button
            onClick={onAuditCompleted}
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-black hover:bg-slate-800 text-white font-black text-sm border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <span>View Full Rejection Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
