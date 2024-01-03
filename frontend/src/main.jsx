import './index.css'

import { Account, ForgotPassword, Login, Logout, Register, ResetPassword } from './routes/access';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import ErrorPage from './components/utils/ErrorPage'

import { FlashProvider } from './contexts/FlashProvider.jsx';

import Home from './routes/Home';
import Index from './routes/entries';
import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './routes/root';

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
