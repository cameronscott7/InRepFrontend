<template>
    <h1>
        API Key Creation Simulator
    </h1>
    <form @submit.prevent="fetchTest">
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
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const selected = ref('')

async function fetchTest() {
    if (!selected.value) return

    try {
        // Simulate API call to create an API key
        console.log('Creating API key for selection:', selected.value)
        // Here you would typically call your API to create the API key
        // For example: await ApiKeyService.createApiKey({ selection: selected.value })
        alert(`API Key for "${selected.value}" created successfully!`)
        selected.value = '' // Clear the selection after creation
    } catch (error) {
        console.error('Error creating API key:', error)
        alert('Failed to create API key. Please try again.')
    }
}

async function serviceFetch() {
    // Gets the list of sercives from the backend to populate the dropdown menu
    
}
</script>