import { type Component } from "solid-js";
import { Navigate, Route, Router } from "@solidjs/router";
import { BrandBuilder } from "./components/VoidStranger/BrandBuilder";
import { VoidStrangerGame } from "./components/VoidStranger/Game";



const App: Component = () => {

  return <Router >
    <Route path="/bb" component={BrandBuilder} />
    <Route path="/game" component={VoidStrangerGame} />
    <Route path="*" component={() => <Navigate href="/bb" />} />
  </Router>;
};

export default App;
