# FinanceX Security Guidelines

Este documento contém o relatório de auditoria de segurança, lista de mudanças aplicadas, e checklist de validação.

---

## 📝 1. Lista de Commits e Arquivos Alterados

### Commit 1: P0 - SELECT com filtro user_id no pullFromServer
**Objetivo:** Prevenir vazamento de dados via SELECT sem filtro explícito

| Arquivo | Mudança |
|---------|---------|
| `src/lib/offline/syncService.ts` | `pullFromServer()` agora filtra por `.eq('user_id', userId)` em transactions (linha 379), debts (linha 424), e investment_goals (linha 467) |

### Commit 2: P0 - Fallback nuclear no logout
**Objetivo:** Garantir limpeza de dados mesmo se `clearUserData()` falhar

| Arquivo | Mudança |
|---------|---------|
| `src/contexts/AuthContext.tsx` | `signOut()` agora tenta `db.delete()` como fallback se `db.clearUserData()` falhar |

### Commit 3: P0 - Validação estrita de sessão no sync
**Objetivo:** Impedir sync com sessão inválida ou corrompida

| Arquivo | Mudança |
|---------|---------|
| `src/lib/offline/syncService.ts` | `syncAll()` agora valida session, user, userId e formato UUID antes de qualquer operação |

### Commit 4: P0 - Defense in depth em queries Supabase (syncService)
**Objetivo:** Adicionar filtro `user_id` em todas as operações UPDATE/DELETE como camada extra de segurança

| Arquivo | Mudança |
|---------|---------|
| `src/lib/offline/syncService.ts` | Adicionado `.eq('user_id', userId)` em UPDATE e DELETE de transactions, debts e investment_goals |

### Commit 5: P0 - Defense in depth nos hooks offline
**Objetivo:** Mesmo filtro de user_id nos hooks que fazem CRUD direto

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useOfflineTransactions.ts` | UPDATE e DELETE agora incluem `.eq('user_id', userId)` |
| `src/hooks/useOfflineDebts.ts` | UPDATE e DELETE agora incluem `.eq('user_id', userId)` |
| `src/hooks/useOfflineInvestmentGoals.ts` | UPDATE e DELETE agora incluem `.eq('user_id', userId)` |

### Commit 6: P1 - Content Security Policy
**Objetivo:** Mitigar vetores de XSS com política restritiva

| Arquivo | Mudança |
|---------|---------|
| `index.html` | CSP sem `'unsafe-eval'` (removido para produção) |

---

## 📋 2. Diff Completo dos Pontos Críticos

### 2.1 pullFromServer - SELECT com filtro user_id (CRÍTICO)

```typescript
// ANTES (VULNERÁVEL) - linha 372-375
const { data: serverTransactions } = await supabase
  .from('transactions')
  .select('*')
  .order('created_at', { ascending: false });

// DEPOIS (SEGURO) - linhas 375-380
// SECURITY: Always filter by user_id for defense in depth
const { data: serverTransactions } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', userId)  // ✅ ADICIONADO
  .order('created_at', { ascending: false });

// Mesmo padrão aplicado para debts (linha 424) e investment_goals (linha 467)
```

### 2.2 Validação de Sessão no Sync (CRÍTICO)

```typescript
// ANTES - validação básica
const { data: { session } } = await supabase.auth.getSession();
const user = session?.user;
if (!user) {
  result.errors.push('Usuário não autenticado');
  return result;
}

// DEPOIS - validação estrita (linhas 53-88)
const { data: { session }, error: sessionError } = await supabase.auth.getSession();

// Fail closed: Any session error means no sync
if (sessionError) {
  logger.error('Session validation error during sync:', sessionError);
  result.errors.push('Erro ao validar sessão');
  return result;
}

const user = session?.user;
const userId = user?.id;

// SECURITY: Both session and userId must exist
if (!session || !user || !userId) {
  logger.warn('Sync blocked: Invalid session state');
  result.errors.push('Usuário não autenticado');
  return result;
}

