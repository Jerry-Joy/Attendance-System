import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { History as HistoryIcon, UserCircle, QrCode, CheckCircle2, XCircle, Calendar, Clock, TrendingUp, Filter as FilterIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '@/src/contexts/AppContext';

type Filter = 'All' | 'Present' | 'Absent';

export default function HistoryTab() {
  const { history, fetchHistory, historyLoading } = useAppContext();
  const [filter, setFilter] = useState<Filter>('All');
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchHistory();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchHistory]);

  const filteredHistory = history.filter(record => {
    if (filter === 'All') return true;
    return filter.toLowerCase() === record.status;
  });

  const countFor = (f: Filter) =>
    f === 'All' ? history.length : history.filter(r => r.status === f.toLowerCase()).length;

  return (
    <View className="flex-1 bg-surface">
      {/* Simple Gradient Header */}
      <LinearGradient
        colors={['#081637', '#0A1F4D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View className="px-5 pb-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-white/70 font-medium tracking-wide uppercase">GCTU Connect</Text>
              <Text className="text-2xl font-bold text-white tracking-tight mt-1">Attendance History</Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-secondary items-center justify-center" style={styles.iconCircle}>
              <HistoryIcon size={24} color="#081637" strokeWidth={2} />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Section */}
      <View className="px-5 py-4">
        <View className="flex-row items-center gap-2 mb-3">
          <FilterIcon size={16} color="#081637" />
          <Text className="text-sm font-bold text-primary uppercase tracking-wider">Filter Records</Text>
        </View>
        
        <View className="flex-row bg-white p-1 rounded-xl border border-outline-variant" style={styles.filterContainer}>
          {(['All', 'Present', 'Absent'] as Filter[]).map(f => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className="flex-1 py-3 rounded-lg items-center active:opacity-80"
              style={{
                backgroundColor: filter === f ? '#081637' : 'transparent',
              }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: filter === f ? '#FFFFFF' : '#64748B' }}
              >
                {f}
              </Text>
              <Text
                className="text-xs font-semibold mt-0.5"
                style={{ color: filter === f ? '#F5B41C' : '#94A3B8' }}
              >
                {countFor(f)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#081637']} 
            tintColor="#081637"
            progressViewOffset={-20}
          />
        }
      >
        {historyLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" color="#081637" />
            <Text className="text-sm text-on-surface-variant font-semibold mt-4">Loading your records...</Text>
          </View>
        ) : filteredHistory.length === 0 ? (
          <View className="py-16 items-center gap-4">
            <View className="w-24 h-24 rounded-full items-center justify-center" style={{ backgroundColor: '#F1F5F9' }}>
              <HistoryIcon size={48} color="#CBD5E1" strokeWidth={1.5} />
            </View>
            <View className="items-center">
              <Text className="text-primary font-bold text-lg">No Records Found</Text>
              <Text className="text-on-surface-variant text-sm text-center px-8 mt-2 leading-relaxed">
                {filter === 'All' 
                  ? 'Your attendance records will appear here once you start marking attendance' 
                  : `No ${filter.toLowerCase()} records to show`}
              </Text>
            </View>
          </View>
        ) : (
          filteredHistory.map(record => {
            const isPresent = record.status === 'present';
            return (
              <View
                key={record.id}
                className="bg-white rounded-2xl overflow-hidden"
                style={[
                  styles.recordCard,
                  { 
                    borderLeftWidth: 6, 
                    borderLeftColor: isPresent ? '#16A34A' : '#DC2626',
                  }
                ]}
              >
                <View className="p-5 gap-3.5">
                  {/* Top row with status */}
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2.5 mb-2">
                        {isPresent ? (
                          <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
                            <CheckCircle2 size={22} color="#16A34A" strokeWidth={2.5} />
                          </View>
                        ) : (
                          <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                            <XCircle size={22} color="#DC2626" strokeWidth={2.5} />
                          </View>
                        )}
                        <View
                          className="px-3 py-1.5 rounded-lg"
                          style={{ 
                            backgroundColor: isPresent ? '#DCFCE7' : '#FEE2E2',
                            shadowColor: isPresent ? '#16A34A' : '#DC2626',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 2,
                          }}
                        >
                          <Text
                            className="text-sm font-bold uppercase tracking-wider"
                            style={{ color: isPresent ? '#15803D' : '#991B1B' }}
                          >
                            {record.status}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xl font-bold text-primary leading-tight">{record.courseName}</Text>
                      <Text className="text-base font-semibold mt-1" style={{ color: '#F5B41C' }}>{record.courseCode}</Text>
                    </View>
                  </View>

                  {/* Course details */}
                  <View className="flex-row items-center gap-2 bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant">
                    <UserCircle size={18} color="#64748B" />
                    <Text className="text-sm text-on-surface-variant font-medium flex-1">{record.lecturer}</Text>
                  </View>

                  {/* Bottom section */}
                  <View className="flex-row justify-between items-center pt-3 border-t-2 border-outline">
                    <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-lg">
                        <Calendar size={16} color="#64748B" />
                        <Text className="text-xs text-on-surface-variant font-semibold">{record.date}</Text>
                      </View>
                      <View className="flex-row items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-lg">
                        <Clock size={16} color="#081637" />
                        <Text className="text-xs text-primary font-bold">{record.time}</Text>
                      </View>
                    </View>
                    {record.method && (
                      <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#F5B41C' }}>
                        <QrCode size={14} color="#081637" strokeWidth={2.5} />
                        <Text className="text-[11px] uppercase font-bold text-primary tracking-wider">
                          {record.method}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  filterContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recordCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
