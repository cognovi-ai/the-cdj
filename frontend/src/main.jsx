import './index.css'

import { Account, ForgotPassword, Login, Logout, Register, ResetPassword } from './routes/access';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import ErrorPage from './components/utils/ErrorPage'
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
        element: <h1>Home</h1>,
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
    <RouterProvider router={router} />
  </React.StrictMode>,
)
