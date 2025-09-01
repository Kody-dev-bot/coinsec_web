<script lang="ts" setup>
import {reactive} from 'vue';
import axios from 'axios';
import {SM3Util} from "../../utils/SM3Util.ts";

const form = reactive({
  username: '',
  password: ''

})

async function login() {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:8080/sys/login',
      data: {
        userName: form.username,
        password: SM3Util.encrypt(form.password)
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data

  } catch (error: any) {
    console.log(error)
  }
}

const onSubmit = async () => {
  let value = await login()
  if (value.code === 200) {
    localStorage.setItem('userName', value.data.userName);
    localStorage.setItem('role', value.data.role);
    localStorage.setItem('tokenName', value.data.tokenName);
    localStorage.setItem('tokenValue', value.data.tokenValue);

  }
  console.log(value)
}
</script>

<template>
  <div>
    <div>
      <p>登录</p>
    </div>
    <el-form :model="form" label-width="auto" style="max-width: 100%">
      <el-form-item label="用户名: ">
        <el-input v-model="form.username"/>
      </el-form-item>
      <el-form-item label="密码: ">
        <el-input v-model="form.password" type="password"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
</style>