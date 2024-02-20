import './index.css'

import { Account, ForgotPassword, Login, Logout, Register, ResetPassword, VerifyEmail } from './routes/access';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Dashboard } from './routes/reports';

import ErrorPage from './components/utils/ErrorPage'

import { FlashProvider } from './contexts/FlashProvider.jsx';

import Home from './routes/Home';
import Index from './routes/entries';
import React from 'react'
import ReactDOM from 'react-dom/client'
import ReactGA from 'react-ga4';
import Root from './routes/root';

if (import.meta.env.VITE_NODE_ENV === 'production') {
  ReactGA.initialize(import.meta.env.VITE_GA_TRACKING_ID);
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/entries',
        element: <Index />,
        children: [
          {
            path: ':entryId',
            element: <Index />
          },
          {
            path: ':entryId/analysis',
            element: <Index />
          },
          {
            path: ':entryId/chat',
            element: <Index />
          },
        ],
      },
      {
        path: '/reports',
        element: <Dashboard />,
      },
      {
        path: '/account',
        element: <Account />,
      },
      {
        path: '/logout',
        element: <Logout />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />
      },
      {
        path: '/reset-password',
        element: <ResetPassword />
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/verify-email',
        element: <VerifyEmail />,
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FlashProvider>
      <RouterProvider router={router} />
    </FlashProvider>
  </React.StrictMode>,
)
