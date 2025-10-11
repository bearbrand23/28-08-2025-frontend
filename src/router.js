import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';

import AdminSidebarLayout from 'src/layouts/AdminSidebarLayout';
import CoordinatorSidebarLayout from 'src/layouts/CoordinatorSidebarLayout';
import BeneficiarySidebarLayout from 'src/layouts/BeneficiarySidebarLayout'; // ✅ New layout for beneficiaries

import BaseLayout from 'src/layouts/BaseLayout';

import SuspenseLoader from 'src/components/SuspenseLoader';
import ProtectedRoute from 'src/hooks-auth/components/ProtectedRoute';

const Loader = (Component) => (props) => (
  <Suspense fallback={<SuspenseLoader />}>
    <Component {...props} />
  </Suspense>
);

// 🔑 Auth Components
const AdminLogin = Loader(lazy(() => import('src/auth/authAdmin/Login')));
const CoordinatorLogin = Loader(lazy(() => import('src/auth/authCoordinator/Login')));
const BeneficiaryLogin = Loader(lazy(() => import('src/auth/authBeneficiary/Login'))); // ✅

const CoordinatorRegister = Loader(lazy(() => import('src/auth/authCoordinator/Register')));
const BeneficiaryRegister = Loader(lazy(() => import('src/auth/authBeneficiary/Register'))); // ✅

// 📊 Dashboard Components
const Admin = Loader(lazy(() => import('src/content/dashboards/Admin')));
const Coordinator = Loader(lazy(() => import('src/coordinator_contents/dashboards/Coordinator')));
const BeneficiaryDashboard = Loader(lazy(() => import('src/beneficiary_contents/dashboards/Beneficiary'))); // ✅

// 📩 Shared Modules
const Messenger = Loader(lazy(() => import('src/content/applications/Messenger')));
const BeneficiaryMessenger = Loader(lazy(() => import('src/beneficiary_contents/applications/Messenger')));
const CoordinatorMessenger = Loader(lazy(() => import('src/coordinator_contents/applications/Messenger')));
const Transactions = Loader(lazy(() => import('src/content/applications/Transactions')));
const Sector = Loader(lazy(() => import('src/content/applications/Sector')));
const CoordinatorSettings = Loader(lazy(() => import('src/content/applications/Coordinator')));

// 👤 Admin/Coordinator Profile Components
const AdminUserProfile = Loader(lazy(() => import('src/content/applications/Users/profile')));
const AdminUserSettings = Loader(lazy(() => import('src/content/applications/Users/settings')));

// 🌾 Beneficiary Profile Components
const BeneficiaryUserProfile = Loader(lazy(() => import('src/beneficiary_contents/applications/Users/profile')));
const BeneficiaryUserSettings = Loader(lazy(() => import('src/beneficiary_contents/applications/Users/settings')));

// 🌾 RSBSA Modules - Registry System for Basic Sectors in Agriculture
const RSBSAForm = Loader(lazy(() => import('src/beneficiary_contents/applications/RSBSA_FORM'))); // Main RSBSA form component


// 🎨 UI Components
const Buttons = Loader(lazy(() => import('src/content/pages/Components/Buttons')));
const Modals = Loader(lazy(() => import('src/content/pages/Components/Modals')));
const Accordions = Loader(lazy(() => import('src/content/pages/Components/Accordions')));
const Tabs = Loader(lazy(() => import('src/content/pages/Components/Tabs')));
const Badges = Loader(lazy(() => import('src/content/pages/Components/Badges')));
const Tooltips = Loader(lazy(() => import('src/content/pages/Components/Tooltips')));
const Avatars = Loader(lazy(() => import('src/content/pages/Components/Avatars')));
const Cards = Loader(lazy(() => import('src/content/pages/Components/Cards')));
const Forms = Loader(lazy(() => import('src/content/pages/Components/Forms')));

// ⚠️ Status Pages & HomePage
const HomePage = Loader(lazy(() => import('src/pages/Status/HomePage')));
const Status404 = Loader(lazy(() => import('src/pages/Status/Status404')));
const Status500 = Loader(lazy(() => import('src/pages/Status/Status500')));
const StatusComingSoon = Loader(lazy(() => import('src/pages/Status/ComingSoon')));
const StatusMaintenance = Loader(lazy(() => import('src/pages/Status/Maintenance')));

