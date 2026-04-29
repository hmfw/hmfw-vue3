<template>
  <el-dropdown
    trigger="click"
    @command="handleNotification"
    @visible-change="handleNotificationVisible"
  >
    <el-badge :value="unreadCount" :max="99" class="notification-badge">
      <el-icon class="header-action">
        <Bell />
      </el-icon>
    </el-badge>
    <template #dropdown>
      <el-dropdown-menu class="notification-dropdown">
        <div class="notification-header">
          <span>通知中心</span>
          <el-link @click="clearNotifications">清空</el-link>
        </div>
        <div class="notification-list">
          <div
            v-for="item in notifications"
            :key="item.id"
            :class="['notification-item', { unread: !item.read }]"
            @click="readNotification(item)"
          >
            <div class="notification-icon">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ item.title }}</div>
              <div class="notification-desc">{{ item.description }}</div>
              <div class="notification-time">{{ item.time }}</div>
            </div>
          </div>
        </div>
        <div class="notification-footer">
          <el-link @click="viewAllNotifications">查看全部</el-link>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import { Bell, Message, Warning, CircleCheck, InfoFilled } from '@element-plus/icons-vue'

interface Notification {
  id: number
  title: string
  description: string
  icon: any
  time: string
  read: boolean
  type: 'success' | 'warning' | 'info' | 'error'
}

const router = useRouter()
const unreadCount = ref(3)
const notifications = shallowRef<Notification[]>([
  {
    id: 1,
    title: '新消息通知',
    description: '您有新的消息待处理',
    icon: Message,
    time: '刚刚',
    read: false,
    type: 'info',
  },
  {
    id: 2,
    title: '系统升级提醒',
    description: '系统将于今晚进行升级维护',
    icon: Warning,
    time: '10分钟前',
    read: false,
    type: 'warning',
  },
  {
    id: 3,
    title: '订单处理完成',
    description: '您的订单已经处理完成',
    icon: CircleCheck,
    time: '1小时前',
    read: true,
    type: 'success',
  },
  {
    id: 4,
    title: '安全提醒',
    description: '请及时修改您的密码',
    icon: InfoFilled,
    time: '2小时前',
    read: true,
    type: 'info',
  },
])

const handleNotification = (command: string) => {
  console.log('Notification command:', command)
}

const handleNotificationVisible = (visible: boolean) => {
  if (visible) {
    // 标记为已读
    notifications.value.forEach(item => {
      if (!item.read) {
        item.read = true
        unreadCount.value--
      }
    })
  }
}

const readNotification = (notification: Notification) => {
  if (!notification.read) {
    notification.read = true
    unreadCount.value--
  }
}

const clearNotifications = () => {
  notifications.value = []
  unreadCount.value = 0
}

const viewAllNotifications = () => {
  router.push('/notifications')
}
</script>
<style lang="scss">
.notification-badge {
  cursor: pointer;

  :deep(.el-badge__content) {
    top: 8px;
    right: 8px;
    background-color: var(--error-color);
  }
}

.notification-dropdown {
  width: 360px;
  padding: 0;

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;

    span {
      font-weight: 600;
      font-size: 14px;
    }

    .el-button {
      padding: 0;
      font-size: 12px;
    }
  }

  .notification-list {
    max-height: 320px;
    overflow-y: auto;
    padding: 8px 0;

    .notification-item {
      display: flex;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }

      &.unread {
        background-color: #f0f9ff;

        &:hover {
          background-color: #e6f4ff;
        }
      }

      .notification-icon {
        margin-right: 12px;

        .el-icon {
          font-size: 20px;
          color: var(--el-color-primary);
        }
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        .notification-title {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }

        .notification-desc {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .notification-time {
          font-size: 12px;
          color: #c0c4cc;
        }
      }
    }
  }

  .notification-footer {
    text-align: center;
    padding: 8px 16px;
    border-top: 1px solid #f0f0f0;

    .el-button {
      width: 100%;
      color: var(--el-color-primary);
    }
  }
}
</style>
