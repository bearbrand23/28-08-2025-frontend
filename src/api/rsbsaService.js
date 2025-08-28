/* eslint-disable no-restricted-globals */
/* eslint-disable no-useless-escape */
import axiosInstance from './axiosInstance';

// Add validation schemas
const VALIDATION_SCHEMAS = {
  beneficiaryDetails: {
    required: ['first_name', 'last_name', 'contact_number', 'barangay', 'municipality', 'province', 'region'],
    string: ['first_name', 'last_name', 'middle_name', 'contact_number', 'barangay', 'municipality', 'province', 'region', 'address'],
    email: ['email'],
    phone: ['contact_number']
  },
  farmProfile: {
    required: ['livelihood_category_id'],
    integer: ['livelihood_category_id']
  },
  farmParcel: {
    required: ['parcel_number', 'barangay', 'tenure_type', 'farm_type', 'farm_area'],
    string: ['parcel_number', 'barangay', 'tenure_type', 'farm_type', 'remarks'],
    decimal: ['farm_area'],
    boolean: ['is_ancestral_domain', 'is_agrarian_reform_beneficiary', 'is_organic_practitioner']
  }
};

// Validation helper functions
const validateField = (value, fieldName, rules) => {
  const errors = [];
  
  if (rules.required && rules.required.includes(fieldName)) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`${fieldName} is required`);
    }
  }
  
  if (rules.string && rules.string.includes(fieldName)) {
    if (value && typeof value !== 'string') {
      errors.push(`${fieldName} must be a string`);
    }
  }
  
  if (rules.integer && rules.integer.includes(fieldName)) {
    if (value && (!Number.isInteger(Number(value)) || Number(value) <= 0)) {
      errors.push(`${fieldName} must be a positive integer`);
    }
  }
  
  if (rules.decimal && rules.decimal.includes(fieldName)) {
    if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
      errors.push(`${fieldName} must be a positive number`);
    }
  }
  
  if (rules.boolean && rules.boolean.includes(fieldName)) {
    if (value !== undefined && typeof value !== 'boolean') {
      errors.push(`${fieldName} must be a boolean`);
    }
  }
  
  if (rules.email && rules.email.includes(fieldName)) {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push(`${fieldName} must be a valid email`);
    }
  }
  
  if (rules.phone && rules.phone.includes(fieldName)) {
    if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
      errors.push(`${fieldName} must be a valid phone number`);
    }
  }
  
  return errors;
};

const validateObject = (data, schema) => {
  const errors = {};
  let hasErrors = false;
  
  Object.keys(schema).forEach(ruleType => {
    schema[ruleType].forEach(fieldName => {
      const fieldErrors = validateField(data[fieldName], fieldName, { [ruleType]: [fieldName] });
      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
        hasErrors = true;
      }
    });
  });
  
  return { errors, hasErrors };
};

// Enhanced error logging
const logError = (context, error, additionalData = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    additionalData,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.group(`🚨 RSBSA Error: ${context}`);
  console.error('Error Details:', errorInfo);
  console.error('Full Error Object:', error);
  console.groupEnd();
  
  // You can also send this to your error tracking service
  // Example: Sentry.captureException(error, { extra: errorInfo });
};

/**
 * RSBSA API Service
 * Handles all API operations for RSBSA (Registry System for Basic Sectors in Agriculture)
 */

// Base API endpoints
const RSBSA_ENDPOINTS = {
  // Main enrollment endpoints
  ENROLLMENTS: '/api/rsbsa/enrollments',
  ENROLLMENT_STATUS: '/api/rsbsa/enrollments/status',
  
  // Profile endpoints
  BENEFICIARY_DETAILS: '/api/rsbsa/beneficiary-details',
  FARM_PROFILES: '/api/rsbsa/farm-profiles',
  
  // Detail endpoints
  FARMER_DETAILS: '/api/rsbsa/farmer-details',
  FISHERFOLK_DETAILS: '/api/rsbsa/fisherfolk-details',
  FARMWORKER_DETAILS: '/api/rsbsa/farmworker-details',
  AGRI_YOUTH_DETAILS: '/api/rsbsa/agri-youth-details',
  
  // Farm parcels
  FARM_PARCELS: '/api/rsbsa/farm-parcels',
  
  // Reference data
  LIVELIHOOD_CATEGORIES: '/api/rsbsa/livelihood-categories',
  COMMODITIES: '/api/rsbsa/commodities',
  BARANGAYS: '/api/rsbsa/barangays',
  MUNICIPALITIES: '/api/rsbsa/municipalities',
  PROVINCES: '/api/rsbsa/provinces',
  REGIONS: '/api/rsbsa/regions'
};

