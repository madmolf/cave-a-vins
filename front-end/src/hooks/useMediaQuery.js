import { useEffect, useState } from "react";

/**
 * Renvoie true si la media query correspond. Se met à jour au changement de taille.
 * @param {string} query ex. "(min-width: 834px)"
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
