import { expect, test } from "vitest";
import { openSection, sectionIn } from "@/open-section";

const plans = { id: "plans" };
const ports = { id: "ports" };
const sections = [plans, ports] as const;

function fakeWindow(href: string) {
  const entries = [href];
  let at = 0;
  const popstate = new Set<() => void>();
  return {
    location: {
      get href() {
        return entries[at]!;
      },
    },
    history: {
      pushState(_data: null, _unused: string, url: string) {
        entries.splice(at + 1, Infinity, url);
        at++;
      },
    },
    addEventListener: (_type: "popstate", listener: () => void) => popstate.add(listener),
    entries,
    back() {
      if (at === 0) return;
      at--;
      for (const listener of popstate) listener();
    },
  };
}

test("a URL opens the section its query names", () => {
  expect(sectionIn(sections, "grug://app/?section=ports")).toBe(ports);
  expect(sectionIn(sections, "http://localhost:5317/?section=ports")).toBe(ports);
  expect(sectionIn(sections, "grug://app/?calls=hang&section=ports#top")).toBe(ports);
});

test("a URL with no section, an empty one or an unknown one opens the first", () => {
  expect(sectionIn(sections, "grug://app/")).toBe(plans);
  expect(sectionIn(sections, "grug://app/?section=")).toBe(plans);
  expect(sectionIn(sections, "grug://app/?section=gone")).toBe(plans);
});

test("the back button returns to the section open before", () => {
  const place = fakeWindow("grug://app/");
  const store = openSection(sections, place);
  store.open(ports);
  expect(store.current()).toBe(ports);
  place.back();
  expect(store.current()).toBe(plans);
});

test("the page redraws when a section is picked and on the back button", () => {
  const place = fakeWindow("grug://app/");
  const store = openSection(sections, place);
  let redraws = 0;
  store.subscribe(() => redraws++);
  store.open(ports);
  expect(redraws).toBe(1);
  place.back();
  expect(redraws).toBe(2);
});

test("picking a section keeps the rest of the query", () => {
  const place = fakeWindow("grug://app/?calls=hang");
  openSection(sections, place).open(ports);
  expect(place.location.href).toBe("grug://app/?calls=hang&section=ports");
});

test("picking the section already open adds no history entry", () => {
  const place = fakeWindow("grug://app/");
  openSection(sections, place).open(plans);
  expect(place.entries).toEqual(["grug://app/"]);
});
