<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-title>
        <v-icon class="me-2">mdi-file-pdf-box</v-icon>
        PhysicianQA Filler
      </v-app-bar-title>
      
      <v-spacer />
      
      <!-- PWA Install Button -->
      <v-btn
        v-if="showInstallPrompt"
        variant="outlined"
        prepend-icon="mdi-download"
        @click="installPWA"
        class="me-2"
      >
        Install App
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="py-8">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-card>
              <v-card-title class="text-h5 text-center py-6">
                PDF Generator
              </v-card-title>
              
              <v-card-text>
                <v-form ref="form" v-model="formValid">
                  <!-- Doctor List Editor -->
                  <div class="mb-6">
                    <DoctorListEditor
                      v-model="doctors"
                      @update="saveDoctors"
                    />
                  </div>
                  
                  <!-- Number Range -->
                  <v-card class="mb-6">
                    <v-card-title class="d-flex align-center">
                      <v-icon class="me-2">mdi-numeric</v-icon>
                      Number Range
                    </v-card-title>
                    
                    <v-card-text>
                      <v-row>
                        <v-col cols="6">
                          <v-text-field
                            v-model.number="numberMin"
                            label="Minimum"
                            type="number"
                            variant="outlined"
                            :rules="numberMinRules"
                            @input="saveNumberRange"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-text-field
                            v-model.number="numberMax"
                            label="Maximum"
                            type="number"
                            variant="outlined"
                            :rules="numberMaxRules"
                            @input="saveNumberRange"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-btn
                            variant="outlined"
                            size="small"
                            @click="resetToDefaults"
                            block
                          >
                            Reset to Config Defaults ({{ DEFAULT_VALUES.numberMin }}-{{ DEFAULT_VALUES.numberMax }})
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                  
                  <!-- Generate Button -->
                  <v-btn
                    block
                    size="large"
                    color="primary"
                    :disabled="!canGenerate"
                    :loading="generating"
                    @click="generatePDFs"
                  >
                    <v-icon class="me-2">mdi-creation</v-icon>
                    Generate 5 PDFs
                  </v-btn>
                </v-form>
                
                <!-- Generation Status -->
                <v-alert
                  v-if="generationStatus"
                  :type="generationStatus.type"
                  class="mt-4"
                  dismissible
                  @click:close="generationStatus = null"
                >
                  {{ generationStatus.message }}
                </v-alert>
                
                <!-- Download Section -->
                <div v-if="generatedPDFs.length > 0" class="mt-6">
                  <v-divider class="mb-4" />
                  
                  <v-card>
                    <v-card-title class="d-flex align-center">
                      <v-icon class="me-2">mdi-download</v-icon>
                      Generated PDFs ({{ generatedPDFs.length }})
                    </v-card-title>
                    
                    <v-card-text>
                      <v-btn
                        block
                        size="large"
                        color="success"
                        @click="downloadAll"
                        :disabled="generatedPDFs.length === 0"
                      >
                        <v-icon class="me-2">mdi-download-multiple</v-icon>
                        Download All as ZIP
                      </v-btn>
                      
                      <!-- PDF Preview List -->
                      <v-list class="mt-4" density="compact">
                        <v-list-item
                          v-for="(pdf, index) in generatedPDFs"
                          :key="index"
                        >
                          <v-list-item-title>{{ pdf.filename }}</v-list-item-title>
                          <v-list-item-subtitle>
                            Doctor: {{ pdf.data.doctor }} | 
                            Date: {{ pdf.data.date }} | 
                            Number: {{ pdf.data.number }}
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    
    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import DoctorListEditor from './components/DoctorListEditor.vue';
import { createFilledPDF } from './lib/pdf.js';
import { downloadPDFsAsZip, generatePDFFilename } from './lib/zip.js';
import { getRandomDateInCurrentMonth, formatDate } from './lib/date.js';
import { DEFAULT_VALUES } from './config/pdfConfig.js';

