<script lang="ts" setup>
import {reactive} from 'vue';
import axios from 'axios';
import {sm3} from 'sm-crypto';
import router from "@/router";
import {Eye, EyeOff} from 'lucide-vue-next';

// 登录表单数据
const form = reactive({
  username: '',
  password: ''
})

// 状态管理
const state = reactive({
  loading: false,
  showPassword: false,
  showSetPasswordModal: false // 控制密码设置弹窗显示
})

// 密码设置表单
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

// 密码验证状态
const passwordState = reactive({
  mismatch: false,
  error: ''
})

// 登录处理
async function login() {
  try {
    let password = sm3(form.password);
    state.loading = true;

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:8080/sys/login',
      data: {
        userName: form.username,
        password: password
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data

  } catch (error: any) {
    console.log(error)
    return {code: 500, message: error.message || '登录失败'}
  } finally {
    state.loading = false;
  }
}

// 提交新密码
async function submitNewPassword() {
  // 验证密码
  if (!passwordForm.newPassword) {
    passwordState.error = '请输入新密码';
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordState.mismatch = true;
    passwordState.error = '';
    return;
  }

  // 可以添加密码强度验证
  if (passwordForm.newPassword.length < 6) {
    passwordState.error = '密码长度不能少于6位';
    return;
  }

  try {
    // 调用API提交新密码
    const encryptedPassword = sm3(passwordForm.newPassword);
    await axios({
      method: 'POST',
      url: 'http://localhost:8080/sys/update-password',
      params: {
        userId: localStorage.getItem('userId'),
        newPassword: encryptedPassword
      },
      headers: {
        [localStorage.getItem('tokenName') as string]: localStorage.getItem('tokenValue')
      }
    })

    // 密码设置成功，关闭弹窗并跳转到首页
    state.showSetPasswordModal = false;
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    passwordState.mismatch = false;
    passwordState.error = '';

  } catch (error: any) {
    passwordState.error = error.message || '密码设置失败，请重试';
  }
}

// 表单提交
const onSubmit = async () => {
  let value = await login();
  console.log(value);

  if (value.code === 200) {
    // 保存用户信息
    localStorage.setItem('userId', value.data.userId);
    localStorage.setItem('userName', value.data.userName);
    localStorage.setItem('role', value.data.role);
    localStorage.setItem('tokenName', value.data.tokenName);
    localStorage.setItem('tokenValue', value.data.tokenValue);

    // 首次登录需要设置密码
    if (value.data.firstLogin) {
      state.showSetPasswordModal = true; // 显示密码设置弹窗
    } else if (value.data.role == 'ADMIN') {
      router.push('/admin').catch(error => {
        console.log(error)
      })
    } else if (value.data.role == 'USER') {
      router.push('/user').catch(error => {
        console.log(error)
      })
    } else {
      alert('登录失败，请重试')
    }
  } else {
    alert(value.message || '登录失败，请重试')
  }
}

// 检查密码匹配
const checkPasswordMatch = () => {
  passwordState.mismatch = passwordForm.newPassword !== passwordForm.confirmPassword;
  if (passwordState.mismatch) {
    passwordState.error = '';
  }
}
</script>

<template>
  <div class="fullscreen-background"></div>
  <div>
    <!-- 登录卡片容器 -->
    <div class="login-wrapper">
      <!-- 登录卡片 -->
      <div class="login-card">
        <!-- 登录标题区域 -->
        <div class="login-header">
          <div class="logo">
            <img alt="CoinSec Logo" class="logo-img" src="@/assets/logo.svg"/>
          </div>
          <h1>系统登录</h1>
          <p>请输入账号信息登录系统</p>
        </div>

        <!-- 登录表单 -->
        <el-form
            :model="form"
            :rules="{
            username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
            password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
          }"
            class="login-form"
            label-width="80px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
                v-model="form.username"
                class="form-input"
                placeholder="请输入用户名"
                prefix-icon="User"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
                v-model="form.password"
                :type="state.showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请输入密码"
                prefix-icon="Lock"
            >
              <template #suffix>
                <el-icon class="cursor-pointer" @click="state.showPassword = !state.showPassword">
                  <EyeOff v-if="state.showPassword"/>
                  <Eye v-else/>
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item class="form-actions">
            <el-button
                :loading="state.loading"
                class="login-button"
                type="primary"
                @click="onSubmit"
            >
              登录
            </el-button>
            <div class="links">
              <a class="link">
                <router-link to="/forget">
                  忘记密码?
                </router-link>
              </a>
              <span>&nbsp;&nbsp;</span>
              <a class="link">
                <router-link to="/register">
                  注册账号
                </router-link>
              </a>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="login-footer">
      © 2023 系统登录页面 - 版权所有
    </footer>
  </div>

  <!-- 首次登录密码设置弹窗 -->
  <el-dialog
      v-model="state.showSetPasswordModal"
      :close-on-click-modal="false"
      :show-close="false"
      title="设置初始密码"
      width="400px"
  >
    <div class="password-setting">
      <p class="text-gray-600 mb-4">请设置您的初始登录密码以完成首次登录</p>

      <el-form-item class="mb-2" label="新密码">
        <el-input
            v-model="passwordForm.newPassword"
            placeholder="请输入新密码"
            prefix-icon="Lock"
            type="password"
            @input="checkPasswordMatch"
        />
      </el-form-item>

      <el-form-item class="mb-2" label="确认密码">
        <el-input
            v-model="passwordForm.confirmPassword"
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            type="password"
            @input="checkPasswordMatch"
        />
        <p v-if="passwordState.mismatch" class="text-red-500 text-xs mt-1">两次输入的密码不一致</p>
      </el-form-item>

      <p v-if="passwordState.error" class="text-red-500 text-xs mt-1">{{ passwordState.error }}</p>
    </div>

    <template #footer>
      <el-button type="primary" @click="submitNewPassword">
        确认设置
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
/* 确保所有父元素都没有边距和内边距 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root, body {
  height: 100%;
  overflow: hidden; /* 移除默认滚动条 */
}

