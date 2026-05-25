import fs from 'fs';
[
  'convex/newsroom/queries.ts', 
  'convex/newsroom/mutations.ts', 
  'convex/newsroom/actions.ts', 
  'convex/testing.ts', 
  'convex/schema.ts',
  'types.ts',
  'contexts/NewsroomContext.tsx',
  'hooks/useNewsroomUIState.ts',
  'hooks/useEditorialAgents.ts',
  'services/signals/SignalBroker.ts',
  'services/agents/agentTicker.ts',
  'services/agents/agentConsensus.ts',
  'components/newsroom-v2/TheWire.tsx',
  'components/newsroom-v2/NewsroomUI.tsx',
  'components/newsroom-v2/NewsroomFloor.tsx'
].forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf-8');
  c = c.replace(/"ticker_items"/g, '"signals"');
  c = c.replace(/TickerItem/g, 'Signal');
  c = c.replace(/tickerItems/g, 'signals');
  c = c.replace(/tickerItem/g, 'signal');
  c = c.replace(/ticker_items:/g, 'signals:');
  c = c.replace(/getTickerItems/g, 'getSignals');
  c = c.replace(/getTickerItem/g, 'getSignal');
  c = c.replace(/getOrphanTickerItems/g, 'getOrphanSignals');
  fs.writeFileSync(f, c);
});
