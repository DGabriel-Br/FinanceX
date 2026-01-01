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
    answer: 'Sim. Você pode cancelar quando quiser, em 1 clique. Sem multa, sem ligação, sem conversa chata.',
  },
  {
    question: 'Preciso conectar minha conta bancária?',
    answer: 'Não. O FinanceX é manual e simples. Você lança apenas o que quiser, quando quiser.',
  },
  {
    question: 'Meus dados ficam seguros?',
    answer: 'Ficam. Seus dados são privados e ninguém além de você tem acesso.',
  },
  {
    question: 'É difícil de usar?',
    answer: 'Não. Você lança o que gastou em segundos. Sem configuração complicada.',
  },
];

export const FAQSection = memo(function FAQSection() {
  return (
    <section className="pt-12 pb-10 lg:pt-16 lg:pb-14 bg-white text-landing-dark">
      <div className="w-full max-w-3xl mx-auto px-5 lg:px-8">
        <ScrollReveal direction="up" duration={700}>
          <header className="text-center mb-8 lg:mb-10">
            <h2 
              className="text-lg sm:text-xl lg:text-2xl font-medium tracking-[-0.01em] text-landing-dark/70"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Perguntas frequentes
            </h2>
          </header>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={100} duration={700}>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-0 border-b border-black/[0.05] last:border-b-0 px-0 bg-transparent"
              >
                <AccordionTrigger className="text-left text-sm lg:text-base font-normal text-landing-dark/70 hover:text-landing-dark/90 py-4 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-landing-dark/50 leading-relaxed pb-4">
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
