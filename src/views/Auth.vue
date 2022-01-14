<template>
    <div>OAuth認証</div>
</template>

<script>
import axios from 'axios';

export default {
    name: "Auth",
    created() {
        this.getAuth();
    },
    methods: {
        async getAuth() {
            //認証画面のURLを取得
            const res = await axios.get("http://localhost:8082/auth", {});
            console.log({res});
            //認証画面にリダイレクト
            window.open(res.data, "_self");
        },
    },
};
</script>

<style>
</style>