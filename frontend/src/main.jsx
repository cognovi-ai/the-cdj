import './index.css'

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
        element: <h1>Account</h1>,
      },
      {
        path: '/logout',
        element: <h1>Logged out</h1>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
