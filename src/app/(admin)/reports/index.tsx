import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { reportService } from '../../../services/reportService';
import {
  FeeCollectionReportRow,
  DailyCollectionReportRow,
  LibraryReportSummary,
  VisitorReportSummary,
  TransportTripReportSummary,
} from '../../../types/reports';
import ScreenHeader from '../../../components/ScreenHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ListItemCard from '../../../components/ListItemCard';
import PrimaryButton from '../../../components/PrimaryButton';
import { feeService } from '../../../services/feeService';
import EmptyState from '../../../components/EmptyState';

/**
 * Reports & Export Center.
 *
 * FIX: the tab set is now derived from the active role. Previously the screen always
 * loaded the Financial tab (fee + daily collection), which is restricted to
 * Accountant/Principal per requirements §16 — so Librarian and Transport Manager
 * were greeted with a 403 popup on open. The transport trip report was also never
 * requested at all, despite existing in reportService and the backend.
 */
type TabKey = 'financial' | 'library' | 'visitors' | 'transport';

const TAB_LABELS: Record<TabKey, string> = {
  financial: 'Financial',
  library: 'Library',
  visitors: 'Visitors',
  transport: 'Transport',
};

/** Report tabs each role is allowed to see, per requirements §16. */
function tabsForRole(roleName: string | undefined): TabKey[] {
  switch (roleName) {
    case 'Principal':
    case 'SuperAdmin':
      return ['financial', 'library', 'visitors', 'transport'];
    case 'Accountant':
      return ['financial'];
    case 'Librarian':
      return ['library'];
    case 'Reception':
      return ['visitors'];
    case 'TransportManager':
      return ['transport'];
    default:
      return [];
  }
}