const routes = [
  {
    path: '',
    element: <BaseLayout />,
    children: [
      { path: '', element: <HomePage /> }, 
      { path: 'admin-login', element: <AdminLogin /> },
      { path: 'coordinator-login', element: <CoordinatorLogin /> },
      { path: 'beneficiary-login', element: <BeneficiaryLogin /> }, // ✅
      { path: 'register', element: <CoordinatorRegister /> },
      { path: 'beneficiary-register', element: <BeneficiaryRegister /> }, // ✅
      {
        path: 'status',
        children: [
          { path: '', element: <Navigate to="404" replace /> },
          { path: '404', element: <Status404 /> },
          { path: '500', element: <Status500 /> },
          { path: 'maintenance', element: <StatusMaintenance /> },
          { path: 'coming-soon', element: <StatusComingSoon /> }
        ]
      },
      { path: '*', element: <Status404 /> }
    ]
  },

  // 🔴 Admin Routes
  {
    path: 'dashboards',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminSidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="Admin" replace /> },
      { path: 'Admin', element: <Admin /> },
      { path: 'messenger', element: <Messenger /> }
    ]
  },
  {
    path: 'management',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminSidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="transactions" replace /> },
      { path: 'Sector', element: <Sector /> },
      { path: 'Coordinator', element: <CoordinatorSettings /> },
      { path: 'transactions', element: <Transactions /> },
      {
        path: 'profile',
        children: [
          { path: '', element: <Navigate to="details" replace /> },
          { path: 'details', element: <AdminUserProfile /> },
          { path: 'settings', element: <AdminUserSettings /> }
        ]
      }
    ]
  },

  // 🟣 Coordinator Routes
  {
    path: 'coordinator',
    element: (
      <ProtectedRoute allowedRoles={['coordinator']}>
        <CoordinatorSidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Coordinator /> },
      { path: 'messenger', element: <CoordinatorMessenger /> },
      { path: 'transactions', element: <Transactions /> },
      {
        path: 'profile',
        children: [
          { path: '', element: <Navigate to="details" replace /> },
          { path: 'details', element: <AdminUserProfile /> },
          { path: 'settings', element: <AdminUserSettings /> }
        ]
      },
      { path: '*', element: <Status404 /> }
    ]
  },

  // 🟢 Beneficiary Routes ✅
  {
    path: 'beneficiary',
    element: (
      <ProtectedRoute allowedRoles={['beneficiary']}>
        <BeneficiarySidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <BeneficiaryDashboard /> },
      { path: 'transactions', element: <Transactions /> },
      { 
        path: 'profile',
        children: [
          { path: '', element: <Navigate to="details" replace /> },
          { path: 'details', element: <BeneficiaryUserProfile /> },
          { path: 'settings', element: <BeneficiaryUserSettings /> }
        ] 
      },
      
      // 🌾 RSBSA Routes Section - Registry System for Basic Sectors in Agriculture
      // This matches your sidebar navigation structure from the menu you showed me
      { 
        path: 'RSBSA_FORM', // 📝 Main RSBSA application form
        element: <RSBSAForm /> // This route matches "/beneficiary/RSBSA_FORM" from your sidebar
      },
      { 
        path: 'messenger', // 💬 Beneficiary messenger
        element: <BeneficiaryMessenger />
      },
      {
        path: 'rsbsa', // 📊 RSBSA management section with nested routes
        children: [
          { 
            path: '', // Default redirect to status when accessing /beneficiary/rsbsa/
            element: <Navigate to="status" replace /> 
          },
        
        ]
      },

      { path: '*', element: <Status404 /> } // Catch-all for unmatched beneficiary routes
    ]
  },

  // ⚙️ Shared Components (Admin/Coordinator/Beneficiary)
  {
    path: 'components',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'coordinator', 'beneficiary']}>
        <AdminSidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="buttons" replace /> },
      { path: 'buttons', element: <Buttons /> },
      { path: 'modals', element: <Modals /> },
      { path: 'accordions', element: <Accordions /> },
      { path: 'tabs', element: <Tabs /> },
      { path: 'badges', element: <Badges /> },
      { path: 'tooltips', element: <Tooltips /> },
      { path: 'avatars', element: <Avatars /> },
      { path: 'cards', element: <Cards /> },
      { path: 'forms', element: <Forms /> }
    ]
  },

  // 🌐 Global Catch-All
  {
    path: '*',
    element: <Status404 />
  }
];

export default routes;