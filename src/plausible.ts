import Plausible from "plausible-tracker";

const plausible = Plausible({
  domain: "aleryc.fr",
  apiHost: "https://plausible.aleryc.fr"
});

export { plausible };