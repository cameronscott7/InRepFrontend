<template>
    <h1>Incident : {{ incident?.name }}</h1>
    <p v-if="incident?.status === 'open'">
        <i class="pi pi-minus-circle red"></i> Reported at {{ formatTimestamp(incident.created_at) }} by {{ incident.author }}
    </p>
    <p v-else-if="incident?.status === 'closed'">
        <i class="pi pi-check-circle green"></i> Resolved at {{ formatTimestamp(incident.resolved_at!) }}, Reported at {{ formatTimestamp(incident.created_at) }} by {{ incident.author }} 
    </p>
    <p :class="severityClass(incident?.severity || '')">Severity: {{ incident?.severity }}</p>

    <p>{{ incident?.description }}</p>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import { onMounted, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { IncidentService } from '@/api/generated'
import { definePreset } from '@primevue/themes'
import 'primeicons/primeicons.css'

const state = reactive({
    testMessage: null as string | null,
    loading: false,
    error: null as string | null,
})

onMounted(() => {
    console.log('AboutView mounted')
    fetchTest()
})

interface IncidentsResponse {
    incidents: Incident[]
}
interface Incident {
    name: string
    id: number
    description: string
    status: string
    severity: string
    author: string
    created_at: number
    resolved_at: number | null
}

const route = useRoute()
const incident = ref<Incident | null>(null)

async function fetchTest() {
    state.loading = true
    state.error = null

    try {
        console.log('Fetching incident with ID:', route.params.id)
        const response = await IncidentService.getApiV1Incidents(route.params.id as unknown as number)

        if ('id' in response && response.id === parseInt(route.params.id as string)) {
            console.log('Received incident:', response)
            incident.value = response as Incident
        } else if ('message' in response) {
            state.error = (response as any).message ?? 'There are no incidents'
        }
    } catch (error: any) {
        state.error = error?.message || 'An error occurred'
    } finally {
        state.loading = false
    }
}

function formatTimestamp(ts: number): string {
    return new Date(ts * 1000).toLocaleString()
}

function severityClass(severity: string) {
    switch (severity?.toLowerCase()) {
        case 'low':
            return 'severity-low'
        case 'medium':
            return 'severity-medium'
        case 'high':
            return 'severity-high'
        case 'critical':
            return 'severity-critical'
        default:
            return ''
        }
}
</script>

<style scoped>
.green {
    color: green;
}
.red {
    color: red;
}
.right {
    float: right;
    margin-left: auto;
}
.row {
    display: flex;
    justify-content: space-between;
}
.icon {
    margin-right: 10px;
}
.incident-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.9em;
    color: #555;
}
.severity-critical {
    color: #ff0000;
    font-weight: bold;
}
.severity-high {
    color: #e8670b;
    font-weight: bold;
}
.severity-medium {
    color: rgb(201, 211, 17);
    font-weight: bold;
}
.severity-low {
    color: rgb(48, 222, 249);
    font-weight: bold;
}
</style>