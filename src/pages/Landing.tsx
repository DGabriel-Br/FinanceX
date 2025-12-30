import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
import { Check, X, ArrowRight, Shield, WifiOff } from 'lucide-react';

export default function Landing() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'FinanceX - Veja pra onde seu dinheiro vai';
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header simples */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1">
            <FinanceLogo size={24} />
            <span className="text-base font-bold tracking-wide" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              inanceX
            </span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        
        {/* Hero - direto, sem hype */}
        <section className="mb-20">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
            Se você não sabe pra onde seu dinheiro vai, esse app é pra você.
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Você anota o que gasta. O app te mostra, de forma clara, se você pode gastar mais ou se precisa parar. Sem complicação.
          </p>
          <Button size="lg" onClick={() => navigate('/cadastro')}>
            Começar a usar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>

        {/* Dor real */}
        <section className="mb-20">
          <h2 className="text-xl font-semibold mb-6">Você já passou por isso?</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Chega no fim do mês e você não entende. Trabalhou, recebeu, não fez nenhuma loucura... mas o dinheiro sumiu.
            </p>
            <p>
              Você já tentou planilha. Funcionou por uma semana. Depois virou aquele arquivo que você nem abre mais.
            </p>
            <p>
              Ou baixou um app cheio de função, conectou com banco, configurou categorias... e desistiu porque era coisa demais.
            </p>
            <p className="text-foreground font-medium pt-2">
              O problema não é você. É que essas soluções complicam algo que deveria ser simples.
            </p>
          </div>
        </section>

        {/* Método - o que o app faz */}
        <section className="mb-20">
          <h2 className="text-xl font-semibold mb-6">Como funciona</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary">
                1
              </div>
              <div>
                <p className="font-medium">Você lança o que gastou</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Gastou R$ 45 no mercado? Abre o app, digita, pronto. Menos de 10 segundos.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary">
                2
              </div>
              <div>
                <p className="font-medium">O app organiza pra você</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Categorias prontas. Tudo separado automaticamente. Você não precisa montar nada.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary">
                3
              </div>
              <div>
                <p className="font-medium">Você vê o que está acontecendo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Quanto entrou, quanto saiu, quanto sobrou. Claro, direto, sem gráfico complicado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Para quem é / não é */}
        <section className="mb-20">
          <h2 className="text-xl font-semibold mb-6">Pra quem é (e pra quem não é)</h2>
          
          <div className="grid gap-6">
            <Card className="p-5 border-income/20">
              <p className="font-medium mb-4 flex items-center gap-2">
                <Check className="w-4 h-4 text-income" />
                É pra você se:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Você ganha dinheiro mas não sabe pra onde ele vai</li>
                <li>• Você quer algo simples que funcione no celular</li>
                <li>• Você já desistiu de planilha e de app complicado</li>
                <li>• Você quer clareza, não controle obsessivo</li>
              </ul>
            </Card>
            
            <Card className="p-5 border-expense/20">
              <p className="font-medium mb-4 flex items-center gap-2">
                <X className="w-4 h-4 text-expense" />
                Não é pra você se:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Você quer conectar conta bancária automaticamente</li>
                <li>• Você precisa de relatórios complexos pra empresa</li>
                <li>• Você quer um app gratuito com tudo</li>
                <li>• Você já tem um sistema que funciona</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Oferta - honesta */}
        <section className="mb-20">
          <h2 className="text-xl font-semibold mb-6">Quanto custa</h2>
          
          <Card className="p-6">
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">R$ 14,90</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            
            <ul className="space-y-2 text-sm mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-income" />
                Lançamentos ilimitados
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-income" />
                Controle de dívidas e investimentos
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-income" />
                Funciona offline
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-income" />
                Sincroniza entre dispositivos
              </li>
            </ul>
            
            <Button className="w-full" size="lg" onClick={() => navigate('/planos')}>
              Assinar agora
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              Cancela quando quiser. Sem multa, sem pergunta.
            </p>
          </Card>
        </section>

        {/* Confiança */}
        <section className="mb-20">
          <h2 className="text-xl font-semibold mb-6">Sobre segurança e privacidade</h2>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p>
                Seus dados ficam criptografados. Ninguém além de você tem acesso.
              </p>
            </div>
            <div className="flex gap-3">
              <WifiOff className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p>
                O app funciona offline. Você pode lançar gastos sem internet e sincroniza depois.
              </p>
            </div>
            <p className="pt-2">
              Não vendemos dados. Não mostramos anúncios. O negócio é simples: você paga, o app funciona.
            </p>
          </div>
        </section>

        {/* CTA final */}
        <section className="text-center py-8">
          <p className="text-lg mb-6">
            Menos ansiedade, mais clareza.
          </p>
          <Button size="lg" onClick={() => navigate('/cadastro')}>
            Começar a usar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>

      </main>

      {/* Footer mínimo */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FinanceLogo size={16} />
            <span className="font-medium" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              inanceX
            </span>
          </div>
          <div className="flex gap-6">
            <Link to="/termos" className="hover:text-foreground">Termos</Link>
            <Link to="/privacidade" className="hover:text-foreground">Privacidade</Link>
            <a href="mailto:contato@financex.app" className="hover:text-foreground">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
