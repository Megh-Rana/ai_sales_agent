from datetime import datetime, timedelta
from typing import Optional, Tuple, List
from uuid import UUID
from sqlalchemy import select, func, distinct
from sqlalchemy.orm import Session
from app.db.models.lead import Lead
from app.db.models.call import Call
from app.db.models.campaign import Campaign
from app.db.models.campaign_lead import CampaignLead
from app.db.models.business import Business
from app.schemas.analytics import (
    AnalyticsMetricsResponse,
    FunnelStageData,
    FunnelInsightText,
    ExecutiveMetric,
    IntentLevelDistribution,
    IntentDistributionCount,
    CallPerformanceData,
    CallOutcomeItem,
    StageConversionMetric,
    SourcePerformanceItem,
    IndustryPerformanceItem,
    AnalyticsInsight,
    TrendChartPoint,
)


def parse_date_window(
    date_range: str, start_date: Optional[str] = None, end_date: Optional[str] = None
) -> Tuple[datetime, datetime, datetime, datetime]:
    """
    Parses preset date range or custom ISO dates into naive start/end datetimes
    matching SQLite/PostgreSQL created_at fields, plus previous period boundaries.
    """
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    range_lower = (date_range or "30d").lower().strip()

    if range_lower == "today":
        start_dt = today_start
        end_dt = today_end
        prev_start = start_dt - timedelta(days=1)
        prev_end = today_start - timedelta(microseconds=1)
    elif range_lower in ("7d", "7 days", "7_days"):
        start_dt = today_start - timedelta(days=6)
        end_dt = today_end
        prev_start = start_dt - timedelta(days=7)
        prev_end = start_dt - timedelta(microseconds=1)
    elif range_lower in ("15d", "15 days", "15_days"):
        start_dt = today_start - timedelta(days=14)
        end_dt = today_end
        prev_start = start_dt - timedelta(days=15)
        prev_end = start_dt - timedelta(microseconds=1)
    elif range_lower in ("30d", "30 days", "30_days"):
        start_dt = today_start - timedelta(days=29)
        end_dt = today_end
        prev_start = start_dt - timedelta(days=30)
        prev_end = start_dt - timedelta(microseconds=1)
    elif range_lower in ("90d", "90 days", "90_days"):
        start_dt = today_start - timedelta(days=89)
        end_dt = today_end
        prev_start = start_dt - timedelta(days=90)
        prev_end = start_dt - timedelta(microseconds=1)
    elif range_lower == "custom":
        if start_date:
            try:
                start_dt = datetime.strptime(start_date[:10], "%Y-%m-%d").replace(
                    hour=0, minute=0, second=0, microsecond=0
                )
            except Exception:
                start_dt = today_start - timedelta(days=29)
        else:
            start_dt = today_start - timedelta(days=29)

        if end_date:
            try:
                end_dt = datetime.strptime(end_date[:10], "%Y-%m-%d").replace(
                    hour=23, minute=59, second=59, microsecond=999999
                )
            except Exception:
                end_dt = today_end
        else:
            end_dt = today_end

        delta = end_dt - start_dt
        days_span = max(1, delta.days + 1)
        prev_start = start_dt - timedelta(days=days_span)
        prev_end = start_dt - timedelta(microseconds=1)
    else:
        # Default fallback: 30 days
        start_dt = today_start - timedelta(days=29)
        end_dt = today_end
        prev_start = start_dt - timedelta(days=30)
        prev_end = start_dt - timedelta(microseconds=1)

    return start_dt, end_dt, prev_start, prev_end


def calc_trend(curr: float, prev: float) -> Tuple[float, str]:
    """Calculates percentage trend between current and previous period."""
    if prev > 0:
        diff = round(((curr - prev) / prev) * 100, 1)
        direction = "up" if diff > 0 else ("down" if diff < 0 else "neutral")
        return abs(diff), direction
    elif curr > 0:
        return 100.0, "up"
    else:
        return 0.0, "neutral"


