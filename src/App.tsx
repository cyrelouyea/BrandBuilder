import { type Component } from "solid-js";
import { Route, Router } from "@solidjs/router";
import { BrandBuilder } from "./components/VoidStranger/BrandBuilder";




const App: Component = () => {

  return <Router>
    <Route path="/" component={BrandBuilder} />
  </Router>;
};

export default App;
