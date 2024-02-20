import { type Component } from "solid-js";
import { Route, Router } from "@solidjs/router";
import { Alphabet } from "./components/VoidStranger/Alphabet";
import { SentenceBuilder } from "./components/VoidStranger/SentenceBuilder";
import { BrandBuilder } from "./components/VoidStranger/BrandBuilder";




const App: Component = () => {

  return <Router>
    <Route path="/alphabet" component={Alphabet} />
    <Route path="/brand-builder" component={BrandBuilder} />
    <Route path="/sentence-builder" component={SentenceBuilder} />
  </Router>;
};

export default App;
