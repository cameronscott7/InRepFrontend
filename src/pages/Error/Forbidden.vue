<template>
    <div class="forbidden">
        <h1>403 - Forbidden</h1>
        <p>The action that was attempted is not allowed.</p>
        <router-link to="/">Go back home</router-link>
    </div>
</template>

<style scoped>
.forbidden {
    text-align: center;
    margin-top: 4rem;
    font-family: Arial, sans-serif;
}

h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
}
</style>