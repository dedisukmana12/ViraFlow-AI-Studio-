import { VideoProject, VoiceName } from '../types';

export const INITIAL_SAMPLE_PROJECTS: VideoProject[] = [
  {
    id: 'proj-001',
    title: '5 AI Tools Replacing Entire Marketing Agencies in 2026',
    niche: 'AI & Tech',
    hook: 'If you are paying an agency $5,000/month, watch this before you write your next check.',
    status: 'completed',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6, // 6 days ago
    voiceId: VoiceName.FENRIR,
    audioUrl: 'sample-audio-1',
    captions: 'Stop overpaying for content creation. These 5 generative AI tools automate 90% of campaign planning, copy, and video production.',
    hashtags: ['aitools', 'artificialintelligence', 'marketinghacks', 'entrepreneurship', 'productivity'],
    script: [
      { id: 'sc-1', duration: 8, visualPrompt: 'Hyper-realistic dark studio, neon blue holographic displays showing agency invoices crumbling', audioScript: 'If you are paying an agency $5,000 a month, stop right now.' },
      { id: 'sc-2', duration: 12, visualPrompt: 'Cinematic close-up of AI neural network interface rendering high-converting ads in real-time', audioScript: 'Tool number one automates your entire creative direction and ad copy in 15 seconds.' },
      { id: 'sc-3', duration: 10, visualPrompt: 'Split screen comparing 40-hour human video edit vs 30-second automated multi-camera render', audioScript: 'Tool number two turns raw webcam footage into studio-grade vertical shorts.' },
      { id: 'sc-4', duration: 10, visualPrompt: 'Sleek analytics dashboard with subscriber count skyrocketing 300% in 14 days', audioScript: 'And tool three automatically schedules and repurposes your content across four platforms.' },
      { id: 'sc-5', duration: 10, visualPrompt: 'Presenter standing in futuristic command center pointing at free resource checklist', audioScript: 'Comment TOOLS below and I will send you the secret prompt sheet for free.' }
    ]
  },
  {
    id: 'proj-002',
    title: '3 Morning Habits That Tripled My Energy Naturally',
    niche: 'Health & Wellness',
    hook: 'The secret to all-day focus has nothing to do with drinking three cups of coffee.',
    status: 'scheduled',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4, // 4 days ago
    voiceId: VoiceName.KORE,
    audioUrl: 'sample-audio-2',
    captions: 'Ditch the 2 PM caffeine crash. Try these neurobiology-backed morning habits for steady, laser-sharp focus.',
    hashtags: ['morningroutine', 'biohacking', 'healthtips', 'energyboost', 'wellness'],
    script: [
      { id: 'sc-1', duration: 7, visualPrompt: 'Sunrise lighting filtering through modern minimalist kitchen, glass of sea salt mineral water', audioScript: 'The secret to non-stop energy has nothing to do with coffee.' },
      { id: 'sc-2', duration: 11, visualPrompt: 'Time-lapse of morning sunlight hitting the eyes, dopamine pathway 3D graphic animation', audioScript: 'First, get 10 minutes of direct morning sunlight within 30 minutes of waking.' },
      { id: 'sc-3', duration: 12, visualPrompt: 'Person doing dynamic hip mobility and cold shower burst with biometric heart rate monitor', audioScript: 'Second, delay your first caffeine intake by 90 minutes to prevent the dreaded afternoon crash.' },
      { id: 'sc-4', duration: 10, visualPrompt: 'Satisfied creator focused deeply at wooden desk, serene green plant environment', audioScript: 'Third, hydrate with electrolytes before touching your phone.' },
      { id: 'sc-5', duration: 8, visualPrompt: 'Text overlay with 7-Day Morning Challenge with download link prompt', audioScript: 'Save this video and start tomorrow morning!' }
    ]
  },
  {
    id: 'proj-003',
    title: 'The 10-Minute Budget Rule That Saved Me $20,000',
    niche: 'Personal Finance',
    hook: 'You do not need spreadsheets or restriction to save an extra $1,500 every single month.',
    status: 'completed',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    voiceId: VoiceName.CHARON,
    audioUrl: 'sample-audio-3',
    captions: 'The simplest personal finance framework ever created: The 50/30/20 reverse automation system.',
    hashtags: ['moneytok', 'financetips', 'savingmoney', 'wealthbuilding', 'budgeting'],
    script: [
      { id: 'sc-1', duration: 9, visualPrompt: 'Moody dark aesthetic, person looking at luxury store receipt then swiping it away with confidence', audioScript: 'You do not need strict spreadsheets to save an extra $1,500 every month.' },
      { id: 'sc-2', duration: 12, visualPrompt: 'Minimalist bank account animation showing automated salary routing into high-yield savings', audioScript: 'Instead of budgeting what is left over, automate your savings the exact minute your paycheck deposits.' },
      { id: 'sc-3', duration: 14, visualPrompt: 'Interactive 3D graph showing compound interest growing from $20k to $180k over 10 years', audioScript: 'Place 20% into an index fund and forget it exists. The rest is guilt-free spending.' },
      { id: 'sc-4', duration: 10, visualPrompt: 'Mobile screen showing automated investment transfer notification with green checkmark', audioScript: 'This one mindset shift eliminates money stress completely.' }
    ]
  },
  {
    id: 'proj-004',
    title: 'Solo Travel in Japan: 4 Hidden Spots Tourists Miss',
    niche: 'Travel',
    hook: 'Do not visit Tokyo until you know these 4 secret countryside escapes.',
    status: 'scheduled',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    voiceId: VoiceName.PUCK,
    audioUrl: 'sample-audio-4',
    captions: 'Escape the crowds in Shibuya and discover Kyoto and Nagano like a local. Save for your next trip to Japan!',
    hashtags: ['japantravel', 'solotravel', 'tokyo', 'kyoto', 'travelsecrets'],
    script: [
      { id: 'sc-1', duration: 8, visualPrompt: 'Cinematic drone shot of misty mountain temple surrounded by vibrant cherry blossoms', audioScript: 'Do not go to Tokyo without knowing these four hidden locations.' },
      { id: 'sc-2', duration: 10, visualPrompt: 'Traditional wooden onsen bath overlooking snowy forest in Gunma prefecture', audioScript: 'First, the secluded hot springs tucked away two hours north of the city.' },
      { id: 'sc-3', duration: 11, visualPrompt: 'Vintage vinyl jazz bar in an underground Tokyo alleyway with warm tungsten glow', audioScript: 'Second, the subterranean listening bars where cameras are not allowed.' },
      { id: 'sc-4', duration: 9, visualPrompt: 'Rural train winding along dramatic coastal cliffs with Pacific Ocean sunset', audioScript: 'Third, the coastal railway ticket that costs less than ten dollars.' },
      { id: 'sc-5', duration: 8, visualPrompt: 'Map overlay pinpointing secret locations with clickable itinerary preview', audioScript: 'Check the link in bio for the complete map coordinates.' }
    ]
  },
  {
    id: 'proj-005',
    title: 'The Ultimate High-Protein Meal Prep Under 25 Minutes',
    niche: 'Health & Wellness',
    hook: '45 grams of protein per serving and it costs less than $3.50.',
    status: 'draft',
    createdAt: Date.now() - 1000 * 60 * 60 * 18, // 18 hours ago
    voiceId: VoiceName.ZEPHYR,
    captions: 'Meal prep doesn’t have to be dry chicken and white rice. Try this spicy chipotle honey bowl recipe.',
    hashtags: ['mealprep', 'highprotein', 'gymtok', 'easyrecipes', 'fitnessfood'],
    script: [
      { id: 'sc-1', duration: 7, visualPrompt: 'Top-down sizzling skillet shot with diced seasoned chicken breast and charred corn', audioScript: '45 grams of protein, under 25 minutes, and less than four dollars per bowl.' },
      { id: 'sc-2', duration: 10, visualPrompt: 'Chef slicing fresh cilantro, lime, and avocado with rapid cinematic knife cuts', audioScript: 'Start with high-heat sear on spiced chicken breast with smoked paprika and garlic.' },
      { id: 'sc-3', duration: 10, visualPrompt: 'Glass meal prep containers lined up neatly with colorful balanced ingredients', audioScript: 'Pair with cilantro lime black beans and roasted sweet potato cubes.' },
      { id: 'sc-4', duration: 8, visualPrompt: 'Creamy Greek yogurt chipotle drizzle cascading over the finished bowl', audioScript: 'Top with this 2-minute high-protein Greek yogurt chipotle sauce.' },
      { id: 'sc-5', duration: 8, visualPrompt: 'Nutritional breakdown card graphic showing 520 calories, 48g protein, 8g fat', audioScript: 'Full grocery list and macro breakdown is in the comments!' }
    ]
  },
  {
    id: 'proj-006',
    title: 'Why 99% of People Fail at Cold Email in 2026',
    niche: 'AI & Tech',
    hook: 'Stop writing 4-paragraph emails that end up straight in the spam folder.',
    status: 'draft',
    createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    voiceId: VoiceName.FENRIR,
    captions: 'The 3-sentence framework generated a 42% reply rate for B2B founders last quarter. Here is the exact breakdown.',
    hashtags: ['saleshacks', 'coldemail', 'startuptips', 'b2b', 'growthhacking'],
    script: [
      { id: 'sc-1', duration: 8, visualPrompt: 'Frustrated executive opening inbox with 342 unread spam emails and clicking Select All Delete', audioScript: 'Stop sending 4-paragraph cold emails. Nobody has time to read them.' },
      { id: 'sc-2', duration: 12, visualPrompt: 'High-contrast clean smartphone screen displaying a concise 3-line personalized message', audioScript: 'Here is the 3-sentence framework that gets CEOs to reply within 10 minutes.' },
      { id: 'sc-3', duration: 11, visualPrompt: 'Animated breakdown of Line 1 Observation, Line 2 Metric Evidence, Line 3 Low-friction Ask', audioScript: 'Observation, proof point, and zero-risk question. That is all you need.' },
      { id: 'sc-4', duration: 9, visualPrompt: 'Notification badge popping up with 14 new booked calendar meetings', audioScript: 'Try this on your next 50 leads and watch your response rate explode.' }
    ]
  }
];
