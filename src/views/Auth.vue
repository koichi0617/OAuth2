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
            const res = await axios.get("http://localhost:8082/auth", {});
            console.log({res});
            window.open(res.data, "_self");
        },
    },
};
</script>

<style>
</style>