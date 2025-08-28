import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  LinearProgress,
  Alert,
  Fade,
  Paper,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Agriculture as AgricultureIcon,
  Landscape as LandscapeIcon,
  Assessment as AssessmentIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import the custom hook
import { useRSBSAForm } from './useRSBSAForm';

// Import form sections
import BeneficiaryProfileSection from './sections/BeneficiaryProfileSection';
import FarmProfileSection from './sections/FarmProfileSection';
import FarmParcelsSection from './sections/FarmParcelsSection';
import ReviewSection from './sections/ReviewSection';
import SubmissionSection from './sections/SubmissionSection';

// Styled components for modern design
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)'
  }
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  padding: theme.spacing(3, 0),
  '& .MuiStepLabel-root': {
    '& .MuiStepLabel-iconContainer': {
      '& .MuiSvgIcon-root': {
        fontSize: '1.8rem',
        color: theme.palette.primary.main,
        '&.Mui-active': {
          color: theme.palette.primary.main,
        },
        '&.Mui-completed': {
          color: theme.palette.success.main,
        }
      }
    }
  }
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(2),
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${theme.palette.divider}`
}));

const ActionButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`
}));

const RSBSAForm = () => {
  // Get user ID from context or props (this should be provided by your auth system)
  const userId = 1; // Replace with actual user ID from authentication context
  
  const {
    formData,
    errors,
    backendErrors,
    isSubmitting,
    isSavingDraft,
    currentStep,
    totalSteps,
    submissionResult,
    updateField,
    addFarmParcel,
    updateFarmParcel,
    removeFarmParcel,
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    saveDraft,
    resetForm,
    loadExistingEnrollment,
    formProgress,
    canSubmit,
    hasBackendErrors
  } = useRSBSAForm();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle form submission with proper backend integration
  const handleSubmit = async () => {
    try {
      const result = await submitForm(userId);
      if (result.success) {
        setShowSuccess(true);
        setShowError(false);
      } else {
        setShowError(true);
        setErrorMessage(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      setShowError(true);
      setErrorMessage('An unexpected error occurred');
    }
  };

  // Handle draft saving
  const handleSaveDraft = async () => {
    try {
      const result = await saveDraft(userId);
      if (result.success) {
        // Show temporary success message for draft saving
        console.log('✅ Draft saved successfully');
      } else {
        console.error('❌ Failed to save draft:', result.error);
      }
    } catch (error) {
      console.error('❌ Draft save error:', error);
    }
  };

  // Updated step configuration (removed livelihood details step)
  const steps = [
    {
      label: 'Personal Information',
      icon: <PersonIcon />,
      description: 'Basic beneficiary details'
    },
    {
      label: 'Farm Profile',
      icon: <AgricultureIcon />,
      description: 'Farm and livelihood information'
    },
    {
      label: 'Farm Parcels',
      icon: <LandscapeIcon />,
      description: 'Land ownership details'
    },
    {
      label: 'Review',
      icon: <AssessmentIcon />,
      description: 'Review all information'
    },
    {
      label: 'Submit',
      icon: <SendIcon />,
      description: 'Submit your application'
    }
  ];

  // Handle form submission
  const handleSubmit = async () => {
    const success = await submitForm();
    if (success) {
      setShowSuccess(true);
      setShowError(false);
    } else {
      setShowError(true);
      setErrorMessage('Failed to submit form. Please try again.');
      setShowSuccess(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to reset the form? All data will be lost.')) {
      resetForm();
      setShowSuccess(false);
      setShowError(false);
    }
  };

  // Save draft
  const handleSaveDraft = () => {
    // Data is automatically saved to localStorage via the hook
    // eslint-disable-next-line no-alert
    alert('Draft saved successfully!');
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BeneficiaryProfileSection
            formData={formData.beneficiaryProfile}
            errors={errors}
            updateField={(field, value) => updateField('beneficiaryProfile', field, value)}
          />
        );
      case 2:
        return (
          <FarmProfileSection
            formData={formData.farmProfile}
            farmerDetails={formData.farmerDetails}
            fisherfolkDetails={formData.fisherfolkDetails}
            farmworkerDetails={formData.farmworkerDetails}
            agriYouthDetails={formData.agriYouthDetails}
            errors={errors}
            updateField={updateField}
          />
        );
      case 3:
        return (
          <FarmParcelsSection
            farmParcels={formData.farmParcels}
            errors={errors}
            addFarmParcel={addFarmParcel}
            updateFarmParcel={updateFarmParcel}
            removeFarmParcel={removeFarmParcel}
          />
        );
      case 4:
        return (
          <ReviewSection
            formData={formData}
            errors={errors}
            onEdit={goToStep}
          />
        );
      case 5:
        return (
          <SubmissionSection
            formData={formData}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            canSubmit={canSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>RSBSA Registration Form - Registry System for Basic Sectors in Agriculture</title>
        <meta 
          name="description" 
          content="Complete your RSBSA registration to access agricultural programs and benefits" 
        />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            RSBSA Registration Form
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Registry System for Basic Sectors in Agriculture
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Complete this form to register as a beneficiary and access agricultural programs, 
            services, and benefits provided by the Department of Agriculture.
          </Typography>
        </Paper>

        {/* Progress Indicator */}
        <ProgressContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              Form Progress
            </Typography>
            <Chip 
              label={`${formProgress}% Complete`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={formProgress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4
              }
            }} 
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Step {currentStep} of {totalSteps}: {steps[currentStep - 1]?.description}
          </Typography>
        </ProgressContainer>

        {/* Success/Error Messages */}
        <Fade in={showSuccess}>
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setShowSuccess(false)}
          >
            <Typography variant="h6" gutterBottom>Form Submitted Successfully!</Typography>
            Your RSBSA application has been submitted and is now being processed. 
            You will receive updates on your application status.
          </Alert>
        </Fade>

        <Fade in={showError}>
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setShowError(false)}
          >
            <Typography variant="h6" gutterBottom>Submission Failed</Typography>
            {errorMessage}
          </Alert>
        </Fade>

        {/* Main Form Card */}
        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            {/* Stepper */}
            <StyledStepper activeStep={currentStep - 1} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel 
                    icon={step.icon}
                    onClick={() => goToStep(index + 1)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </StyledStepper>

            {/* Form Content */}
            <Box sx={{ mt: 4 }}>
              {renderStepContent()}
            </Box>

            {/* Action Buttons */}
            <ActionButtonContainer>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Tooltip title="Save current progress">
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                  >
                    Save Draft
                  </Button>
                </Tooltip>

                <Tooltip title="Reset all form data">
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<RefreshIcon />}
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    Reset Form
                  </Button>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={prevStep}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  Previous
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={nextStep}
                    disabled={isSubmitting}
                    sx={{ minWidth: 120 }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    endIcon={<SendIcon />}
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    sx={{ minWidth: 120 }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </Box>
            </ActionButtonContainer>
          </CardContent>
        </StyledCard>

        {/* Form Information Footer */}
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 4, 
            p: 3, 
            backgroundColor: 'background.default',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" gutterBottom color="primary">
            Important Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Data Privacy:</strong> Your information is protected under the Data Privacy Act of 2012.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Auto-Save:</strong> Your progress is automatically saved as you complete each section.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Support:</strong> Contact your local DA office for assistance with this form.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default RSBSAForm;