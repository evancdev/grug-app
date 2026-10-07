// In the query, not the path, since the app's protocol answers a path with no
// file with a 404.
const KEY = "section";

type Place = {
  location: { href: string };
  history: { pushState(data: null, unused: string, url: string): void };
  addEventListener(type: "popstate", listener: () => void): void;
};

export function sectionIn<S extends { id: string }>(sections: readonly [S, ...S[]], href: string) {
  const id = new URL(href).searchParams.get(KEY);
  return sections.find((section) => section.id === id) ?? sections[0];
}

export function openSection<S extends { id: string }>(
  sections: readonly [S, ...S[]],
  place: Place,
) {
  const listeners = new Set<() => void>();
  const changed = () => {
    for (const listener of listeners) listener();
  };
  const current = () => sectionIn(sections, place.location.href);
  place.addEventListener("popstate", changed);
  return {
    current,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    open: (section: S) => {
      if (section === current()) return;
      const url = new URL(place.location.href);
      url.searchParams.set(KEY, section.id);
      place.history.pushState(null, "", url.href);
      changed();
    },
  };
}
