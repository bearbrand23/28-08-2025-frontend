import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  FormHelperText,
  Chip
} from '@mui/material';
// Using standard TextField for date input to avoid additional dependencies
import { Person as PersonIcon } from '@mui/icons-material';

const BeneficiaryProfileSection = ({ formData, errors, updateField }) => {
  // Options based on database enum values
  const civilStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' },
    { value: 'divorced', label: 'Divorced' }
  ];

  const educationOptions = [
    { value: 'None', label: 'None' },
    { value: 'Pre-school', label: 'Pre-school' },
    { value: 'Elementary', label: 'Elementary' },
    { value: 'Junior High School', label: 'Junior High School' },
    { value: 'Senior High School', label: 'Senior High School' },
    { value: 'Vocational', label: 'Vocational' },
    { value: 'College', label: 'College' },
    { value: 'Post Graduate', label: 'Post Graduate' }
  ];

  const yesNoOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const barangayOptions = [
    'Bagocboc', 'Barra', 'Bonbon', 'Buruanga', 'Cabadiangan', 'Camaman-an',
    'Gotokan', 'Igpit', 'Limbaybay', 'Lower Olave', 'Lumbia', 'Malitbog',
    'Mapayag', 'Napaliran', 'Opol Poblacion', 'Patag', 'Pontod', 'San Vicente',
    'Tingalan', 'Taboc', 'Talakag', 'Upper Olave'
  ];

  const handleFieldChange = (field, value) => {
    updateField('beneficiaryDetails', field, value);
  };

  return (
    <Box>
        {/* Section Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PersonIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h2" fontWeight="bold" color="primary">
              Personal Information
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please provide your personal details as they appear in your valid IDs
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Basic Information Card */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  Basic Information
                  <Chip label="Required" color="error" size="small" sx={{ ml: 2 }} />
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {/* Name Information */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="First Name *"
                      value={formData.beneficiaryDetails?.first_name || ''}
                      onChange={(e) => handleFieldChange('first_name', e.target.value)}
                      error={!!errors['beneficiaryDetails.first_name']}
                      helperText={errors['beneficiaryDetails.first_name']}
                      placeholder="Enter your first name"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Last Name *"
                      value={formData.beneficiaryDetails?.last_name || ''}
                      onChange={(e) => handleFieldChange('last_name', e.target.value)}
                      error={!!errors['beneficiaryDetails.last_name']}
                      helperText={errors['beneficiaryDetails.last_name']}
                      placeholder="Enter your last name"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Middle Name"
                      value={formData.beneficiaryDetails?.middle_name || ''}
                      onChange={(e) => handleFieldChange('middle_name', e.target.value)}
                      placeholder="Enter your middle name (optional)"
                    />
                  </Grid>

                  {/* Contact Information */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Number *"
                      value={formData.beneficiaryDetails?.contact_number || ''}
                      onChange={(e) => handleFieldChange('contact_number', e.target.value)}
                      error={!!errors['beneficiaryDetails.contact_number']}
                      helperText={errors['beneficiaryDetails.contact_number']}
                      placeholder="e.g., +63 912 345 6789"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.beneficiaryDetails?.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      error={!!errors['beneficiaryDetails.email']}
                      helperText={errors['beneficiaryDetails.email']}
                      placeholder="your.email@example.com"
                    />
                  </Grid>

                  {/* Location Information */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors['beneficiaryDetails.barangay']}>
                      <InputLabel>Barangay *</InputLabel>
                      <Select
                        value={formData.beneficiaryDetails?.barangay || ''}
                        onChange={(e) => handleFieldChange('barangay', e.target.value)}
                        label="Barangay *"
                      >
                        {barangayOptions.map((barangay) => (
                          <MenuItem key={barangay} value={barangay}>
                            {barangay}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors['beneficiaryDetails.barangay'] && (
                        <FormHelperText>{errors['beneficiaryDetails.barangay']}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Municipality *"
                      value={formData.municipality || 'Opol'}
                      onChange={(e) => handleFieldChange('municipality', e.target.value)}
                      error={!!errors['beneficiaryProfile.municipality']}
                      helperText={errors['beneficiaryProfile.municipality']}
                      InputProps={{ readOnly: true }}
                      sx={{ backgroundColor: 'action.hover' }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Province *"
                      value={formData.province || 'Misamis Oriental'}
                      onChange={(e) => handleFieldChange('province', e.target.value)}
                      InputProps={{ readOnly: true }}
                      sx={{ backgroundColor: 'action.hover' }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Region *"
                      value={formData.region || 'Region X (Northern Mindanao)'}
                      onChange={(e) => handleFieldChange('region', e.target.value)}
                      InputProps={{ readOnly: true }}
                      sx={{ backgroundColor: 'action.hover' }}
                    />
                  </Grid>

                  {/* Contact Information */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Number *"
                      value={formData.contact_number || ''}
                      onChange={(e) => handleFieldChange('contact_number', e.target.value)}
                      error={!!errors['beneficiaryProfile.contact_number']}
                      helperText={errors['beneficiaryProfile.contact_number'] || 'Format: 09XXXXXXXXX'}
                      placeholder="09XXXXXXXXX"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Emergency Contact Number"
                      value={formData.emergency_contact_number || ''}
                      onChange={(e) => handleFieldChange('emergency_contact_number', e.target.value)}
                      placeholder="09XXXXXXXXX"
                    />
                  </Grid>

                  {/* Personal Details */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Birth Date *"
                      type="date"
                      value={formData.birth_date ? formData.birth_date.split('T')[0] : ''}
                      onChange={(e) => handleFieldChange('birth_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                      error={!!errors['beneficiaryProfile.birth_date']}
                      helperText={errors['beneficiaryProfile.birth_date']}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Place of Birth"
                      value={formData.place_of_birth || ''}
                      onChange={(e) => handleFieldChange('place_of_birth', e.target.value)}
                      placeholder="City, Province"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors['beneficiaryProfile.civil_status']}>
                      <InputLabel>Civil Status *</InputLabel>
                      <Select
                        value={formData.civil_status || ''}
                        onChange={(e) => handleFieldChange('civil_status', e.target.value)}
                        label="Civil Status *"
                      >
                        {civilStatusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors['beneficiaryProfile.civil_status'] && (
                        <FormHelperText>{errors['beneficiaryProfile.civil_status']}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name of Spouse"
                      value={formData.name_of_spouse || ''}
                      onChange={(e) => handleFieldChange('name_of_spouse', e.target.value)}
                      disabled={formData.civil_status !== 'married'}
                      placeholder={formData.civil_status === 'married' ? 'Enter spouse name' : 'Select married status first'}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Highest Educational Attainment</InputLabel>
                      <Select
                        value={formData.highest_education || ''}
                        onChange={(e) => handleFieldChange('highest_education', e.target.value)}
                        label="Highest Educational Attainment"
                      >
                        {educationOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Religion"
                      value={formData.religion || ''}
                      onChange={(e) => handleFieldChange('religion', e.target.value)}
                      placeholder="e.g., Catholic, Protestant, Islam"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Information Card */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {/* PWD Status */}
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.pwd || false}
                          onChange={(e) => handleFieldChange('pwd', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Person with Disability (PWD)"
                    />
                  </Grid>

                  {/* Government ID */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Has Government ID</InputLabel>
                      <Select
                        value={formData.has_government_id || 'no'}
                        onChange={(e) => handleFieldChange('has_government_id', e.target.value)}
                        label="Has Government ID"
                      >
                        {yesNoOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.has_government_id === 'yes' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Government ID Type"
                          value={formData.gov_id_type || ''}
                          onChange={(e) => handleFieldChange('gov_id_type', e.target.value)}
                          placeholder="e.g., Driver's License, PhilID, Passport"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Government ID Number"
                          value={formData.gov_id_number || ''}
                          onChange={(e) => handleFieldChange('gov_id_number', e.target.value)}
                          placeholder="Enter ID number"
                        />
                      </Grid>
                    </>
                  )}

                  {/* Association Membership */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Member of Association</InputLabel>
                      <Select
                        value={formData.is_association_member || 'no'}
                        onChange={(e) => handleFieldChange('is_association_member', e.target.value)}
                        label="Member of Association"
                      >
                        {yesNoOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.is_association_member === 'yes' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Association Name"
                        value={formData.association_name || ''}
                        onChange={(e) => handleFieldChange('association_name', e.target.value)}
                        placeholder="Enter association name"
                      />
                    </Grid>
                  )}

                  {/* Family Information */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Mother's Maiden Name"
                      value={formData.mothers_maiden_name || ''}
                      onChange={(e) => handleFieldChange('mothers_maiden_name', e.target.value)}
                      placeholder="Enter mother's maiden name"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_household_head || false}
                          onChange={(e) => handleFieldChange('is_household_head', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Head of Household"
                    />
                  </Grid>

                  {!formData.is_household_head && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Household Head Name"
                        value={formData.household_head_name || ''}
                        onChange={(e) => handleFieldChange('household_head_name', e.target.value)}
                        placeholder="Enter household head name"
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
  );
};

export default BeneficiaryProfileSection;