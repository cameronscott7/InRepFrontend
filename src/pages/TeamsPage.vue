<template>
  <div class="teams-page">
    <div class="container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Teams Management</h1>
          <p class="page-subtitle">Manage your teams and their configurations</p>
        </div>
        <Button
          icon="pi pi-plus"
          label="Add Team"
          @click="openCreateDialog"
          class="add-button"
        />
      </div>

      <div class="content-card">
        <DataTable
          :value="teams"
          paginator
          :rows="pageSize"
          :totalRecords="total"
          :first="first"
          @page="onPageChange"
          responsiveLayout="scroll"
          class="teams-table"
          stripedRows
          showGridlines
          :loading="loading"
        >
          <Column field="name" sortable class="name-column">
            <template #header>
              <div class="column-header">
                <span class="column-title">Name</span>
                <InputText
                  v-model="filters.name"
                  placeholder="Filter by name..."
                  class="column-filter"
                  @input="applyFilters"
                />
              </div>
            </template>
          </Column>

          <Column field="description" class="description-column">
            <template #header>
              <div class="column-header">
                <span class="column-title">Description</span>
                <InputText
                  v-model="filters.description"
                  placeholder="Filter by description..."
                  class="column-filter"
                  @input="applyFilters"
                />
              </div>
            </template>
          </Column>

          <Column header="Actions" class="actions-column">
            <template #body="slotProps">
              <div class="action-buttons">
                <Button
                  icon="pi pi-pencil"
                  @click="openEditDialog(slotProps.data)"
                  class="action-button edit-button"
                  v-tooltip.top="'Edit team'"
                />
                <Button
                  icon="pi pi-trash"
                  @click="confirmDelete(slotProps.data)"
                  class="action-button delete-button"
                  v-tooltip.top="'Delete team'"
                />
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="empty-state">
              <div class="empty-icon">
                <i class="pi pi-users"></i>
              </div>
              <h3 class="empty-title">No teams found</h3>
              <p class="empty-message">Get started by creating your first team.</p>
            </div>
          </template>
        </DataTable>
      </div>

      <!-- Modern Team Modal -->
      <div v-if="dialogVisible" class="modal-overlay" @click="dialogVisible = false">
        <div class="modal-container" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon">
                <i :class="isEditMode ? 'pi pi-pencil' : 'pi pi-plus-circle'"></i>
              </div>
              <div class="header-text">
                <h2 class="modal-title">{{ isEditMode ? 'Edit Team' : 'Create New Team' }}</h2>
                <p class="modal-subtitle">{{ isEditMode ? 'Update team details' : 'Add a new team to your workspace' }}</p>
              </div>
            </div>
            <button class="close-button" @click="dialogVisible = false">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <form @submit.prevent="submitForm" class="team-form-modern">
              <!-- Team Name Field -->
              <div class="form-group-modern">
                <div class="input-wrapper">
                  <label for="name" class="input-label">
                    <i class="pi pi-tag"></i>
                    Team Name
                    <span class="required-indicator">*</span>
                  </label>
                  <div class="input-container" :class="{ 'has-error': errors.name }">
                    <InputText
                      id="name"
                      v-model="formData.name"
                      class="modern-input"
                      placeholder="Enter team name..."
                      :class="{ 'error-state': errors.name }"
                    />
                    <div class="input-accent"></div>
                  </div>
                  <div v-if="errors.name" class="error-feedback">
                    <i class="pi pi-exclamation-circle"></i>
                    <span>{{ errors.name }}</span>
                  </div>
                </div>
              </div>

              <!-- Description Field -->
              <div class="form-group-modern">
                <div class="input-wrapper">
                  <label for="description" class="input-label">
                    <i class="pi pi-align-left"></i>
                    Description
                  </label>
                  <div class="input-container" :class="{ 'has-error': errors.description }">
                    <Textarea
                      id="description"
                      v-model="formData.description"
                      :rows="3"
                      class="modern-input textarea-input"
                      placeholder="Describe your team's purpose and goals..."
                      :class="{ 'error-state': errors.description }"
                    />
                    <div class="input-accent"></div>
                  </div>
                  <div v-if="errors.description" class="error-feedback">
                    <i class="pi pi-exclamation-circle"></i>
                    <span>{{ errors.description }}</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <div class="footer-actions">
              <button
                type="button"
                class="btn-secondary"
                @click="dialogVisible = false"
              >
                <i class="pi pi-times"></i>
                Cancel
              </button>
              <button
                type="submit"
                class="btn-primary"
                @click="submitForm"
                :disabled="submitting"
              >
                <i :class="submitting ? 'pi pi-spin pi-spinner' : (isEditMode ? 'pi pi-check' : 'pi pi-plus')"></i>
                {{ isEditMode ? 'Update Team' : 'Create Team' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog group="delete" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ConfirmDialog from 'primevue/confirmdialog'
import Tooltip from 'primevue/tooltip'
import type { Team, Query, Filter } from '@/api'
import { useTeamsData, useTeamsForm } from '@/composables/useTeams'

// Composables
const { teams, total, loading, createTeam, updateTeam, deleteTeam, queryTeams } = useTeamsData()
const { formData, errors, resetForm, setFormData, validate, getFormValues } = useTeamsForm()

// Services
const confirm = useConfirm()

// State
const dialogVisible = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const first = ref(0)
const pageSize = ref(10)
const filters = ref({
    name: '',
    description: '',
})

// Methods
function openCreateDialog() {
    isEditMode.value = false
    resetForm()
    dialogVisible.value = true
}

function openEditDialog(team: Team) {
    isEditMode.value = true
    setFormData(team)
    dialogVisible.value = true
}

async function submitForm() {
    if (!validate()) {
        return
    }

    submitting.value = true
    try {
        const values = getFormValues()
        if (isEditMode.value && values.id) {
            const { id, ...teamData } = values
            await updateTeam(id, teamData)
        } else {
            await createTeam(values)
        }

        dialogVisible.value = false
        resetForm()
        // Reapply filters after create/update
        applyFilters()
    } finally {
        submitting.value = false
    }
}

function confirmDelete(team: Team) {
    confirm.require({
        group: 'delete',
        message: `Are you sure you want to delete the team "${team.name}"?`,
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            await deleteTeam(team.id!)
            await applyFilters()
        },
    })
}

async function onPageChange(event: { first: number; rows: number }) {
    first.value = event.first
    pageSize.value = event.rows
    await applyFilters()  // Reapply filters when page changes
}

async function applyFilters() {
    first.value = 0  // ← reset to first page before filtering

    const query: Query = {
        first: first.value,
        rows: pageSize.value,
        filters: {},
    }

    if (filters.value.name) {
        query.filters!['name'] = {
            value: filters.value.name,
            matchMode: 'contains',
        }
    }

    if (filters.value.description) {
        query.filters!['description'] = {
            value: filters.value.description,
            matchMode: 'contains',
        }
    }

    await queryTeams(query)
}

// Lifecycle
onMounted(() => {
    applyFilters()
})

</script>

<style scoped lang="scss">
.teams-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--surface-50) 0%, var(--surface-100) 100%);
  padding: 2rem 1rem;

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    padding: 2rem;
    background: var(--surface-0);
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid var(--surface-200);

    .header-content {
      .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-color);
        margin: 0 0 0.5rem 0;
        letter-spacing: -0.025em;
      }

      .page-subtitle {
        font-size: 1rem;
        color: var(--text-muted-color);
        margin: 0;
        font-weight: 400;
      }
    }

    .add-button {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      border-radius: 0.75rem;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      color: white;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px 0 rgba(16, 185, 129, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  .content-card {
    background: var(--surface-0);
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid var(--surface-200);
    overflow: hidden;

    .teams-table {
      :deep(.p-datatable-header) {
        display: none;
      }

      :deep(.p-datatable-thead > tr > th) {
        background: var(--surface-50);
        border-bottom: 2px solid var(--surface-200);
        font-weight: 600;
        color: var(--text-color);
        font-size: 0.875rem;
        padding: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      :deep(.p-datatable-tbody > tr) {
        transition: background-color 0.2s ease;

        &:hover {
          background: var(--surface-50);
        }

        > td {
          padding: 1rem;
          border-bottom: 1px solid var(--surface-100);
          color: var(--text-color);
        }
      }

      .column-header {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .column-title {
          font-weight: 600;
          color: var(--text-color);
          font-size: 0.875rem;
        }

        .column-filter {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--surface-300);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;

          &:focus {
            outline: none;
            border-color: var(--primary-500);
            box-shadow: 0 0 0 3px rgba(var(--primary-500-rgb), 0.1);
          }
        }
      }

      .name-column {
        width: 30%;
      }

      .description-column {
        width: 55%;
      }

      .actions-column {
        width: 15%;
        text-align: center;

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;

          .action-button {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 0.5rem;
            border: none;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;

            &.edit-button {
              background: var(--surface-100);
              color: var(--text-color);

              &:hover {
                background: var(--primary-50);
                color: var(--primary-700);
                transform: translateY(-1px);
              }
            }

            &.delete-button {
              background: var(--red-50);
              color: var(--red-500);

              &:hover {
                background: var(--red-100);
                transform: translateY(-1px);
              }
            }
          }
        }
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;

        .empty-icon {
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, var(--surface-200) 0%, var(--surface-300) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;

          i {
            font-size: 2rem;
            color: var(--text-muted-color);
          }
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0 0 0.5rem 0;
        }

        .empty-message {
          font-size: 1rem;
          color: var(--text-muted-color);
          margin: 0;
        }
      }
    }
  }

  // Modal Styles
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
  }

  .modal-container {
    background: linear-gradient(145deg, #1f2937 0%, #111827 100%);
    border-radius: 24px;
    box-shadow:
      0 25px 50px rgba(0, 0, 0, 0.5),
      0 15px 35px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    max-width: 480px;
    width: 90%;
    max-height: 90vh;
    overflow: hidden;
    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-header {
    padding: 2rem 2rem 1.5rem 2rem;
    border-bottom: 1px solid #374151;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="50" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="30" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="80" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
      z-index: 1;

      .header-icon {
        width: 3rem;
        height: 3rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);

        i {
          font-size: 1.25rem;
          color: white;
        }
      }

      .header-text {
        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          color: white;
          letter-spacing: -0.025em;
        }

        .modal-subtitle {
          font-size: 0.875rem;
          margin: 0;
          opacity: 0.9;
          font-weight: 400;
        }
      }
    }

    .close-button {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      width: 2.5rem;
      height: 2.5rem;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(10px);
      z-index: 1;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.05);
      }

      i {
        font-size: 1rem;
      }
    }
  }

  .modal-body {
    padding: 2rem;

    .team-form-modern {
      .form-group-modern {
        margin-bottom: 2rem;

        &:last-child {
          margin-bottom: 0;
        }

        .input-wrapper {
          .input-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #e5e7eb;
            margin-bottom: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;

            i {
              color: #10b981;
              font-size: 0.875rem;
            }

            .required-indicator {
              color: #ef4444;
              font-size: 0.75rem;
            }
          }

          .input-container {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            background: #374151;
            border: 2px solid #4b5563;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

            &:hover {
              border-color: #6b7280;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }

            &:focus-within {
              border-color: #10b981;
              box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
            }

            &.has-error {
              border-color: #ef4444;
              background: #451a1a;

              .input-accent {
                background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
              }
            }

            .modern-input {
              width: 100%;
              border: none;
              outline: none;
              background: transparent;
              padding: 1rem 1.25rem;
              font-size: 0.95rem;
              color: #f9fafb;
              font-family: inherit;

              &::placeholder {
                color: #9ca3af;
                opacity: 1;
              }

              &.textarea-input {
                resize: vertical;
                min-height: 80px;
              }
            }

            .input-accent {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #10b981 0%, #059669 100%);
              transform: scaleX(0);
              transition: transform 0.3s ease;
              transform-origin: left;
            }

            &:focus-within .input-accent {
              transform: scaleX(1);
            }
          }

          .error-feedback {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
            color: #ef4444;
            font-size: 0.8rem;
            font-weight: 500;

            i {
              font-size: 0.75rem;
            }
          }
        }
      }
    }
  }

  .modal-footer {
    padding: 1.5rem 2rem 2rem 2rem;
    border-top: 1px solid #374151;
    background: #1f2937;

    .footer-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;

      .btn-secondary {
        background: #374151;
        border: 2px solid #4b5563;
        color: #d1d5db;
        border-radius: 12px;
        padding: 0.875rem 1.5rem;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 120px;
        justify-content: center;

        &:hover {
          background: #4b5563;
          border-color: #6b7280;
          color: #f9fafb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        i {
          font-size: 0.875rem;
        }
      }

      .btn-primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border: none;
        color: white;
        border-radius: 12px;
        padding: 0.875rem 1.5rem;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 140px;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }

        &:active {
          transform: translateY(0);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        i {
          font-size: 0.875rem;
        }
      }
    }
  }

  // Animations
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .teams-page {
    padding: 1rem 0.5rem;

    .page-header {
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem;
      text-align: center;

      .page-title {
        font-size: 1.5rem;
      }

      .add-button {
        width: 100%;
        justify-content: center;
      }
    }

    .content-card {
      .teams-table {
        :deep(.p-datatable-thead > tr > th),
        :deep(.p-datatable-tbody > tr > td) {
          padding: 0.75rem 0.5rem;
          font-size: 0.875rem;
        }

        .name-column {
          width: 40%;
        }

        .description-column {
          width: 45%;
        }

        .actions-column {
          width: 15%;

          .action-buttons {
            flex-direction: column;
            gap: 0.25rem;

            .action-button {
              width: 2rem;
              height: 2rem;

              i {
                font-size: 0.875rem;
              }
            }
          }
        }
      }
    }

    .modal-container {
      max-width: 95%;
      margin: 1rem;

      .modal-header {
        padding: 1.5rem 1.5rem 1rem 1.5rem;

        .header-content {
          gap: 0.75rem;

          .header-icon {
            width: 2.5rem;
            height: 2.5rem;

            i {
              font-size: 1rem;
            }
          }

          .header-text {
            .modal-title {
              font-size: 1.25rem;
            }

            .modal-subtitle {
              font-size: 0.8rem;
            }
          }
        }

        .close-button {
          top: 1rem;
          right: 1rem;
          width: 2rem;
          height: 2rem;

          i {
            font-size: 0.875rem;
          }
        }
      }

      .modal-body {
        padding: 1.5rem;

        .team-form-modern {
          .form-group-modern {
            margin-bottom: 1.5rem;

            .input-wrapper {
              .input-label {
                font-size: 0.8rem;
                margin-bottom: 0.5rem;

                i {
                  font-size: 0.75rem;
                }
              }

              .input-container {
                .modern-input {
                  padding: 0.875rem 1rem;
                  font-size: 0.9rem;

                  &.textarea-input {
                    min-height: 70px;
                  }
                }
              }
            }
          }
        }
      }

      .modal-footer {
        padding: 1.5rem;

        .footer-actions {
          gap: 0.75rem;
          flex-wrap: wrap;

          .btn-secondary,
          .btn-primary {
            min-width: auto;
            width: calc(50% - 0.375rem);
            padding: 0.75rem 1rem;
            font-size: 0.85rem;

            i {
              font-size: 0.75rem;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .teams-page {
    .page-header {
      padding: 1rem;

      .page-title {
        font-size: 1.25rem;
      }
    }

    .content-card {
      .teams-table {
        .empty-state {
          padding: 2rem 1rem;

          .empty-icon {
            width: 3rem;
            height: 3rem;

            i {
              font-size: 1.5rem;
            }
          }

          .empty-title {
            font-size: 1rem;
          }

          .empty-message {
            font-size: 0.875rem;
          }
        }
      }
    }
  }
}
</style>