// SECURITY: Validate userId format (UUID v4)
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(userId)) {
  logger.error('Sync blocked: Invalid userId format');
  result.errors.push('ID de usuário inválido');
  return result;
}
```

### 2.3 Fallback Nuclear no Logout (CRÍTICO)

```typescript
// ANTES - continua mesmo se limpeza falhar
const signOut = async () => {
  try {
    await clearAllSecureItems();
    if (currentUserId) {
      await db.clearUserData(currentUserId);
    }
  } catch (error) {
    // Continue with logout even if cleanup fails  ❌ INSEGURO
  }
  await supabase.auth.signOut();
};

// DEPOIS - fallback nuclear (linhas 196-226)
const signOut = async () => {
  const currentUserId = user?.id;
  
  try {
    await clearAllSecureItems();
    if (currentUserId) {
      await db.clearUserData(currentUserId);
    }
  } catch (error) {
    logger.error('Error clearing user data (primary method):', error);
    
    // SECURITY FALLBACK: Nuclear option - delete entire database
    try {
      logger.warn('Attempting nuclear database cleanup as fallback');
      await db.delete();  // ✅ FALLBACK NUCLEAR
      logger.info('Nuclear database cleanup successful');
    } catch (nuclearError) {
      logger.error('Nuclear database cleanup also failed:', nuclearError);
    }
  }
  
  await supabase.auth.signOut();
};
```

### 2.4 Content Security Policy (P1)

```html
<!-- ANTES -->
<meta http-equiv="Content-Security-Policy" content="
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  ...
">

<!-- DEPOIS - 'unsafe-eval' REMOVIDO -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
">
```

---

## 📊 3. Relatório P0, P1, P2

### P0: Isolamento de Dados por Usuário (CRÍTICO)

| Achado | Status | Arquivo | Risco | Correção |
|--------|--------|---------|-------|----------|
| SELECT em pullFromServer sem user_id | ✅ Corrigido | `syncService.ts` | **CRÍTICO**: Poderia retornar dados de outros usuários | `.eq('user_id', userId)` em todas as queries |
| Logout não tinha fallback | ✅ Corrigido | `AuthContext.tsx` | ALTO: Se limpeza falhasse, dados vazariam | Fallback nuclear com `db.delete()` |
| Validação de sessão incompleta | ✅ Corrigido | `syncService.ts` | MÉDIO: Sync poderia rodar com sessão corrompida | Validação de session, user, userId e formato UUID |
| UPDATE/DELETE sem user_id | ✅ Corrigido | Todos hooks | ALTO: Bypass se RLS falhasse | `.eq('user_id', userId)` em todas operações |

### P1: RPC e XSS

| Achado | Status | Arquivo | Risco |
|--------|--------|---------|-------|
| RPCs admin | ✅ OK | Verificado | Todas validam `is_admin()` internamente |
| `dangerouslySetInnerHTML` | ✅ OK | `chart.tsx` | Apenas CSS interno do recharts |
| Import Excel/CSV | ✅ OK | `ExcelImportExport.tsx` | Tratado como texto puro |
| CSP | ✅ Hardened | `index.html` | `'unsafe-eval'` removido |

### P2: Segredos e Dependências

| Item | Status | Observação |
|------|--------|------------|
| Service role key no client | ✅ OK | `.env` só tem anon key |
| Secrets commitados | ✅ OK | `.env` está no `.gitignore` |
| Variáveis sensíveis expostas | ✅ OK | Apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` |

---

## ✅ 4. Checklist de Teste Manual

### Teste 1: Isolamento entre Usuários Offline (P0)

```
1. ☐ Login com Usuário A
2. ☐ Criar transações, dívidas e metas
3. ☐ Desligar internet
4. ☐ Fazer logout
5. ☐ Login com Usuário B (ainda offline)
6. ☐ VERIFICAR: Nenhum dado do Usuário A aparece
7. ☐ Ligar internet
8. ☐ VERIFICAR: Sync funciona e dados do B aparecem
```

### Teste 2: Fallback Nuclear no Logout (P0)

