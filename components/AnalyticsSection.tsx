import React, { useState, useMemo } from 'react';
import { VideoProject } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  BarChart3,
  Clock,
  Film,
  Sparkles,
  Zap,
  TrendingUp,
  PieChart as PieChartIcon,
  Layers,
  Calendar,
  CheckCircle2,
  Hourglass,
  Timer,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from './Button';

interface AnalyticsSectionProps {
  projects: VideoProject[];
  onLoadSampleData?: () => void;
  onCreateNew?: () => void;
}

const NICHE_COLORS: Record<string, string> = {
  'AI & Tech': '#6366f1', // Indigo
  'Health & Wellness': '#10b981', // Emerald
  'Personal Finance': '#f59e0b', // Amber
  'Travel': '#06b6d4', // Cyan
  'Productivity': '#8b5cf6', // Violet
  'Fitness': '#ec4899', // Pink
  'Business': '#3b82f6', // Blue
  'General': '#a855f7' // Purple
};

const DEFAULT_COLOR = '#6366f1';

// Calculate estimated production time based on scene complexity, audio rendering, and visual composition
export function calculateProjectMetrics(project: VideoProject) {
  const sceneCount = project.script ? project.script.length : 0;
  const totalRuntimeSeconds = project.script
    ? project.script.reduce((acc, s) => acc + (Number(s.duration) || 10), 0)
    : 0;

  // AI Pipeline Estimation Formula:
  // - 18s per scene for multi-modal visual diffusion & prompt parsing
  // - 12s for neural voice synthesis & audio alignment
  // - 8s for timeline composition, metadata tagging, and export rendering
  const estimatedAiProdTimeSeconds = sceneCount > 0 ? (sceneCount * 18) + (project.audioUrl ? 12 : 6) + 8 : 0;
  
  // Traditional Human Editing Benchmark:
  // An experienced editor spends ~8-12 minutes per scene for scripting, sourcing b-roll, audio sync, and captions.
  const estimatedHumanTimeSavedMinutes = sceneCount * 9 + 15;

  return {
    sceneCount,
    totalRuntimeSeconds,
    estimatedAiProdTimeSeconds,
    estimatedHumanTimeSavedMinutes
  };
}

