CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE transaction_type AS ENUM ('receita', 'despesa');
CREATE TYPE investment_activity_type AS ENUM ('aporte', 'resgate');
CREATE TYPE investment_type AS ENUM (
  'reserva_emergencia',
  'acoes',
  'fundos_imobiliarios',
  'renda_fixa',
  'tesouro_direto',
  'criptomoedas',
  'outros_investimentos'
);

CREATE TABLE "Transaction" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  value NUMERIC(12,2) NOT NULL,
  "investmentType" investment_type,
  "investmentActivity" investment_activity_type,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "Transaction_userId_date" ON "Transaction"("userId", date);

CREATE TABLE "Debt" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "totalValue" NUMERIC(12,2) NOT NULL,
  "paidValue" NUMERIC(12,2) NOT NULL DEFAULT 0,
  "monthlyInstallment" NUMERIC(12,2) NOT NULL,
  "startDate" DATE NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "Debt_userId" ON "Debt"("userId");

CREATE TABLE "InvestmentGoal" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "targetValue" NUMERIC(12,2) NOT NULL,
  "currentValue" NUMERIC(12,2) NOT NULL DEFAULT 0,
  deadline DATE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "InvestmentGoal_userId" ON "InvestmentGoal"("userId");
