# FinanceX Security Guidelines

Este documento define as regras de segurança do projeto e um checklist para validação de regressões.

---

## 📋 Relatório de Auditoria

### Achados Corrigidos

#### P0 - Crítico

| Achado | Arquivo | Risco | Correção |
|--------|---------|-------|----------|
| Dados offline persistiam após logout | `src/contexts/AuthContext.tsx` | Vazamento de dados entre usuários no mesmo device | `signOut()` agora chama `db.clearUserData(userId)` |
| UPDATE/DELETE sem filtro user_id | `src/lib/offline/syncService.ts`, hooks offline | Potencial modificação de dados de outro usuário se RLS falhar | Adicionado `.eq('user_id', userId)` em todas as queries |

#### P1 - Alto

| Achado | Arquivo | Risco | Correção |
|--------|---------|-------|----------|
| Sem CSP configurado | `index.html` | XSS mais difícil de mitigar | Adicionado meta tag CSP com política restritiva |

#### P2 - Médio (Já Adequados)

| Achado | Status | Observação |
|--------|--------|------------|
| localStorage com dados sensíveis | ✅ OK | `secureStorage.ts` tem blacklist para password/token/secret |
| Service role key no client | ✅ OK | `.env` só tem anon key (pública) |
| dangerouslySetInnerHTML | ✅ OK | Apenas em `chart.tsx` (CSS interno do recharts, não user input) |
| RLS em tabelas de usuário | ✅ OK | Todas as tabelas têm RLS com `auth.uid() = user_id` |
| RPCs SECURITY DEFINER | ✅ OK | Todas validam `is_admin()` internamente |

### Recomendações Futuras

1. **Habilitar Leaked Password Protection** no Supabase Dashboard
2. **Considerar política de audit_log** mais restritiva (somente admins)
3. **Adicionar policy de INSERT em profiles** para controle mais fino

---

## 🔒 Regras de Segurança do Código

### 1. Isolamento de Dados por Usuário

```typescript
// ✅ CORRETO - Sempre incluir user_id em UPDATE/DELETE
await supabase
  .from('transactions')
  .delete()
  .eq('id', id)
  .eq('user_id', userId);

// ❌ ERRADO - Nunca fazer UPDATE/DELETE apenas por ID
await supabase
  .from('transactions')
  .delete()
  .eq('id', id);
```

### 2. Limpeza de Dados no Logout

```typescript
// ✅ CORRETO - Limpar IndexedDB no logout
const signOut = async () => {
  const currentUserId = user?.id;
  await clearAllSecureItems();
  if (currentUserId) {
    await db.clearUserData(currentUserId);
  }
  await supabase.auth.signOut();
};
```

### 3. Nunca Armazenar Dados Sensíveis

```typescript
// ✅ PERMITIDO
localStorage.setItem('theme', 'dark');
localStorage.setItem('financex_saved_email', email);

// ❌ PROIBIDO
localStorage.setItem('password', password);
localStorage.setItem('token', authToken);
localStorage.setItem('secret', apiSecret);
```

### 4. Validação de Sessão no Sync

```typescript
// ✅ CORRETO - Verificar sessão antes de sync
const { data: { session } } = await supabase.auth.getSession();
if (!session?.user) {
  return { success: false, errors: ['Usuário não autenticado'] };
}
const userId = session.user.id;
```

### 5. XSS Prevention

```typescript
// ✅ CORRETO - Renderizar como texto
<span>{userInput}</span>

// ❌ EVITAR - Só usar se absolutamente necessário e com sanitização
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

### 6. user_id Sempre do Servidor

```typescript
// ✅ CORRETO - user_id vem do auth context
await supabase.from('transactions').insert({
  ...data,
  user_id: userId, // Do useAuthContext()
});

// ❌ ERRADO - Nunca aceitar user_id de input do usuário
await supabase.from('transactions').insert({
  ...data,
  user_id: formData.userId, // NUNCA
});
```

---

## ✅ Checklist de Validação de Segurança

Execute este checklist antes de cada deploy:

### Isolamento de Dados
- [ ] Todas as queries SELECT em tabelas de usuário filtram por `user_id`
- [ ] Todas as queries UPDATE incluem `.eq('user_id', userId)`
- [ ] Todas as queries DELETE incluem `.eq('user_id', userId)`
- [ ] INSERTs setam `user_id` do contexto de auth, nunca de input

### Offline/Logout
- [ ] Logout limpa IndexedDB via `db.clearUserData()`
- [ ] Após logout + login com outro usuário, dados anteriores não aparecem
- [ ] Sync só executa com sessão válida

### Storage
- [ ] Nenhuma senha armazenada em localStorage/IndexedDB
- [ ] Nenhum token armazenado manualmente (Supabase gerencia)
- [ ] Blacklist de `secureStorage.ts` está ativa

### XSS
- [ ] Nenhum `dangerouslySetInnerHTML` com user input
- [ ] CSP está configurado no `index.html`
- [ ] Imports de CSV/Excel são tratados como texto puro

### Secrets
- [ ] `.env` só contém chaves públicas (anon key, URL)
- [ ] Nenhuma service role key no código client
- [ ] Edge functions usam secrets do Supabase Vault

### RLS
- [ ] Todas as tabelas de usuário têm RLS habilitado
- [ ] Policies verificam `auth.uid() = user_id`
- [ ] `user_id` é NOT NULL em todas as tabelas

---

## 🧪 Como Testar

### Teste 1: Isolamento entre Usuários
1. Login com Usuário A
2. Criar transações
3. Logout
4. Login com Usuário B
5. **Verificar**: Nenhuma transação do Usuário A aparece

### Teste 2: Modo Offline
1. Login e criar transações
2. Desligar internet
3. Verificar que dados continuam visíveis
4. Logout (online)
5. Login com outro usuário
6. **Verificar**: Dados do usuário anterior foram limpos

### Teste 3: Defesa em Profundidade
1. Tentar modificar ID de transação no DevTools
2. Enviar requisição UPDATE com ID de outro usuário
3. **Verificar**: RLS bloqueia + client filtra por user_id

---

## 📞 Contato de Segurança

Para reportar vulnerabilidades, entre em contato com a equipe de desenvolvimento.
