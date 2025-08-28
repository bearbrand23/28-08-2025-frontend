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
  // Form state based on database structure
  const [formData, setFormData] = useState({
    // RSBSA Enrollment (rsbsa_enrollments table)
    enrollment: {
      id: null,
      user_id: null,
      farm_profile_id: null,
      reference_code: '',
      status: 'pending', // enum: pending, verifying, verified, rejected
      submitted_at: null,
      verified_at: null,
      rejection_reason: null,
      verified_by: null,
      created_at: null,
      updated_at: null
    },

    // Beneficiary Profile (beneficiary_profiles table)
    beneficiaryProfile: {
      id: null,
      user_id: null,
      RSBSA_NUMBER: null,
      SYSTEM_GENERATED_RSBSA_NUMBER: null,
      barangay: '',
      municipality: '',
      province: '',
      region: '',
      contact_number: '',
      birth_date: null,
      place_of_birth: '',
      civil_status: null, // enum: single, married, widowed, separated, divorced
      name_of_spouse: '',
      highest_education: null, // enum: None, Pre-school, Elementary, Junior High School, Senior High School, Vocational, College, Post Graduate
      religion: '',
      pwd: false,
      has_government_id: 'no', // enum: yes, no
      gov_id_type: '',
      gov_id_number: '',
      is_association_member: 'no', // enum: yes, no
      association_name: '',
      mothers_maiden_name: '',
      is_household_head: false,
      household_head_name: '',
      emergency_contact_number: '',
      created_at: null,
      updated_at: null
    },

    // Farm Profile (farm_profiles table)
    farmProfile: {
      id: null,
      beneficiary_id: null,
      livelihood_category_id: null,
      created_at: null,
      updated_at: null
    },

    // Farm Parcels (farm_parcels table) - Array for multiple parcels
    farmParcels: [],

    // Farmer Details (farmer_details table)
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

    // Fisherfolk Details (fisherfolk_details table)
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

    // Farmworker Details (farmworker_details table)
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

    // Agricultural Youth Details (agri_youth_details table)
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
  });

  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Loading states
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('rsbsa_form_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prevData => ({ ...prevData, ...parsedData }));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading saved form data:', error);
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

  // Add new farm parcel
  const addFarmParcel = useCallback(() => {
    const newParcel = {
      id: Date.now(), // Temporary ID for frontend
      farm_profile_id: null,
      parcel_number: '',
      barangay: '',
      tenure_type: null, // enum: registered_owner, tenant, lessee
      ownership_document_number: '',
      is_ancestral_domain: false,
      is_agrarian_reform_beneficiary: false,
      farm_type: null, // enum: irrigated, rainfed_upland, rainfed_lowland
      is_organic_practitioner: false,
      farm_area: 0,
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

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate beneficiary profile
    const { beneficiaryProfile } = formData;
    if (!beneficiaryProfile.barangay.trim()) {
      newErrors['beneficiaryProfile.barangay'] = 'Barangay is required';
    }
    if (!beneficiaryProfile.municipality.trim()) {
      newErrors['beneficiaryProfile.municipality'] = 'Municipality is required';
    }
    if (!beneficiaryProfile.contact_number.trim()) {
      newErrors['beneficiaryProfile.contact_number'] = 'Contact number is required';
    }
    if (!beneficiaryProfile.birth_date) {
      newErrors['beneficiaryProfile.birth_date'] = 'Birth date is required';
    }
    if (!beneficiaryProfile.civil_status) {
      newErrors['beneficiaryProfile.civil_status'] = 'Civil status is required';
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
        if (!parcel.barangay.trim()) {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  // Submit form
  const submitForm = useCallback(async () => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      // Here you would make API call to submit form
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update enrollment status
      setFormData(prevData => ({
        ...prevData,
        enrollment: {
          ...prevData.enrollment,
          status: 'verifying',
          submitted_at: new Date().toISOString(),
          reference_code: `RSBSA-${Date.now()}`
        }
      }));

      // Clear localStorage after successful submission
      localStorage.removeItem('rsbsa_form_data');
      
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      enrollment: {
        id: null,
        user_id: null,
        farm_profile_id: null,
        reference_code: '',
        status: 'pending',
        submitted_at: null,
        verified_at: null,
        rejection_reason: null,
        verified_by: null,
        created_at: null,
        updated_at: null
      },
      beneficiaryProfile: {
        id: null,
        user_id: null,
        RSBSA_NUMBER: null,
        SYSTEM_GENERATED_RSBSA_NUMBER: null,
        barangay: '',
        municipality: '',
        province: '',
        region: '',
        contact_number: '',
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
    });
    setErrors({});
    setCurrentStep(1);
    localStorage.removeItem('rsbsa_form_data');
  }, []);

  // Get form completion percentage
  const getFormProgress = useCallback(() => {
    const totalFields = 15; // Approximate number of required fields
    let completedFields = 0;

    // Check beneficiary profile completion
    const { beneficiaryProfile } = formData;
    if (beneficiaryProfile.barangay) completedFields++;
    if (beneficiaryProfile.municipality) completedFields++;
    if (beneficiaryProfile.contact_number) completedFields++;
    if (beneficiaryProfile.birth_date) completedFields++;
    if (beneficiaryProfile.civil_status) completedFields++;

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

    return Math.round((completedFields / totalFields) * 100);
  }, [formData]);

  return {
    // State
    formData,
    errors,
    isLoading,
    isSubmitting,
    currentStep,
    totalSteps,

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
    resetForm,

    // Computed values
    formProgress: getFormProgress(),
    isValid: Object.keys(errors).length === 0,
    canSubmit: Object.keys(errors).length === 0 && formData.farmParcels.length > 0
  };
};

export default useRSBSAForm;