export default {
  name: 'App',
  components: {
    DoctorListEditor
  },
  setup() {
    // Expose DEFAULT_VALUES to template
    return {
      DEFAULT_VALUES
    };
  },
  data() {
    return {
      // Form state
      formValid: false,
      
      // Doctor list
      doctors: [...DEFAULT_VALUES.doctors],
      
      // Number range
      numberMin: DEFAULT_VALUES.numberMin,
      numberMax: DEFAULT_VALUES.numberMax,
      
      // Generation state
      generating: false,
      generatedPDFs: [],
      generationStatus: null,
      
      // PWA
      deferredPrompt: null,
      showInstallPrompt: false,
      
      // Snackbar
      snackbar: {
        show: false,
        text: '',
        color: 'info',
        timeout: 4000
      }
    };
  },
  
  computed: {
    canGenerate() {
      return this.formValid && 
             this.doctors.length > 0 && 
             this.doctors.every(d => d.trim().length > 0) &&
             this.numberMin <= this.numberMax &&
             !this.generating;
    },
    
    numberMinRules() {
      return [
        v => v !== null && v !== '' && !isNaN(v) || 'Must be a valid number',
        v => parseInt(v) >= 0 || 'Must be non-negative',
        v => parseInt(v) <= this.numberMax || 'Must be less than or equal to maximum'
      ];
    },
    
    numberMaxRules() {
      return [
        v => v !== null && v !== '' && !isNaN(v) || 'Must be a valid number',
        v => parseInt(v) >= 0 || 'Must be non-negative',
        v => parseInt(v) >= this.numberMin || 'Must be greater than or equal to minimum'
      ];
    }
  },
  
  mounted() {
    this.loadSettings();
    this.setupPWA();
  },
  
  methods: {
    // Data persistence
    loadSettings() {
      try {
        const savedDoctors = localStorage.getItem('physicians-doctors');
        if (savedDoctors) {
          this.doctors = JSON.parse(savedDoctors);
        } else {
          // Use config defaults if no saved data
          this.doctors = [...DEFAULT_VALUES.doctors];
        }
        
        const savedMin = localStorage.getItem('physicians-number-min');
        if (savedMin) {
          this.numberMin = parseInt(savedMin);
        } else {
          // Use config default if no saved data
          this.numberMin = DEFAULT_VALUES.numberMin;
        }
        
        const savedMax = localStorage.getItem('physicians-number-max');
        if (savedMax) {
          this.numberMax = parseInt(savedMax);
        } else {
          // Use config default if no saved data
          this.numberMax = DEFAULT_VALUES.numberMax;
        }
      } catch (error) {
        console.warn('Error loading settings from localStorage:', error);
        // Fallback to config defaults on error
        this.doctors = [...DEFAULT_VALUES.doctors];
        this.numberMin = DEFAULT_VALUES.numberMin;
        this.numberMax = DEFAULT_VALUES.numberMax;
      }
    },
    
    saveDoctors() {
      try {
        localStorage.setItem('physicians-doctors', JSON.stringify(this.doctors));
      } catch (error) {
        console.warn('Error saving doctors to localStorage:', error);
      }
    },
    
    saveNumberRange() {
      try {
        localStorage.setItem('physicians-number-min', this.numberMin.toString());
        localStorage.setItem('physicians-number-max', this.numberMax.toString());
      } catch (error) {
        console.warn('Error saving number range to localStorage:', error);
      }
    },
    
    resetToDefaults() {
      // Reset to config defaults and clear localStorage
      this.doctors = [...DEFAULT_VALUES.doctors];
      this.numberMin = DEFAULT_VALUES.numberMin;
      this.numberMax = DEFAULT_VALUES.numberMax;
      
      // Clear localStorage
      localStorage.removeItem('physicians-doctors');
      localStorage.removeItem('physicians-number-min');
      localStorage.removeItem('physicians-number-max');
      
      this.showSnackbar('Reset to config defaults!', 'success');
    },
    
    // PDF Generation
    async generatePDFs() {
      if (!this.canGenerate) return;
      
      this.generating = true;
      this.generatedPDFs = [];
      this.generationStatus = null;
      
      try {
        const pdfs = [];
        const usedCombinations = new Set();
        
        for (let i = 0; i < 5; i++) {
          let attempts = 0;
          let data;
          
          // Try to generate unique combinations
          do {
            data = this.generateRandomData();
            attempts++;
          } while (usedCombinations.has(this.getDataKey(data)) && attempts < 10);
          
          usedCombinations.add(this.getDataKey(data));
          
          // Generate PDF
          const pdfBytes = await createFilledPDF(data);
          const filename = generatePDFFilename(data);
          
          pdfs.push({
            filename,
            data,
            pdfBytes
          });
        }
        
        this.generatedPDFs = pdfs;
        this.generationStatus = {
          type: 'success',
          message: `Successfully generated ${pdfs.length} PDFs!`
        };
        
      } catch (error) {
        console.error('Error generating PDFs:', error);
        this.generationStatus = {
          type: 'error',
          message: `Error generating PDFs: ${error.message}`
        };
      } finally {
        this.generating = false;
      }
    },
    
    generateRandomData() {
      // Random doctor
      const doctor = this.doctors[Math.floor(Math.random() * this.doctors.length)];
      
      // Random date in current month
      const dateObj = getRandomDateInCurrentMonth();
      const date = formatDate(dateObj);
      
      // Random number in range
      const number = Math.floor(Math.random() * (this.numberMax - this.numberMin + 1)) + this.numberMin;
      
      return { doctor, date, dateObj, number };
    },
    
    getDataKey(data) {
      return `${data.doctor}-${data.date}-${data.number}`;
    },
    
    // Download functionality
    async downloadAll() {
      if (this.generatedPDFs.length === 0) return;
      
      try {
        const pdfData = this.generatedPDFs.map(pdf => ({
          name: pdf.filename,
          data: pdf.pdfBytes
        }));
        
        await downloadPDFsAsZip(pdfData);
        
        this.showSnackbar('ZIP file downloaded successfully!', 'success');
        
      } catch (error) {
        console.error('Error downloading ZIP:', error);
        this.showSnackbar(`Error downloading ZIP: ${error.message}`, 'error');
      }
    },
    
    // PWA functionality
    setupPWA() {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.showInstallPrompt = true;
      });
      
      window.addEventListener('appinstalled', () => {
        this.showInstallPrompt = false;
        this.showSnackbar('App installed successfully!', 'success');
      });
    },
    
    async installPWA() {
      if (!this.deferredPrompt) return;
      
      this.deferredPrompt.prompt();
      const result = await this.deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('PWA installation accepted');
      }
      
      this.deferredPrompt = null;
      this.showInstallPrompt = false;
    },
    
    // Utility
    showSnackbar(text, color = 'info', timeout = 4000) {
      this.snackbar = {
        show: true,
        text,
        color,
        timeout
      };
    }
  }
};
</script>

<style scoped>
.v-container {
  max-width: 1200px;
}
</style>
