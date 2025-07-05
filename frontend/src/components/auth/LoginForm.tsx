'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

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
import { Checkbox } from '../ui/checkbox';
import { useAuth } from '@/context/AuthContext';

const formSchema = z.object({
  username: z.string().min(1, { message: 'O nome de usuário é obrigatório.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
  rememberMe: z.boolean().default(false).optional(),
});

export function LoginForm() {
  const { login } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await login(values.username, values.password, values.rememberMe)
    } catch (error) {
      form.setError('username', {message: 'Usuário ou senha inválidos'}),
      form.setError('password', {message: 'Usuário ou senha inválidos'})
    }
  }

  return (
    <>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold">Entrar</h2>
        <p className="text-muted-foreground">
          Insira suas credenciais para acessar sua conta.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-muted-foreground">
                    Lembre-se de mim
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="flex w-full justify-center rounded-lg bg-yellow-500 py-3 px-4 text-sm font-semibold text-gray-900 shadow-sm hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black transition-colors"
          >
            Entrar
          </Button>
        </form>
      </Form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Não possui conta?{' '}
        <Link
          href="/register"
          className="font-semibold text-yellow-500 hover:text-yellow-500/90"
        >
          Crie sua conta
        </Link>
      </p>
    </>
  );
}