/**
 * RSBSA Enrollment Operations
 */
export const rsbsaEnrollmentService = {
  // Create new RSBSA enrollment
  async createEnrollment(enrollmentData) {
    try {
      console.log('🚀 Creating RSBSA enrollment:', enrollmentData);
      
      // Validate enrollment data
      const validation = validateObject(enrollmentData, {
        required: ['user_id', 'beneficiary_id', 'enrollment_year', 'enrollment_type'],
        integer: ['user_id', 'beneficiary_id', 'enrollment_year']
      });
      
      if (validation.hasErrors) {
        const error = new Error('Enrollment validation failed');
        error.validationErrors = validation.errors;
        console.error('❌ Enrollment validation failed:', validation.errors);
        throw error;
      }
      
      const response = await axiosInstance.post(RSBSA_ENDPOINTS.ENROLLMENTS, enrollmentData);
      console.log('✅ Enrollment created successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Create Enrollment', error, { enrollmentData });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create enrollment',
        details: error.response?.data,
        validationErrors: error.validationErrors
      };
    }
  },

  // Get enrollment by ID
  async getEnrollment(enrollmentId) {
    try {
      console.log('🔍 Fetching enrollment by ID:', enrollmentId);
      const response = await axiosInstance.get(`${RSBSA_ENDPOINTS.ENROLLMENTS}/${enrollmentId}`);
      console.log('✅ Enrollment fetched successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Get Enrollment', error, { enrollmentId });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch enrollment',
        details: error.response?.data
      };
    }
  },

  // Get enrollment by user ID
  async getEnrollmentByUserId(userId) {
    try {
      console.log('🔍 Fetching enrollment by user ID:', userId);
      const response = await axiosInstance.get(`${RSBSA_ENDPOINTS.ENROLLMENTS}/user/${userId}`);
      console.log('✅ User enrollment fetched successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Get Enrollment By User ID', error, { userId });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch user enrollment',
        details: error.response?.data
      };
    }
  },

  // Get enrollment by beneficiary ID
  async getEnrollmentByBeneficiaryId(beneficiaryId) {
    try {
      console.log('🔍 Fetching enrollment by beneficiary ID:', beneficiaryId);
      const response = await axiosInstance.get(`${RSBSA_ENDPOINTS.ENROLLMENTS}/beneficiary/${beneficiaryId}`);
      console.log('✅ Beneficiary enrollment fetched successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Get Enrollment By Beneficiary ID', error, { beneficiaryId });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch beneficiary enrollment',
        details: error.response?.data
      };
    }
  },

  // Update enrollment
  async updateEnrollment(enrollmentId, updateData) {
    try {
      console.log('🔄 Updating enrollment:', { enrollmentId, updateData });
      const response = await axiosInstance.put(`${RSBSA_ENDPOINTS.ENROLLMENTS}/${enrollmentId}`, updateData);
      console.log('✅ Enrollment updated successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Update Enrollment', error, { enrollmentId, updateData });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update enrollment',
        details: error.response?.data
      };
    }
  },

  // Get enrollment status
  async getEnrollmentStatus(enrollmentId) {
    try {
      const response = await axiosInstance.get(`${RSBSA_ENDPOINTS.ENROLLMENT_STATUS}/${enrollmentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch enrollment status',
        details: error.response?.data
      };
    }
  },

  // Submit enrollment for review
  async submitEnrollment(enrollmentId) {
    try {
      console.log('📤 Submitting enrollment for review:', enrollmentId);
      const response = await axiosInstance.put(`${RSBSA_ENDPOINTS.ENROLLMENTS}/${enrollmentId}/submit`);
      console.log('✅ Enrollment submitted successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Submit Enrollment', error, { enrollmentId });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to submit enrollment',
        details: error.response?.data
      };
    }
  },

  // Approve enrollment
  async approveEnrollment(enrollmentId, rsbsaNumber, coordinatorNotes = '') {
    try {
      const response = await axiosInstance.put(`${RSBSA_ENDPOINTS.ENROLLMENTS}/${enrollmentId}/approve`, {
        assigned_rsbsa_number: rsbsaNumber,
        coordinator_notes: coordinatorNotes
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to approve enrollment',
        details: error.response?.data
      };
    }
  },

  // Reject enrollment
  async rejectEnrollment(enrollmentId, rejectionReason, coordinatorNotes = '') {
    try {
      const response = await axiosInstance.put(`${RSBSA_ENDPOINTS.ENROLLMENTS}/${enrollmentId}/reject`, {
        rejection_reason: rejectionReason,
        coordinator_notes: coordinatorNotes
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to reject enrollment',
        details: error.response?.data
      };
    }
  }
};

/**
 * Beneficiary Details Operations
 */
export const beneficiaryDetailsService = {
  // Create beneficiary details
  async createDetails(detailsData) {
    try {
      console.log('🚀 Creating beneficiary details:', detailsData);
      
      // Validate beneficiary data
      const validation = validateObject(detailsData, VALIDATION_SCHEMAS.beneficiaryDetails);
      
      if (validation.hasErrors) {
        const error = new Error('Beneficiary details validation failed');
        error.validationErrors = validation.errors;
        console.error('❌ Beneficiary validation failed:', validation.errors);
        throw error;
      }
      
      const response = await axiosInstance.post(RSBSA_ENDPOINTS.BENEFICIARY_DETAILS, detailsData);
      console.log('✅ Beneficiary details created successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Create Beneficiary Details', error, { detailsData });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create beneficiary details',
        details: error.response?.data,
        validationErrors: error.validationErrors
      };
    }
  },

  // Get details by ID
  async getDetails(detailsId) {
    try {
      console.log('🔍 Fetching beneficiary details by ID:', detailsId);
      const response = await axiosInstance.get(`${RSBSA_ENDPOINTS.BENEFICIARY_DETAILS}/${detailsId}`);
      console.log('✅ Beneficiary details fetched successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Get Beneficiary Details', error, { detailsId });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch beneficiary details',
        details: error.response?.data
      };
    }
  },

  // Get details by user ID
  async getDetailsByUserId(userId) {
    try {
      console.log('🔍 Fetching beneficiary details by user ID:', userId);
      const response = await axiosInstance.get(`${RSBSA_ENDPOINTS.BENEFICIARY_DETAILS}/user/${userId}`);
      console.log('✅ User beneficiary details fetched successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Get Beneficiary Details By User ID', error, { userId });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch user details',
        details: error.response?.data
      };
    }
  },

  // Update details
  async updateDetails(detailsId, updateData) {
    try {
      console.log('🔄 Updating beneficiary details:', { detailsId, updateData });
      const response = await axiosInstance.put(`${RSBSA_ENDPOINTS.BENEFICIARY_DETAILS}/${detailsId}`, updateData);
      console.log('✅ Beneficiary details updated successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Update Beneficiary Details', error, { detailsId, updateData });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update beneficiary details',
        details: error.response?.data
      };
    }
  },

  // Check RSBSA number availability
  async checkRSBSANumberAvailability(rsbsaNumber) {
    try {
      const response = await axiosInstance.get(`${RSBSA_ENDPOINTS.BENEFICIARY_DETAILS}/check-rsbsa/${rsbsaNumber}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to check RSBSA number availability',
        details: error.response?.data
      };
    }
  }
};