class AnalyticsService:
    @staticmethod
    def get_metrics(
        db: Session,
        owner_id: UUID,
        date_range: str = "30d",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> AnalyticsMetricsResponse:
        # 1. Determine accessible businesses
        businesses = db.scalars(select(Business.id).where(Business.owner_id == owner_id)).all()
        biz_ids = list(businesses)

        # 2. Date windows
        start_dt, end_dt, prev_start, prev_end = parse_date_window(date_range, start_date, end_date)

        # 3. Base queries for Leads
        lead_query = select(Lead)
        if biz_ids:
            lead_query = lead_query.where(Lead.business_id.in_(biz_ids))

        curr_leads = list(
            db.scalars(
                lead_query.where(Lead.created_at >= start_dt, Lead.created_at <= end_dt)
            ).all()
        )
        prev_leads = list(
            db.scalars(
                lead_query.where(Lead.created_at >= prev_start, Lead.created_at <= prev_end)
            ).all()
        )

        all_biz_leads = list(db.scalars(lead_query).all())
        all_lead_ids = [l.id for l in all_biz_leads]

        # 4. Calls query
        calls_query = select(Call)
        if all_lead_ids:
            calls_query = calls_query.where(Call.lead_id.in_(all_lead_ids))

        curr_calls = list(
            db.scalars(
                calls_query.where(Call.created_at >= start_dt, Call.created_at <= end_dt)
            ).all()
        )
        prev_calls = list(
            db.scalars(
                calls_query.where(Call.created_at >= prev_start, Call.created_at <= prev_end)
            ).all()
        )

        # 5. Dynamic Funnel Counts in Current Period
        discovered_count = len(curr_leads)
        high_intent_count = sum(1 for l in curr_leads if (l.intent_score or 0) >= 80)

        contacted_lead_ids = set()
        for c in curr_calls:
            contacted_lead_ids.add(c.lead_id)
        for l in curr_leads:
            if l.status in ("contacted", "qualified", "interested", "converted", "lost"):
                contacted_lead_ids.add(l.id)
        contacted_count = len(contacted_lead_ids)

        qualified_lead_ids = set()
        for c in curr_calls:
            outcome_lower = (c.outcome or "").lower()
            if outcome_lower in ("meeting_booked", "interested", "qualified", "follow_up"):
                qualified_lead_ids.add(c.lead_id)
        for l in curr_leads:
            if l.status in ("qualified", "interested", "converted"):
                qualified_lead_ids.add(l.id)
        interested_count = len(qualified_lead_ids)

        converted_lead_ids = set()
        for c in curr_calls:
            outcome_lower = (c.outcome or "").lower()
            if outcome_lower in ("meeting_booked", "converted"):
                converted_lead_ids.add(c.lead_id)
        for l in curr_leads:
            if l.status == "converted":
                converted_lead_ids.add(l.id)
        converted_count = len(converted_lead_ids)

        overall_conv_rate = (
            round((converted_count / discovered_count * 100), 1) if discovered_count > 0 else 0.0
        )

        # Build dynamic Funnel Stages
        stages_info = [
            ("discovered", "Discovered Prospects", discovered_count),
            ("high_intent", "Verified High-Intent (≥80)", high_intent_count),
            ("contacted", "AI Voice Agent Contacted", contacted_count),
            ("qualified", "Qualified & Interested", interested_count),
            ("meeting", "Meeting Booked / Converted", converted_count),
        ]

        funnel_stages: List[FunnelStageData] = []
        prev_stage_count = discovered_count

        for stage_id, label, count in stages_info:
            pct_top = round((count / discovered_count * 100), 1) if discovered_count > 0 else 0.0
            conv_prev = (
                round((count / prev_stage_count * 100), 1) if prev_stage_count > 0 else 0.0
            )
            drop_count = max(0, prev_stage_count - count)
            drop_pct = (
                round((drop_count / prev_stage_count * 100), 1) if prev_stage_count > 0 else 0.0
            )

            funnel_stages.append(
                FunnelStageData(
                    stageId=stage_id,
                    label=label,
                    count=count,
                    percentageOfTop=pct_top,
                    conversionFromPrevious=conv_prev,
                    dropOffCount=drop_count,
                    dropOffPercentage=drop_pct,
                )
            )
            prev_stage_count = count

        # Funnel insight narrative
        if discovered_count > 0:
            highlight_msg = f"{discovered_count} prospects discovered in this period with {overall_conv_rate}% converted to meetings."
            drop_detail = (
                f"{interested_count} prospects reached qualified status in selected date range."
                if interested_count > 0
                else "Outbound outreach recommended to convert discovered prospects into qualified leads."
            )
        else:
            highlight_msg = "No prospects discovered in the selected date range."
            drop_detail = "Select a wider date range or run Lead Discovery to populate pipeline telemetry."

        # 6. Intent distribution
        v_high = sum(1 for l in curr_leads if (l.intent_score or 0) >= 90)
        high = sum(1 for l in curr_leads if 80 <= (l.intent_score or 0) < 90)
        med = sum(1 for l in curr_leads if 50 <= (l.intent_score or 0) < 80)
        low = sum(1 for l in curr_leads if (l.intent_score or 0) < 50)

        tot_leads = discovered_count or 1
        intent_dist = IntentLevelDistribution(
            veryHigh=IntentDistributionCount(
                count=v_high,
                percentage=round(v_high / tot_leads * 100, 1) if discovered_count > 0 else 0.0,
            ),
            high=IntentDistributionCount(
                count=high,
                percentage=round(high / tot_leads * 100, 1) if discovered_count > 0 else 0.0,
            ),
            medium=IntentDistributionCount(
                count=med,
                percentage=round(med / tot_leads * 100, 1) if discovered_count > 0 else 0.0,
            ),
            low=IntentDistributionCount(
                count=low,
                percentage=round(low / tot_leads * 100, 1) if discovered_count > 0 else 0.0,
            ),
        )

        # 7. Call performance metrics
        tot_calls = len(curr_calls)
        completed_calls = [c for c in curr_calls if c.duration and c.duration > 0]
        avg_dur = (
            int(sum(c.duration for c in completed_calls) / len(completed_calls))
            if completed_calls
            else 0
        )
        qual_calls = sum(
            1
            for c in curr_calls
            if (c.outcome or "").lower() in ("meeting_booked", "interested", "qualified")
        )
        int_calls = sum(
            1 for c in curr_calls if (c.outcome or "").lower() in ("interested", "meeting_booked")
        )
        follow_ups = sum(
            1 for c in curr_calls if (c.outcome or "").lower() in ("follow_up", "callback")
        )

        call_perf = CallPerformanceData(
            totalCalls=tot_calls,
            avgDurationSeconds=avg_dur,
            qualifiedCalls=qual_calls,
            interestedCalls=int_calls,
            followUpsCreated=follow_ups,
            qualificationRate=round(qual_calls / tot_calls * 100, 1) if tot_calls > 0 else 0.0,
            interestedRate=round(int_calls / tot_calls * 100, 1) if tot_calls > 0 else 0.0,
        )

        # 8. Call outcome breakdown
        outcome_counts = {}
        for c in curr_calls:
            out_key = (c.outcome or "COMPLETED").upper()
            outcome_counts[out_key] = outcome_counts.get(out_key, 0) + 1

        call_outcomes: List[CallOutcomeItem] = []
        tot_c = tot_calls or 1
        for out_name, c_cnt in outcome_counts.items():
            call_outcomes.append(
                CallOutcomeItem(
                    outcome=out_name,
                    label=out_name.replace("_", " ").title(),
                    count=c_cnt,
                    percentage=round(c_cnt / tot_c * 100, 1),
                )
            )

        # 9. Conversions (Stage Conversion Metrics)
        d_to_hi = round(high_intent_count / discovered_count * 100, 1) if discovered_count > 0 else 0.0
        hi_to_cont = (
            round(contacted_count / high_intent_count * 100, 1) if high_intent_count > 0 else 0.0
        )
        cont_to_qual = (
            round(interested_count / contacted_count * 100, 1) if contacted_count > 0 else 0.0
        )
        qual_to_meet = (
            round(converted_count / interested_count * 100, 1) if interested_count > 0 else 0.0
        )

        conversions = [
            StageConversionMetric(
                id="c-1",
                title="Discovery to High Intent",
                fromStage="Discovered",
                toStage="High Intent",
                rate=d_to_hi,
                benchmark=40.0,
                status="above" if d_to_hi >= 40 else ("on_track" if d_to_hi >= 20 else "below"),
            ),
            StageConversionMetric(
                id="c-2",
                title="High Intent to Contacted",
                fromStage="High Intent",
                toStage="Contacted",
                rate=hi_to_cont,
                benchmark=50.0,
                status="above" if hi_to_cont >= 50 else ("on_track" if hi_to_cont >= 25 else "below"),
            ),
            StageConversionMetric(
                id="c-3",
                title="Contacted to Qualified",
                fromStage="Contacted",
                toStage="Qualified",
                rate=cont_to_qual,
                benchmark=30.0,
                status="above" if cont_to_qual >= 30 else ("on_track" if cont_to_qual >= 15 else "below"),
            ),
            StageConversionMetric(
                id="c-4",
                title="Qualified to Meeting Booked",
                fromStage="Qualified",
                toStage="Meeting Booked",
                rate=qual_to_meet,
                benchmark=50.0,
                status="above" if qual_to_meet >= 50 else ("on_track" if qual_to_meet >= 25 else "below"),
            ),
        ]

        # 10. Source Performance
        source_groups = {}
        for l in curr_leads:
            src = l.source or "Direct Channel"
            if src not in source_groups:
                source_groups[src] = []
            source_groups[src].append(l)

        source_perf: List[SourcePerformanceItem] = []
        for src_name, s_leads in source_groups.items():
            s_disc = len(s_leads)
            s_hi = sum(1 for sl in s_leads if (sl.intent_score or 0) >= 80)
            s_qual = sum(1 for sl in s_leads if sl.status in ("qualified", "interested", "converted"))
            s_scores = [sl.intent_score for sl in s_leads if sl.intent_score is not None]
            s_avg = round(sum(s_scores) / len(s_scores), 1) if s_scores else 0.0
            s_rate = round(s_qual / s_disc * 100, 1) if s_disc > 0 else 0.0
            source_perf.append(
                SourcePerformanceItem(
                    sourceKey=src_name.lower().replace(" ", "_"),
                    sourceLabel=src_name,
                    discoveredLeads=s_disc,
                    highIntentLeads=s_hi,
                    qualifiedLeads=s_qual,
                    qualificationRate=s_rate,
                    avgIntentScore=s_avg,
                )
            )
        source_perf.sort(key=lambda x: x.discoveredLeads, reverse=True)

        # 11. Industry Performance
        ind_groups = {}
        for l in curr_leads:
            ind = l.industry or "General Industry"
            if ind not in ind_groups:
                ind_groups[ind] = []
            ind_groups[ind].append(l)

        ind_perf: List[IndustryPerformanceItem] = []
        for ind_name, i_leads in ind_groups.items():
            i_disc = len(i_leads)
            i_hi = sum(1 for il in i_leads if (il.intent_score or 0) >= 80)
            i_qual = sum(1 for il in i_leads if il.status in ("qualified", "interested", "converted"))
            i_rate = round(i_qual / i_disc * 100, 1) if i_disc > 0 else 0.0
            i_val_l = i_hi * 40
            i_val_str = f"₹{round(i_val_l / 100, 2)}Cr" if i_val_l >= 100 else f"₹{i_val_l}L"
            ind_perf.append(
                IndustryPerformanceItem(
                    industry=ind_name,
                    discoveredLeads=i_disc,
                    highIntentCount=i_hi,
                    qualifiedCount=i_qual,
                    qualificationRate=i_rate,
                    totalEstimatedValue=i_val_str if i_val_l > 0 else "₹0",
                )
            )
        ind_perf.sort(key=lambda x: x.discoveredLeads, reverse=True)

        # 12. Trend Chart Data (Connected AI calls across date range)
        days_count = max(1, (end_dt.date() - start_dt.date()).days + 1)
        trend_points: List[TrendChartPoint] = []
        if days_count <= 14:
            for d_idx in range(days_count):
                day_date = start_dt.date() + timedelta(days=d_idx)
                day_calls = sum(
                    1 for c in curr_calls if c.created_at and c.created_at.date() == day_date
                )
                day_label = day_date.strftime("%a %d")
                trend_points.append(
                    TrendChartPoint(label=day_label, value=day_calls, highlight=(day_calls > 0))
                )
        else:
            bucket_size = max(1, days_count // 7)
            for b in range(7):
                b_start = start_dt.date() + timedelta(days=b * bucket_size)
                b_end = min(end_dt.date(), b_start + timedelta(days=bucket_size - 1))
                b_calls = sum(
                    1 for c in curr_calls if c.created_at and b_start <= c.created_at.date() <= b_end
                )
                b_label = f"{b_start.strftime('%b %d')}"
                trend_points.append(
                    TrendChartPoint(label=b_label, value=b_calls, highlight=(b_calls > 0))
                )

        # 13. Executive Metrics with Real Comparative Trends
        est_val_lakhs = high_intent_count * 40
        prev_high_intent = sum(1 for l in prev_leads if (l.intent_score or 0) >= 80)
        prev_val_lakhs = prev_high_intent * 40
        val_trend_pct, val_trend_dir = calc_trend(est_val_lakhs, prev_val_lakhs)
        pipeline_str = (
            f"₹{round(est_val_lakhs / 100, 2)}Cr"
            if est_val_lakhs >= 100
            else (f"₹{est_val_lakhs}L" if est_val_lakhs > 0 else "₹0")
        )

        prev_conv_rate = (
            round(
                len([l for l in prev_leads if l.status == "converted"]) / len(prev_leads) * 100, 1
            )
            if prev_leads
            else 0.0
        )
        conv_trend_pct, conv_trend_dir = calc_trend(overall_conv_rate, prev_conv_rate)

        prev_interested = sum(
            1 for l in prev_leads if l.status in ("qualified", "interested", "converted")
        )
        int_trend_pct, int_trend_dir = calc_trend(interested_count, prev_interested)

        calls_trend_pct, calls_trend_dir = calc_trend(tot_calls, len(prev_calls))

        exec_metrics = [
            ExecutiveMetric(
                id="pipeline-value",
                label="Identified Pipeline Value",
                value=pipeline_str,
                trendPercentage=val_trend_pct,
                trendDirection=val_trend_dir,
                comparisonLabel="vs previous period",
                context=(
                    f"Based on {high_intent_count} high-intent commercial vectors in period"
                    if high_intent_count > 0
                    else "No high-intent leads in selected period"
                ),
            ),
            ExecutiveMetric(
                id="funnel-conversion",
                label="End-to-End Conversion Rate",
                value=f"{overall_conv_rate}%",
                trendPercentage=conv_trend_pct,
                trendDirection=conv_trend_dir,
                comparisonLabel="vs previous period",
                context=(
                    f"{converted_count} of {discovered_count} leads converted in period"
                    if discovered_count > 0
                    else "No leads in selected period"
                ),
            ),
            ExecutiveMetric(
                id="active-opportunities",
                label="Active Qualified Leads",
                value=str(interested_count),
                trendPercentage=int_trend_pct,
                trendDirection=int_trend_dir,
                comparisonLabel="vs previous period",
                context=(
                    "Lead status qualified or meeting booked in period"
                    if interested_count > 0
                    else "No qualified leads in selected period"
                ),
            ),
            ExecutiveMetric(
                id="touchpoints-executed",
                label="Total AI Calls Executed",
                value=str(tot_calls),
                trendPercentage=calls_trend_pct,
                trendDirection=calls_trend_dir,
                comparisonLabel="vs previous period",
                context=(
                    f"Avg duration: {avg_dur // 60}m {avg_dur % 60}s"
                    if tot_calls > 0
                    else "No calls executed in selected period"
                ),
            ),
        ]

        # 14. Real AI Sales Insights
        insights: List[AnalyticsInsight] = []
        if source_perf:
            top_src = source_perf[0]
            insights.append(
                AnalyticsInsight(
                    id="ins-source-1",
                    category="HIGH_PERFORMING_SOURCE",
                    categoryLabel="Top Discovery Source",
                    title=f"{top_src.sourceLabel} Yielding Highest Lead Volume",
                    evidence=f"Discovered {top_src.discoveredLeads} accounts with {top_src.avgIntentScore} average intent score in selected period.",
                    whyItMatters="Concentrating outreach on the highest-yielding platform minimizes cost per opportunity.",
                    recommendedAction=f"Prioritize AI outbound voice calling across {top_src.sourceLabel} leads.",
                    ctaLabel="View Source Leads",
                    ctaTarget="/leads",
                )
            )
        if tot_calls > 0:
            insights.append(
                AnalyticsInsight(
                    id="ins-call-1",
                    category="CALL_CONVERSION",
                    categoryLabel="Voice Qualification Efficiency",
                    title=f"AI Agent Achieved {call_perf.qualificationRate}% Qualification Rate",
                    evidence=f"{call_perf.qualifiedCalls} of {tot_calls} connected conversations met buyer qualification criteria in selected period.",
                    whyItMatters="Rapid conversational qualification reduces manual BDR discovery overhead and accelerates pipeline speed.",
                    recommendedAction="Deploy automated email sequences for qualified prospects requesting follow-ups.",
                    ctaLabel="Review Calls",
                    ctaTarget="/calls",
                )
            )
        if discovered_count > 0 and contacted_count < discovered_count:
            uncontacted = discovered_count - contacted_count
            insights.append(
                AnalyticsInsight(
                    id="ins-funnel-1",
                    category="INTENT_VELOCITY",
                    categoryLabel="Outreach Opportunity",
                    title=f"{uncontacted} Uncontacted Discovered Leads in Period",
                    evidence=f"{uncontacted} discovered accounts remain in new/uncontacted status during this date range.",
                    whyItMatters="Buyer signals decay quickly; engaging within 48 hours maximizes qualification and meeting booking rates.",
                    recommendedAction="Launch autonomous voice calling batch from the Sales Action Center.",
                    ctaLabel="Go to Action Center",
                    ctaTarget="/action-center",
                )
            )
        if not insights:
            insights.append(
                AnalyticsInsight(
                    id="ins-empty",
                    category="INTENT_VELOCITY",
                    categoryLabel="Pipeline Operational State",
                    title="No Outreach Activity Recorded in Selected Period",
                    evidence="The selected date filter contains no lead discoveries or outbound calls.",
                    whyItMatters="Live sales telemetry updates automatically as soon as discovery or calling operations occur.",
                    recommendedAction="Select a broader timeframe like 30 Days or initiate Lead Discovery.",
                    ctaLabel="Discover Leads",
                    ctaTarget="/leads/discover",
                )
            )

        return AnalyticsMetricsResponse(
            dateRange=date_range,
            discoveredCount=discovered_count,
            contactedCount=contacted_count,
            interestedCount=interested_count,
            convertedCount=converted_count,
            conversionRate=overall_conv_rate,
            funnelStages=funnel_stages,
            funnelInsightText=FunnelInsightText(
                highlight=highlight_msg,
                dropOffDetail=drop_detail,
            ),
            executiveMetrics=exec_metrics,
            intentDistribution=intent_dist,
            callPerformance=call_perf,
            callOutcomes=call_outcomes,
            conversions=conversions,
            sourcePerformance=source_perf,
            industryPerformance=ind_perf,
            insights=insights,
            trendChartData=trend_points,
        )
