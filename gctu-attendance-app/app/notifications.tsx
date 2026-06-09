import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  BookOpen, 
  Clock,
  Trash2,
  CheckCheck
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotifications, NotificationType } from '@/src/contexts/NotificationContext';

const NOTIFICATION_ICONS: Record<NotificationType, any> = {
  session_start: Bell,
  session_ending: Clock,
  attendance_success: CheckCircle2,
  attendance_missed: XCircle,
  course_joined: BookOpen,
  course_update: AlertCircle,
  announcement: Bell,
};

const NOTIFICATION_COLORS: Record<NotificationType, { bg: string; icon: string; border: string }> = {
  session_start: { bg: '#DCFCE7', icon: '#16A34A', border: '#16A34A' },
  session_ending: { bg: '#FEF3C7', icon: '#F59E0B', border: '#F59E0B' },
  attendance_success: { bg: '#DCFCE7', icon: '#16A34A', border: '#16A34A' },
  attendance_missed: { bg: '#FEE2E2', icon: '#DC2626', border: '#DC2626' },
  course_joined: { bg: '#E0E7FF', icon: '#081637', border: '#081637' },
  course_update: { bg: '#FEF3C7', icon: '#F5B41C', border: '#F5B41C' },
  announcement: { bg: '#E0E7FF', icon: '#3B82F6', border: '#3B82F6' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, deleteNotification } = useNotifications();

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleNotificationPress = (notif: any) => {
    markAsRead(notif.id);
    
    // Handle actionable notifications
    if (notif.actionable && notif.actionData) {
      if (notif.type === 'session_start') {
        router.push('/scanner');
      }
    }
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <LinearGradient
        colors={['#081637', '#0A1F4D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View className="flex-row items-center justify-between px-5 pb-4">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:opacity-80 border border-white/20"
            >
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2} />
            </Pressable>
            <View>
              <Text className="text-2xl font-bold text-white tracking-tight">Notifications</Text>
              {unreadCount > 0 && (
                <Text className="text-sm text-white/70 font-medium mt-0.5">
                  {unreadCount} unread
                </Text>
              )}
            </View>
          </View>
          {notifications.length > 0 && (
            <Pressable
              onPress={markAllAsRead}
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 active:opacity-80"
            >
              <Text className="text-xs font-bold text-white">Mark All Read</Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>

      {/* Notifications List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 100 }}
      >
        {notifications.length === 0 ? (
          <View className="py-16 items-center gap-4">
            <View className="w-24 h-24 rounded-full items-center justify-center" style={{ backgroundColor: '#F1F5F9' }}>
              <Bell size={48} color="#CBD5E1" strokeWidth={1.5} />
            </View>
            <View className="items-center">
              <Text className="text-primary font-bold text-lg">No Notifications</Text>
              <Text className="text-on-surface-variant text-sm text-center px-8 mt-2 leading-relaxed">
                You're all caught up! New notifications will appear here
              </Text>
            </View>
          </View>
        ) : (
          <>
            {notifications.map((notif) => {
              const Icon = NOTIFICATION_ICONS[notif.type];
              const colors = NOTIFICATION_COLORS[notif.type];
              
              return (
                <Pressable
                  key={notif.id}
                  onPress={() => handleNotificationPress(notif)}
                  className="active:opacity-80"
                >
                  <View
                    className="bg-white rounded-xl overflow-hidden"
                    style={[
                      styles.notificationCard,
                      {
                        borderLeftWidth: 4,
                        borderLeftColor: colors.border,
                        opacity: notif.read ? 0.6 : 1,
                      }
                    ]}
                  >
                    <View className="p-4 flex-row gap-3">
                      {/* Icon */}
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: colors.bg }}
                      >
                        <Icon size={22} color={colors.icon} strokeWidth={2} />
                      </View>

                      {/* Content */}
                      <View className="flex-1">
                        <View className="flex-row items-start justify-between mb-1">
                          <Text className="text-base font-bold text-primary flex-1">
                            {notif.title}
                          </Text>
                          {!notif.read && (
                            <View className="w-2 h-2 rounded-full bg-secondary ml-2 mt-1.5" />
                          )}
                        </View>
                        
                        <Text className="text-sm text-on-surface-variant leading-relaxed mb-2">
                          {notif.message}
                        </Text>

                        {notif.courseCode && (
                          <View className="flex-row items-center gap-2 mb-2">
                            <View className="px-2 py-1 rounded bg-surface">
                              <Text className="text-xs font-bold text-secondary">
                                {notif.courseCode}
                              </Text>
                            </View>
                            {notif.courseName && (
                              <Text className="text-xs text-on-surface-variant font-medium">
                                {notif.courseName}
                              </Text>
                            )}
                          </View>
                        )}

                        <View className="flex-row items-center justify-between">
                          <Text className="text-xs text-on-surface-variant font-medium">
                            {formatTimestamp(notif.timestamp)}
                          </Text>
                          
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="p-1.5 rounded-lg bg-surface active:opacity-70"
                          >
                            <Trash2 size={14} color="#64748B" />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}

            {/* Clear All Button */}
            {notifications.length > 0 && (
              <Pressable
                onPress={clearAll}
                className="mt-4 py-3 rounded-xl border-2 border-outline-variant items-center active:opacity-70"
              >
                <Text className="text-sm font-bold text-on-surface-variant">Clear All Notifications</Text>
              </Pressable>
            )}
          </>
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
  notificationCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
});