/**
 * Farm Profile Operations
 */
export const farmProfileService = {
  // Create farm profile
  async createProfile(profileData) {
    try {
      console.log('🚀 Creating farm profile:', profileData);
      const response = await axiosInstance.post(RSBSA_ENDPOINTS.FARM_PROFILES, profileData);
      console.log('✅ Farm profile created successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Create Farm Profile', error, { profileData });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create farm profile',
        details: error.response?.data
      };
    }
  },

  // Get farm profile by ID
  async getProfile(profileId) {
    try {
      console.log('🔍 Fetching farm profile by ID:', profileId);
      const response = await axiosInstance.get(`${RSBSA_ENDPOINTS.FARM_PROFILES}/${profileId}`);
      console.log('✅ Farm profile fetched successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Get Farm Profile', error, { profileId });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch farm profile',
        details: error.response?.data
      };
    }
  },

  // Update farm profile
  async updateProfile(profileId, updateData) {
    try {
      const response = await axiosInstance.put(`${RSBSA_ENDPOINTS.FARM_PROFILES}/${profileId}`, updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update farm profile',
        details: error.response?.data
      };
    }
  }
};

/**
 * Farm Parcels Operations
 */
export const farmParcelsService = {
  // Create farm parcel
  async createParcel(parcelData) {
    try {
      console.log('🚀 Creating farm parcel:', parcelData);
      const response = await axiosInstance.post(RSBSA_ENDPOINTS.FARM_PARCELS, parcelData);
      console.log('✅ Farm parcel created successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Create Farm Parcel', error, { parcelData });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create farm parcel',
        details: error.response?.data
      };
    }
  },

  // Create multiple farm parcels
  async createMultipleParcels(parcelsData) {
    try {
      const response = await axiosInstance.post(`${RSBSA_ENDPOINTS.FARM_PARCELS}/bulk`, parcelsData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create farm parcels',
        details: error.response?.data
      };
    }
  },

  // Get parcels by farm profile ID
  async getParcelsByFarmProfile(farmProfileId) {
    try {
      const response = await axiosInstance.get(`${RSBSA_ENDPOINTS.FARM_PARCELS}/farm-profile/${farmProfileId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch farm parcels',
        details: error.response?.data
      };
    }
  },

  // Update farm parcel
  async updateParcel(parcelId, updateData) {
    try {
      const response = await axiosInstance.put(`${RSBSA_ENDPOINTS.FARM_PARCELS}/${parcelId}`, updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update farm parcel',
        details: error.response?.data
      };
    }
  },

  // Delete farm parcel
  async deleteParcel(parcelId) {
    try {
      const response = await axiosInstance.delete(`${RSBSA_ENDPOINTS.FARM_PARCELS}/${parcelId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete farm parcel',
        details: error.response?.data
      };
    }
  }
};