```
1. ☐ Login com Usuário A
2. ☐ Criar dados
3. ☐ Abrir DevTools > Application > IndexedDB > FinanceOfflineDB
4. ☐ Fazer logout
5. ☐ VERIFICAR: Banco foi limpo (tabelas vazias ou banco deletado)
6. ☐ Login com Usuário B
7. ☐ VERIFICAR: Zero dados do Usuário A
```

### Teste 3: Sync sem Sessão Válida (P0)

```
1. ☐ Login e criar dados offline
2. ☐ Abrir DevTools > Application > Storage
3. ☐ Limpar todos os dados de sessão do Supabase
4. ☐ Tentar forçar sync (desligar/ligar internet ou F5)
5. ☐ VERIFICAR: Sync falha com "Usuário não autenticado"
6. ☐ VERIFICAR: Nenhuma requisição de dados é feita
```

### Teste 4: SELECT Scoping (P0)

```
1. ☐ Login com Usuário A
2. ☐ Abrir DevTools > Network
3. ☐ Fazer sync ou refresh
4. ☐ Filtrar por "rest/v1" no Network
5. ☐ VERIFICAR: Todas as requisições GET incluem "user_id=eq.UUID"
6. ☐ VERIFICAR: Nenhum SELECT sem filtro de user_id
```

### Teste 5: CSP Funcionando (P1)

```
1. ☐ Abrir DevTools > Console
2. ☐ Tentar: eval("console.log('test')")
3. ☐ VERIFICAR: CSP bloqueia com "Refused to evaluate..."
4. ☐ VERIFICAR: App funciona normalmente (build de produção)
```

### Teste 6: Storage Seguro (P1)

```
1. ☐ Fazer login com "Lembrar email"
2. ☐ Abrir DevTools > Application > Local Storage
3. ☐ VERIFICAR: financex_saved_email existe
4. ☐ VERIFICAR: Nenhuma chave com "password", "token", "secret"
5. ☐ Fazer logout
6. ☐ VERIFICAR: Keys de login foram limpas
```

---

## 🔒 5. Regras de Segurança do Código

### Regra 1: Sempre filtrar por user_id

```typescript
// ✅ CORRETO
await supabase.from('transactions').select('*').eq('user_id', userId);
await supabase.from('transactions').update({...}).eq('id', id).eq('user_id', userId);
await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);

// ❌ ERRADO - NUNCA fazer SELECT/UPDATE/DELETE sem user_id
await supabase.from('transactions').select('*');
await supabase.from('transactions').delete().eq('id', id);
```

### Regra 2: Validar sessão antes de operações críticas

```typescript
// ✅ CORRETO
const { data: { session }, error } = await supabase.auth.getSession();
if (error || !session?.user?.id) {
  return { success: false, error: 'Não autenticado' };
}
```

### Regra 3: Fallback nuclear no logout

```typescript
// ✅ CORRETO
try {
  await db.clearUserData(userId);
} catch {
  await db.delete(); // Fallback nuclear
}
```

### Regra 4: user_id sempre do contexto

```typescript
// ✅ CORRETO - user_id do useAuthContext()
const { user } = useAuthContext();
await supabase.from('transactions').insert({ ...data, user_id: user.id });

// ❌ ERRADO - NUNCA aceitar user_id de input
await supabase.from('transactions').insert({ ...data, user_id: formData.userId });
```

### Regra 5: Nunca armazenar dados sensíveis

```typescript
// ✅ PERMITIDO
localStorage.setItem('theme', 'dark');
localStorage.setItem('financex_saved_email', email);

// ❌ PROIBIDO
localStorage.setItem('password', password);
localStorage.setItem('token', authToken);
```

---

## 📋 6. Checklist Pre-Deploy

### Isolamento de Dados
- [x] Todas as queries SELECT filtram por `user_id`
- [x] Todas as queries UPDATE incluem `.eq('user_id', userId)`
- [x] Todas as queries DELETE incluem `.eq('user_id', userId)`
- [x] INSERTs setam `user_id` do contexto de auth

### Offline/Logout
- [x] Logout limpa IndexedDB via `db.clearUserData()`
- [x] Fallback nuclear com `db.delete()` se limpeza falhar
- [x] Sync valida sessão, user e userId antes de operar
- [x] Validação de formato UUID no userId

