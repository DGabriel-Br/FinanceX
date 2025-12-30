import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
import { Check, X, ArrowRight, Lock, Wifi } from 'lucide-react';

export default function Landing() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'FinanceX - Controle financeiro pessoal';
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header - funcional, sem efeitos */}
      <header className="border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5">
            <FinanceLogo size={20} />
            <span className="text-sm font-semibold tracking-wide" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              inanceX
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs h-8" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button size="sm" className="text-xs h-8" onClick={() => navigate('/cadastro')}>
              Criar conta
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Hero - compacto, alinhado à esquerda */}
        <section className="py-8 border-b border-border">
          <div className="max-w-xl">
            <h1 className="text-2xl font-semibold leading-snug mb-3">
              Se você não sabe pra onde seu dinheiro vai, esse app é pra você.
            </h1>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Você anota o que gasta. O app te mostra se você pode gastar mais ou se precisa parar.
            </p>
            <Button size="sm" className="h-9" onClick={() => navigate('/cadastro')}>
              Começar a usar
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </section>

        {/* Duas colunas: Problema + Solução */}
        <section className="py-8 border-b border-border">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Problema */}
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
                O problema
              </h2>
              <div className="space-y-3 text-sm">
                <p>Fim do mês chega e você não entende onde o dinheiro foi.</p>
                <p>Você já tentou planilha. Funcionou uma semana.</p>
                <p>Apps de banco mostram extrato, não clareza.</p>
                <p>Apps de finanças são complexos demais.</p>
              </div>
            </div>
            
            {/* Solução */}
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Como funciona aqui
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-muted-foreground font-mono text-xs mt-0.5">1.</span>
                  <div>
                    <span className="font-medium">Você lança.</span>
                    <span className="text-muted-foreground"> Gastou? Abre, digita, pronto.</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-muted-foreground font-mono text-xs mt-0.5">2.</span>
                  <div>
                    <span className="font-medium">O app organiza.</span>
                    <span className="text-muted-foreground"> Por categoria, automático.</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-muted-foreground font-mono text-xs mt-0.5">3.</span>
                  <div>
                    <span className="font-medium">Você vê.</span>
                    <span className="text-muted-foreground"> Quanto entrou, saiu, sobrou.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preview do app - bloco representativo */}
        <section className="py-8 border-b border-border">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
            O que você vê no app
          </h2>
          
          <div className="border border-border rounded-md overflow-hidden bg-card">
            {/* Header fake do app */}
            <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-muted/30">
              <span className="text-sm font-medium">Resumo de dezembro</span>
              <span className="text-xs text-muted-foreground">atualizado agora</span>
            </div>
            
            {/* Conteúdo fake */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Receitas</p>
                  <p className="text-lg font-semibold text-income">R$ 4.200,00</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Despesas</p>
                  <p className="text-lg font-semibold text-expense">R$ 3.150,00</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Saldo</p>
                  <p className="text-lg font-semibold">R$ 1.050,00</p>
                </div>
              </div>
              
              {/* Lista fake de transações */}
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">Últimos lançamentos</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <div>
                      <span className="font-medium">Mercado</span>
                      <span className="text-muted-foreground ml-2 text-xs">Alimentação</span>
                    </div>
                    <span className="text-expense font-medium">-R$ 245,00</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <div>
                      <span className="font-medium">Salário</span>
                      <span className="text-muted-foreground ml-2 text-xs">Renda</span>
                    </div>
                    <span className="text-income font-medium">+R$ 4.200,00</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <div>
                      <span className="font-medium">Internet</span>
                      <span className="text-muted-foreground ml-2 text-xs">Contas</span>
                    </div>
                    <span className="text-expense font-medium">-R$ 99,90</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Para quem é / não é - tabela simples */}
        <section className="py-8 border-b border-border">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                É pra você se
              </h2>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-muted-foreground">—</span>
                  <span>Você não sabe pra onde o dinheiro vai</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground">—</span>
                  <span>Você quer algo simples no celular</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground">—</span>
                  <span>Você desistiu de planilha</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground">—</span>
                  <span>Você quer clareza, não controle obsessivo</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" />
                Não é pra você se
              </h2>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-muted-foreground">—</span>
                  <span>Você quer conectar conta bancária</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground">—</span>
                  <span>Você precisa de relatórios de empresa</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground">—</span>
                  <span>Você quer tudo grátis</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground">—</span>
                  <span>Você já tem um sistema que funciona</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Preço - direto */}
        <section className="py-8 border-b border-border">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Preço
              </h2>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-semibold">R$ 14,90</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Cancela quando quiser. Sem multa.
              </p>
              <Button size="sm" className="h-9" onClick={() => navigate('/planos')}>
                Assinar
              </Button>
            </div>
            
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
                O que inclui
              </h2>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-muted-foreground" />
                  Lançamentos ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-muted-foreground" />
                  Controle de dívidas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-muted-foreground" />
                  Acompanhamento de investimentos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-muted-foreground" />
                  Funciona offline
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-muted-foreground" />
                  Sincroniza entre dispositivos
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Confiança - inline */}
        <section className="py-8">
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Dados criptografados</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              <span>Funciona offline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">•</span>
              <span>Sem anúncios</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">•</span>
              <span>Não vendemos dados</span>
            </div>
          </div>
        </section>

      </main>

      {/* Footer - mínimo */}
      <footer className="border-t border-border py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} FinanceX</span>
          <div className="flex gap-4">
            <Link to="/termos" className="hover:text-foreground">Termos</Link>
            <Link to="/privacidade" className="hover:text-foreground">Privacidade</Link>
            <a href="mailto:contato@financex.app" className="hover:text-foreground">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
