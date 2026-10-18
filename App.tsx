import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VideoProject, ViralIdea, VoiceName } from './types';
import { geminiService } from './services/geminiService';
import { Button } from './components/Button';
import { 
  IconPlus, IconVideo, IconZap, IconMic, 
  IconDrive, IconCalendar, IconChevronRight, IconSearch 
} from './components/Icons';
import { AnalyticsSection, calculateProjectMetrics } from './components/AnalyticsSection';
import { INITIAL_SAMPLE_PROJECTS } from './data/sampleProjects';
import { 
  BarChart3, 
  LayoutGrid, 
  Search, 
  Trash2, 
  Eye, 
  Sparkles, 
  Clock, 
  Layers, 
  CheckCircle2, 
  X,
  ExternalLink,
  Share2
} from 'lucide-react';

const App: React.FC = () => {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'analytics'>('projects');
  const [dashboardFilter, setDashboardFilter] = useState<'all' | 'draft' | 'scheduled' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<VideoProject | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [niche, setNiche] = useState('');
  const [ideas, setIdeas] = useState<ViralIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ViralIdea | null>(null);
  const [currentProject, setCurrentProject] = useState<Partial<VideoProject> | null>(null);
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState<VoiceName>(VoiceName.KORE);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load projects from localStorage on mount or seed sample data if empty
  useEffect(() => {
    const saved = localStorage.getItem('viraflow_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved projects', e);
      }
    }
    // Default seed with rich sample batch for immediate visualization
    setProjects(INITIAL_SAMPLE_PROJECTS);
    localStorage.setItem('viraflow_projects', JSON.stringify(INITIAL_SAMPLE_PROJECTS));
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('viraflow_projects', JSON.stringify(projects));
    }
  }, [projects]);

  const handleLoadSampleData = () => {
    setProjects(INITIAL_SAMPLE_PROJECTS);
    localStorage.setItem('viraflow_projects', JSON.stringify(INITIAL_SAMPLE_PROJECTS));
    showToast('Loaded sample video projects with performance metrics!');
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this project?')) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem('viraflow_projects', JSON.stringify(updated));
      showToast('Project removed.');
    }
  };

  const handleToggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const nextStatus: Record<string, VideoProject['status']> = {
        draft: 'completed',
        completed: 'scheduled',
        scheduled: 'draft'
      };
      const newStatus = nextStatus[p.status || 'draft'] || 'completed';
      return { ...p, status: newStatus };
    }));
    showToast('Project status updated.');
  };

  const handleGenerateIdeas = async () => {
    if (!niche) return;
    setLoading(true);
    try {
      const result = await geminiService.generateViralIdeas(niche);
      setIdeas(result);
      setStep(2);
    } catch (error) {
      alert("Error generating ideas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIdea = async (idea: ViralIdea) => {
    setSelectedIdea(idea);
    setLoading(true);
    try {
      const result = await geminiService.generateScript(idea.title, idea.hook);
      setCurrentProject({
        id: Math.random().toString(36).substr(2, 9),
        title: idea.title,
        hook: idea.hook,
        niche: niche,
        script: result.scenes,
        captions: result.captions,
        hashtags: result.hashtags,
        status: 'draft',
        createdAt: Date.now()
      });
      setStep(3);
    } catch (error) {
      alert("Error generating script.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVoiceOver = async () => {
    if (!currentProject?.script) return;
    setLoading(true);
    try {
      const fullText = currentProject.script.map(s => s.audioScript).join(' ');
      const buffer = await geminiService.generateVoiceOver(fullText, voice);
      
      // Convert buffer to a playable URL for the preview
      const wav = audioBufferToWav(buffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioPreview(url);
      
      setCurrentProject(prev => ({ ...prev, voiceId: voice, audioUrl: url }));
    } catch (error) {
      alert("Error generating voice-over.");
    } finally {
      setLoading(false);
    }
  };

  // Utility to convert AudioBuffer to WAV
  function audioBufferToWav(buffer: AudioBuffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    // write header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // length of fmt chunk
    setUint16(1); // PCM format
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return bufferArray;

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }
    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }

  const handleFinalize = () => {
    if (currentProject) {
      const newProject = currentProject as VideoProject;
      setProjects(prev => [newProject, ...prev]);
      setIsCreating(false);
      setStep(1);
      setCurrentProject(null);
      setNiche('');
      showToast(`Added "${newProject.title}" to project board!`);
    }
  };

  // Filtered projects for the dashboard view
  const displayedProjects = useMemo(() => {
    return projects.filter(p => {
      if (dashboardFilter !== 'all' && p.status !== dashboardFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesHook = p.hook.toLowerCase().includes(q);
        const matchesNiche = p.niche.toLowerCase().includes(q);
        if (!matchesTitle && !matchesHook && !matchesNiche) return false;
      }
      return true;
    });
  }, [projects, dashboardFilter, searchQuery]);

  // Overall quick metrics
  const quickMetrics = useMemo(() => {
    let totalScenes = 0;
    let totalAiProdSeconds = 0;
    let totalRuntime = 0;
    projects.forEach(p => {
      const m = calculateProjectMetrics(p);
      totalScenes += m.sceneCount;
      totalAiProdSeconds += m.estimatedAiProdTimeSeconds;
      totalRuntime += m.totalRuntimeSeconds;
    });
    return {
      totalProjects: projects.length,
      totalScenes,
      totalAiProdSeconds,
      totalRuntime
    };
  }, [projects]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 glass px-4 py-2.5 rounded-xl border border-indigo-500/30 text-white text-xs shadow-2xl animate-fadeIn flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-gray-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
            <IconZap />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">ViraFlow AI</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Studio
              </span>
            </div>
            <p className="text-xs text-gray-400">Autonomous Short-Form Video Engine</p>
          </div>
        </div>

        {/* View Switcher: Projects vs Analytics */}
        {!isCreating && (
          <div className="hidden sm:flex items-center bg-gray-900/90 p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'projects'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Projects</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                {projects.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Analytics</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                Recharts
              </span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isCreating ? (
            <Button 
              onClick={() => {
                setIsCreating(true);
                setStep(1);
              }} 
              icon={<IconPlus />}
            >
              New Batch
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreating(false);
                setStep(1);
              }}
            >
              Close Batch
            </Button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {!isCreating ? (
          <>
            {/* Mobile Tab Switcher */}
            <div className="sm:hidden flex items-center bg-gray-900 p-1 rounded-xl border border-gray-800 mb-6 text-xs w-full">
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium ${
                  activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'text-gray-400'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Projects ({projects.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium ${
                  activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-gray-400'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                Analytics
              </button>
            </div>

            {/* TAB: ANALYTICS (Recharts Powered) */}
            {activeTab === 'analytics' ? (
              <AnalyticsSection
                projects={projects}
                onLoadSampleData={handleLoadSampleData}
                onCreateNew={() => {
                  setIsCreating(true);
                  setStep(1);
                }}
              />
            ) : (
              /* TAB: PROJECTS VIEW */
              <div className="space-y-6 animate-fadeIn">
                {/* Quick Performance Telemetry Banner with link to Analytics */}
                <div className="glass p-4 rounded-2xl border border-gray-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-900/80 via-gray-900/40 to-indigo-950/30">
                  <div className="flex items-center gap-6 divide-x divide-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium">Total Scenes</p>
                        <p className="text-lg font-bold text-white">{quickMetrics.totalScenes} scenes</p>
                      </div>
                    </div>

                    <div className="pl-6 flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium">Est. Production Time</p>
                        <p className="text-lg font-bold text-amber-400">
                          {Math.floor(quickMetrics.totalAiProdSeconds / 60)}m {quickMetrics.totalAiProdSeconds % 60}s
                        </p>
                      </div>
                    </div>

                    <div className="hidden lg:flex pl-6 items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium">Total Runtime</p>
                        <p className="text-lg font-bold text-emerald-400">
                          {Math.floor(quickMetrics.totalRuntime / 60)}m {quickMetrics.totalRuntime % 60}s
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all group"
                  >
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <span>View Performance Analytics & Charts</span>
                    <IconChevronRight />
                  </button>
                </div>

                {/* Dashboard Controls: Search & Status Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search projects by title, hook, or niche..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex bg-gray-900/90 p-1 rounded-xl border border-gray-800 text-xs">
                      {(['all', 'completed', 'scheduled', 'draft'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setDashboardFilter(tab)}
                          className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                            dashboardFilter === tab
                              ? 'bg-gray-800 text-white shadow-sm'
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleLoadSampleData}
                      className="px-2.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-800 rounded-lg text-xs transition-colors"
                      title="Reload realistic sample projects"
                    >
                      Sample Data
                    </button>
                  </div>
                </div>

                {/* Projects Grid */}
                {displayedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/20 text-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-600">
                      <IconVideo />
                    </div>
                    <h3 className="text-lg font-medium text-gray-300">No matching projects found</h3>
                    <p className="text-gray-500 mb-6 text-sm">
                      {searchQuery ? 'Try clearing your search query.' : 'Start your first AI content batch to see results here.'}
                    </p>
                    <div className="flex gap-3">
                      <Button onClick={() => setIsCreating(true)} icon={<IconPlus />}>
                        Create Project
                      </Button>
                      <Button variant="secondary" onClick={handleLoadSampleData}>
                        Load Sample Batch
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedProjects.map(project => {
                      const metrics = calculateProjectMetrics(project);
                      return (
                        <div 
                          key={project.id} 
                          onClick={() => setSelectedProjectForModal(project)}
                          className="glass p-5 rounded-2xl hover:border-indigo-500/50 transition-all group flex flex-col justify-between cursor-pointer border border-gray-800/80 hover:shadow-xl hover:shadow-indigo-500/5"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                                {project.niche}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span 
                                  onClick={(e) => handleToggleStatus(project.id, e)}
                                  className={`px-2 py-0.5 text-[10px] font-semibold rounded cursor-pointer uppercase ${
                                    project.status === 'completed'
                                      ? 'bg-green-500/10 text-green-400'
                                      : project.status === 'scheduled'
                                      ? 'bg-pink-500/10 text-pink-400'
                                      : 'bg-blue-500/10 text-blue-400'
                                  }`}
                                  title="Click to cycle status"
                                >
                                  {project.status || 'draft'}
                                </span>
                                <button
                                  onClick={(e) => handleDeleteProject(project.id, e)}
                                  className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                                  title="Delete project"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h4 className="font-bold text-base mb-1.5 line-clamp-2 text-white group-hover:text-indigo-300 transition-colors">
                              {project.title}
                            </h4>
                            <p className="text-gray-400 text-xs mb-4 line-clamp-2 italic">
                              "{project.hook}"
                            </p>
                          </div>

                          <div>
                            {/* Performance Metrics Pill Row */}
                            <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800/80 flex items-center justify-between text-xs mb-4">
                              <div className="flex items-center gap-1.5 text-gray-300">
                                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="font-semibold text-indigo-300">{metrics.sceneCount} Scenes</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>~{Math.round(metrics.estimatedAiProdTimeSeconds)}s prod</span>
                              </div>
                              <div className="text-[11px] text-emerald-400 font-mono">
                                {metrics.totalRuntimeSeconds}s run
                              </div>
                            </div>

                            {/* Card Actions */}
                            <div className="grid grid-cols-2 gap-2" onClick={e => e.stopPropagation()}>
                              <Button 
                                variant="secondary" 
                                className="text-xs py-1.5 h-8" 
                                icon={<Eye className="w-3.5 h-3.5" />}
                                onClick={() => setSelectedProjectForModal(project)}
                              >
                                View Script
                              </Button>
                              <Button 
                                variant="secondary" 
                                className="text-xs py-1.5 h-8" 
                                icon={<IconDrive />}
                                onClick={() => showToast(`Syncing "${project.title}" storyboard & audio to Drive...`)}
                              >
                                Drive
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* PROJECT CREATION WIZARD */
          <div className="max-w-4xl mx-auto py-8">
            {/* Wizard Steps */}
            <div className="flex items-center justify-between mb-12 relative px-4">
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-800 -z-10"></div>
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    step === s ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20' : 
                    step > s ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-700/50' : 
                    'bg-gray-900 text-gray-600 border border-gray-800'
                  }`}>
                    {s}
                  </div>
                  <span className={`text-xs font-medium ${step === s ? 'text-indigo-400' : 'text-gray-600'}`}>
                    {s === 1 ? 'Ideation' : s === 2 ? 'Selection' : s === 3 ? 'Production' : 'Export'}
                  </span>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="animate-slideUp">
              {step === 1 && (
                <div className="glass p-8 rounded-3xl text-center space-y-6">
                  <div className="w-16 h-16 bg-indigo-600/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto">
                    <IconSearch />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">What is your niche?</h3>
                    <p className="text-gray-400 max-w-md mx-auto">Tell us the topic and Gemini will brainstorm viral hooks tailored for your audience.</p>
                  </div>
                  <div className="max-w-md mx-auto relative">
                    <input 
                      type="text" 
                      placeholder="e.g. AI productivity tips, Healthy meal prep, Solo travel..."
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && niche) handleGenerateIdeas();
                      }}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <Button 
                    className="w-full max-w-md mx-auto h-12"
                    onClick={handleGenerateIdeas}
                    isLoading={loading}
                    disabled={!niche}
                  >
                    Generate Viral Ideas
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Pick your best idea</h3>
                    <Button variant="ghost" onClick={() => setStep(1)}>Back to niche</Button>
                  </div>
                  <div className="grid gap-4">
                    {ideas.map((idea, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleSelectIdea(idea)}
                        className="glass p-6 rounded-2xl cursor-pointer hover:border-indigo-500 transition-all group flex gap-6"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold px-2 py-0.5 bg-green-500/10 text-green-400 rounded">
                              Score: {idea.viralScore}%
                            </span>
                            <h4 className="font-bold text-lg group-hover:text-indigo-400 transition-colors">{idea.title}</h4>
                          </div>
                          <p className="text-gray-400 text-sm italic mb-2">Hook: "{idea.hook}"</p>
                          <p className="text-xs text-gray-500">{idea.reasoning}</p>
                        </div>
                        <div className="flex items-center text-gray-500 group-hover:text-indigo-400">
                          <IconChevronRight />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && currentProject && (
                <div className="space-y-8 pb-12">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Production Studio</h3>
                      <p className="text-sm text-gray-400">Reviewing: {currentProject.title}</p>
                    </div>
                    <Button variant="ghost" onClick={() => setStep(2)}>Back to ideas</Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Script & Visuals */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Video Script & Storyboard</h4>
                          <span className="text-xs text-indigo-400 font-medium">
                            {currentProject.script?.length} scenes generated
                          </span>
                        </div>
                        {currentProject.script?.map((scene, i) => (
                          <div key={scene.id} className="glass overflow-hidden rounded-2xl flex flex-col md:flex-row border-l-4 border-indigo-600">
                            <div className="md:w-1/3 p-4 bg-gray-900/50 space-y-2">
                              <span className="text-[10px] font-bold text-indigo-400 uppercase">Scene {i+1} • {scene.duration}s</span>
                              <p className="text-xs text-gray-400 leading-relaxed font-mono">{scene.visualPrompt}</p>
                            </div>
                            <div className="flex-1 p-4 bg-gray-800/20">
                              <p className="text-sm leading-relaxed text-gray-200">
                                <span className="text-indigo-400">VO: </span>
                                {scene.audioScript}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Metadata (SEO)</h4>
                        <div className="glass p-5 rounded-2xl space-y-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1">Caption</label>
                            <p className="text-sm text-gray-300 bg-gray-900 p-3 rounded-lg border border-gray-800">{currentProject.captions}</p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1">Hashtags</label>
                            <div className="flex flex-wrap gap-2">
                              {currentProject.hashtags?.map((h, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-800 text-gray-400 rounded-md text-[10px]">#{h}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Audio & Settings */}
                    <div className="space-y-6">
                      <div className="glass p-6 rounded-2xl space-y-6 sticky top-24">
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <IconMic /> Voice Settings
                          </h4>
                          <select 
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-sm focus:outline-none"
                            value={voice}
                            onChange={(e) => setVoice(e.target.value as VoiceName)}
                          >
                            <option value={VoiceName.ZEPHYR}>Zephyr (Neutral)</option>
                            <option value={VoiceName.KORE}>Kore (Energetic)</option>
                            <option value={VoiceName.PUCK}>Puck (Playful)</option>
                            <option value={VoiceName.CHARON}>Charon (Deep)</option>
                            <option value={VoiceName.FENRIR}>Fenrir (Bold)</option>
                          </select>
                          <Button 
                            variant="secondary" 
                            className="w-full"
                            onClick={handleGenerateVoiceOver}
                            isLoading={loading}
                          >
                            Generate Audio Preview
                          </Button>
                          {audioPreview && (
                            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                              <audio controls src={audioPreview} className="w-full h-8" />
                            </div>
                          )}
                        </div>

                        <hr className="border-gray-800" />

                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <IconDrive /> Integrations
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs p-2 bg-gray-900 rounded-lg">
                              <span className="text-gray-400">Google Drive</span>
                              <span className="text-green-500">Connected</span>
                            </div>
                            <div className="flex items-center justify-between text-xs p-2 bg-gray-900 rounded-lg">
                              <span className="text-gray-400">Instagram/TikTok</span>
                              <span className="text-gray-600">Ready for Scheduling</span>
                            </div>
                          </div>
                        </div>

                        <Button 
                          className="w-full h-12 mt-4"
                          onClick={() => setStep(4)}
                        >
                          Proceed to Finalize
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="glass p-12 rounded-3xl text-center space-y-8">
                  <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <IconDrive />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold">Your content is ready!</h3>
                    <p className="text-gray-400">Visual prompts, scripts, and audio are synced and ready for export.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                    <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                        <IconDrive />
                      </div>
                      <div className="text-sm font-bold">Sync to Drive</div>
                      <p className="text-[10px] text-gray-500">Saves scripts, visuals, and audio to shared folder.</p>
                      <Button 
                        variant="secondary" 
                        className="w-full mt-2"
                        onClick={() => showToast('Synced script and audio package to Drive.')}
                      >
                        Export Now
                      </Button>
                    </div>
                    <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-pink-500/10 text-pink-500 rounded-xl flex items-center justify-center">
                        <IconCalendar />
                      </div>
                      <div className="text-sm font-bold">Schedule Post</div>
                      <p className="text-[10px] text-gray-500">Automate posting to TikTok and Reels.</p>
                      <Button 
                        variant="secondary" 
                        className="w-full mt-2"
                        onClick={() => showToast('Queued for social calendar release.')}
                      >
                        Queue Post
                      </Button>
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button onClick={handleFinalize} icon={<IconPlus />}>Add to Project Board</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Persistent CTA when creating */}
      {isCreating && step < 4 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounceIn">
          <div className="glass px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl shadow-indigo-500/20 border-indigo-500/30">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ViraFlow Production Mode</span>
            <div className="h-4 w-px bg-gray-800"></div>
            <button 
              onClick={() => { setIsCreating(false); setStep(1); }}
              className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
            >
              Exit Batch
            </button>
          </div>
        </div>
      )}

      {/* Project Inspector Modal */}
      {selectedProjectForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-3xl p-6 border border-gray-800 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 rounded-md">
                  {selectedProjectForModal.niche}
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5">{selectedProjectForModal.title}</h3>
                <p className="text-xs text-gray-400 italic">"{selectedProjectForModal.hook}"</p>
              </div>
              <button 
                onClick={() => setSelectedProjectForModal(null)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance Metrics summary for this project */}
            {(() => {
              const m = calculateProjectMetrics(selectedProjectForModal);
              return (
                <div className="grid grid-cols-3 gap-3 p-3.5 bg-gray-900/90 rounded-2xl border border-gray-800 text-center">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500">Total Scenes</p>
                    <p className="text-base font-extrabold text-indigo-400">{m.sceneCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500">Video Runtime</p>
                    <p className="text-base font-extrabold text-emerald-400">{m.totalRuntimeSeconds}s</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500">Est. Prod Time</p>
                    <p className="text-base font-extrabold text-amber-400">~{Math.round(m.estimatedAiProdTimeSeconds)}s</p>
                  </div>
                </div>
              );
            })()}

            {/* Scenes List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Storyboard Scenes</h4>
              {selectedProjectForModal.script?.map((sc, i) => (
                <div key={sc.id || i} className="p-3.5 bg-gray-900/60 rounded-xl border border-gray-800 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-indigo-400 font-bold uppercase">
                    <span>Scene {i + 1}</span>
                    <span>{sc.duration}s</span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono"><strong className="text-gray-300">Prompt:</strong> {sc.visualPrompt}</p>
                  <p className="text-xs text-gray-200"><strong className="text-indigo-400">VO:</strong> {sc.audioScript}</p>
                </div>
              ))}
            </div>

            {/* Metadata */}
            {selectedProjectForModal.captions && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Captions & Tags</h4>
                <p className="text-xs text-gray-300 bg-gray-900 p-3 rounded-xl border border-gray-800">
                  {selectedProjectForModal.captions}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedProjectForModal.hashtags?.map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-400 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelectedProjectForModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] glass flex flex-col items-center justify-center backdrop-blur-md">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
              <IconZap />
            </div>
          </div>
          <p className="mt-8 text-xl font-bold text-white">Gemini is thinking...</p>
          <p className="mt-2 text-gray-400 animate-pulse text-sm">Generating viral hooks and cinematic narratives.</p>
        </div>
      )}
    </div>
  );
};

export default App;
