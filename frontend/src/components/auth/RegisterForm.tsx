'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { endpoints } from '@/lib/api';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z
  .object({
    username: z.string().min(3, 'Usuário deve ter pelo menos 3 caracteres.'),
    email: z.string().email('Por favor, insira um e-mail válido.'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.'),
    password2: z.string(),
  })
  .refine((data) => data.password === data.password2, {
    message: 'As senhas não correspondem.',
    path: ['password2'],
  });

export function RegisterForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', email: '', password: '', password2: '' },
  });

  const router = useRouter()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axios.post(endpoints.register, values)
      router.push('/login')
    } catch (error: any) {
      const errors = error.response?.data
      if (errors) {
        Object.entries(errors).forEach(([field, messages]) => {
          form.setError(field as keyof typeof values, {
            message: (messages as string[])[0],
          })
        })
      } 
    }
  }

  return (
    <>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold">Cadastrar</h2>
        <p className="text-muted-foreground">Crie sua conta para começar.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuário</FormLabel>
                <FormControl>
                  <Input placeholder="seu.usuario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="flex w-full justify-center rounded-lg bg-yellow-500 py-3 px-4 text-sm font-semibold text-gray-900 shadow-sm hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black transition-colors"
          >
            Criar Conta
          </Button>
        </form>
      </Form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link
          href="/login"
          className="font-semibold text-yellow-500 hover:text-yellow-500/90"
        >
          Faça login
        </Link>
      </p>
    </>
  );
}
