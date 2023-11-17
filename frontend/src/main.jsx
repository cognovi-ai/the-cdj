import React from 'react'
import ReactDOM from 'react-dom/client'

import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import Root from './routes/root';
import Index from './routes/entries';

import ErrorPage from './components/utils/ErrorPage.jsx'

import './index.css'
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/entries',
        element: <Index />
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