/**
 * Livelihood Details Operations
 */
export const livelihoodDetailsService = {
  // Farmer details
  async createFarmerDetails(detailsData) {
    try {
      console.log('🚀 Creating farmer details:', detailsData);
      const response = await axiosInstance.post(RSBSA_ENDPOINTS.FARMER_DETAILS, detailsData);
      console.log('✅ Farmer details created successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Create Farmer Details', error, { detailsData });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create farmer details',
        details: error.response?.data
      };
    }
  },

  async updateFarmerDetails(detailsId, updateData) {
    try {
      const response = await axiosInstance.put(`${RSBSA_ENDPOINTS.FARMER_DETAILS}/${detailsId}`, updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update farmer details',
        details: error.response?.data
      };
    }
  },

  // Fisherfolk details
  async createFisherfolkDetails(detailsData) {
    try {
      console.log('🚀 Creating fisherfolk details:', detailsData);
      const response = await axiosInstance.post(RSBSA_ENDPOINTS.FISHERFOLK_DETAILS, detailsData);
      console.log('✅ Fisherfolk details created successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Create Fisherfolk Details', error, { detailsData });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create fisherfolk details',
        details: error.response?.data
      };
    }
  },

  async updateFisherfolkDetails(detailsId, updateData) {
    try {
      const response = await axiosInstance.put(`${RSBSA_ENDPOINTS.FISHERFOLK_DETAILS}/${detailsId}`, updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update fisherfolk details',
        details: error.response?.data
      };
    }
  },

  // Farmworker details
  async createFarmworkerDetails(detailsData) {
    try {
      console.log('🚀 Creating farmworker details:', detailsData);
      const response = await axiosInstance.post(RSBSA_ENDPOINTS.FARMWORKER_DETAILS, detailsData);
      console.log('✅ Farmworker details created successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Create Farmworker Details', error, { detailsData });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create farmworker details',
        details: error.response?.data
      };
    }
  },

  async updateFarmworkerDetails(detailsId, updateData) {
    try {
      const response = await axiosInstance.put(`${RSBSA_ENDPOINTS.FARMWORKER_DETAILS}/${detailsId}`, updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update farmworker details',
        details: error.response?.data
      };
    }
  },

  // Agri youth details
  async createAgriYouthDetails(detailsData) {
    try {
      const response = await axiosInstance.post(RSBSA_ENDPOINTS.AGRI_YOUTH_DETAILS, detailsData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create agri youth details',
        details: error.response?.data
      };
    }
  },

  async updateAgriYouthDetails(detailsId, updateData) {
    try {
      const response = await axiosInstance.put(`${RSBSA_ENDPOINTS.AGRI_YOUTH_DETAILS}/${detailsId}`, updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update agri youth details',
        details: error.response?.data
      };
    }
  }
};

