import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@workspace/ui/globals.css"
import { App } from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Provider } from 'react-redux'
import { store } from './store/store'
import { ErrorBoundary } from "react-error-boundary"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <ErrorBoundary fallbackRender={() => <div>Something went wrong</div>}>
          <App />
        </ErrorBoundary>
      </Provider>
    </ThemeProvider>
  </StrictMode>
)