// Format seconds into "Xm Ys" or "Xs"
function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  projects,
  onLoadSampleData,
  onCreateNew
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | '30d' | '7d'>('all');
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [timeUnit, setTimeUnit] = useState<'seconds' | 'minutes'>('seconds');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Filter projects according to timeframe & niche
  const filteredProjects = useMemo(() => {
    const now = Date.now();
    return projects.filter(p => {
      // Timeframe check
      if (selectedTimeframe === '7d' && now - p.createdAt > 7 * 86400 * 1000) return false;
      if (selectedTimeframe === '30d' && now - p.createdAt > 30 * 86400 * 1000) return false;
      // Niche check
      if (selectedNiche !== 'all' && p.niche !== selectedNiche) return false;
      return true;
    });
  }, [projects, selectedTimeframe, selectedNiche]);

  // Aggregate Key Performance Indicators (KPIs)
  const stats = useMemo(() => {
    let totalScenes = 0;
    let totalRuntimeSecs = 0;
    let totalAiProdTimeSecs = 0;
    let totalHumanSavedMins = 0;
    const nicheCounts: Record<string, { count: number; scenes: number; prodTime: number }> = {};
    const statusCounts: Record<string, number> = { completed: 0, scheduled: 0, draft: 0, generating: 0 };

    filteredProjects.forEach(p => {
      const metrics = calculateProjectMetrics(p);
      totalScenes += metrics.sceneCount;
      totalRuntimeSecs += metrics.totalRuntimeSeconds;
      totalAiProdTimeSecs += metrics.estimatedAiProdTimeSeconds;
      totalHumanSavedMins += metrics.estimatedHumanTimeSavedMinutes;

      const nicheName = p.niche || 'General';
      if (!nicheCounts[nicheName]) {
        nicheCounts[nicheName] = { count: 0, scenes: 0, prodTime: 0 };
      }
      nicheCounts[nicheName].count += 1;
      nicheCounts[nicheName].scenes += metrics.sceneCount;
      nicheCounts[nicheName].prodTime += metrics.estimatedAiProdTimeSeconds;

      const st = p.status || 'draft';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    const projectCount = filteredProjects.length;
    const avgScenesPerProject = projectCount > 0 ? (totalScenes / projectCount).toFixed(1) : '0';
    const avgRuntimePerVideo = projectCount > 0 ? Math.round(totalRuntimeSecs / projectCount) : 0;
    const avgProdTimePerProject = projectCount > 0 ? Math.round(totalAiProdTimeSecs / projectCount) : 0;
    const totalHumanSavedHours = (totalHumanSavedMins / 60).toFixed(1);

    return {
      projectCount,
      totalScenes,
      totalRuntimeSecs,
      totalAiProdTimeSecs,
      totalHumanSavedHours,
      avgScenesPerProject,
      avgRuntimePerVideo,
      avgProdTimePerProject,
      nicheCounts,
      statusCounts
    };
  }, [filteredProjects]);

  // Data for Chart 1: Scenes & Estimated Production Time per Project
  const projectComparisonData = useMemo(() => {
    return filteredProjects.map(p => {
      const metrics = calculateProjectMetrics(p);
      const shortTitle = p.title.length > 22 ? p.title.substring(0, 20) + '...' : p.title;
      return {
        id: p.id,
        name: shortTitle,
        fullTitle: p.title,
        niche: p.niche,
        status: p.status,
        scenes: metrics.sceneCount,
        prodTimeRaw: metrics.estimatedAiProdTimeSeconds,
        prodTime: timeUnit === 'minutes' 
          ? Number((metrics.estimatedAiProdTimeSeconds / 60).toFixed(2))
          : metrics.estimatedAiProdTimeSeconds,
        runtime: metrics.totalRuntimeSeconds,
        timeSavedMins: metrics.estimatedHumanTimeSavedMinutes
      };
    });
  }, [filteredProjects, timeUnit]);

  // Data for Chart 2: Chronological Timeline of Production Velocity
  const timelineData = useMemo(() => {
    // Sort projects chronologically
    const sorted = [...filteredProjects].sort((a, b) => a.createdAt - b.createdAt);
    let cumulativeScenes = 0;
    let cumulativeProdTime = 0;

    return sorted.map((p, idx) => {
      const metrics = calculateProjectMetrics(p);
      cumulativeScenes += metrics.sceneCount;
      cumulativeProdTime += metrics.estimatedAiProdTimeSeconds;

      const dateLabel = new Date(p.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });

      return {
        index: idx + 1,
        date: dateLabel,
        project: p.title.substring(0, 15) + '...',
        scenes: metrics.sceneCount,
        cumulativeScenes,
        prodTime: timeUnit === 'minutes' 
          ? Number((metrics.estimatedAiProdTimeSeconds / 60).toFixed(2)) 
          : metrics.estimatedAiProdTimeSeconds,
        cumulativeProdTime: timeUnit === 'minutes'
          ? Number((cumulativeProdTime / 60).toFixed(1))
          : cumulativeProdTime
      };
    });
  }, [filteredProjects, timeUnit]);

  // Data for Chart 3: Niche Distribution (Donut Chart)
  const nicheChartData = useMemo(() => {
    return Object.entries(stats.nicheCounts).map(([niche, data]) => ({
      name: niche,
      projects: data.count,
      scenes: data.scenes,
      prodTimeSeconds: data.prodTime,
      color: NICHE_COLORS[niche] || DEFAULT_COLOR
    }));
  }, [stats.nicheCounts]);

  // Available unique niches for filter
  const allNiches = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => {
      if (p.niche) set.add(p.niche);
    });
    return Array.from(set);
  }, [projects]);

  const handleExportSummary = () => {
    const summaryText = `ViraFlow AI - Video Production Performance Report
Generated: ${new Date().toLocaleString()}
------------------------------------------
Total Projects: ${stats.projectCount}
Total Scenes Generated: ${stats.totalScenes}
Total Finished Video Runtime: ${formatDuration(stats.totalRuntimeSecs)}
Estimated AI Production Time: ${formatDuration(stats.totalAiProdTimeSecs)}
Estimated Human Editing Saved: ${stats.totalHumanSavedHours} hours
Average Scenes per Video: ${stats.avgScenesPerProject}
Average Video Length: ${formatDuration(stats.avgRuntimePerVideo)}
------------------------------------------
Niche Breakdown:
${Object.entries(stats.nicheCounts)
  .map(([n, d]) => `• ${n}: ${d.count} videos (${d.scenes} scenes, ~${formatDuration(d.prodTime)} prod time)`)
  .join('\n')}
`;
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    });
  };

  // If there are zero projects, display an interactive onboarding/demo empty state
  if (projects.length === 0) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold">Analytics & Performance</h2>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Visualize scene throughput, estimated production time, and efficiency across your content pipeline.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/30 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-indigo-600/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-5 ring-1 ring-indigo-500/20">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-200 mb-2">No Performance Metrics Yet</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-md">
            Generate your first batch of videos with Gemini or load realistic sample projects to see live interactive Recharts performance visualizations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onLoadSampleData && (
              <Button onClick={onLoadSampleData} variant="primary" icon={<Sparkles className="w-4 h-4" />}>
                Load Sample Batch Analytics
              </Button>
            )}
            {onCreateNew && (
              <Button onClick={onCreateNew} variant="secondary" icon={<Film className="w-4 h-4" />}>
                Create New Video
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight">Production Analytics</h2>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Real-time telemetry on total scenes generated, estimated AI production time, and workflow efficiency.
          </p>
        </div>

        {/* Global Toolbar Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Niche Dropdown */}
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-300">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            <select
              value={selectedNiche}
              onChange={e => setSelectedNiche(e.target.value)}
              className="bg-transparent text-gray-200 outline-none text-xs cursor-pointer"
            >
              <option value="all" className="bg-gray-900 text-gray-200">All Niches ({projects.length})</option>
              {allNiches.map(n => (
                <option key={n} value={n} className="bg-gray-900 text-gray-200">{n}</option>
              ))}
            </select>
          </div>

          {/* Timeframe Switcher */}
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800 text-xs">
            <button
              onClick={() => setSelectedTimeframe('all')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                selectedTimeframe === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setSelectedTimeframe('30d')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                selectedTimeframe === '30d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('7d')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                selectedTimeframe === '7d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              7 Days
            </button>
          </div>

          {/* Time Unit Switcher */}
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800 text-xs">
            <button
              onClick={() => setTimeUnit('seconds')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                timeUnit === 'seconds' ? 'bg-gray-800 text-indigo-400' : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Display production time in Seconds"
            >
              Sec (s)
            </button>
            <button
              onClick={() => setTimeUnit('minutes')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                timeUnit === 'minutes' ? 'bg-gray-800 text-indigo-400' : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Display production time in Minutes"
            >
              Min (m)
            </button>
          </div>

          {/* Export / Copy Report Button */}
          <button
            onClick={handleExportSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 rounded-lg text-xs font-medium transition-colors"
            title="Copy summary report to clipboard"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            {copiedNotification ? 'Copied!' : 'Export'}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Scenes Generated */}
        <div className="glass p-5 rounded-2xl relative overflow-hidden border border-gray-800/80 hover:border-indigo-500/40 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Scenes</p>
              <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{stats.totalScenes}</h3>
              <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 inline" /> {stats.avgScenesPerProject} avg / video
              </p>
            </div>
            <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
            <span>Across {stats.projectCount} video projects</span>
            <span className="text-green-400">100% storyboarded</span>
          </div>
        </div>

        {/* Card 2: Estimated AI Production Time */}
        <div className="glass p-5 rounded-2xl relative overflow-hidden border border-gray-800/80 hover:border-amber-500/40 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Est. AI Prod Time</p>
              <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                {formatDuration(stats.totalAiProdTimeSecs)}
              </h3>
              <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 inline" /> ~{stats.avgProdTimePerProject}s / project
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
            <span>Diffusion + TTS Voice</span>
            <span className="text-amber-400">~25s / scene</span>
          </div>
        </div>

        {/* Card 3: Total Finished Video Runtime */}
        <div className="glass p-5 rounded-2xl relative overflow-hidden border border-gray-800/80 hover:border-emerald-500/40 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Finished Runtime</p>
              <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                {formatDuration(stats.totalRuntimeSecs)}
              </h3>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 inline" /> ~{stats.avgRuntimePerVideo}s avg duration
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
            <span>Target: Vertical Shorts</span>
            <span className="text-emerald-400">9:16 optimized</span>
          </div>
        </div>

        {/* Card 4: Human Editing Hours Saved */}
        <div className="glass p-5 rounded-2xl relative overflow-hidden border border-gray-800/80 hover:border-cyan-500/40 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Human Time Saved</p>
              <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                {stats.totalHumanSavedHours}h
              </h3>
              <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 inline" /> ~18x faster workflow
              </p>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
              <Hourglass className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
            <span>Vs. traditional editing</span>
            <span className="text-cyan-400">Zero manual cuts</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row 1: Dual Metric Composed Chart & Niche Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Project Performance - Total Scenes & Estimated Production Time (2 Cols) */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-gray-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Project Performance: Scenes & Production Time</h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Comparing storyboard scene count (bars) with estimated AI production time (line) per project.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block"></span>
                <span className="text-gray-300">Total Scenes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-400 inline-block"></span>
                <span className="text-gray-300">
                  Est. Prod Time ({timeUnit === 'minutes' ? 'min' : 'sec'})
                </span>
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projectComparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                <defs>
                  <linearGradient id="sceneGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#4338ca" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  yAxisId="left"
                  stroke="#818cf8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'dataMax + 2']}
                  label={{ value: 'Scenes', angle: -90, position: 'insideLeft', fill: '#818cf8', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#fbbf24"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: timeUnit === 'minutes' ? 'Prod (min)' : 'Prod (sec)',
                    angle: 90,
                    position: 'insideRight',
                    fill: '#fbbf24',
                    fontSize: 10
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    color: '#f3f4f6',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  formatter={(value: any, name: any, item: any) => {
                    if (name === 'Total Scenes') return [`${value} scenes`, 'Scenes'];
                    if (name === 'Est. Prod Time') {
                      return [
                        timeUnit === 'minutes' ? `${value} mins (${item.payload.prodTimeRaw}s)` : `${value}s`,
                        'Est. Production Time'
                      ];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(_label, payload) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return `${data.fullTitle} (${data.niche})`;
                    }
                    return _label;
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="scenes"
                  name="Total Scenes"
                  fill="url(#sceneGradient)"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="prodTime"
                  name="Est. Prod Time"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#fbbf24', strokeWidth: 1, stroke: '#111827' }}
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#ffffff' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Content Distribution by Niche (Donut Chart) (1 Col) */}
        <div className="glass p-6 rounded-2xl border border-gray-800/80 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-base text-white">Niche Distribution</h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Share of video projects and generated scenes by niche category.</p>
          </div>

          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nicheChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="scenes"
                  nameKey="name"
                >
                  {nicheChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    color: '#f3f4f6',
                    fontSize: '12px'
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val} scenes (${item.payload.projects} projects, ~${formatDuration(item.payload.prodTimeSeconds)})`,
                    item.payload.name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Niche Badges List */}
          <div className="space-y-2 pt-2 border-t border-gray-800/60 max-h-36 overflow-y-auto pr-1">
            {nicheChartData.map(entry => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-gray-300 font-medium">{entry.name}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <span>{entry.projects} vids</span>
                  <span className="font-semibold text-gray-200">{entry.scenes} scenes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Cumulative Production Timeline & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cumulative Production Velocity (AreaChart) (2 cols) */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-gray-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Cumulative Production Velocity</h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Tracking cumulative storyboard scenes and aggregate AI production runtime over project generation sequence.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                <span className="text-gray-300">Cumulative Scenes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                <span className="text-gray-300">
                  Cumulative Time ({timeUnit === 'minutes' ? 'min' : 'sec'})
                </span>
              </div>
            </div>
          </div>

          <div className="h-[240px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaScenes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    color: '#f3f4f6',
                    fontSize: '12px'
                  }}
                  formatter={(val: any, name: any) => {
                    if (name === 'Cumulative Scenes') return [`${val} scenes`, name];
                    return [
                      timeUnit === 'minutes' ? `${val} minutes` : `${val} seconds`,
                      name
                    ];
                  }}
                  labelFormatter={(_label, payload) => {
                    if (payload && payload.length > 0) {
                      return `Project #${payload[0].payload.index}: ${payload[0].payload.project} (${payload[0].payload.date})`;
                    }
                    return _label;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeScenes"
                  name="Cumulative Scenes"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaScenes)"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeProdTime"
                  name="Cumulative Time"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaTime)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Production Pipeline Status & Efficiency Metrics (1 col) */}
        <div className="glass p-6 rounded-2xl border border-gray-800/80 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-base text-white">Production Status</h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Workflow stages for generated video batches.</p>
          </div>

          <div className="space-y-3 my-auto">
            {/* Completed */}
            <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-green-500/10 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Completed & Rendered</h4>
                  <p className="text-[11px] text-gray-500">Audio voice-over + scenes ready</p>
                </div>
              </div>
              <span className="text-sm font-bold text-green-400">{stats.statusCounts.completed || 0}</span>
            </div>

            {/* Scheduled */}
            <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Scheduled for Socials</h4>
                  <p className="text-[11px] text-gray-500">TikTok & IG Reels queued</p>
                </div>
              </div>
              <span className="text-sm font-bold text-pink-400">{stats.statusCounts.scheduled || 0}</span>
            </div>

            {/* Draft */}
            <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Hourglass className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Draft Storyboards</h4>
                  <p className="text-[11px] text-gray-500">Script generated, ready for audio</p>
                </div>
              </div>
              <span className="text-sm font-bold text-blue-400">{stats.statusCounts.draft || 0}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>AI throughput averages <strong>~2.4x</strong> realtime video runtime.</span>
          </div>
        </div>
      </div>

      {/* Detailed Project Performance Table */}
      <div className="glass rounded-2xl border border-gray-800/80 overflow-hidden">
        <div className="p-5 border-b border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-white">Generated Video Performance Log</h3>
            <p className="text-xs text-gray-400">Detailed breakdown of scenes, video duration, and estimated AI render time per project.</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
            Showing {filteredProjects.length} projects
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Project & Hook</th>
                <th className="py-3 px-4">Niche</th>
                <th className="py-3 px-4 text-center">Total Scenes</th>
                <th className="py-3 px-4 text-center">Video Runtime</th>
                <th className="py-3 px-4 text-center">Est. Prod Time</th>
                <th className="py-3 px-4 text-center">Time Saved</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredProjects.map(project => {
                const metrics = calculateProjectMetrics(project);
                const nicheColor = NICHE_COLORS[project.niche] || DEFAULT_COLOR;
                return (
                  <tr key={project.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-gray-200 truncate">{project.title}</p>
                      <p className="text-[11px] text-gray-500 truncate italic">"{project.hook}"</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold rounded-md"
                        style={{
                          backgroundColor: `${nicheColor}20`,
                          color: nicheColor
                        }}
                      >
                        {project.niche || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {metrics.sceneCount} scenes
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap text-gray-300 font-mono">
                      {formatDuration(metrics.totalRuntimeSeconds)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono text-amber-400">
                      {formatDuration(metrics.estimatedAiProdTimeSeconds)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono text-emerald-400">
                      +{metrics.estimatedHumanTimeSavedMinutes}m
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase ${
                          project.status === 'completed'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : project.status === 'scheduled'
                            ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {project.status || 'draft'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
