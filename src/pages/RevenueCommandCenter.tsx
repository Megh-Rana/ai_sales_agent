import React, { useState } from 'react';
import { mockCommandCenterData } from '../data/mockCommandCenter';
import { CommandCenterAggregatedData } from '../types/commandCenter';
import { CommandHeader } from '../components/commandCenter/CommandHeader';
import { RevenueProgressStrip } from '../components/commandCenter/RevenueProgressStrip';
import { TodayPriorityFeed } from '../components/commandCenter/TodayPriorityFeed';
import { ActiveConversationsCard } from '../components/commandCenter/ActiveConversationsCard';
import { CampaignMomentumCard } from '../components/commandCenter/CampaignMomentumCard';
import { FollowUpsWidget } from '../components/commandCenter/FollowUpsWidget';
import { RecentOutcomesStream } from '../components/commandCenter/RecentOutcomesStream';
import { toast } from 'sonner';

export const RevenueCommandCenter: React.FC = () => {
  const [data, setData] = useState<CommandCenterAggregatedData>(mockCommandCenterData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Revenue Command Center telemetry updated with live market signals.');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16">
      {/* COMMAND CENTER HEADER */}
      <CommandHeader
        metrics={data.metrics}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* MAIN WORKBENCH CONTAINER */}
      <main className="flex-1 px-6 py-6 max-w-7xl w-full mx-auto space-y-8">
        {/* SECTION 1: REVENUE & QUALIFICATION PROGRESS STRIP */}
        <RevenueProgressStrip metrics={data.metrics} />

        {/* SECTION 2: TODAY'S PRIORITY FOCUS FEED */}
        <TodayPriorityFeed items={data.todayPriorities} />

        {/* SECTION 3: ASYMMETRICAL 60/40 WORKBENCH LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: ACTIVE CONVERSATIONS & FOLLOW-UPS (60% Desktop) */}
          <div className="lg:col-span-7 space-y-6">
            <ActiveConversationsCard conversations={data.activeConversations} />
            <FollowUpsWidget />
          </div>

          {/* RIGHT COLUMN: CAMPAIGN MOMENTUM & RECENT OUTCOMES STREAM (40% Desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <CampaignMomentumCard campaigns={data.campaignMomentum} />
            <RecentOutcomesStream outcomes={data.recentOutcomes} />
          </div>
        </div>
      </main>
    </div>
  );
};
