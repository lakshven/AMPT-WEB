// tailwind.d.ts
// Ensures TypeScript understands Tailwind's config and theme types

declare module "tailwindcss" {
  export interface Config {
    content: string[];
    theme: {
      extend: Record<string, unknown>;
      [key: string]: unknown;
    };
    plugins: unknown[];
  }
}

declare module "tailwindcss/defaultTheme" {
  const theme: Record<string, unknown>;
  export default theme;
}