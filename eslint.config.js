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
            "group": ["@/components/finance/*", "@/pages/*", "@/layouts/*"],
            "message": "shared/ui (components/ui) não pode importar de features ou app. Use apenas core e shared."
          },
          
          // ----------------------------------------
          // REGRA 2: core não pode importar React/infra
          // Os arquivos em src/core devem ser pure business logic
          // ----------------------------------------
          // Nota: Esta regra é aplicada via override abaixo
          
          // ----------------------------------------
          // REGRA 3: features só podem importar core e shared
          // ----------------------------------------
          // Nota: features podem importar de components/ui, hooks, lib, core
          // Não podem importar de outras features específicas (evita acoplamento)
          
          // ----------------------------------------
          // REGRA 4: routes/pages só compõem, sem lógica de domínio inline
          // ----------------------------------------
          // Nota: Isso é mais uma convenção de code review do que uma regra de lint
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
            "group": ["@/components/*", "@/pages/*", "@/layouts/*", "@/contexts/*", "@/hooks/*"],
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
            "group": ["@/pages/*", "@/layouts/*"],
            "message": "components/ui/ (shared) não pode importar de pages/layouts (app layer)."
          },
          {
            "group": ["@/contexts/*"],
            "message": "components/ui/ (shared) não pode importar contexts. Passe dados via props."
          },
          {
            "group": ["@/integrations/*"],
            "message": "components/ui/ (shared) não pode importar integrations diretamente."
          }
        ]
      }]
    }
  }
);
