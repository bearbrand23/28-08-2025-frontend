import { useState, useEffect, useCallback } from 'react';
import { rsbsaFormService, referenceDataService } from '../../api/rsbsaService';

/**
 * Custom hook for managing RSBSA form state and operations
 * Based on the database schema provided:
 * - rsbsa_enrollments
 * - beneficiary_profiles  
 * - farm_profiles
 * - farm_parcels
 * - farmer_details
 * - fisherfolk_details
 * - farmworker_details
 * - agri_youth_details
 * - livelihood_categories
 * - commodities
 * - barangays
 */
export const useRSBSAForm = () => {
  // Form state based on database structure and API service
  const [formData, setFormData] = useState({
    // Beneficiary Details (matches actual database structure)
    beneficiaryDetails: {
      id: null,
      user_id: null,
      
      // RSBSA INFORMATION & VERIFICATION
      system_generated_rsbsa_number: null,
      manual_rsbsa_number: null,
      rsbsa_verification_status: 'not_verified',
      rsbsa_verification_notes: null,
      rsbsa_verified_at: null,
      rsbsa_verified_by: null,

      // LOCATION INFORMATION  
      barangay: '',
      municipality: 'Opol',
      province: 'Misamis Oriental',
      region: 'Region X (Northern Mindanao)',

      // CONTACT INFORMATION
      contact_number: '',
      emergency_contact_number: '',

      // PERSONAL INFORMATION
      birth_date: null,
      place_of_birth: '',
      sex: null, // male, female - CRITICAL MISSING FIELD
      civil_status: null, // single, married, widowed, separated, divorced
      name_of_spouse: '',

      // EDUCATIONAL & DEMOGRAPHIC INFORMATION
      highest_education: null, // None, Pre-school, Elementary, Junior High School, Senior High School, Vocational, College, Post Graduate
      religion: '',
      is_pwd: false,

      // GOVERNMENT ID INFORMATION
      has_government_id: 'no',
      gov_id_type: '',
      gov_id_number: '',

      // ASSOCIATION & ORGANIZATION MEMBERSHIP
      is_association_member: 'no',
      association_name: '',

      // HOUSEHOLD INFORMATION
      mothers_maiden_name: '',
      is_household_head: false,
      household_head_name: '',

      // PROFILE COMPLETION & VERIFICATION SYSTEM
      profile_completion_status: 'pending',
      is_profile_verified: false,
      verification_notes: null,
      profile_verified_at: null,
      profile_verified_by: null,
      
      // INTERVIEW TRACKING
      interview_status: 'pending',
      interviewed_at: null,
      interviewed_by: null,
      interview_notes: null,
      
      // DATA SOURCE & AUDIT TRACKING
      data_source: 'self_registration',
      last_updated_by_beneficiary: null,
      completion_tracking: null,
      
      created_at: null,
      updated_at: null
    },

    // Farm Profile (matches farmProfileService structure)
    farmProfile: {
      id: null,
      beneficiary_id: null,
      livelihood_category_id: null,
      created_at: null,
      updated_at: null
    },

    // Farm Parcels (updated to match database structure)
    farmParcels: [],

    // NEW STRUCTURE: Beneficiary Livelihoods (many-to-many relationship)
    beneficiaryLivelihoods: [],

    // Farmer Activities (matches farmer_activities table)
    farmerActivities: {
      id: null,
      beneficiary_livelihood_id: null,
      rice: false,
      corn: false,
      other_crops: false,
      other_crops_specify: '',
      livestock: false,
      livestock_specify: '',
      poultry: false,
      poultry_specify: '',
      created_at: null,
      updated_at: null
    },

    // Fisherfolk Activities (matches fisherfolk_activities table)
    fisherfolkActivities: {
      id: null,
      beneficiary_livelihood_id: null,
      fish_capture: false,
      aquaculture: false,
      gleaning: false, // NEW ACTIVITY
      fish_processing: false,
      fish_vending: false, // NEW ACTIVITY
      others: false,
      others_specify: '',
      created_at: null,
      updated_at: null
    },

    // Farmworker Activities (matches farmworker_activities table)
    farmworkerActivities: {
      id: null,
      beneficiary_livelihood_id: null,
      land_preparation: false,
      planting: false, // NEW ACTIVITY (separate from cultivation)
      cultivation: false,
      harvesting: false,
      others: false,
      others_specify: '',
      created_at: null,
      updated_at: null
    },

    // Agri Youth Activities (matches proposed agri_youth_activities table)
    agriYouthActivities: {
      id: null,
      beneficiary_livelihood_id: null,
      is_agri_youth: false,
      is_part_of_farming_household: false,
      is_formal_agri_course: false,
      is_nonformal_agri_course: false,
      is_agri_program_participant: false,
      others: false,
      others_specify: '',
      created_at: null,
      updated_at: null
    }
  });

  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);

  // Backend integration states
  const [submissionResult, setSubmissionResult] = useState(null);
  const [existingEnrollment, setExistingEnrollment] = useState(null);
  const [backendErrors, setBackendErrors] = useState({});

  // Form step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Load existing enrollment data from backend
  const loadExistingEnrollment = useCallback(async (userId) => {
    if (!userId) return;
    
    setIsLoadingExistingData(true);
    try {
      console.log('🔍 Loading existing enrollment for user:', userId);
      const result = await rsbsaFormService.getCompleteRSBSAData(userId);
      
      if (result.success && result.data) {
        console.log('✅ Existing enrollment found:', result.data);
        setExistingEnrollment(result.data);
        
        // Populate form data with existing enrollment
        setFormData(prevData => ({
          ...prevData,
          beneficiaryDetails: { ...prevData.beneficiaryDetails, ...result.data.beneficiaryDetails },
          farmProfile: { ...prevData.farmProfile, ...result.data.farmProfile },
          farmParcels: result.data.farmParcels || [],
          farmerDetails: { ...prevData.farmerDetails, ...result.data.livelihoodDetails },
          fisherfolkDetails: { ...prevData.fisherfolkDetails, ...result.data.livelihoodDetails },
          farmworkerDetails: { ...prevData.farmworkerDetails, ...result.data.livelihoodDetails },
          agriYouthDetails: { ...prevData.agriYouthDetails, ...result.data.livelihoodDetails }
        }));
        
        localStorage.setItem('rsbsa_form_data', JSON.stringify(formData));
      } else {
        console.log('ℹ️ No existing enrollment found for user');
      }
    } catch (error) {
      console.error('❌ Error loading existing enrollment:', error);
      setBackendErrors(prev => ({ ...prev, loadError: 'Failed to load existing data' }));
    } finally {
      setIsLoadingExistingData(false);
    }
  }, [formData]);

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('rsbsa_form_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('📦 Loading saved form data from localStorage:', parsedData);
        setFormData(prevData => ({ ...prevData, ...parsedData }));
      } catch (error) {
        console.error('❌ Error loading saved form data:', error);
        setBackendErrors(prev => ({ ...prev, localStorageError: 'Failed to load saved data' }));
      }
    }
  }, []);

  // Save form data to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('rsbsa_form_data', JSON.stringify(formData));
  }, [formData]);

  // Update form field
  const updateField = useCallback((section, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value
      }
    }));

    // Clear error for this field if it exists
    if (errors[`${section}.${field}`]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  }, [errors]);

  // Add new farm parcel (updated to match database structure)
  const addFarmParcel = useCallback(() => {
    const newParcel = {
      id: Date.now(), // Temporary ID for frontend
      farm_profile_id: null,
      sector_id: null, // MISSING FIELD - required
      parcel_number: '',
      barangay: '',
      farm_area: 0,
      
      // Tenure / Ownership
      tenure_type: null, // enum: registered_owner, tenant, lessee
      landowner_name: '', // MISSING FIELD
      ownership_document_number: '',
      
      // Legal and classification
      is_ancestral_domain: false,
      is_agrarian_reform_beneficiary: false,
      farm_type: null, // enum: irrigated, rainfed upland, rainfed lowland (note: space in enum)
      is_organic_practitioner: false,
      
      remarks: '',
      created_at: null,
      updated_at: null
    };

    setFormData(prevData => ({
      ...prevData,
      farmParcels: [...prevData.farmParcels, newParcel]
    }));
  }, []);

  // Update farm parcel
  const updateFarmParcel = useCallback((index, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      farmParcels: prevData.farmParcels.map((parcel, i) =>
        i === index ? { ...parcel, [field]: value } : parcel
      )
    }));
  }, []);

  // Remove farm parcel
  const removeFarmParcel = useCallback((index) => {
    setFormData(prevData => ({
      ...prevData,
      farmParcels: prevData.farmParcels.filter((_, i) => i !== index)
    }));
  }, []);

  // Form validation with comprehensive error handling
  const validateForm = useCallback(() => {
    console.log('🔍 Validating form data...');
    const newErrors = {};

    try {
      // Validate beneficiary details (updated for new structure)
      const { beneficiaryDetails } = formData;
      
      // CRITICAL REQUIRED FIELDS
      if (!beneficiaryDetails.barangay?.trim()) {
        newErrors['beneficiaryDetails.barangay'] = 'Barangay is required';
      }
      if (!beneficiaryDetails.contact_number?.trim()) {
        newErrors['beneficiaryDetails.contact_number'] = 'Contact number is required';
      }
      if (!beneficiaryDetails.birth_date) {
        newErrors['beneficiaryDetails.birth_date'] = 'Birth date is required';
      }
      if (!beneficiaryDetails.sex) {
        newErrors['beneficiaryDetails.sex'] = 'Sex is required';
      }
      
      // Municipality, province, region have defaults but validate if changed
      if (!beneficiaryDetails.municipality?.trim()) {
        newErrors['beneficiaryDetails.municipality'] = 'Municipality is required';
      }
      if (!beneficiaryDetails.province?.trim()) {
        newErrors['beneficiaryDetails.province'] = 'Province is required';
      }
      if (!beneficiaryDetails.region?.trim()) {
        newErrors['beneficiaryDetails.region'] = 'Region is required';
      }

      // Validate farm profile
      if (!formData.farmProfile.livelihood_category_id) {
        newErrors['farmProfile.livelihood_category_id'] = 'Livelihood category is required';
      }

      // Validate at least one farm parcel
      if (formData.farmParcels.length === 0) {
        newErrors['farmParcels'] = 'At least one farm parcel is required';
      } else {
        // Validate each farm parcel
        formData.farmParcels.forEach((parcel, index) => {
          if (!parcel.barangay?.trim()) {
            newErrors[`farmParcels.${index}.barangay`] = 'Parcel barangay is required';
          }
          if (!parcel.tenure_type) {
            newErrors[`farmParcels.${index}.tenure_type`] = 'Tenure type is required';
          }
          if (!parcel.farm_area || parcel.farm_area <= 0) {
            newErrors[`farmParcels.${index}.farm_area`] = 'Farm area must be greater than 0';
          }
        });
      }

      // Validate livelihood-specific activities (updated for new structure)
      // Note: With new structure, we need to validate based on selected livelihoods
      if (formData.beneficiaryLivelihoods && formData.beneficiaryLivelihoods.length > 0) {
        formData.beneficiaryLivelihoods.forEach((livelihood, index) => {
          if (livelihood.livelihood_category_id === 1) { // Farmer
            const hasAnyFarmerActivity = 
              formData.farmerActivities.rice || 
              formData.farmerActivities.corn || 
              formData.farmerActivities.other_crops ||
              formData.farmerActivities.livestock ||
              formData.farmerActivities.poultry;
            
            if (!hasAnyFarmerActivity) {
              newErrors['farmerActivities'] = 'Please select at least one farming activity';
            }
          } else if (livelihood.livelihood_category_id === 2) { // Fisherfolk
            const hasAnyFishingActivity = 
              formData.fisherfolkActivities.fish_capture || 
              formData.fisherfolkActivities.aquaculture || 
              formData.fisherfolkActivities.gleaning ||
              formData.fisherfolkActivities.fish_processing ||
              formData.fisherfolkActivities.fish_vending;
            
            if (!hasAnyFishingActivity) {
              newErrors['fisherfolkActivities'] = 'Please select at least one fishing activity';
            }
          } else if (livelihood.livelihood_category_id === 3) { // Farmworker
            const hasAnyFarmworkerActivity = 
              formData.farmworkerActivities.land_preparation || 
              formData.farmworkerActivities.planting ||
              formData.farmworkerActivities.cultivation || 
              formData.farmworkerActivities.harvesting;
            
            if (!hasAnyFarmworkerActivity) {
              newErrors['farmworkerActivities'] = 'Please select at least one farmworker activity';
            }
          } else if (livelihood.livelihood_category_id === 4) { // Agri Youth
            if (!formData.agriYouthActivities.is_agri_youth) {
              newErrors['agriYouthActivities.is_agri_youth'] = 'Please confirm you are an Agri-Youth';
            }
          }
        });
      } else {
        // Fallback validation for single livelihood (backward compatibility)
        const livelihoodCategoryId = formData.farmProfile.livelihood_category_id;
        if (livelihoodCategoryId) {
          newErrors['beneficiaryLivelihoods'] = 'Please select at least one livelihood category';
        }
      }

      setErrors(newErrors);
      setBackendErrors({}); // Clear backend errors on successful validation
      
      const isValid = Object.keys(newErrors).length === 0;
      console.log(isValid ? '✅ Form validation passed' : '❌ Form validation failed:', newErrors);
      
      return isValid;
    } catch (error) {
      console.error('❌ Error during form validation:', error);
      setBackendErrors(prev => ({ ...prev, validationError: 'Validation error occurred' }));
      return false;
    }
  }, [formData]);

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Go to specific step
  const goToStep = useCallback((step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  // Submit complete form to backend
  const submitForm = useCallback(async (userId) => {
    console.log('🚀 Starting form submission process...');
    
    if (!validateForm()) {
      console.error('❌ Form validation failed, cannot submit');
      return { success: false, error: 'Form validation failed' };
    }

    if (!userId) {
      console.error('❌ User ID is required for submission');
      setBackendErrors(prev => ({ ...prev, submissionError: 'User ID is required' }));
      return { success: false, error: 'User ID is required' };
    }

    setIsSubmitting(true);
    setBackendErrors({});
    
    try {
      console.log('📤 Submitting form data to backend:', formData);
      
      // Submit complete form using the rsbsaFormService
      const result = await rsbsaFormService.submitCompleteForm(formData, userId);
      
      if (result.success) {
        console.log('✅ Form submitted successfully:', result.data);
        setSubmissionResult(result);
        
        // Clear localStorage after successful submission
        localStorage.removeItem('rsbsa_form_data');
        
        return { success: true, data: result.data };
      } else {
        console.error('❌ Form submission failed:', result.error);
        setBackendErrors(prev => ({ 
          ...prev, 
          submissionError: result.error,
          validationErrors: result.validationErrors 
        }));
        
        return { success: false, error: result.error, details: result.details };
      }
    } catch (error) {
      console.error('❌ Unexpected error during form submission:', error);
      setBackendErrors(prev => ({ ...prev, submissionError: 'Unexpected error occurred' }));
      return { success: false, error: 'Unexpected error occurred' };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  // Save draft to backend
  const saveDraft = useCallback(async (userId) => {
    console.log('💾 Saving form as draft...');
    
    if (!userId) {
      console.error('❌ User ID is required for saving draft');
      setBackendErrors(prev => ({ ...prev, draftError: 'User ID is required' }));
      return { success: false, error: 'User ID is required' };
    }

    setIsSavingDraft(true);
    setBackendErrors({});
    
    try {
      console.log('💾 Saving draft to backend:', formData);
      
      const result = await rsbsaFormService.saveDraft(formData, userId);
      
      if (result.success) {
        console.log('✅ Draft saved successfully:', result.data);
        return { success: true, data: result.data };
      } else {
        console.error('❌ Failed to save draft:', result.error);
        setBackendErrors(prev => ({ ...prev, draftError: result.error }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Unexpected error while saving draft:', error);
      setBackendErrors(prev => ({ ...prev, draftError: 'Failed to save draft' }));
      return { success: false, error: 'Failed to save draft' };
    } finally {
      setIsSavingDraft(false);
    }
  }, [formData]);

  // Reset form with comprehensive cleanup
  const resetForm = useCallback(() => {
    console.log('🔄 Resetting form to initial state...');
    
    const initialFormData = {
      beneficiaryDetails: {
        id: null,
        user_id: null,
        first_name: '',
        last_name: '',
        middle_name: '',
        email: '',
        contact_number: '',
        barangay: '',
        municipality: '',
        province: '',
        region: '',
        address: '',
        birth_date: null,
        place_of_birth: '',
        civil_status: null,
        name_of_spouse: '',
        highest_education: null,
        religion: '',
        pwd: false,
        has_government_id: 'no',
        gov_id_type: '',
        gov_id_number: '',
        is_association_member: 'no',
        association_name: '',
        mothers_maiden_name: '',
        is_household_head: false,
        household_head_name: '',
        emergency_contact_number: '',
        profile_completion_status: 'pending',
        data_source: 'self_registration',
        created_at: null,
        updated_at: null
      },
      farmProfile: {
        id: null,
        beneficiary_id: null,
        livelihood_category_id: null,
        created_at: null,
        updated_at: null
      },
      farmParcels: [],
      farmerDetails: {
        id: null,
        farm_profile_id: null,
        is_rice: false,
        is_corn: false,
        is_other_crops: false,
        other_crops_description: '',
        is_livestock: false,
        livestock_description: '',
        is_poultry: false,
        poultry_description: '',
        created_at: null,
        updated_at: null
      },
      fisherfolkDetails: {
        id: null,
        farm_profile_id: null,
        is_fish_capture: false,
        is_aquaculture: false,
        is_fish_processing: false,
        other_fishing_description: '',
        created_at: null,
        updated_at: null
      },
      farmworkerDetails: {
        id: null,
        farm_profile_id: null,
        is_land_preparation: false,
        is_cultivation: false,
        is_harvesting: false,
        other_work_description: '',
        created_at: null,
        updated_at: null
      },
      agriYouthDetails: {
        id: null,
        farm_profile_id: null,
        is_agri_youth: false,
        is_part_of_farming_household: false,
        is_formal_agri_course: false,
        is_nonformal_agri_course: false,
        is_agri_program_participant: false,
        other_involvement_description: '',
        created_at: null,
        updated_at: null
      }
    };

    setFormData(initialFormData);
    setErrors({});
    setBackendErrors({});
    setSubmissionResult(null);
    setExistingEnrollment(null);
    setCurrentStep(1);
    localStorage.removeItem('rsbsa_form_data');
    
    console.log('✅ Form reset completed');
  }, []);

  // Get form completion percentage with enhanced calculation
  const getFormProgress = useCallback(() => {
    const totalFields = 20; // Updated number of required fields
    let completedFields = 0;

    try {
      // Check beneficiary details completion
      const { beneficiaryDetails } = formData;
      if (beneficiaryDetails.first_name?.trim()) completedFields++;
      if (beneficiaryDetails.last_name?.trim()) completedFields++;
      if (beneficiaryDetails.barangay?.trim()) completedFields++;
      if (beneficiaryDetails.municipality?.trim()) completedFields++;
      if (beneficiaryDetails.province?.trim()) completedFields++;
      if (beneficiaryDetails.region?.trim()) completedFields++;
      if (beneficiaryDetails.contact_number?.trim()) completedFields++;

      // Check farm profile completion
      if (formData.farmProfile.livelihood_category_id) completedFields++;

      // Check farm parcels completion
      if (formData.farmParcels.length > 0) {
        completedFields++;
        // Check if first parcel is properly filled
        const firstParcel = formData.farmParcels[0];
        if (firstParcel && firstParcel.barangay && firstParcel.tenure_type && firstParcel.farm_area > 0) {
          completedFields += 3;
        }
      }

      // Check livelihood-specific completion
      const livelihoodCategoryId = formData.farmProfile.livelihood_category_id;
      if (livelihoodCategoryId === 1) { // Farmer
        const hasActivity = formData.farmerDetails.is_rice || formData.farmerDetails.is_corn || 
                           formData.farmerDetails.is_other_crops || formData.farmerDetails.is_livestock || 
                           formData.farmerDetails.is_poultry;
        if (hasActivity) completedFields++;
      } else if (livelihoodCategoryId === 2) { // Fisherfolk
        const hasActivity = formData.fisherfolkDetails.is_fish_capture || 
                           formData.fisherfolkDetails.is_aquaculture || 
                           formData.fisherfolkDetails.is_fish_processing;
        if (hasActivity) completedFields++;
      } else if (livelihoodCategoryId === 3) { // Farmworker
        const hasActivity = formData.farmworkerDetails.is_land_preparation || 
                           formData.farmworkerDetails.is_cultivation || 
                           formData.farmworkerDetails.is_harvesting;
        if (hasActivity) completedFields++;
      } else if (livelihoodCategoryId === 4) { // Agri Youth
        if (formData.agriYouthDetails.is_agri_youth) completedFields++;
      }

      return Math.round((completedFields / totalFields) * 100);
    } catch (error) {
      console.error('❌ Error calculating form progress:', error);
      return 0;
    }
  }, [formData]);

  return {
    // State
    formData,
    errors,
    backendErrors,
    isLoading,
    isSubmitting,
    isSavingDraft,
    isLoadingExistingData,
    currentStep,
    totalSteps,
    submissionResult,
    existingEnrollment,

    // Actions
    updateField,
    addFarmParcel,
    updateFarmParcel,
    removeFarmParcel,
    validateForm,
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    saveDraft,
    resetForm,
    loadExistingEnrollment,

    // Computed values
    formProgress: getFormProgress(),
    isValid: Object.keys(errors).length === 0 && Object.keys(backendErrors).length === 0,
    canSubmit: Object.keys(errors).length === 0 && formData.farmParcels.length > 0 && !isSubmitting,
    hasBackendErrors: Object.keys(backendErrors).length > 0
  };
};

export default useRSBSAForm;