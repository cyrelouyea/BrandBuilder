import { type Component } from "solid-js";
import { Navigate,  Route, Router } from "@solidjs/router";
import { BrandBuilder } from "./components/VoidStranger/BrandBuilder";
import { VoidStrangerGame } from "./components/VoidStranger/Game";



const App: Component = () => {

  return <Router >
    <Route path="/brand-builder" component={BrandBuilder} />
    <Route path="/level-editor" component={VoidStrangerGame} />
    <Route path="*" component={() => <Navigate href="/brand-builder" />} />
  </Router>;
};

export default App;