### Storage
- [x] Nenhuma senha armazenada
- [x] Nenhum token armazenado manualmente
- [x] Blacklist de secureStorage.ts ativa

### XSS/CSP
- [x] Nenhum `dangerouslySetInnerHTML` com user input
- [x] CSP configurado sem `'unsafe-eval'`
- [x] Imports de CSV/Excel tratados como texto

### Secrets
- [x] `.env` só contém chaves públicas
- [x] Nenhuma service role key no código

### RLS
- [x] Todas as tabelas têm RLS habilitado
- [x] Policies verificam `auth.uid() = user_id`
- [x] RPCs admin validam `is_admin()`

---

## 📱 8. Checklist de Responsividade

### Mudanças Aplicadas

| Arquivo | Mudança |
|---------|---------|
| `src/index.css` | Adicionadas classes utilitárias: `pb-mobile-nav`, `page-container`, `no-overflow-x` |
| `src/layouts/AppShell.tsx` | `main` usa `pb-mobile-nav` e `overflow-x-hidden` para prevenir overflow |
| `src/components/finance/MobileNav.tsx` | Safe-area-bottom separado, touch-target para melhor toque |
| `src/components/finance/Dashboard.tsx` | Removido resize listener, usando `useIsMobile` hook com media query |
| `src/components/finance/Transactions.tsx` | Usando `page-container` |
| `src/components/finance/Debts.tsx` | Usando `page-container` |
| `src/components/finance/Investments.tsx` | Usando `page-container` |

### Checklist de Validação Manual

#### Teste 1: Responsividade em 320px (dispositivo pequeno)
1. Abrir DevTools → toggle device toolbar
2. Selecionar 320px de largura
3. Navegar por Dashboard, Lançamentos, Dívidas, Investimentos
4. ✅ **Esperado:** Nenhum overflow horizontal, cards se adaptam, texto trunca corretamente

#### Teste 2: Responsividade em 375px (iPhone padrão)
1. Configurar DevTools para 375px
2. Verificar cabeçalhos e botões
3. ✅ **Esperado:** Layout equilibrado, botões clicáveis, nenhum elemento cortado

#### Teste 3: Responsividade em 768px (tablet)
1. Configurar DevTools para 768px
2. Verificar transição para layout desktop
3. ✅ **Esperado:** Sidebar aparece, grid se reorganiza, conteúdo usa espaço disponível

#### Teste 4: Bottom Nav não sobrepõe conteúdo (mobile)
1. Navegar até Lançamentos ou Dívidas em mobile
2. Rolar até o final da página
3. ✅ **Esperado:** Último item da lista visível acima do bottom nav

#### Teste 5: Safe Area em dispositivo com notch (nativo)
1. Rodar app em iPhone X/11/12/13/14 ou similar
2. Verificar padding inferior do bottom nav
3. ✅ **Esperado:** Espaço respeitado para home indicator

### Critérios de Aceite
- [x] Nenhum overflow horizontal em 320px
- [x] Bottom nav não sobrepõe conteúdo
- [x] Safe areas respeitadas em dispositivos nativos
- [x] Resize listeners removidos do Dashboard (usando media query)
- [x] Container padrão aplicado em todas as páginas de finanças

---

## 🔮 9. Recomendações Futuras

1. **Habilitar Leaked Password Protection** no Supabase Dashboard
2. **Implementar rate limiting** para APIs sensíveis
3. **Adicionar nonces dinâmicos** ao CSP para remover `'unsafe-inline'`
4. **Considerar policy de audit_log** mais restritiva (somente admins)
5. **Adicionar scripts de segurança** ao package.json:
   ```json
   {
     "scripts": {
       "security:grep": "grep -rn 'dangerouslySetInnerHTML\\|service_role\\|from.*select.*(?!.*user_id)' src/",
       "security:audit": "npm audit --audit-level=high"
     }
   }
   ```

---

## 📞 Contato de Segurança

Para reportar vulnerabilidades, entre em contato com a equipe de desenvolvimento.
