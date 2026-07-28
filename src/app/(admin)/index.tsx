import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import {
  PrincipalDashboardResponse,
  AccountantDashboardResponse,
  LibrarianDashboardResponse,
  TransportDashboardResponse,
  ReceptionDashboardResponse,
} from '../../types/dashboard';
import ScreenHeader from '../../components/ScreenHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ListItemCard from '../../components/ListItemCard';
import EmptyState from '../../components/EmptyState';

/**
 * (admin) landing screen — dispatches to the dashboard matching the active role.
 *
 * FIX: previously only SuperAdmin was special-cased and every other admin-group role
 * fell through to PrincipalDashboardScreen. Accountant / Librarian / TransportManager /
 * Reception therefore called GET /api/dashboards/principal, which is restricted to
 * Policies.PrincipalOrSuperAdmin — returning 403 "you do not have permission" with an
 * empty body under a Principal header.
 */
export default function AdminHomeScreen() {
  const { activeRole } = useAuth();

  switch (activeRole?.roleName) {
    case 'SuperAdmin':
      return <Redirect href={'/(admin)/cross-school' as never} />;
    case 'Accountant':
      return <AccountantDashboardScreen />;
    case 'Librarian':
      return <LibrarianDashboardScreen />;
    case 'TransportManager':
      return <TransportDashboardScreen />;
    case 'Reception':
      return <ReceptionDashboardScreen />;
    case 'Principal':
      return <PrincipalDashboardScreen />;
    default:
      // Unknown / not-yet-resolved role — let the root router re-dispatch.
      return <Redirect href={'/' as never} />;
  }
}

/** Formats a number as Nepali Rupees for the finance widgets. */
function money(value: number | undefined | null): string {
  return `Rs. ${(value ?? 0).toLocaleString('en-IN')}`;
}

// ── Accountant ─────────────────────────────────────────────────────────────
function AccountantDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AccountantDashboardResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setData(await dashboardService.getAccountantDashboard());
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load accountant dashboard.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title="Accounts Dashboard"
          subtitle="Fee collection and outstanding dues"
          showBackButton={false}
        />
      </View>

      {data ? (
        <ScrollView className="flex-1 px-4">
          <View className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-4 items-center">
            <Text className="text-4xl font-body-bold text-primary-600">
              {money(data.todayFeeCollection)}
            </Text>
            <Text className="text-sm font-body-semibold text-slate-700 mt-1">Collected Today</Text>
          </View>

          <ListItemCard
            title="Month-to-Date Collection"
            subtitle="Total received this month"
            badge={money(data.monthToDateFeeCollection)}
            badgeColor="mint"
          />

          <ListItemCard
            title="Pending Payment Claims"
            subtitle="Parent-submitted payments awaiting approval"
            badge={`${data.pendingPaymentsCount}`}
            badgeColor="secondary"
            onPress={() => router.push('/(admin)/fees/pending-payments' as any)}
          />

          <ListItemCard
            title="Outstanding Dues"
            subtitle="Across all active students"
            badge={money(data.totalOutstandingDues)}
            badgeColor="coral"
            onPress={() => router.push('/(admin)/fees/defaulters' as any)}
          />

          <ListItemCard
            title="Fee Defaulters"
            subtitle="Students with an unpaid balance"
            badge={`${data.feeDefaultersCount}`}
            badgeColor="coral"
            onPress={() => router.push('/(admin)/fees/defaulters' as any)}
          />

          <Text className="text-base font-body-bold text-slate-800 mt-4 mb-2">Modules</Text>

          <ListItemCard
            title="Fee Heads & Structure"
            subtitle="Configure fee heads and per-class amounts"
            badge="Setup"
            badgeColor="primary"
            onPress={() => router.push('/(admin)/fees/heads' as any)}
          />

          <ListItemCard
            title="Reports & Exports"
            subtitle="Daily and periodic collection reports"
            badge="Reports"
            badgeColor="mint"
            onPress={() => router.push('/(admin)/reports' as any)}
          />

          <View className="h-8" />
        </ScrollView>
      ) : (
        <View className="px-4">
          <EmptyState
            icon="alert-circle-outline"
            title="Couldn't load your dashboard"
            message="Please try again in a moment."
          />
        </View>
      )}
    </View>
  );
}