/**
 * Reference Data Operations
 */
export const referenceDataService = {
  // Get livelihood categories
  async getLivelihoodCategories() {
    try {
      console.log('🔍 Fetching livelihood categories...');
      const response = await axiosInstance.get(RSBSA_ENDPOINTS.LIVELIHOOD_CATEGORIES);
      console.log('✅ Livelihood categories fetched successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Get Livelihood Categories', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch livelihood categories',
        details: error.response?.data
      };
    }
  },

  // Get commodities
  async getCommodities() {
    try {
      console.log('🔍 Fetching commodities...');
      const response = await axiosInstance.get(RSBSA_ENDPOINTS.COMMODITIES);
      console.log('✅ Commodities fetched successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Get Commodities', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch commodities',
        details: error.response?.data
      };
    }
  },

  // Get barangays
  async getBarangays() {
    try {
      console.log('🔍 Fetching barangays...');
      const response = await axiosInstance.get(RSBSA_ENDPOINTS.BARANGAYS);
      console.log('✅ Barangays fetched successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError('Get Barangays', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch barangays',
        details: error.response?.data
      };
    }
  },

  // Get municipalities
  async getMunicipalities() {
    try {
      const response = await axiosInstance.get(RSBSA_ENDPOINTS.MUNICIPALITIES);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch municipalities',
        details: error.response?.data
      };
    }
  },

  // Get provinces
  async getProvinces() {
    try {
      const response = await axiosInstance.get(RSBSA_ENDPOINTS.PROVINCES);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch provinces',
        details: error.response?.data
      };
    }
  },

  // Get regions
  async getRegions() {
    try {
      const response = await axiosInstance.get(RSBSA_ENDPOINTS.REGIONS);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch regions',
        details: error.response?.data
      };
    }
  }
};

/**
 * Complete RSBSA Form Submission
 * This handles the entire form submission process
 */
