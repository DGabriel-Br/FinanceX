import Fastify, { type FastifyRequest } from 'fastify';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { z } from 'zod';

const prisma = new PrismaClient();
const app = Fastify({
  logger: {
    level: 'info',
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  },
});

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me';

app.register(jwt, { secret: JWT_SECRET });
app.register(swagger, {
  openapi: {
    info: { title: 'FinanceX API', version: '1.0.0' },
  },
});
app.register(swaggerUi, { routePrefix: '/docs' });

app.decorate('authenticate', async (request: FastifyRequest) => {
  await request.jwtVerify();
});

type AuthenticatedRequest = FastifyRequest & {
  user: { sub: string };
};

app.get('/health', async () => ({ status: 'ok' }));

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

app.post('/v1/auth/register', async (request, reply) => {
  const body = registerSchema.parse(request.body);
  const passwordHash = await argon2.hash(body.password, { type: argon2.argon2id });
  const user = await prisma.user.create({
    data: { email: body.email, password: passwordHash },
    select: { id: true, email: true },
  });
  const token = app.jwt.sign({ sub: user.id });
  return reply.send({ accessToken: token, user });
});

const loginSchema = registerSchema;

app.post('/v1/auth/login', async (request, reply) => {
  const body = loginSchema.parse(request.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    return reply.status(401).send({ message: 'Credenciais inválidas' });
  }
  const valid = await argon2.verify(user.password, body.password);
  if (!valid) {
    return reply.status(401).send({ message: 'Credenciais inválidas' });
  }
  const token = app.jwt.sign({ sub: user.id });
  return reply.send({ accessToken: token, user: { id: user.id, email: user.email } });
});

const transactionSchema = z.object({
  type: z.enum(['receita', 'despesa']),
  category: z.string().min(1),
  date: z.string().regex(/\d{4}-\d{2}-\d{2}/),
  description: z.string().min(1),
  value: z.number().positive(),
});

app.get('/v1/transactions', { preHandler: app.authenticate }, async (request) => {
  const auth = request as AuthenticatedRequest;
  const transactions = await prisma.transaction.findMany({
    where: { userId: auth.user.sub },
    orderBy: { date: 'desc' },
  });
  return transactions;
});

app.post('/v1/transactions', { preHandler: app.authenticate }, async (request) => {
  const auth = request as AuthenticatedRequest;
  const body = transactionSchema.parse(request.body);
  const transaction = await prisma.transaction.create({
    data: {
      userId: auth.user.sub,
      type: body.type,
      category: body.category,
      date: new Date(body.date),
      description: body.description,
      value: body.value,
    },
  });
  return transaction;
});

const port = Number(process.env.API_PORT ?? 4000);

app.listen({ port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
