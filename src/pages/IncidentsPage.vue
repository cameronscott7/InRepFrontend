<template>
    <div class="controls container">
        <h1>Incidents</h1>
        <div class="filter-row">

            <div class="checkbox-group">
                <div class="checkbox-item">
                    <Checkbox v-model="showUnResolved" binary inputId="unresolved" />
                    <label for="unresolved">Unresolved</label>
                </div>

                <div class="checkbox-item">
                    <Checkbox v-model="showResolved" binary inputId="resolved" />
                    <label for="resolved">Resolved</label>
                </div>

                <div class="checkbox-item">
                    <Checkbox v-model="showAcknowledged" binary inputId="acknowledged" />
                    <label for="acknowledged">Acknowledged</label>
                </div>
            </div>

            <div class="search-sort">

                <InputText v-model="searchTerm" placeholder="Search incidents..." class="control-input" />

                <Select v-model="sortSeverity" :options="severitySortOptions" optionLabel="label" optionValue="value"
                    placeholder="Sort by severity" class="control-input" />

            </div>

        </div>

    </div>

    <div class="testPage">
        <div class="incident-list" v-if="!state.loading">
            <div v-for="incident in filteredIncidents" :key="incident.id">
                <Card class="mb-3 issue-card" @click="openIncident(incident.id)">

                    <template #title>
                        <div class="row">
                            <span class="icon">
                                <i v-if="incident.status === 'resolved'" class="pi pi-check-circle green"></i>
                                <i v-if="incident.status === 'triggered'" class="pi pi-minus-circle red"></i>
                            </span>
                            <span>{{ incident.summary }}</span>
                            <span class="right" :class="severityClass(incident.severity)">
                                {{ incident.severity }}
                            </span>
                        </div>
                    </template>

                    <template #content>
                        <div class="incident-meta">
                            <span class="issue-number">#{{ incident.id }}</span>
                            <span v-if="incident.status === 'triggered'">
                                reported at {{ formatDate(incident.created_at) }}
                            </span>
                            <span v-if="incident.status === 'resolved'">
                                resolved at {{ formatDate(incident.resolved_at!) }}
                            </span>
                        </div>
                    </template>

                </Card>
            </div>
        </div>
        <div v-else-if="state.error">{{ state.error }}</div>
        <div v-else>
            <p>Loading...</p>
        </div>
    </div>
</template>


<script setup lang="ts">
import Card from 'primevue/card'
import { onMounted, ref, reactive } from 'vue'
import { IncidentService } from '@/api'
import { definePreset } from '@primevue/themes'
import Select from 'primevue/select'
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import 'primeicons/primeicons.css'

onMounted(() => {
    console.log('AboutView mounted')
    fetchIncidents()
})

const state = reactive({
    testMessage: null as string | null,
    loading: false,
    error: null as string | null,
})

/* Sorting */

const showResolved = ref(false)
const showUnResolved = ref(true)
const showAcknowledged = ref(true)
const searchTerm = ref('')

const sortSeverity = ref('none')

const severitySortOptions = [
    { label: 'No Sorting', value: 'none' },
    { label: 'Severity (High → Low)', value: 'desc' },
    { label: 'Severity (Low → High)', value: 'asc' }
]

const severityRank: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
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

const filteredIncidents = computed(() => {
    let result = incidents.value.filter((incident) => {
        const statusMatch =
            (incident.status === 'triggered' && showUnResolved.value) ||
            (incident.status === 'resolved' && showResolved.value) ||
            (incident.status === 'acknowledged' && showAcknowledged.value)

        const searchMatch =
            !searchTerm.value ||
            incident.summary.toLowerCase().includes(searchTerm.value.toLowerCase())

        return statusMatch && searchMatch
    })

    if (sortSeverity.value !== 'none') {
        result = result.sort((a, b) => {
            const aRank = severityRank[a.severity.toLowerCase()] ?? 0;
            const bRank = severityRank[b.severity.toLowerCase()] ?? 0;
            const diff = aRank - bRank;
            return sortSeverity.value === 'asc' ? diff : -diff;
        });
    }

    return result
})

/* Incidents */

const incidents = ref<Incident[]>([])

interface IncidentsResponse {
    incidents: Incident[]
}

interface Incident {
    id: number
    summary: string
    severity: string
    status: string
    created_at: number
    service_id: number
    acknowledged_at: number | null
    resolved_at: number | null
    resolution_notes: string | null
    assigned_to: number | null
    acknowledged_by: number | null
    resolved_by: number | null
}

function openIncident(incident_id: number) {
    window.open(`/incident/${incident_id}`, '_blank')?.focus()
}

async function fetchIncidents() {
    state.loading = true
    state.error = null

    try {
        const response = await IncidentService.getApiV1Incidents()
        console.log('Received incidents:', response)

        if (Array.isArray(response) && response.length > 0) {
            incidents.value = response as unknown as Incident[]
        } else if ('message' in response) {
            state.error = response.message ?? 'There are no incidents'
        }
    } catch (error: any) {
        state.error = error?.message || 'An error occurred'
    } finally {
        state.loading = false
    }
}

/* Date Formatting */

const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
});

function formatDate(ts: any) {
    return formatter.format(new Date(ts));
}
</script>

<style scoped>
.container {
    max-width: 900px;
    margin: auto;
}

/* Sorting controls */

.controls {
    margin-bottom: 18px;
}

.filter-row {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.checkbox-group {
    display: flex;
    gap: 20px;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.95rem;
}

.search-sort {
    display: flex;
    gap: 12px;
}

.control-input {
    width: 220px;
}

/* incident cards */

.incident-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 20px;
}

.issue-card {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    transition: all 0.18s ease;
    cursor: pointer;
}

.issue-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
}

/* icons */

.green {
    color: #22c55e;
}

.red {
    color: #ef4444;
}

.row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.right {
    margin-left: auto;
}

.incident-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.9em;
    color: #6b7280;
    margin-top: 6px;
}

/* severity colors */

.severity-critical {
    color: #ef4444;
    font-weight: 600;
}

.severity-high {
    color: #f97316;
    font-weight: 600;
}

.severity-medium {
    color: #eab308;
    font-weight: 600;
}

.severity-low {
    color: #38bdf8;
    font-weight: 600;
}
</style>