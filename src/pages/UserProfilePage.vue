<template>
    <div class="testPage">
        <div v-if="!state.loading && state.user">
            <Card class="mb-3">
                <template #title>id: [{{ state.user?.id }}]</template>
                <template #content>
                    <p>Cognito_Id: {{ state.user?.cognito_id }}</p>
                    <p>Email: {{ state.user?.email }}</p>
                    <p>Username: {{ state.user?.username }}</p>
                    <p>First Name: {{ state.user?.first_name }}</p>
                    <p>Last Name: {{ state.user?.last_name }}</p>
                    <p>Phone: {{ state.user?.phone_number }}</p>
                    <p>Role: {{ state.user?.role }}</p>
                    <p>Team: {{ state.user?.team_id }}</p>
                </template>
                
            </Card>
        </div>
    </div>
   
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import { reactive, onMounted } from 'vue'
import { type User } from '@/api/generated/models/User'
import { useToastHelperService } from '@/services/toastHelperService'
import { useAuthStore } from '@/stores/auth'

const { showSuccess, showInfo, showWarn, showError, showSecondary, showContrast } = useToastHelperService()
const authStore = useAuthStore()

onMounted(() => {
    state.user = authStore.appUser
})

const state = reactive({
    user: null as User | null,
    loading: false,
    error: null as string | null,
})

</script>
<style scoped>
</style>
