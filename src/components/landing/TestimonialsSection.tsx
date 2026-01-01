import { memo } from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const testimonials = [
  {
    name: 'Rafael Mendes',
    role: 'Designer Freelancer',
    initials: 'RM',
    gradient: 'from-landing-cyan to-landing-teal',
    borderHover: 'hover:border-landing-cyan/20',
    lineColor: 'via-landing-cyan/30',
    quote: 'Eu já tinha desistido de controlar meu dinheiro. Planilha, app de banco, caderninho… nada funcionava.',
    highlight: 'O FinanceX foi o primeiro que realmente me deu clareza.',
    afterHighlight: 'Em 2 meses, eu sabia exatamente pra onde ia cada centavo.',
    featured: true,
    delay: 0,
  },
  {
    name: 'Camila Santos',
    role: 'Professora',
    initials: 'CS',
    gradient: 'from-landing-teal to-landing-green',
    borderHover: 'hover:border-landing-teal/20',
    lineColor: 'via-landing-teal/30',
    quote: 'Simples do jeito que deveria ser. Abro, lanço o gasto, fecho.',
    highlight: 'Sem complicação.',
    delay: 60,
  },
  {
    name: 'Pedro Almeida',
    role: 'Analista de Sistemas',
    initials: 'PA',
    gradient: 'from-landing-green to-landing-cyan',
    borderHover: 'hover:border-landing-green/20',
    lineColor: 'via-landing-green/30',
    quote: 'Finalmente consigo ver quanto sobra no mês.',
    highlight: 'Agora sei se posso ou não fazer aquela compra.',
    delay: 120,
  },
  {
    name: 'Juliana Lima',
    role: 'Empreendedora',
    initials: 'JL',
    gradient: 'from-landing-cyan to-landing-teal',
    borderHover: 'hover:border-landing-cyan/20',
    lineColor: 'via-landing-cyan/30',
    quote: 'O melhor é a praticidade. Lanço os gastos na hora, sem complicação.',
    highlight: 'Praticidade total.',
    delay: 180,
  },
];

const StarRating = memo(function StarRating({ size = 4 }: { size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-${size} h-${size} text-amber-400`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
});

const TestimonialCard = memo(function TestimonialCard({ 
  testimonial 
}: { 
  testimonial: typeof testimonials[0];
}) {
  const avatarSize = testimonial.featured ? 'h-14 w-14' : 'h-12 w-12';
  const starSize = testimonial.featured ? 4 : 3.5;

  return (
    <ScrollReveal direction="up" delay={testimonial.delay} duration={700}>
      <div className={`group bg-white rounded-2xl lg:rounded-3xl p-7 lg:p-9 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] transition-all duration-500 relative border border-black/[0.03] ${testimonial.borderHover}`}>
        <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent ${testimonial.lineColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`${avatarSize} rounded-2xl bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold ${testimonial.featured ? 'text-lg shadow-lg' : 'shadow-lg'} shadow-landing-cyan/25 group-hover:shadow-landing-cyan/40 transition-shadow duration-500`}>
              {testimonial.initials}
            </div>
            <div>
              <p className={`font-semibold ${testimonial.featured ? 'text-lg' : ''} text-landing-dark/90`}>{testimonial.name}</p>
              <p className="text-landing-dark/45 text-sm">{testimonial.role}</p>
            </div>
          </div>
          <StarRating size={starSize} />
        </div>
        
        <blockquote className={`text-landing-dark/60 ${testimonial.featured ? 'text-base lg:text-lg' : 'text-base'} leading-relaxed`}>
          "{testimonial.quote} <span className="text-landing-dark/85 font-medium">{testimonial.highlight}</span>{testimonial.afterHighlight ? ` ${testimonial.afterHighlight}` : ''}"
        </blockquote>
      </div>
    </ScrollReveal>
  );
});

export const TestimonialsSection = memo(function TestimonialsSection() {
  const leftColumn = testimonials.filter((_, i) => i % 2 === 0);
  const rightColumn = testimonials.filter((_, i) => i % 2 === 1);

  return (
    <section className="pt-16 pb-14 lg:pt-24 lg:pb-20 bg-[#f3f4f6] text-landing-dark relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-landing-cyan/[0.02] rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-landing-teal/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 relative">
        <ScrollReveal direction="up" duration={700}>
          <header className="text-center mb-16 lg:mb-24">
            <div className="flex items-center justify-center gap-3 mb-5 lg:mb-6">
              <div className="h-px w-8 lg:w-12 bg-gradient-to-r from-transparent to-landing-cyan/50" />
              <span className="text-[10px] lg:text-[11px] font-semibold tracking-[0.3em] uppercase text-landing-cyan/70">Depoimentos</span>
              <div className="h-px w-8 lg:w-12 bg-gradient-to-l from-transparent to-landing-cyan/50" />
            </div>
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold tracking-[-0.02em] text-landing-dark/90"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              O que muda quando você passa a ver seu dinheiro
            </h2>
            <p className="text-landing-dark/45 mt-4 max-w-lg mx-auto text-sm lg:text-base">
              Histórias reais de pessoas que ganharam clareza financeira
            </p>
          </header>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          <div className="space-y-5 lg:space-y-6">
            {leftColumn.map((t) => (
              <TestimonialCard key={t.name} testimonial={t} />
            ))}
          </div>
          <div className="space-y-5 lg:space-y-6 md:pt-16">
            {rightColumn.map((t) => (
              <TestimonialCard key={t.name} testimonial={t} />
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-landing-dark/40 mt-6">
          Pessoas comuns. Problemas comuns. Clareza real.
        </p>
      </div>
    </section>
  );
});
