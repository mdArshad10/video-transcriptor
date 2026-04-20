import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@workspace/ui/globals.css"
import { App } from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Provider } from 'react-redux'
import { persistor, store } from './store/store'
import { ErrorBoundary } from "react-error-boundary"
import { PersistGate } from "redux-persist/integration/react"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ErrorBoundary fallbackRender={() => <div>Something went wrong</div>}>
            <App />
          </ErrorBoundary>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  </StrictMode>
)
