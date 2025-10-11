/* eslint-disable no-useless-escape */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  Box,
  Chip,
  Autocomplete,
  FormHelperText
} from '@mui/material';

// ============================================
// LIVESTOCK SERVICE ITEMS (Optional Details)
// ============================================
const COMMON_SERVICE_ITEMS = [
  'Anti-FMD Vaccine',
  'Anti-Rabies Vaccine',
  'Newcastle Disease Vaccine',
  'Fowl Pox Vaccine',
  'Albendazole',
  'Ivermectin',
  'Fenbendazole',
  'Antibiotic Injection',
  'Vitamin Injection',
  'Health Certificate',
  'Transport Permit',
  'General Service',
  'Other'
];

// ============================================
// LIVESTOCK SPECIES OPTIONS
// ============================================
const LIVESTOCK_SPECIES = [
  'Cattle',
  'Carabao', 
  'Goat',
  'Sheep',
  'Pig',
  'Chicken',
  'Duck',
  'Turkey',
  'Quail',
  'Dog',
  'Cat'
];

// ============================================
// BREED OPTIONS BY SPECIES
// ============================================
const BREED_OPTIONS = {
  'Cattle': [
    'Brahman',
    'Simmental', 
    'Holstein',
    'Angus',
    'Limousin',
    'Charolais',
    'Native/Local',
    'Crossbred',
    'Mixed Breed'
  ],
  'Carabao': [
    'Murrah',
    'Nili-Ravi',
    'Bulgarian Murrah',
    'Native Philippine Carabao',
    'Crossbred'
  ],
  'Goat': [
    'Boer',
    'Anglo Nubian',
    'Saanen',
    'Native/Local',
    'Crossbred'
  ],
  'Sheep': [
    'Katahdin',
    'Dorper',
    'Native/Local',
    'Crossbred'
  ],
  'Pig': [
    'Large White',
    'Landrace', 
    'Duroc',
    'Hampshire',
    'Native/Local',
    'Crossbred',
    'Hypor',
    'PIC'
  ],
  'Chicken': [
    'Broiler',
    'Layer',
    'Native/Local',
    'Improved',
    'Dual Purpose'
  ],
  'Duck': [
    'Peking',
    'Muscovy',
    'Native/Local',
    'Mallard'
  ],
  'Turkey': [
    'Bronze',
    'White Holland',
    'Native/Local'
  ],
  'Quail': [
    'Japanese Quail',
    'Native/Local'
  ],
  'Dog': [
    'Aspin',
    'Mixed Breed',
    'Purebred',
    'Unknown'
  ],
  'Cat': [
    'Mixed Breed',
    'Purebred', 
    'Unknown'
  ]
};


// ============================================
// UNITS BY SPECIES
// ============================================
const UNIT_OPTIONS = {
  'Cattle': ['head', 'heads'],
  'Carabao': ['head', 'heads'],
  'Goat': ['head', 'heads'], 
  'Sheep': ['head', 'heads'],
  'Pig': ['head', 'heads'],
  'Chicken': ['head', 'heads', 'flock'],
  'Duck': ['head', 'heads', 'flock'],
  'Turkey': ['head', 'heads'],
  'Quail': ['head', 'heads', 'flock'],
  'Dog': ['head', 'heads'],
  'Cat': ['head', 'heads']
};

// ============================================
// SEX OPTIONS BY SPECIES  
// ============================================
const SEX_OPTIONS = {
  'Cattle': ['Male', 'Female', 'Bull', 'Cow', 'Heifer', 'Steer', 'Calf', 'Mixed'],
  'Carabao': ['Male', 'Female', 'Bull', 'Cow', 'Heifer', 'Steer', 'Calf', 'Mixed'],
  'Goat': ['Male', 'Female', 'Buck', 'Doe', 'Kid', 'Castrated', 'Mixed'],
  'Sheep': ['Male', 'Female', 'Ram', 'Ewe', 'Lamb', 'Wether', 'Mixed'],
  'Pig': ['Male', 'Female', 'Boar', 'Sow', 'Gilt', 'Barrow', 'Piglet', 'Mixed'],
  'Chicken': ['Male', 'Female', 'Rooster', 'Hen', 'Chick', 'Mixed'],
  'Duck': ['Male', 'Female', 'Drake', 'Duck', 'Duckling', 'Mixed'],
  'Turkey': ['Male', 'Female', 'Tom', 'Hen', 'Poult', 'Mixed'],
  'Quail': ['Male', 'Female', 'Mixed'],
  'Dog': ['Male', 'Female', 'Neutered', 'Spayed', 'Mixed'],
  'Cat': ['Male', 'Female', 'Neutered', 'Spayed', 'Mixed']
};