export default function ReportsCenterScreen() {
  const { activeRole } = useAuth();
  const allowedTabs = useMemo(() => tabsForRole(activeRole?.roleName), [activeRole?.roleName]);

  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [loading, setLoading] = useState(false);
    const [downloadingReceiptId, setDownloadingReceiptId] = useState<number | null>(null);

  const [feeCollection, setFeeCollection] = useState<FeeCollectionReportRow[]>([]);
  const [dailyCollection, setDailyCollection] = useState<DailyCollectionReportRow[]>([]);
  const [librarySummary, setLibrarySummary] = useState<LibraryReportSummary | null>(null);
  const [visitorSummary, setVisitorSummary] = useState<VisitorReportSummary | null>(null);
  const [transportSummary, setTransportSummary] = useState<TransportTripReportSummary | null>(null);

  // Default to the first tab this role is actually permitted to load.
  useEffect(() => {
    if (!activeTab && allowedTabs.length > 0) {
      setActiveTab(allowedTabs[0]);
    }
  }, [allowedTabs, activeTab]);

  const fetchReportData = useCallback(async (tab: TabKey) => {
    try {
      setLoading(true);
      if (tab === 'financial') {
        // Settled individually so one failure doesn't blank the whole tab.
        const [feeRes, dailyRes] = await Promise.allSettled([
          reportService.getFeeCollectionReport(),
          reportService.getDailyCollectionReport(),
        ]);
        setFeeCollection(feeRes.status === 'fulfilled' ? feeRes.value : []);
        setDailyCollection(dailyRes.status === 'fulfilled' ? dailyRes.value : []);
      } else if (tab === 'library') {
        setLibrarySummary(await reportService.getLibraryReport());
      } else if (tab === 'visitors') {
        setVisitorSummary(await reportService.getVisitorLogReport());
      } else if (tab === 'transport') {
        setTransportSummary(await reportService.getTransportTripReport());
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }, []);

    /** FIX (#6): reprint an existing receipt PDF from the daily collection log (§10.7). */
  const handleDownloadReceipt = async (receiptId: number, receiptNumber: string) => {
    try {
      setDownloadingReceiptId(receiptId);
      await feeService.downloadReceipt(receiptId, receiptNumber);
    } catch (err: any) {
      Alert.alert('Download failed', err.message || 'Could not download the receipt.');
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  useEffect(() => {
    if (activeTab) fetchReportData(activeTab);
  }, [activeTab, fetchReportData]);

  if (allowedTabs.length === 0) {
    return (
      <View className="flex-1 bg-cream-100">
        <View className="p-4">
          <ScreenHeader title="Reports & Export Center" subtitle="Report summaries" />
        </View>
        <View className="px-4">
          <EmptyState
            icon="lock-closed-outline"
            title="No Reports Available"
            message="Your role does not have access to any reports."
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title="Reports & Export Center"
          subtitle="Summaries available to your role"
        />
      </View>

      {/* Only render tabs this role may actually open. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-4"
        contentContainerStyle={{ gap: 8 }}
      >
        {allowedTabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`px-4 py-2.5 items-center rounded-xl ${
              activeTab === tab ? 'bg-primary-600' : 'bg-white border border-primary-100'
            }`}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              className={`text-xs font-body-bold ${
                activeTab === tab ? 'text-white' : 'text-slate-700'
              }`}
            >
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <LoadingSpinner />
      ) : activeTab === 'financial' ? (
        <ScrollView className="flex-1 px-4">
          <Text className="text-base font-body-bold text-slate-800 mb-2">Collection by Fee Head</Text>
          {feeCollection.length > 0 ? (
            feeCollection.map((row, idx) => (
              <ListItemCard
                key={idx}
                title={row.feeHeadName}
                subtitle={`Collected: NPR ${row.totalCollected.toLocaleString()} | Outstanding: NPR ${row.totalOutstanding.toLocaleString()}`}
                badge={`NPR ${row.totalCharged.toLocaleString()}`}
                badgeColor="primary"
              />
            ))
          ) : (
            <EmptyState icon="wallet-outline" title="No Fee Collection Data" message="No records found." />
          )}

          <Text className="text-base font-body-bold text-slate-800 mt-4 mb-2">Today's Receipts Log</Text>
          {dailyCollection.length > 0 ? (
            dailyCollection.map((r) => (
              <View key={r.receiptId} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3">
                <Text className="text-xs font-body-bold text-primary-600">Receipt #{r.receiptNumber}</Text>
                <Text className="text-base font-body-bold text-slate-800 mt-0.5">
                  {r.studentName} ({r.className})
                </Text>
                <Text className="text-xs font-body text-slate-500">
                  Method: {r.paymentMethod.toUpperCase()} | Ref: {r.referenceNumber || 'N/A'}
                </Text>
                                <Text className="text-sm font-body-bold text-emerald-600 mt-1">
                  Amount: NPR {r.amount.toLocaleString()}
                </Text>
                <View className="mt-3">
                  <PrimaryButton
                    label="Download Receipt"
                    icon="download-outline"
                    variant="outline"
                    isLoading={downloadingReceiptId === r.receiptId}
                    onPress={() => handleDownloadReceipt(r.receiptId, r.receiptNumber)}
                  />
                </View>
              </View>
            ))
          ) : (
            <EmptyState icon="receipt-outline" title="No Daily Receipts" message="No receipts generated today." />
          )}
          <View className="h-8" />
        </ScrollView>
      ) : activeTab === 'library' ? (
        <ScrollView className="flex-1 px-4">
          {librarySummary ? (
            <View className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-4">
              <Text className="text-base font-body-bold text-slate-800 mb-2">Library Overview</Text>
              <Text className="text-xs font-body text-slate-600">Total Catalog Titles: {librarySummary.totalCatalogBooks}</Text>
              <Text className="text-xs font-body text-slate-600">Total Physical Copies: {librarySummary.totalCopies}</Text>
              <Text className="text-xs font-body text-slate-600">Available Stock: {librarySummary.availableCopies}</Text>
              <Text className="text-xs font-body text-emerald-600 font-body-bold">Currently Issued: {librarySummary.currentlyIssuedCopies}</Text>
              <Text className="text-xs font-body text-coral-600 font-body-bold mt-1">Overdue Copies: {librarySummary.overdueCopiesCount}</Text>
            </View>
          ) : (
            <EmptyState icon="book-outline" title="No Library Data" message="No library records found." />
          )}
          <View className="h-8" />
        </ScrollView>
      ) : activeTab === 'visitors' ? (
        <ScrollView className="flex-1 px-4">
          {visitorSummary ? (
            <View className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-4">
              <Text className="text-base font-body-bold text-slate-800 mb-2">Visitor Traffic Overview</Text>
              <Text className="text-xs font-body text-slate-600">Total Visitor Entries: {visitorSummary.totalVisitorsCount}</Text>
              <Text className="text-xs font-body text-emerald-600 font-body-bold">Open Visits: {visitorSummary.openVisitsCount}</Text>
              <Text className="text-xs font-body text-slate-500 font-body-bold">Completed Departures: {visitorSummary.closedVisitsCount}</Text>
            </View>
          ) : (
            <EmptyState icon="clipboard-outline" title="No Visitor Data" message="No visitor records found." />
          )}
          <View className="h-8" />
        </ScrollView>
      ) : activeTab === 'transport' ? (
        <ScrollView className="flex-1 px-4">
          {/* FIX: this report was never rendered anywhere, despite existing
              in reportService and being permitted by §16. */}
          {transportSummary ? (
            <View className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-4">
              <Text className="text-base font-body-bold text-slate-800 mb-2">Transport Trip History</Text>
              {Object.entries(transportSummary as unknown as Record<string, unknown>).map(([key, value]) =>
                typeof value === 'number' || typeof value === 'string' ? (
                  <Text key={key} className="text-xs font-body text-slate-600">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}: {String(value)}
                  </Text>
                ) : null
              )}
            </View>
          ) : (
            <EmptyState icon="bus-outline" title="No Trip Data" message="No transport trips recorded." />
          )}
          <View className="h-8" />
        </ScrollView>
      ) : null}
    </View>
  );
}