export const rsbsaFormService = {
  async submitCompleteForm(formData, userId) {
    try {
      console.log('🚀 Submitting complete RSBSA form:', { formData, userId });
      
      // Validate complete form data
      const formValidation = this.validateCompleteForm(formData);
      if (formValidation.hasErrors) {
        const error = new Error('Form validation failed');
        error.validationErrors = formValidation.errors;
        console.error('❌ Form validation failed:', formValidation.errors);
        throw error;
      }
      
      // Step 1: Create beneficiary details
      const beneficiaryResult = await beneficiaryDetailsService.createDetails({
        ...formData.beneficiaryDetails,
        user_id: userId,
        profile_completion_status: 'completed',
        data_source: 'self_registration'
      });

      if (!beneficiaryResult.success) {
        return beneficiaryResult;
      }

      const beneficiaryDetailsId = beneficiaryResult.data.id;

      // Step 2: Create farm profile
      const farmProfileResult = await farmProfileService.createProfile({
        ...formData.farmProfile,
        beneficiary_id: beneficiaryDetailsId
      });

      if (!farmProfileResult.success) {
        return farmProfileResult;
      }

      const farmProfileId = farmProfileResult.data.id;

      // Step 3: Create farm parcels
      const parcelsData = formData.farmParcels.map(parcel => ({
        ...parcel,
        farm_profile_id: farmProfileId
      }));

      const parcelsResult = await farmParcelsService.createMultipleParcels(parcelsData);
      if (!parcelsResult.success) {
        return parcelsResult;
      }

      // Step 4: Create livelihood details based on category
      let livelihoodDetailsResult = { success: true, data: null };

      if (formData.farmProfile.livelihood_category_id === 1) { // Farmer
        livelihoodDetailsResult = await livelihoodDetailsService.createFarmerDetails({
          ...formData.farmerDetails,
          farm_profile_id: farmProfileId
        });
      } else if (formData.farmProfile.livelihood_category_id === 2) { // Fisherfolk
        livelihoodDetailsResult = await livelihoodDetailsService.createFisherfolkDetails({
          ...formData.fisherfolkDetails,
          farm_profile_id: farmProfileId
        });
      } else if (formData.farmProfile.livelihood_category_id === 3) { // Farmworker
        livelihoodDetailsResult = await livelihoodDetailsService.createFarmworkerDetails({
          ...formData.farmworkerDetails,
          farm_profile_id: farmProfileId
        });
      } else if (formData.farmProfile.livelihood_category_id === 4) { // Agri Youth
        livelihoodDetailsResult = await livelihoodDetailsService.createAgriYouthDetails({
          ...formData.agriYouthDetails,
          farm_profile_id: farmProfileId
        });
      }

      if (!livelihoodDetailsResult.success) {
        return livelihoodDetailsResult;
      }

      // Step 5: Create RSBSA enrollment
      const enrollmentResult = await rsbsaEnrollmentService.createEnrollment({
        user_id: userId,
        beneficiary_id: beneficiaryDetailsId,
        farm_profile_id: farmProfileId,
        application_reference_code: `RSBSA-${Date.now()}`,
        enrollment_year: new Date().getFullYear(),
        enrollment_type: 'new',
        application_status: 'submitted',
        submitted_at: new Date().toISOString()
      });

      if (!enrollmentResult.success) {
        return enrollmentResult;
      }

      return {
        success: true,
        data: {
          enrollment: enrollmentResult.data,
          beneficiaryDetails: beneficiaryResult.data,
          farmProfile: farmProfileResult.data,
          farmParcels: parcelsResult.data,
          livelihoodDetails: livelihoodDetailsResult.data
        },
        message: 'RSBSA application submitted successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to submit RSBSA application',
        details: error.message
      };
    }
  },

  // Get complete RSBSA data for a user
  async getCompleteRSBSAData(userId) {
    try {
      // Get enrollment
      const enrollmentResult = await rsbsaEnrollmentService.getEnrollmentByUserId(userId);
      if (!enrollmentResult.success) {
        return enrollmentResult;
      }

      const enrollment = enrollmentResult.data;
      if (!enrollment) {
        return { success: true, data: null, message: 'No RSBSA enrollment found' };
      }

      // Get beneficiary details
      const beneficiaryResult = await beneficiaryDetailsService.getDetailsByUserId(userId);
      if (!beneficiaryResult.success) {
        return beneficiaryResult;
      }

      // Get farm profile
      const farmProfileResult = await farmProfileService.getProfile(enrollment.farm_profile_id);
      if (!farmProfileResult.success) {
        return farmProfileResult;
      }

      // Get farm parcels
      const parcelsResult = await farmParcelsService.getParcelsByFarmProfile(enrollment.farm_profile_id);
      if (!parcelsResult.success) {
        return parcelsResult;
      }

      // Get livelihood details based on category
      let livelihoodDetails = null;
      if (farmProfileResult.data.livelihood_category_id === 1) {
        const result = await livelihoodDetailsService.getFarmerDetails(farmProfileResult.data.id);
        livelihoodDetails = result.success ? result.data : null;
      } else if (farmProfileResult.data.livelihood_category_id === 2) {
        const result = await livelihoodDetailsService.getFisherfolkDetails(farmProfileResult.data.id);
        livelihoodDetails = result.success ? result.data : null;
      } else if (farmProfileResult.data.livelihood_category_id === 3) {
        const result = await livelihoodDetailsService.getFarmworkerDetails(farmProfileResult.data.id);
        livelihoodDetails = result.success ? result.data : null;
      } else if (farmProfileResult.data.livelihood_category_id === 4) {
        const result = await livelihoodDetailsService.getAgriYouthDetails(farmProfileResult.data.id);
        livelihoodDetails = result.success ? result.data : null;
      }

      return {
        success: true,
        data: {
          enrollment,
          beneficiaryDetails: beneficiaryResult.data,
          farmProfile: farmProfileResult.data,
          farmParcels: parcelsResult.data,
          livelihoodDetails
        }
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch RSBSA data',
        details: error.message
      };
    }
  },

  // Save draft form data
  async saveDraft(formData, userId) {
    try {
      console.log('💾 Saving draft form data:', { formData, userId });
      
      // Validate draft data (less strict than complete form)
      const draftValidation = this.validateDraftForm(formData);
      if (draftValidation.hasErrors) {
        console.warn('⚠️ Draft validation warnings:', draftValidation.errors);
      }
      
      // For draft, we only save to beneficiary details with pending status
      const beneficiaryResult = await beneficiaryDetailsService.createDetails({
        ...formData.beneficiaryDetails,
        user_id: userId,
        profile_completion_status: 'pending',
        data_source: 'self_registration'
      });

      if (!beneficiaryResult.success) {
        return beneficiaryResult;
      }

      console.log('✅ Draft saved successfully');
      return {
        success: true,
        data: {
          beneficiaryDetails: beneficiaryResult.data
        },
        message: 'Draft saved successfully'
      };

    } catch (error) {
      logError('Save Draft', error, { formData, userId });
      return {
        success: false,
        error: 'Failed to save draft',
        details: error.message
      };
    }
  },

  // Validate complete form data
  validateCompleteForm(formData) {
    console.log('🔍 Validating complete form data...');
    
    const errors = {};
    let hasErrors = false;

    // Validate beneficiary details
    if (formData.beneficiaryDetails) {
      const beneficiaryValidation = validateObject(formData.beneficiaryDetails, VALIDATION_SCHEMAS.beneficiaryDetails);
      if (beneficiaryValidation.hasErrors) {
        errors.beneficiaryDetails = beneficiaryValidation.errors;
        hasErrors = true;
      }
    } else {
      errors.beneficiaryDetails = { general: ['Beneficiary details are required'] };
      hasErrors = true;
    }

    // Validate farm profile
    if (formData.farmProfile) {
      const farmProfileValidation = validateObject(formData.farmProfile, VALIDATION_SCHEMAS.farmProfile);
      if (farmProfileValidation.hasErrors) {
        errors.farmProfile = farmProfileValidation.errors;
        hasErrors = true;
      }
    } else {
      errors.farmProfile = { general: ['Farm profile is required'] };
      hasErrors = true;
    }

    // Validate farm parcels
    if (formData.farmParcels && formData.farmParcels.length > 0) {
      const parcelErrors = [];
      formData.farmParcels.forEach((parcel, index) => {
        const parcelValidation = validateObject(parcel, VALIDATION_SCHEMAS.farmParcel);
        if (parcelValidation.hasErrors) {
          parcelErrors[index] = parcelValidation.errors;
        }
      });
      
      if (parcelErrors.length > 0) {
        errors.farmParcels = parcelErrors;
        hasErrors = true;
      }
    } else {
      errors.farmParcels = { general: ['At least one farm parcel is required'] };
      hasErrors = true;
    }

    if (hasErrors) {
      console.error('❌ Form validation errors:', errors);
    } else {
      console.log('✅ Form validation passed');
    }

    return { errors, hasErrors };
  },

  // Validate draft form data (less strict)
  validateDraftForm(formData) {
    console.log('🔍 Validating draft form data...');
    
    const errors = {};
    let hasErrors = false;

    // For draft, only validate required fields if they exist
    if (formData.beneficiaryDetails) {
      const requiredFields = ['first_name', 'last_name'];
      requiredFields.forEach(field => {
        if (formData.beneficiaryDetails[field] && 
            typeof formData.beneficiaryDetails[field] === 'string' && 
            formData.beneficiaryDetails[field].trim() === '') {
          errors[field] = [`${field} cannot be empty if provided`];
          hasErrors = true;
        }
      });
    }

    if (hasErrors) {
      console.warn('⚠️ Draft validation warnings:', errors);
    } else {
      console.log('✅ Draft validation passed');
    }

    return { errors, hasErrors };
  }
};

// Export all services
export default {
  rsbsaEnrollmentService,
  beneficiaryDetailsService,
  farmProfileService,
  farmParcelsService,
  livelihoodDetailsService,
  referenceDataService,
  rsbsaFormService
};