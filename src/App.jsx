import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <DataProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </DataProvider>
  );
}
