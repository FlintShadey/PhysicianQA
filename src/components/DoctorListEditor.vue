<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-account-multiple</v-icon>
      Doctor List
    </v-card-title>
    
    <v-card-text>
      <v-list density="compact">
        <v-list-item
          v-for="(doctor, index) in doctors"
          :key="index"
          class="px-0"
        >
          <template #prepend>
            <v-btn
              icon="mdi-drag-vertical"
              variant="text"
              size="small"
              class="drag-handle me-2"
              @mousedown="startDrag(index)"
            />
          </template>
          
          <v-text-field
            v-model="doctors[index]"
            variant="outlined"
            density="compact"
            hide-details
            :rules="[v => !!v || 'Name is required']"
            @input="$emit('update', doctors)"
          />
          
          <template #append>
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="removeDoctor(index)"
              :disabled="doctors.length <= 1"
            />
          </template>
        </v-list-item>
      </v-list>
      
      <v-btn
        class="mt-3"
        variant="outlined"
        prepend-icon="mdi-plus"
        @click="addDoctor"
        block
      >
        Add Doctor
      </v-btn>
      
      <v-alert
        v-if="doctors.length === 0"
        type="warning"
        class="mt-3"
        density="compact"
      >
        At least one doctor is required
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'DoctorListEditor',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'update'],
  data() {
    return {
      doctors: [...this.modelValue],
      draggedIndex: null
    }
  },
  watch: {
    modelValue: {
      handler(newValue) {
        this.doctors = [...newValue];
      },
      deep: true
    },
    doctors: {
      handler(newValue) {
        this.$emit('update:modelValue', newValue);
        this.$emit('update', newValue);
      },
      deep: true
    }
  },
  methods: {
    addDoctor() {
      this.doctors.push('Dr. ');
    },
    
    removeDoctor(index) {
      if (this.doctors.length > 1) {
        this.doctors.splice(index, 1);
      }
    },
    
    startDrag(index) {
      this.draggedIndex = index;
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
    },
    
    onDrag(event) {
      if (this.draggedIndex === null) return;
      
      // Simple drag and drop logic
      const elements = document.querySelectorAll('.v-list-item');
      const draggedElement = elements[this.draggedIndex];
      const rect = draggedElement.getBoundingClientRect();
      
      // Find the element we're hovering over
      let hoverIndex = this.draggedIndex;
      elements.forEach((el, index) => {
        const elRect = el.getBoundingClientRect();
        if (event.clientY >= elRect.top && event.clientY <= elRect.bottom) {
          hoverIndex = index;
        }
      });
      
      if (hoverIndex !== this.draggedIndex) {
        const draggedItem = this.doctors[this.draggedIndex];
        this.doctors.splice(this.draggedIndex, 1);
        this.doctors.splice(hoverIndex, 0, draggedItem);
        this.draggedIndex = hoverIndex;
      }
    },
    
    stopDrag() {
      this.draggedIndex = null;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    }
  },
  
  beforeUnmount() {
    // Clean up event listeners
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  }
}
</script>

<style scoped>
.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