// ── Librarian ──────────────────────────────────────────────────────────────
function LibrarianDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LibrarianDashboardResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setData(await dashboardService.getLibrarianDashboard());
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load librarian dashboard.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title="Library Dashboard"
          subtitle="Book lending and returns"
          showBackButton={false}
        />
      </View>

      {data ? (
        <ScrollView className="flex-1 px-4">
          <View className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-4 items-center">
            <Text className="text-4xl font-body-bold text-primary-600">{data.booksCurrentlyIssued}</Text>
            <Text className="text-sm font-body-semibold text-slate-700 mt-1">Books Currently Issued</Text>
          </View>

          <ListItemCard
            title="Overdue Books"
            subtitle="Past their due date and not returned"
            badge={`${data.overdueBooksCount}`}
            badgeColor="coral"
            onPress={() => router.push('/(admin)/library/overdue' as any)}
          />

          <ListItemCard
            title="Returned This Week"
            subtitle="Books checked back in over the last 7 days"
            badge={`${data.recentlyReturnedThisWeek}`}
            badgeColor="mint"
          />

          <Text className="text-base font-body-bold text-slate-800 mt-4 mb-2">Modules</Text>

          <ListItemCard
            title="Book Catalog"
            subtitle="Browse, add, and issue books"
            badge="Catalog"
            badgeColor="primary"
            onPress={() => router.push('/(admin)/library/books' as any)}
          />

          <ListItemCard
            title="Reports & Exports"
            subtitle="Library circulation reports"
            badge="Reports"
            badgeColor="mint"
            onPress={() => router.push('/(admin)/reports' as any)}
          />

          <View className="h-8" />
        </ScrollView>
      ) : (
        <View className="px-4">
          <EmptyState
            icon="alert-circle-outline"
            title="Couldn't load your dashboard"
            message="Please try again in a moment."
          />
        </View>
      )}
    </View>
  );
}

// ── Transport Manager ──────────────────────────────────────────────────────
function TransportDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TransportDashboardResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setData(await dashboardService.getTransportDashboard());
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load transport dashboard.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title="Transport Dashboard"
          subtitle="Fleet, routes, and active trips"
          showBackButton={false}
        />
      </View>

      {data ? (
        <ScrollView className="flex-1 px-4">
          <View className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-4 items-center">
            <Text className="text-4xl font-body-bold text-primary-600">{data.activeTripsCount}</Text>
            <Text className="text-sm font-body-semibold text-slate-700 mt-1">Active Trips Right Now</Text>
          </View>

          <ListItemCard
            title="Vehicles In Service"
            subtitle="Buses currently marked active"
            badge={`${data.vehiclesInServiceCount}`}
            badgeColor="mint"
          />

          <ListItemCard
            title="Routes"
            subtitle="Configured pickup and drop routes"
            badge={`${data.totalRoutesCount}`}
            badgeColor="secondary"
            onPress={() => router.push('/(admin)/transport/routes' as any)}
          />

          <ListItemCard
            title="Students Assigned"
            subtitle="Students using school transport"
            badge={`${data.totalAssignedStudentsCount}`}
            badgeColor="primary"
          />

          <Text className="text-base font-body-bold text-slate-800 mt-4 mb-2">Modules</Text>

          <ListItemCard
            title="Routes & Trips"
            subtitle="Manage routes, checkpoints, and trip logs"
            badge="Transport"
            badgeColor="secondary"
            onPress={() => router.push('/(admin)/transport/routes' as any)}
          />

          <ListItemCard
            title="Reports & Exports"
            subtitle="Trip history reports"
            badge="Reports"
            badgeColor="mint"
            onPress={() => router.push('/(admin)/reports' as any)}
          />

          <View className="h-8" />
        </ScrollView>
      ) : (
        <View className="px-4">
          <EmptyState
            icon="alert-circle-outline"
            title="Couldn't load your dashboard"
            message="Please try again in a moment."
          />
        </View>
      )}
    </View>
  );
}

// ── Reception ──────────────────────────────────────────────────────────────
function ReceptionDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReceptionDashboardResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setData(await dashboardService.getReceptionDashboard());
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load reception dashboard.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title="Reception Dashboard"
          subtitle="Admissions and visitor log"
          showBackButton={false}
        />
      </View>

      {data ? (
        <ScrollView className="flex-1 px-4">
          <View className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-4 items-center">
            <Text className="text-4xl font-body-bold text-primary-600">{data.todayVisitorsCount}</Text>
            <Text className="text-sm font-body-semibold text-slate-700 mt-1">Visitors Today</Text>
          </View>

          <ListItemCard
            title="Currently Inside"
            subtitle="Visitors who have not signed out"
            badge={`${data.openVisitorsCount}`}
            badgeColor="coral"
            onPress={() => router.push('/(admin)/reception/visitor-logs' as any)}
          />

          <ListItemCard
            title="Admissions This Month"
            subtitle="New students enrolled"
            badge={`${data.admissionsThisMonth}`}
            badgeColor="mint"
            onPress={() => router.push('/(admin)/students' as any)}
          />

          <Text className="text-base font-body-bold text-slate-800 mt-4 mb-2">Active Students by Class</Text>

          {data.classStudentCounts.length > 0 ? (
            data.classStudentCounts.map((c) => (
              <ListItemCard
                key={c.classId}
                title={c.className}
                subtitle="Active students"
                badge={`${c.activeStudentsCount}`}
                badgeColor="primary"
              />
            ))
          ) : (
            <Text className="text-slate-500 font-body text-sm mb-2">No classes configured yet.</Text>
          )}

          <Text className="text-base font-body-bold text-slate-800 mt-4 mb-2">Modules</Text>

          <ListItemCard
            title="New Visitor Entry"
            subtitle="Log a visitor arriving at the gate"
            badge="Visitors"
            badgeColor="secondary"
            onPress={() => router.push('/(admin)/reception/create-visitor' as any)}
          />

          <View className="h-8" />
        </ScrollView>
      ) : (
        <View className="px-4">
          <EmptyState
            icon="alert-circle-outline"
            title="Couldn't load your dashboard"
            message="Please try again in a moment."
          />
        </View>
      )}
    </View>
  );
}

