import { type Component } from "solid-js";
import { Navigate, Route, Router } from "@solidjs/router";
import { BrandBuilder } from "./components/VoidStranger/BrandBuilder";



const App: Component = () => {

  return <Router >
    <Route path="/" component={BrandBuilder} />
    <Route path="*" component={() => <Navigate href="/" />} />
  </Router>;
};

export default App;
