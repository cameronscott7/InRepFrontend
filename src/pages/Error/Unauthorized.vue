<template>
    <div class="unauthorized">
        <h1>401 - Not Authorized</h1>
        <p>The action that was attempted could not be authorized.</p>
        <router-link to="/">Go back home</router-link>
    </div>
</template>

<style scoped>
.unauthorized {
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