// ── Principal ──────────────────────────────────────────────────────────────
function PrincipalDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PrincipalDashboardResponse | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getPrincipalDashboard();
      setData(res);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load principal dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title="Principal Dashboard"
          subtitle="School overview and module management"
          showBackButton={false}
        />
      </View>

      {data ? (
        <ScrollView className="flex-1 px-4">
          {/* Active Students Summary */}
          <View className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-4 items-center">
            <Text className="text-4xl font-body-bold text-primary-600">{data.totalActiveStudents}</Text>
            <Text className="text-sm font-body-semibold text-slate-700 mt-1">Total Active Students</Text>
          </View>

          <ListItemCard
            title="Teacher Attendance Today"
            subtitle={`${data.todayTeacherPresentCount} / ${data.todayTeacherTotalCount} Present`}
            badge={`${Math.round((data.todayTeacherPresentCount / (data.todayTeacherTotalCount || 1)) * 100)}%`}
            badgeColor="mint"
            // FIX (#4, #10): was routing to the STUDENT attendance report.
            onPress={() => router.push('/(admin)/academic/teacher-attendance' as any)}
          />

          <ListItemCard
            title="Student Attendance %"
            subtitle="Today's attendance average"
            badge={`${data.todayStudentAttendancePercentage}%`}
            badgeColor="primary"
            onPress={() => router.push('/(admin)/academic/attendance' as any)}
          />


          <ListItemCard
            title="Pending Discounts"
            subtitle={`${data.pendingDiscountsCount} pending requests`}
            badge="Pending"
            badgeColor="coral"
            onPress={() => router.push('/(admin)/fees/discounts' as any)}
          />

          {/* Module Navigation Cards */}
          <Text className="text-base font-body-bold text-slate-800 mt-4 mb-2">School Modules</Text>

          <ListItemCard
            title="Academic Structure"
            subtitle="Academic years, classes, sections, subjects"
            badge="Academic"
            badgeColor="primary"
            onPress={() => router.push('/(admin)/academic')}
          />

          <ListItemCard
            title="Staff & Teachers"
            subtitle="Teacher profiles, qualifications, assignments"
            badge="Staff"
            badgeColor="mint"
            onPress={() => router.push('/(admin)/staff')}
          />

          <ListItemCard
            title="Students & Admissions"
            subtitle="Student roster, enrollment, transfers"
            badge="Students"
            badgeColor="primary"
            onPress={() => router.push('/(admin)/students')}
          />

          <ListItemCard
            title="Fee Management & Claims"
            subtitle="Fee heads, pending claims, defaulters aging"
            badge="Finance"
            badgeColor="coral"
            onPress={() => router.push('/(admin)/fees/pending-payments' as any)}
          />

          <ListItemCard
            title="Reception Visitors Log"
            subtitle="Single and group visitor log entries"
            badge="Reception"
            badgeColor="secondary"
            onPress={() => router.push('/(admin)/reception/visitor-logs' as any)}
          />

          <ListItemCard
            title="Library Catalog & Overdue"
            subtitle="Book catalog, issues, overdue returns"
            badge="Library"
            badgeColor="mint"
            onPress={() => router.push('/(admin)/library/books' as any)}
          />

          <ListItemCard
            title="Transport & Routes"
            subtitle="Drivers, vehicles, bus routes, trips"
            badge="Transport"
            badgeColor="secondary"
            onPress={() => router.push('/(admin)/transport/routes' as any)}
          />

          <ListItemCard
            title="Notices & Events"
            subtitle="Targeted announcements & events calendar"
            badge="Notices"
            badgeColor="primary"
            onPress={() => router.push('/(admin)/announcements' as any)}
          />

          <ListItemCard
            title="Reports & Export Center"
            subtitle="Attendance, collection, and ops CSV reports"
            badge="Reports"
            badgeColor="mint"
            onPress={() => router.push('/(admin)/reports' as any)}
          />

          <View className="h-8" />
        </ScrollView>
      ) : (
        <View className="px-4">
          <EmptyState
            icon="alert-circle-outline"
            title="Couldn't load your dashboard"
            message="Please try again in a moment."
          />
        </View>
      )}
    </View>
  );
}