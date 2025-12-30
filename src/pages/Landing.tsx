import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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
        <section className="mb-24">
          <h1 className="font-serif text-4xl md:text-5xl leading-[1.15] mb-6 tracking-tight">
            Se você não sabe pra onde seu dinheiro vai, esse app é pra você.
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl">
            Você anota o que gasta. O app te mostra, de forma clara, se você pode gastar mais ou se precisa parar. Sem complicação.
          </p>
          <Button size="lg" onClick={() => navigate('/cadastro')} className="rounded-full px-8">
            Começar a usar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>

        {/* Dor real */}
        <section className="mb-24">
          <h2 className="font-serif text-2xl md:text-3xl mb-8">Você já passou por isso?</h2>
          <div className="space-y-5 text-muted-foreground text-lg leading-relaxed">
            <p>
              Chega no fim do mês e você não entende. Trabalhou, recebeu, não fez nenhuma loucura... mas o dinheiro sumiu.
            </p>
            <p>
              Você já tentou planilha. Funcionou por uma semana. Depois virou aquele arquivo que você nem abre mais.
            </p>
            <p>
              Ou baixou um app cheio de função, conectou com banco, configurou categorias... e desistiu porque era coisa demais.
            </p>
            <p className="text-foreground font-medium pt-4 border-l-2 border-primary pl-4">
              O problema não é você. É que essas soluções complicam algo que deveria ser simples.
            </p>
          </div>
        </section>

        {/* Método - o que o app faz */}
        <section className="mb-24">
          <h2 className="font-serif text-2xl md:text-3xl mb-10">Como funciona</h2>
          <div className="space-y-8">
            <div className="flex gap-5">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-base font-semibold">
                1
              </div>
              <div>
                <p className="font-medium text-lg">Você lança o que gastou</p>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  Gastou R$ 45 no mercado? Abre o app, digita, pronto. Menos de 10 segundos.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-base font-semibold">
                2
              </div>
              <div>
                <p className="font-medium text-lg">O app organiza pra você</p>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  Categorias prontas. Tudo separado automaticamente. Você não precisa montar nada.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-base font-semibold">
                3
              </div>
              <div>
                <p className="font-medium text-lg">Você vê o que está acontecendo</p>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  Quanto entrou, quanto saiu, quanto sobrou. Claro, direto, sem gráfico complicado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Para quem é / não é */}
        <section className="mb-24">
          <h2 className="font-serif text-2xl md:text-3xl mb-10">Pra quem é (e pra quem não é)</h2>
          
          <div className="grid gap-8">
            <div className="p-6 rounded-lg bg-income/5 border border-income/20">
              <p className="font-medium text-lg mb-5 flex items-center gap-3">
                <Check className="w-5 h-5 text-income" />
                É pra você se:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Você ganha dinheiro mas não sabe pra onde ele vai</li>
                <li>• Você quer algo simples que funcione no celular</li>
                <li>• Você já desistiu de planilha e de app complicado</li>
                <li>• Você quer clareza, não controle obsessivo</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-lg bg-expense/5 border border-expense/20">
              <p className="font-medium text-lg mb-5 flex items-center gap-3">
                <X className="w-5 h-5 text-expense" />
                Não é pra você se:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Você quer conectar conta bancária automaticamente</li>
                <li>• Você precisa de relatórios complexos pra empresa</li>
                <li>• Você quer um app gratuito com tudo</li>
                <li>• Você já tem um sistema que funciona</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Oferta - honesta */}
        <section className="mb-24">
          <h2 className="font-serif text-2xl md:text-3xl mb-10">Quanto custa</h2>
          
          <div className="p-8 rounded-xl border border-border bg-card">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-serif text-4xl">R$ 14,90</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-income" />
                Lançamentos ilimitados
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-income" />
                Controle de dívidas e investimentos
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-income" />
                Funciona offline
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-income" />
                Sincroniza entre dispositivos
              </li>
            </ul>
            
            <Button className="w-full rounded-full" size="lg" onClick={() => navigate('/planos')}>
              Assinar agora
            </Button>
            
            <p className="text-sm text-muted-foreground text-center mt-5">
              Cancela quando quiser. Sem multa, sem pergunta.
            </p>
          </div>
        </section>

        {/* Confiança */}
        <section className="mb-24">
          <h2 className="font-serif text-2xl md:text-3xl mb-10">Sobre segurança e privacidade</h2>
          
          <div className="space-y-6 text-muted-foreground">
            <div className="flex gap-4">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Seus dados ficam criptografados. Ninguém além de você tem acesso.
              </p>
            </div>
            <div className="flex gap-4">
              <WifiOff className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                O app funciona offline. Você pode lançar gastos sem internet e sincroniza depois.
              </p>
            </div>
            <p className="pt-4 border-t border-border">
              Não vendemos dados. Não mostramos anúncios. O negócio é simples: você paga, o app funciona.
            </p>
          </div>
        </section>

        {/* CTA final */}
        <section className="text-center py-12 border-t border-border">
          <p className="font-serif text-2xl md:text-3xl mb-8">
            Menos ansiedade, mais clareza.
          </p>
          <Button size="lg" onClick={() => navigate('/cadastro')} className="rounded-full px-8">
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
