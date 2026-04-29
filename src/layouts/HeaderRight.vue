<template>
  <div class="header-right flex items-center gap-16">
    <!-- 主题切换 -->
    <el-tooltip
      :content="layout.isDarkTheme ? '切换到亮色主题' : '切换到暗色主题'"
      placement="bottom"
    >
      <el-icon class="cursor-pointer" @click="layout.toggleTheme">
        <Sunny v-if="layout.isDarkTheme" />
        <Moon v-else />
      </el-icon>
    </el-tooltip>

    <!-- 通知 -->
    <HeaderNotification />

    <!-- 用户信息 -->
    <el-dropdown @command="handleUserCommand" class="ml-8 cursor-pointer">
      <div class="flex items-center gap-6">
        <el-avatar :size="32" :src="userInfo.avatar" />
        <div class="user-name">{{ userInfo.name }}</div>
        <el-icon><ArrowDown /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="user-menu">
          <el-dropdown-item command="profile">
            <el-icon><User /></el-icon>
            个人中心
          </el-dropdown-item>
          <el-dropdown-item command="settings">
            <el-icon><Setting /></el-icon>
            账户设置
          </el-dropdown-item>
          <el-dropdown-item command="logout" divided>
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import { Sunny, Moon, ArrowDown, User, Setting, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import HeaderNotification from './HeaderNotification.vue'

// 用户信息
interface UserInfo {
  name: string
  avatar?: string
  role?: string
  department?: string
}

// Store & Router
const layout = useLayoutStore()
const router = useRouter()

const userInfo = ref<UserInfo>({
  name: 'Admin',
  avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  role: '管理员',
  department: '技术部',
})

// 方法
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 清除用户信息
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')

      // 跳转到登录页
      router.push('/login')

      ElMessage.success('退出成功')
    })
    .catch(() => {
      // 用户取消
    })
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      handleLogout()
      break
  }
}
</script>
