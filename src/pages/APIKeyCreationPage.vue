<template>
    <h1>
        API Key Creation Simulator
    </h1>
    <form @submit.prevent="serviceFetch">
        <div>Selected: {{ selected }}</div>

        <select v-model="selected">
        <option disabled value="">Select a service for the API key:</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
        </select>
        <br><br>
        <Button type="submit" label="Create API Key" class="p-mt-2" />
    </form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { ServiceService } from '@/api/generated'

const selected = ref('')

onMounted(() => {
    console.log('AboutView mounted')
    serviceFetch()
})

async function serviceFetch() {
    // Gets the list of sercives from the backend to populate the dropdown menu
    // if (!selected.value) return
    try {
        const response = await ServiceService.getApiV1Service()
        console.log('Services fetched successfully:', response)
    } catch (error) {
        console.error('Error fetching services:', error)
        alert('Failed to fetch services. Please try again.')
    }
}
</script>