/* 背景容器设置为全屏 */
.login-back {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
}

/* 全屏背景样式 */
.fullscreen-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  /* 背景装饰效果 */
  background-image: radial-gradient(circle at 20% 30%, rgba(64, 158, 255, 0.15) 0%, transparent 40%),
  radial-gradient(circle at 80% 70%, rgba(64, 158, 255, 0.15) 0%, transparent 40%);
  z-index: 1; /* 确保背景在内容下方 */
}

.login-wrapper {
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  max-width: 1200px;
  position: relative;
  z-index: 2; /* 确保登录卡片在背景上方 */
}

.login-card {
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 30px;
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
  box-sizing: border-box;
}

.login-card:hover {
  transform: translateY(-5px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo-img {
  width: 100%;
  height: 100%;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 10px;
  text-align: center;
}

.login-header p {
  color: #909399;
  margin: 0;
}

.login-form {
  width: 100%;
}

.form-input {
  width: 100%;
  height: 42px;
  border-radius: 6px;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #409eff !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 6px;
  background-color: #409eff;
  border-color: #409eff;
  transition: all 0.3s;
}

.login-button:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
  transform: translateY(-2px);
}

.login-button:active {
  transform: translateY(0);
}

.links {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}

.link {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.login-footer {
  margin-top: 0;
  padding: 20px 0;
  color: #909399;
  font-size: 12px;
  position: relative;
  z-index: 2;
  text-align: center;
  border-top: 1px solid #eee;
  margin-top: 20px;
}

/* 图标样式优化 */
.cursor-pointer {
  cursor: pointer;
  transition: color 0.2s;
}

.cursor-pointer:hover {
  color: #409eff;
}

/* 密码设置弹窗样式 */
.password-setting {
  margin-top: 10px;
}

/* 适配不同屏幕尺寸 */
@media (max-width: 768px) {
  .login-card {
    padding: 25px;
  }
}

@media (max-width: 576px) {
  .login-card {
    padding: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }

  .login-header h1 {
    font-size: 20px;
  }

  .form-input {
    height: 40px;
  }

  .login-button {
    height: 42px;
    font-size: 15px;
  }
}
</style>
