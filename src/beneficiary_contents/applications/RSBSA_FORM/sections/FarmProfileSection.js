/* eslint-disable no-unused-vars */
/* eslint-disable react/button-has-type */
import React, { useState, useEffect } from 'react';
import {
  Grid,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  Collapse,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip
} from '@mui/material';
import {
  Agriculture as AgricultureIcon,
  Phishing as FishIcon,
  Build as WrenchIcon,
  School as GraduationCapIcon,
  ExpandMore as ChevronDownIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { referenceDataService } from '../../../../api/rsbsaService';

const FarmProfileSection = ({ formData, errors, updateField }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [livelihoodCategories, setLivelihoodCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const [expandedSections, setExpandedSections] = useState({
    crops: true,
    livestock: true
  });

  // Load livelihood categories from backend
  useEffect(() => {
    const loadLivelihoodCategories = async () => {
      setLoadingCategories(true);
      try {
        console.log('🔍 Loading livelihood categories...');
        const result = await referenceDataService.getLivelihoodCategories();
        
        if (result.success) {
          console.log('✅ Livelihood categories loaded:', result.data);
          setLivelihoodCategories(result.data);
        } else {
          console.error('❌ Failed to load livelihood categories:', result.error);
        }
      } catch (error) {
        console.error('❌ Error loading livelihood categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadLivelihoodCategories();
  }, []);

  // Handle field updates using the passed updateField function
  const handleFieldUpdate = (section, field, value) => {
    updateField(section, field, value);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Update the livelihood category when tab changes
    const categoryMap = {
      0: 1, // Farmer
      1: 2, // Fisherfolk
      2: 3, // Farmworker
      3: 4  // Agri Youth
    };
    
    if (categoryMap[newValue]) {
      updateField('farmProfile', 'livelihood_category_id', categoryMap[newValue]);
    }
  };

  // Collapsible wrapper
  const CollapsibleSection = ({ title, icon: Icon, isExpanded, onToggle, children }) => (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        mb: 4,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.08)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
          cursor: 'pointer',
          background: isExpanded
            ? 'linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}
        onClick={onToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box
            sx={{
              p: 1.5,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
            }}
          >
            <Icon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography variant="h5" fontWeight="700" color="primary">
            {title}
          </Typography>
        </Box>
        <IconButton
          sx={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            backgroundColor: 'rgba(25, 118, 210, 0.08)'
          }}
        >
          <ChevronDownIcon sx={{ color: 'primary.main' }} />
        </IconButton>
      </Box>
      <Collapse in={isExpanded}>
        <Divider />
        <CardContent sx={{ p: 4 }}>
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );

  // SwitchField
  const SwitchField = ({ label, description, checked, onChange }) => (
    <Card
      variant="outlined"
      sx={{
        p: 3,
        background: checked
          ? 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)'
          : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        border: checked ? '2px solid #4caf50' : '1px solid rgba(0,0,0,0.12)',
        borderRadius: 2
      }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={onChange}
            color="primary"
          />
        }
        label={
          <Box sx={{ ml: 1 }}>
            <Typography variant="body1" fontWeight="700">
              {label}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
        }
        sx={{ m: 0, width: '100%' }}
      />
    </Card>
  );

  return (
    <Box>
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AgricultureIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
        <Box>
          <Typography variant="h4" component="h2" fontWeight="bold" color="primary">
            Farm Profile & Livelihood
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select your primary livelihood category and provide details about your agricultural activities
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Livelihood Category Selection */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                Livelihood Category
                <Chip label="Required" color="error" size="small" sx={{ ml: 2 }} />
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <FormControl fullWidth error={!!errors['farmProfile.livelihood_category_id']}>
                <InputLabel>Primary Livelihood Category *</InputLabel>
                <Select
                  value={formData.farmProfile?.livelihood_category_id || ''}
                  onChange={(e) => {
                    const categoryId = parseInt(e.target.value);
                    updateField('farmProfile', 'livelihood_category_id', categoryId);
                    // Set active tab based on selection
                    setActiveTab(categoryId - 1);
                  }}
                  label="Primary Livelihood Category *"
                  disabled={loadingCategories}
                >
                  <MenuItem value={1}>Farmer</MenuItem>
                  <MenuItem value={2}>Fisherfolk</MenuItem>
                  <MenuItem value={3}>Farmworker</MenuItem>
                  <MenuItem value={4}>Agri Youth</MenuItem>
                </Select>
                {errors['farmProfile.livelihood_category_id'] && (
                  <FormHelperText>{errors['farmProfile.livelihood_category_id']}</FormHelperText>
                )}
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Details Section */}
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="600">
              Activity Details
            </Typography>
            <Typography variant="body2">
              Select all activities that apply to your livelihood category. You can select multiple options.
            </Typography>
          </Alert>
        </Grid>

        {/* Activity Details Based on Selected Category */}
        {formData.farmProfile?.livelihood_category_id && (
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {activeTab === 0 && 'Farmer Activities'}
                  {activeTab === 1 && 'Fisherfolk Activities'}
                  {activeTab === 2 && 'Farmworker Activities'}
                  {activeTab === 3 && 'Agri Youth Details'}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Farmer Activities */}
                {activeTab === 0 && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                      Crop Production
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <SwitchField
                          label="Rice Production"
                          description="Cultivating rice varieties"
                          checked={formData.farmerActivities?.rice || false}
                          onChange={() =>
                            updateField(
                              'farmerActivities',
                              'rice',
                              !formData.farmerActivities?.rice
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <SwitchField
                          label="Corn Production"
                          description="Growing corn/maize crops"
                          checked={formData.farmerActivities?.corn || false}
                          onChange={() =>
                            updateField(
                              'farmerActivities',
                              'corn',
                              !formData.farmerActivities?.corn
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <SwitchField
                          label="Other Crops"
                          description="Vegetables, fruits, root crops"
                          checked={formData.farmerActivities?.other_crops || false}
                          onChange={() =>
                            updateField(
                              'farmerActivities',
                              'other_crops',
                              !formData.farmerActivities?.other_crops
                            )
                          }
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                        Livestock & Poultry
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <SwitchField
                            label="Livestock Raising"
                            description="Cattle, goats, swine"
                            checked={formData.farmerActivities?.livestock || false}
                            onChange={() =>
                              updateField(
                                'farmerActivities',
                                'livestock',
                                !formData.farmerActivities?.livestock
                              )
                            }
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <SwitchField
                            label="Poultry Raising"
                            description="Chickens, ducks"
                            checked={formData.farmerActivities?.poultry || false}
                            onChange={() =>
                              updateField(
                                'farmerActivities',
                                'poultry',
                                !formData.farmerActivities?.poultry
                              )
                            }
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                )}

                {/* Fisherfolk Activities */}
                {activeTab === 1 && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                      Fishing Activities
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <SwitchField
                          label="Fish Capture"
                          description="Ocean, river, lake fishing"
                          checked={formData.fisherfolkActivities?.fish_capture || false}
                          onChange={() =>
                            updateField(
                              'fisherfolkActivities',
                              'fish_capture',
                              !formData.fisherfolkActivities?.fish_capture
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <SwitchField
                          label="Aquaculture"
                          description="Fish farming"
                          checked={formData.fisherfolkActivities?.aquaculture || false}
                          onChange={() =>
                            updateField(
                              'fisherfolkActivities',
                              'aquaculture',
                              !formData.fisherfolkActivities?.aquaculture
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <SwitchField
                          label="Gleaning"
                          description="Collecting shellfish, seaweed"
                          checked={formData.fisherfolkActivities?.gleaning || false}
                          onChange={() =>
                            updateField(
                              'fisherfolkActivities',
                              'gleaning',
                              !formData.fisherfolkActivities?.gleaning
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <SwitchField
                          label="Fish Processing"
                          description="Drying, smoking, packaging"
                          checked={formData.fisherfolkActivities?.fish_processing || false}
                          onChange={() =>
                            updateField(
                              'fisherfolkActivities',
                              'fish_processing',
                              !formData.fisherfolkActivities?.fish_processing
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <SwitchField
                          label="Fish Vending"
                          description="Selling fish and fish products"
                          checked={formData.fisherfolkActivities?.fish_vending || false}
                          onChange={() =>
                            updateField(
                              'fisherfolkActivities',
                              'fish_vending',
                              !formData.fisherfolkActivities?.fish_vending
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Farmworker Activities */}
                {activeTab === 2 && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                      Farm Work Specialization
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <SwitchField
                          label="Land Preparation"
                          description="Plowing, tilling, soil preparation"
                          checked={formData.farmworkerActivities?.land_preparation || false}
                          onChange={() =>
                            updateField(
                              'farmworkerActivities',
                              'land_preparation',
                              !formData.farmworkerActivities?.land_preparation
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <SwitchField
                          label="Planting"
                          description="Seed/seedling planting"
                          checked={formData.farmworkerActivities?.planting || false}
                          onChange={() =>
                            updateField(
                              'farmworkerActivities',
                              'planting',
                              !formData.farmworkerActivities?.planting
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <SwitchField
                          label="Cultivation"
                          description="Weeding, fertilizing, crop care"
                          checked={formData.farmworkerActivities?.cultivation || false}
                          onChange={() =>
                            updateField(
                              'farmworkerActivities',
                              'cultivation',
                              !formData.farmworkerActivities?.cultivation
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <SwitchField
                          label="Harvesting"
                          description="Crop gathering and processing"
                          checked={formData.farmworkerActivities?.harvesting || false}
                          onChange={() =>
                            updateField(
                              'farmworkerActivities',
                              'harvesting',
                              !formData.farmworkerActivities?.harvesting
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Agri Youth Details */}
                {activeTab === 3 && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                      Youth Agricultural Engagement
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <SwitchField
                          label="I am an Agri-Youth"
                          description="Youth (18-30) involved in agriculture"
                          checked={formData.agriYouthActivities?.is_agri_youth || false}
                          onChange={() =>
                            updateField(
                              'agriYouthActivities',
                              'is_agri_youth',
                              !formData.agriYouthActivities?.is_agri_youth
                            )
                          }
                        />
                      </Grid>
                      
                      {formData.agriYouthActivities?.is_agri_youth && (
                        <>
                          <Grid item xs={12} md={6}>
                            <SwitchField
                              label="Part of Farming Household"
                              description="Member of a farming family"
                              checked={formData.agriYouthActivities?.is_part_of_farming_household || false}
                              onChange={() =>
                                updateField(
                                  'agriYouthActivities',
                                  'is_part_of_farming_household',
                                  !formData.agriYouthActivities?.is_part_of_farming_household
                                )
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <SwitchField
                              label="Formal Agricultural Course"
                              description="Enrolled in formal agricultural education"
                              checked={formData.agriYouthActivities?.is_formal_agri_course || false}
                              onChange={() =>
                                updateField(
                                  'agriYouthActivities',
                                  'is_formal_agri_course',
                                  !formData.agriYouthActivities?.is_formal_agri_course
                                )
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <SwitchField
                              label="Non-formal Agricultural Course"
                              description="Training, workshops, seminars"
                              checked={formData.agriYouthActivities?.is_nonformal_agri_course || false}
                              onChange={() =>
                                updateField(
                                  'agriYouthActivities',
                                  'is_nonformal_agri_course',
                                  !formData.agriYouthActivities?.is_nonformal_agri_course
                                )
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <SwitchField
                              label="Agricultural Program Participant"
                              description="Government or NGO programs"
                              checked={formData.agriYouthActivities?.is_agri_program_participant || false}
                              onChange={() =>
                                updateField(
                                  'agriYouthActivities',
                                  'is_agri_program_participant',
                                  !formData.agriYouthActivities?.is_agri_program_participant
                                )
                              }
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>

                    {formData.agriYouthActivities?.is_agri_youth && (
                      <Alert severity="success" sx={{ mt: 3 }}>
                        <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                        Welcome, Agri-Youth! 🌱 You're the future of agriculture.
                      </Alert>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default FarmProfileSection;
