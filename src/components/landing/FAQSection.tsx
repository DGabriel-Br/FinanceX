import { memo } from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Posso cancelar quando quiser?',
    answer: 'Sim. Você pode cancelar a qualquer momento, direto pelo app. Sem multa, sem burocracia.',
  },
  {
    question: 'Funciona offline?',
    answer: 'Funciona sim. Você pode lançar gastos mesmo sem internet. Quando a conexão voltar, tudo sincroniza automaticamente.',
  },
  {
    question: 'Preciso conectar minha conta bancária?',
    answer: 'Não. O FinanceX é manual e simples. Você lança apenas o que quiser, quando quiser.',
  },
  {
    question: 'Meus dados ficam seguros?',
    answer: 'Ficam. Seus dados são privados e ninguém além de você tem acesso.',
  },
];

export const FAQSection = memo(function FAQSection() {
  return (
    <section className="py-16 lg:py-24 bg-[#f8f9fb] text-landing-dark">
      <div className="w-full max-w-3xl mx-auto px-5 lg:px-8">
        <ScrollReveal direction="up" duration={700}>
          <header className="text-center mb-10 lg:mb-12">
            <h2 
              className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-[-0.01em] text-landing-dark/90"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Perguntas frequentes
            </h2>
          </header>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={100} duration={700}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-black/[0.06] rounded-xl bg-white px-5 lg:px-6 data-[state=open]:shadow-sm transition-shadow duration-300"
              >
                <AccordionTrigger className="text-left text-sm lg:text-base font-medium text-landing-dark/85 hover:text-landing-dark py-4 lg:py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm lg:text-base text-landing-dark/55 leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
});