const AddWalkInParticipantModal = ({ 
  open, 
  onClose, 
  onAdd, 
  serviceCatalog,
  isLoading 
}) => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [formData, setFormData] = useState({
    owner_name: '',
    owner_contact: '',
    target_category: '',
    target_breed: '',
    service_item: '',
    quantity: '',
    unit: 'head',
    age_months: '',
    sex: '',
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // ============================================
  // DERIVED VALUES
  // ============================================
  const availableBreeds = useMemo(() => {
    return formData.target_category ? BREED_OPTIONS[formData.target_category] || [] : [];
  }, [formData.target_category]);

  const availableUnits = useMemo(() => {
    return formData.target_category ? UNIT_OPTIONS[formData.target_category] || ['head'] : ['head'];
  }, [formData.target_category]);

  const availableSexOptions = useMemo(() => {
    return formData.target_category ? SEX_OPTIONS[formData.target_category] || [] : [];
  }, [formData.target_category]);

  // ============================================
  // FORM HANDLERS
  // ============================================
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear dependent fields when species/category changes
      if (field === 'target_category') {
        newData.target_breed = '';
        newData.unit = 'head';
        newData.sex = '';
      }
      
      return newData;
    });

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.owner_name.trim()) {
      newErrors.owner_name = 'Animal owner name is required';
    }
    if (!formData.target_category) {
      newErrors.target_category = 'Animal species is required';
    }
    if (!formData.target_breed) {
      newErrors.target_breed = 'Animal breed is required';
    }
    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    // Contact validation (if provided)
    if (formData.owner_contact && !/^[\d\s\-\+\(\)]+$/.test(formData.owner_contact)) {
      newErrors.owner_contact = 'Invalid contact format';
    }

    // Age validation (if provided)
    if (formData.age_months && (parseInt(formData.age_months) < 0 || parseInt(formData.age_months) > 300)) {
      newErrors.age_months = 'Age must be between 0-300 months';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitError('');

    try {
      const participantData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        age_months: formData.age_months ? parseInt(formData.age_months) : null,
        service_catalog_id: serviceCatalog?.id
      };

      await onAdd(participantData);
      handleClose();
    } catch (error) {
      console.error('Error adding walk-in participant:', error);
      setSubmitError(error.message || 'Failed to add participant. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({
      owner_name: '',
      owner_contact: '',
      target_category: '',
      target_breed: '',
      service_item: '',
      quantity: '',
      unit: 'head',
      age_months: '',
      sex: '',
      remarks: ''
    });
    setErrors({});
    setSubmitError('');
    onClose();
  };

  // ============================================
  // RENDER COMPONENT
  // ============================================
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          🐄 Add Walk-in Livestock Service
          {serviceCatalog && (
            <Chip 
              label={serviceCatalog.name}
              color="primary" 
              size="small"
            />
          )}
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Register walk-in livestock for: <strong>{serviceCatalog?.name || 'Service'}</strong>
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* ============================================ */}
          {/* OWNER INFORMATION SECTION */}
          {/* ============================================ */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              👨‍🌾 Owner Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Animal Owner Name *"
              value={formData.owner_name}
              onChange={(e) => handleInputChange('owner_name', e.target.value)}
              error={!!errors.owner_name}
              helperText={errors.owner_name || 'Full name of livestock owner'}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Number"
              value={formData.owner_contact}
              onChange={(e) => handleInputChange('owner_contact', e.target.value)}
              error={!!errors.owner_contact}
              helperText={errors.owner_contact || 'Phone number (optional)'}
              variant="outlined"
            />
          </Grid>

          {/* ============================================ */}
          {/* ANIMAL INFORMATION SECTION */}
          {/* ============================================ */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mt: 2 }}>
              🐮 Animal Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={!!errors.target_category}>
              <InputLabel>Animal Species *</InputLabel>
              <Select
                value={formData.target_category}
                label="Animal Species *"
                onChange={(e) => handleInputChange('target_category', e.target.value)}
              >
                {LIVESTOCK_SPECIES.map((species) => (
                  <MenuItem key={species} value={species}>
                    {species}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.target_category || 'Type of livestock animal'}
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Autocomplete
              fullWidth
              options={availableBreeds}
              value={formData.target_breed}
              onChange={(event, newValue) => handleInputChange('target_breed', newValue || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Animal Breed *"
                  error={!!errors.target_breed}
                  helperText={errors.target_breed || 'Breed or type of animal'}
                />
              )}
              disabled={!formData.target_category}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sex/Classification</InputLabel>
              <Select
                value={formData.sex}
                label="Sex/Classification"
                onChange={(e) => handleInputChange('sex', e.target.value)}
              >
                {availableSexOptions.map((sex) => (
                  <MenuItem key={sex} value={sex}>
                    {sex}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Sex or classification of animals
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* ============================================ */}
          {/* SERVICE DETAILS SECTION */}
          {/* ============================================ */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mt: 2 }}>
              💉 Service Details
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              fullWidth
              options={COMMON_SERVICE_ITEMS}
              value={formData.service_item}
              onChange={(event, newValue) => handleInputChange('service_item', newValue || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Specific Service Item"
                  helperText="Optional: Specific medicine/service details"
                />
              )}
              freeSolo
            />
          </Grid>

          {/* ============================================ */}
          {/* QUANTITY AND DETAILS SECTION */}
          {/* ============================================ */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mt: 2 }}>
              📊 Quantity & Details
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Number of Animals *"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              error={!!errors.quantity}
              helperText={errors.quantity || 'Total count of animals'}
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Unit</InputLabel>
              <Select
                value={formData.unit}
                label="Unit"
                onChange={(e) => handleInputChange('unit', e.target.value)}
              >
                {availableUnits.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Unit of measurement
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Age (months)"
              value={formData.age_months}
              onChange={(e) => handleInputChange('age_months', e.target.value)}
              error={!!errors.age_months}
              helperText={errors.age_months || 'Average age in months (optional)'}
              inputProps={{ min: 0, max: 300 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Notes"
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              helperText="Any additional information about the animals or service"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{ ml: 2 }}
        >
          {isLoading ? 'Adding...' : 'Add Participant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddWalkInParticipantModal;