<script lang="ts" setup>

import {reactive} from "vue";
import axios from "axios";
import router from "@/router";

const form = reactive({
  username: '',
  email: ''
})

// 添加加载状态和密码显示状态
const state = reactive({
  loading: false,
  emailValid: false
})

const validateEmail = (email: string) => {
  const reg = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  state.emailValid = reg.test(email);
  return state.emailValid;
}

async function register() {
  try {
    // 显示加载状态
    state.loading = true;

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:8080/sys/register',
      data: {
        userName: form.username,
        email: form.email
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data

  } catch (error: any) {
    console.log(error)
    return {code: 500, message: error.message || '注册失败'}
  } finally {
    // 隐藏加载状态
    state.loading = false;
  }
}

const onSubmit = async () => {
  let value = await register();
  if (value.code === 200) {
    alert('注册成功')
    router.push("/login").then(error => {
      console.log(error)
    })
  } else {
    alert(value.message)
  }
}
</script>

<template>
  <div class="fullscreen-background"></div>
  <div>
    <!-- 注册卡片容器 -->
    <div class="login-wrapper">
      <!-- 注册卡片 -->
      <div class="login-card">
        <!-- 注册标题区域 -->
        <div class="login-header">
          <div class="logo">
            <img alt="CoinSec Logo" class="logo-img" src="@/assets/logo.svg"/>
          </div>
          <h1>注册</h1>
          <p>请输入账号信息注册系统</p>
        </div>

        <!-- 注册表单 -->
        <el-form
            :model="form"
            :rules="{
            username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
            email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
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

          <el-form-item label="邮箱" prop="email">
            <el-input
                v-model="form.email"
                class="form-input"
                placeholder="请输入邮箱"
                prefix-icon="Message"
                type="text"
                @input="validateEmail(form.email)"
            >
              <template #suffix>
                <el-icon v-if="form.email && state.emailValid" class="text-success">
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
              注册
            </el-button>
            <div class="links">
              <a class="link">
                <router-link to="/login">
                  登录
                </router-link>
              </a>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="login-footer">
      © 2023 系统注册页面 - 版权所有
    </footer>
  </div>
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
  z-index: 2; /* 确保注册卡片在背景上方 */
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