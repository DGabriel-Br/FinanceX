import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      
      // ============================================
      // ARCHITECTURAL BOUNDARIES - Import Restrictions
      // ============================================
      // Regras para enforçar fronteiras de arquitetura
      // Falha no lint se alguém quebrar as regras
      
      "no-restricted-imports": ["error", {
        "patterns": [
          // ----------------------------------------
          // REGRA 1: shared/ui não pode importar features ou app
          // ----------------------------------------
          {
            "group": ["@/components/finance/*", "@/features/*", "@/pages/*", "@/layouts/*"],
            "message": "shared/ui (components/ui) não pode importar de features ou app. Use apenas core e shared."
          }
        ]
      }]
    },
  },
  
  // ============================================
  // Override para arquivos em src/core
  // core não pode depender de React nem de infraestrutura
  // ============================================
  {
    files: ["src/core/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        "patterns": [
          {
            "group": ["react", "react-dom", "react-router-dom"],
            "message": "core/ não pode importar React. Mantenha lógica de domínio pura."
          },
          {
            "group": ["@tanstack/*"],
            "message": "core/ não pode importar @tanstack/*. Use injeção de dependência."
          },
          {
            "group": ["@supabase/*", "@/integrations/supabase/*"],
            "message": "core/ não pode importar Supabase diretamente. Use interfaces abstratas."
          },
          {
            "group": ["dexie", "dexie-react-hooks"],
            "message": "core/ não pode importar Dexie. Use interfaces abstratas para storage."
          },
          {
            "group": ["@/infra/*"],
            "message": "core/ não pode importar de infra/. Use interfaces abstratas."
          },
          {
            "group": ["@/components/*", "@/features/*", "@/pages/*", "@/layouts/*", "@/contexts/*", "@/hooks/*"],
            "message": "core/ não pode importar de UI/React. Mantenha separação de concerns."
          }
        ]
      }]
    }
  },
  
  // ============================================
  // Override para arquivos em src/components/ui
  // shared/ui não pode importar features ou app
  // ============================================
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        "patterns": [
          {
            "group": ["@/components/finance/*", "@/components/landing/*", "@/components/auth/*", "@/components/onboarding/*"],
            "message": "components/ui/ (shared) não pode importar de features. Apenas de @/lib e outros ui."
          },
          {
            "group": ["@/features/*"],
            "message": "components/ui/ (shared) não pode importar de features/."
          },
          {
            "group": ["@/pages/*", "@/layouts/*"],
            "message": "components/ui/ (shared) não pode importar de pages/layouts (app layer)."
          },
          {
            "group": ["@/contexts/*"],
            "message": "components/ui/ (shared) não pode importar contexts. Passe dados via props."
          },
          {
            "group": ["@/integrations/*", "@/infra/*"],
            "message": "components/ui/ (shared) não pode importar integrations/infra diretamente."
          }
        ]
      }]
    }
  },

  // ============================================
  // Override para arquivos em src/infra
  // infra pode importar de qualquer lugar, mas evita features/app
  // ============================================
  {
    files: ["src/infra/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        "patterns": [
          {
            "group": ["@/features/*", "@/pages/*", "@/layouts/*", "@/components/*"],
            "message": "infra/ não pode importar de features/pages/layouts/components. Mantenha infra agnóstica de UI."
          }
        ]
      }]
    }
  },

  // ============================================
  // Override para arquivos em src/features
  // features não podem importar de outras features ou de app/routes
  // ============================================
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        "patterns": [
          {
            "group": ["@/pages/*", "@/layouts/*"],
            "message": "features/ não podem importar de pages/layouts. Apenas de core, shared, infra e hooks."
          }
        ]
      }]
    }
  }
);
