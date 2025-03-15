import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import GuidePage from "@/pages/GuidePage";
import CategoryPage from "@/pages/CategoryPage";
import SearchResults from "@/pages/SearchResults";

function Router() {
  return (
    <Switch>
      {/* Home Page */}
      <Route path="/" component={Home} />
      
      {/* Guide Page */}
      <Route path="/guides/:slug">
        {params => <GuidePage params={params} />}
      </Route>
      
      {/* Category Page */}
      <Route path="/categories/:slug">
        {params => <CategoryPage params={params} />}
      </Route>
      
      {/* Search Results */}
      <Route path="/search" component={SearchResults} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
