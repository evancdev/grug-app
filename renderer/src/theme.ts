type ClassList = { toggle(token: string, force: boolean): unknown };
type SystemSetting = {
  matches: boolean;
  addEventListener(type: "change", listener: () => void): void;
};

export function followSystemTheme(root: { classList: ClassList }, dark: SystemSetting) {
  const apply = () => root.classList.toggle("dark", dark.matches);
  apply();
  dark.addEventListener("change", apply);
}
